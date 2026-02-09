// middleware.ts
import { NextRequest, NextResponse } from 'next/server'
import { FAVOTITE, LOGIN, PROFILE } from './constant/router'

export function middleware(request: NextRequest) {
  // 1. 取得 Cookie
  const token = request.cookies.get('auth-token')?.value

  // 2. 定義哪些路徑是需要登入的
  const protectedPaths = [PROFILE, FAVOTITE]
  const isProtected = protectedPaths.some(path =>
    request.nextUrl.pathname.startsWith(path)
  )

  // 3. 如果是受保護路徑且沒有 token，直接重導向到登入頁
  if (isProtected && !token) {
    const loginUrl = new URL(LOGIN, request.url)
    return NextResponse.redirect(loginUrl)
  }

  // 繼續執行後續動作
  return NextResponse.next()
}

// 設定 Middleware 只在特定路徑執行，避免影響圖片或靜態檔案效能
export const config = {
  matcher: ['/profile/:path*', '/favorites/:path*'],
}
