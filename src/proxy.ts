// middleware.ts
import { NextRequest, NextResponse } from 'next/server'
import { FAVOTITE, LOGIN, PROFILE } from './constant/router'
import { jwtVerify } from 'jose'

export async function proxy(request: NextRequest) {
  // 1. 取得 Cookie
  const token = request.cookies.get('auth-token')?.value

  // 2. 定義哪些路徑是需要登入的
  const protectedPaths = [PROFILE, FAVOTITE]
  const isProtected = protectedPaths.some(path =>
    request.nextUrl.pathname.startsWith(path)
  )

  // 3. 受保護頁面必須具有有效的登入 token
  if (isProtected) {
    try {
      if (!token || !process.env.JWT_SECRET) throw new Error('Missing session')
      const secret = new TextEncoder().encode(process.env.JWT_SECRET)
      const { payload } = await jwtVerify(token, secret, { algorithms: ['HS256'] })
      if (typeof payload.sub !== 'string' || !/^[a-f\d]{24}$/i.test(payload.sub)) {
        throw new Error('Invalid session')
      }
    } catch {
      return NextResponse.redirect(new URL(LOGIN, request.url))
    }
  }

  // 繼續執行後續動作
  return NextResponse.next()
}

// 設定 Middleware 只在特定路徑執行，避免影響圖片或靜態檔案效能
export const config = {
  matcher: ['/profile/:path*', '/favorite/:path*'],
}
