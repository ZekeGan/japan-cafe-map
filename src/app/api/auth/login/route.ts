import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { loginSchema } from '@/lib/validations/auth'
import { prisma } from '@/lib/db'
import { SignJWT } from 'jose'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const result = loginSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json({ error: '格式錯誤' }, { status: 400 })
    }

    const { email, password } = result.data
    const user = await prisma.user.findUnique({ where: { email } })

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return NextResponse.json({ message: '帳號或密碼錯誤' }, { status: 401 })
    }

    // 建立 JWT 載荷 (Payload)
    const secret = new TextEncoder().encode(process.env.JWT_SECRET)
    const token = await new SignJWT({
      sub: user.id, // 主體，通常放使用者 ID
      email: user.email,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h') // 設定有效期
      .sign(secret)

    const response = NextResponse.json(
      { message: '登入成功', user: { id: user.id, email: user.email } },
      { status: 200 }
    )

    // 將 Token 存入 Cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true, // 核心安全設定：前端 JS 無法讀取
      secure: process.env.NODE_ENV === 'production', // 僅在 HTTPS 下傳輸
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 1 天
    })

    return response
  } catch (error) {
    return NextResponse.json({ error: '伺服器錯誤' }, { status: 500 })
  }
}
