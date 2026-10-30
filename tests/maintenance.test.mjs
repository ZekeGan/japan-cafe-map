import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'
import ts from 'typescript'
import { SignJWT } from 'jose'
import bcrypt from 'bcryptjs'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { AsyncLocalStorage } from 'node:async_hooks'

globalThis.AsyncLocalStorage = AsyncLocalStorage
const { NextRequest } = await import('next/server.js')
const { unstable_doesMiddlewareMatch } = await import('next/experimental/testing/server.js')

const loadPackage = createRequire(import.meta.url)

// Execute the real handlers; replace only the database and request cookie boundary.
// No Next server, external services, or database credentials are needed.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const userId = '000000000000000000000001'
const otherId = '000000000000000000000002'
const cafeId = '000000000000000000000003'
const secret = 'maintenance-tests-only-not-a-production-secret'

function load(relativePath, db, token, overrides = {}, expose = '') {
  const cache = new Map()
  function readModule(filename) {
    if (cache.has(filename)) return cache.get(filename).exports
    const loaded = { exports: {} }
    cache.set(filename, loaded)
    if (filename.endsWith('.json')) return { default: JSON.parse(readFileSync(filename, 'utf8')), __esModule: true }
    const compiled = ts.transpileModule(readFileSync(filename, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 },
    }).outputText + (filename === path.join(root, relativePath) ? expose : '')
    const localRequire = name => {
      if (Object.hasOwn(overrides, name)) return overrides[name]
      if (name === '@/lib/db') return { __esModule: true, default: db, prisma: db }
      if (name === 'next/headers') {
        return { cookies: async () => ({ get: () => token ? { value: token } : undefined }) }
      }
      if (name.startsWith('@/') || name.startsWith('.')) {
        const resolved = name.startsWith('@/') ? path.join(root, 'src', name.slice(2)) : path.resolve(path.dirname(filename), name)
        for (const candidate of [resolved + '.ts', resolved + '.tsx', resolved + '/index.ts', resolved]) {
          let isFile = false
          try { isFile = loadPackage('node:fs').statSync(candidate).isFile() } catch { /* Try the next source extension. */ }
          if (isFile) return readModule(candidate)
        }
      }
      return loadPackage(name)
    }
    new Function('require', 'module', 'exports', compiled)(localRequire, loaded, loaded.exports)
    return loaded.exports
  }
  return readModule(path.join(root, relativePath))
}

async function signedToken(subject = userId, expiration = '1h') {
  process.env.JWT_SECRET = secret
  return new SignJWT({ sub: subject }).setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(expiration).sign(new TextEncoder().encode(secret))
}

function request(body, query = '') {
  return new Request('http://localhost/api' + query, body === undefined ? {} : {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  })
}

for (const tokenKind of ['missing', 'forged', 'expired', 'empty-subject']) {
  test(`protected endpoints reject ${tokenKind} JWT without accessing database`, async () => {
    const token = tokenKind === 'missing' ? undefined : tokenKind === 'forged' ? 'forged'
      : await signedToken(tokenKind === 'empty-subject' ? '' : userId, tokenKind === 'expired' ? '0s' : '1h')
    const db = new Proxy({}, { get() { assert.fail('unauthorized database access') } })
    const favorite = load('src/app/api/favorite/route.ts', db, token)
    const report = load('src/app/api/report/route.ts', db, token)
    assert.equal((await favorite.GET(request(undefined, '?userId=' + otherId))).status, 401)
    assert.equal((await favorite.POST(request({ userId: otherId, cafeId }))).status, 401)
    assert.equal((await report.POST(request({ userId: otherId, cafeId }))).status, 401)
  })
}

test('favorite reads and writes use signed identity instead of supplied userId', async () => {
  const db = { favorite: {
    findMany: async ({ where }) => { assert.equal(where.userId, userId); return [{ cafe: { id: cafeId } }] },
    findFirst: async ({ where }) => { assert.deepEqual(where, { userId, cafeId }); return null },
    create: async ({ data }) => { assert.deepEqual(data, { userId, cafeId }); return data },
  } }
  const handler = load('src/app/api/favorite/route.ts', db, await signedToken())
  assert.deepEqual(await (await handler.GET(request(undefined, '?userId=' + otherId))).json(), [{ id: cafeId }])
  const response = await handler.POST(request({ userId: otherId, cafeId }))
  assert.equal(response.status, 200)
  assert.equal((await response.json()).data.userId, userId)
})

test('favorite removal uses the authenticated owner', async () => {
  let deleted = false
  const handler = load('src/app/api/favorite/route.ts', { favorite: {
    findFirst: async ({ where }) => { assert.equal(where.userId, userId); return { id: 'favorite-id' } },
    delete: async ({ where }) => { assert.equal(where.id, 'favorite-id'); deleted = true },
  } }, await signedToken())
  const response = await handler.POST(request({ cafeId }))
  assert.equal(response.status, 200)
  assert.equal((await response.json()).action, 'removed')
  assert.equal(deleted, true)
})

const reportBody = { cafeId, userId: otherId, hasWifi: true, outletCoverage: null,
  seatCapacity: null, noiseLevel: null, smokingAreaType: null, allowCigaretteType: [],
  minConsumption: null, timeLimit: null, isBookingRequired: null }

test('report authenticates ownership and strips unrecognized relation fields', async () => {
  let updated = false
  const tx = { report: {
    create: async ({ data }) => {
      assert.deepEqual(data.user, { connect: { id: userId } })
      assert.deepEqual(data.cafe, { connect: { id: cafeId } })
      assert.equal(data.createdAt, undefined)
      return { id: 'report-id' }
    },
    findMany: async () => [{ ...reportBody, userId }],
  }, cafe: { update: async ({ data }) => { assert.equal(data.hasWifi, true); updated = true } } }
  const handler = load('src/app/api/report/route.ts', { $transaction: callback => callback(tx) }, await signedToken())
  const response = await handler.POST(request({ ...reportBody, user: { connect: { id: otherId } }, createdAt: '2000-01-01' }))
  assert.equal(response.status, 201)
  assert.equal(updated, true)
})

test('report rejects invalid fields before a transaction', async () => {
  const db = { $transaction: () => assert.fail('invalid data reached transaction') }
  const handler = load('src/app/api/report/route.ts', db, await signedToken())
  assert.equal((await handler.POST(request({ ...reportBody, hasWifi: 'yes' }))).status, 400)
})

test('duplicate report returns a conflict rather than an internal error', async () => {
  const handler = load('src/app/api/report/route.ts', {
    $transaction: async () => { throw { code: 'P2002' } },
  }, await signedToken())
  assert.equal((await handler.POST(request(reportBody))).status, 409)
})

test('me returns cafeId so the existing UI can recognize reported cafes', async () => {
  const handler = load('src/app/api/auth/me/route.ts', { user: {
    findUnique: async ({ select }) => ({ id: userId, reports: [Object.fromEntries(
      Object.keys(select.reports.select).map(key => [key, { id: 'report-id', cafeId }[key]])
    )] }),
  } }, await signedToken())
  const response = await handler.GET()
  assert.equal(response.status, 200)
  const { user } = await response.json()
  assert.equal(user.reports.some(report => report.cafeId === cafeId), true)
})

test('reset rejects weak, missing and invalid passwords before database access', async () => {
  const db = new Proxy({}, { get() { assert.fail('invalid password reached database') } })
  const handler = load('src/app/api/auth/reset-password/[token]/route.ts', db)
  for (const password of [undefined, null, 123, '', 'short', 'lowercase123', 'UPPERCASE123', 'OnlyLetters']) {
    assert.equal((await handler.POST(request({ password }), { params: Promise.resolve({ token: 'token' }) })).status, 400)
  }
})

test('reset preserves password-only client contract, hashes password and consumes token', async () => {
  let updated = false
  const handler = load('src/app/api/auth/reset-password/[token]/route.ts', { user: {
    findFirst: async ({ where }) => {
      assert.equal(where.resetPasswordToken, 'valid-token')
      assert.ok(where.resetPasswordExpires.gt instanceof Date)
      return { id: userId }
    },
    update: async ({ data }) => {
      assert.equal(await bcrypt.compare('ValidPass123', data.password), true)
      assert.equal(data.resetPasswordToken, null)
      assert.equal(data.resetPasswordExpires, null)
      updated = true
    },
  } })
  assert.equal((await handler.POST(request({ password: 'ValidPass123' }), { params: Promise.resolve({ token: 'valid-token' }) })).status, 200)
  assert.equal(updated, true)
})

test('reset rejects an expired or unknown token', async () => {
  const handler = load('src/app/api/auth/reset-password/[token]/route.ts', { user: {
    findFirst: async () => null,
    update: async () => assert.fail('expired token updated password'),
  } })
  assert.equal((await handler.POST(request({ password: 'ValidPass123' }), { params: Promise.resolve({ token: 'expired' }) })).status, 400)
})

test('mail rejects a returned provider error instead of reporting success', async () => {
  const { sendResetPasswordEmail } = load('src/lib/mail.ts', {}, undefined, {
    resend: { Resend: class { emails = { send: async () => ({ data: null, error: { message: 'sending disabled' } }) } } },
  })
  await assert.rejects(sendResetPasswordEmail('test@example.invalid', 'test-token', 'en'))
})

test('mail preserves translated content and reset URL on success', async () => {
  process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000'
  const { sendResetPasswordEmail } = load('src/lib/mail.ts', {}, undefined, {
    resend: { Resend: class { emails = { send: async payload => {
      assert.equal(payload.to, 'test@example.invalid')
      assert.equal(payload.subject, 'Reset Your Password')
      assert.ok(payload.html.includes('http://localhost:3000/reset-password/test-token'))
      return { data: { id: 'accepted' }, error: null }
    } } } },
  })
  await sendResetPasswordEmail('test@example.invalid', 'test-token', 'en')
})

test('forgot-password API returns failure when the mail provider rejects the request', async context => {
  context.mock.method(console, 'error', () => {})
  context.mock.method(console, 'log', () => {})
  const handler = load('src/app/api/auth/forgot-password/route.ts', {
    user: {findUnique: async () => ({id:userId}), update: async () => ({id:userId})},
  }, undefined, {
    resend: { Resend: class { emails = {send: async () => ({data:null,error:{message:'simulated rejection'}})} } },
  })
  const response = await handler.POST(request({email:'test@example.invalid',locale:'en'}))
  assert.equal(response.status, 500)
})

test('database guard has valid body markup and recovers on a later request', async context => {
  context.mock.method(console, 'error', () => {})
  let available = false
  const { default: Guard } = load('src/components/databaseGuard.tsx', {
    $runCommandRaw: async () => { if (!available) throw new Error('simulated DB outage') },
  })
  const fallback = renderToStaticMarkup(await Guard({children: 'healthy page'}))
  assert.ok(fallback.includes('database is currently unavailable'))
  assert.equal(fallback.includes('<html'), false)
  assert.equal(fallback.includes('<body'), false)
  available = true
  assert.equal(await Guard({children: 'healthy page'}), 'healthy page')
})

test('proxy matches the actual favorite URL and rejects absent or invalid sessions', async () => {
  const { proxy, config } = load('src/proxy.ts', {})
  assert.equal(unstable_doesMiddlewareMatch({ config, url: '/favorite' }), true)
  for (const token of [undefined, 'forged', await signedToken(userId, '0s')]) {
    const response = await proxy(new NextRequest('http://localhost/favorite', {
      headers: token ? { Cookie: 'auth-token=' + token } : {},
    }))
    assert.equal(response.status, 307)
    assert.equal(response.headers.get('location'), 'http://localhost/login')
  }
  const response = await proxy(new NextRequest('http://localhost/favorite', {
    headers: { Cookie: 'auth-token=' + await signedToken() },
  }))
  assert.equal(response.headers.get('x-middleware-next'), '1')
})

const english = JSON.parse(readFileSync(path.join(root, 'src/lib/i18n/locales/en.json'), 'utf8'))
const shopOverrides = {
  '@/context/languageContext': { useTranslation: () => ({ t: english }) },
}

test('shop details display the same time-limit semantics as the report form', () => {
  const { ShopDetail } = load('src/components/shopInfo.tsx', {}, undefined, shopOverrides, '\nexports.ShopDetail = ShopDetail;')
  for (const [timeLimit, expected, absent] of [[false, 'No time limit', 'Time limited'], [true, 'Time limited', 'No time limit']]) {
    const markup = renderToStaticMarkup(React.createElement(ShopDetail, {shopInfo: {
      ...reportBody, timeLimit, allowCigaretteType: [], _count: { reports: 1 },
    }}))
    assert.ok(markup.includes(expected))
    assert.equal(markup.includes(absent), false)
  }
})

test('report form retains failed input and refreshes details after success', async () => {
  let succeeded = false, refreshes = 0, detailRefreshes = 0, closed = 0, errors = 0
  const originalFetch = globalThis.fetch
  globalThis.fetch = async () => new Response('{}', {status: succeeded ? 201 : 500})
  try {
    const { ShopForm } = load('src/components/shopInfo.tsx', {}, undefined, {
      ...shopOverrides,
      react: {...React, useEffect: () => {}},
      '@/context/authContext': { useAuth: () => ({user: {id: userId}, refreshUser: async () => {refreshes++} }) },
      'react-hook-form': { useForm: () => ({ control: {}, formState: {isSubmitting: false}, handleSubmit: fn => fn }) },
      sonner: { toast: { error: () => {errors++} } },
    }, '\nexports.ShopForm = ShopForm;')
    const element = ShopForm({shopInfo: {id: cafeId}, setIsEditing: () => {closed++}, onReported: async id => {assert.equal(id, cafeId); detailRefreshes++} })
    await element.props.children.props.onSubmit(reportBody)
    assert.equal(errors, 1)
    assert.equal(refreshes, 0)
    assert.equal(closed, 0)
    succeeded = true
    await element.props.children.props.onSubmit(reportBody)
    assert.equal(refreshes, 1)
    assert.equal(detailRefreshes, 1)
    assert.equal(closed, 1)
  } finally { globalThis.fetch = originalFetch }
})

test('no-time-limit map filter includes false and excludes true or unknown', () => {
  const cafes = [false, true, null].map((timeLimit, i) => ({id: String(i), timeLimit, location: {lat: 35, lng: 139}}))
  const filters = {hasWifi: false, hasSmokingArea: false, hasPowerOutlets: false, timeLimit: true, isBookingRequired: false, minConsumption: false}
  const {default: Map} = load('src/components/map.tsx', {}, undefined, {
    ...shopOverrides,
    react: {...React, useEffect: () => {}, useCallback: fn => fn, useMemo: fn => fn(), useRef: value => ({current:value}),
      useState: value => [Array.isArray(value) ? cafes : value && typeof value === 'object' && 'timeLimit' in value ? filters : value, () => {}]},
    '@/context/authContext': {useAuth: () => ({user:null})},
    '@react-google-maps/api': {useJsApiLoader: () => ({isLoaded:true}), GoogleMap: () => null},
  })
  const markers = []
  const visit = node => {
    if (Array.isArray(node)) return node.forEach(visit)
    if (!node || typeof node !== 'object') return
    if (node.type?.name === 'CafeLocationDot') markers.push(node.key)
    visit(node.props?.children)
  }
  visit(Map({setShopId: () => {}}))
  assert.deepEqual(markers, ['0'])
})
