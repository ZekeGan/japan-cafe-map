import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const cookieStore = await cookies()

    // 刪除名為 'auth_token' 的 Cookie
    // 實際上是送出一個 Set-Cookie 表頭，將過期時間設為過去
    cookieStore.delete('auth_token')

    return NextResponse.json({ message: '登出成功' }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: '登出失敗' }, { status: 500 })
  }
}
