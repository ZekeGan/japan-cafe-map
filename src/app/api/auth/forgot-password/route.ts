import { NextResponse } from 'next/server'
import crypto from 'crypto'
import prisma from '@/lib/db'
import { sendResetPasswordEmail } from '@/lib/mail' // 導入發信功能

export async function POST(req: Request) {
  try {
    const { email, locale } = await req.json()
    const user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
      return NextResponse.json({ message: '此郵箱未註冊' }, { status: 404 })
    }

    const token = crypto.randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + 3600000)

    await prisma.user.update({
      where: { email },
      data: { resetPasswordToken: token, resetPasswordExpires: expires },
    })

    console.log('success')

    // --- 核心變更：發送真實郵件 ---
    await sendResetPasswordEmail(email, token, locale)
    // ----------------------------

    return NextResponse.json({ message: '連結已發送至您的信箱' })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: '發送郵件失敗' }, { status: 500 })
  }
}
