import { NextResponse } from 'next/server'
import bcrypt from 'bcrypt' // 建議使用 bcryptjs 避免在某些環境下的編譯問題
import { loginSchema } from '@/lib/validations/auth' // 假設你也有 loginSchema
import { prisma } from '@/lib/db'

export async function POST(req: Request) {
  try {
    const body = await req.json()

    // 1. 驗證資料格式 (使用 Zod)
    const result = loginSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: 'FORMAT_ERROR', message: '資料格式不正確' },
        { status: 400 }
      )
    }

    const { email, password } = result.data

    // 2. 尋找用戶
    const user = await prisma.user.findUnique({
      where: { email },
    })

    // 3. 檢查用戶是否存在
    if (!user) {
      // 為了安全，建議回應統一的錯誤訊息，避免洩漏「此 Email 尚未註冊」的資訊
      return NextResponse.json(
        { error: 'INVALID_CREDENTIALS', message: '帳號或密碼錯誤' },
        { status: 401 }
      )
    }

    // 4. 比對密碼 (將明文 password 與資料庫中的 hashedPassword 比對)
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'INVALID_CREDENTIALS', message: '帳號或密碼錯誤' },
        { status: 401 }
      )
    }

    // 5. 登入成功處理
    // 注意：這裡回傳時要排除敏感資訊
    const { password: _, ...userWithoutPassword } = user

    console.log('用戶登入成功:', email)

    return NextResponse.json(
      {
        message: '登入成功',
        user: userWithoutPassword,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('LOGIN_ERROR:', error)
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: '伺服器錯誤，請稍後再試' },
      { status: 500 }
    )
  }
}
