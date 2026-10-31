import { test } from 'node:test'
import { assert, readFileSync, path, ts, SignJWT, bcrypt, React, renderToStaticMarkup, NextRequest, unstable_doesMiddlewareMatch, loadPackage, root, userId, otherId, cafeId, secret, reportBody, load, signedToken, request } from './helpers.mjs'

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

