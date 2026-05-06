import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ token: string }> } // params 必須定義為 Promise
) {
  try {
    // 1. 必須先 await 才能解構 params
    const { token } = await context.params
    const { password } = await req.json()

    // 2. 尋找權杖符合且尚未過期的用戶
    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: {
          gt: new Date(),
        },
      },
    })

    if (!user) {
      return NextResponse.json(
        { message: '連結已失效或不存在' },
        { status: 400 }
      )
    }

    // 3. 加密新密碼
    const hashedPassword = await bcrypt.hash(password, 10)

    // 4. 更新密碼並清空重設相關欄位
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    })

    return NextResponse.json({ message: '密碼已成功更新' }, { status: 200 })
  } catch (error) {
    console.error('重設密碼錯誤:', error)
    return NextResponse.json({ message: '伺服器發生錯誤' }, { status: 500 })
  }
}
