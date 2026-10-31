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
export const { NextRequest } = await import('next/server.js')
export const { unstable_doesMiddlewareMatch } = await import('next/experimental/testing/server.js')

export const loadPackage = createRequire(import.meta.url)

// Execute the real handlers; replace only the database and request cookie boundary.
// No Next server, external services, or database credentials are needed.
export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
export const userId = '000000000000000000000001'
export const otherId = '000000000000000000000002'
export const cafeId = '000000000000000000000003'
export const secret = 'maintenance-tests-only-not-a-production-secret'

export function load(relativePath, db, token, overrides = {}, expose = '') {
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

export async function signedToken(subject = userId, expiration = '1h') {
  process.env.JWT_SECRET = secret
  return new SignJWT({ sub: subject }).setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(expiration).sign(new TextEncoder().encode(secret))
}

export function request(body, query = '') {
  return new Request('http://localhost/api' + query, body === undefined ? {} : {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  })
}

export const reportBody = { cafeId, userId: otherId, hasWifi: true, outletCoverage: null,
  seatCapacity: null, noiseLevel: null, smokingAreaType: null, allowCigaretteType: [],
  minConsumption: null, timeLimit: null, isBookingRequired: null }

export { assert, readFileSync, path, ts, SignJWT, bcrypt, React, renderToStaticMarkup }
