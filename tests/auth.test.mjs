import { test } from 'node:test'
import { assert, bcrypt, userId, load, request } from './helpers.mjs'

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

