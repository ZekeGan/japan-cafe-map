import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { registerSchema } from '@/lib/validations/auth'
import { prisma } from '@/lib/db'

export async function POST(req: Request) {
  try {
    const body = await req.json()

    // 1. 後端再次驗證資料 (確保資料沒被攔截竄改)
    const result = registerSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: '資料格式不正確', details: result.error.format() },
        { status: 400 }
      )
    }

    const { email, password } = result.data

    // 2. 檢查 Email 是否已存在 (模擬資料庫查詢)
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true }, // 只需要知道有沒有，不用回傳全部資料
    })
    if (!!user) {
      return NextResponse.json(
        { error: 'EMAIL_EXISTS', message: '此電子郵件已被註冊' },
        { status: 400 }
      )
    }

    // 3. 密碼加密 (Salt rounds = 10)
    const hashedPassword = await bcrypt.hash(password, 10)

    // 4. 存入資料庫
    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    })

    return NextResponse.json({ message: '註冊成功' }, { status: 201 })
  } catch (error) {
    console.error('REGISTER_ERROR:', error)
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: '伺服器錯誤，請稍後再試' },
      { status: 500 }
    )
  }
}
