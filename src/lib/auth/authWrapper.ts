// lib/auth-wrapper.ts
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'

export async function getAuthUser() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value

    if (!token) return null

    const secret = new TextEncoder().encode(process.env.JWT_SECRET)
    const { payload } = await jwtVerify(token, secret)

    // 返回 user ID，供 API 使用
    return { id: payload.sub as string }
  } catch {
    return null
  }
}
