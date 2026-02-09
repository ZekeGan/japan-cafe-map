import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const cookieStore = await cookies()

    // 必須與登入時設定的名稱 'auth-token' 完全一致
    cookieStore.delete({
      name: 'auth-token',
      path: '/', // 登入時有設定 path: '/', 這裡也要對應
    })

    return NextResponse.json({ message: '登出成功' }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: '登出失敗' }, { status: 500 })
  }
}
