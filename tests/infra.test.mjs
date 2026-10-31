import { test } from 'node:test'
import { assert, renderToStaticMarkup, NextRequest, unstable_doesMiddlewareMatch, userId, load, signedToken } from './helpers.mjs'

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
