'use client'

import Loading from '@/components/loading'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { LOGIN } from '@/constant/router'
import { useAuth } from '@/context/authContext'
import { LogOut, User } from 'lucide-react' // 使用 lucide-react 增加圖示感
import { useRouter } from 'next/navigation'

export default function ProfilePage() {
  // const { data: session, status } = useSession()
  const router = useRouter()
  const { user, isLoading, refreshUser } = useAuth()

  // 處理載入狀態
  if (isLoading) return <Loading />

  const handleLogout = async () => {
    // 1. 呼叫後端 API 清除 Cookie
    const res = await fetch('/api/auth/logout', { method: 'POST' })

    if (res.ok) {
      // 2. 清除成功後，將頁面導向首頁或登入頁
      // router.refresh() 可以強制讓 Server Component 重新檢查登入狀態
      refreshUser()
      router.push(LOGIN)
    }
  }

  return (
    <div className="h-full justify-center items-center bg-slate-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 flex flex-col items-center">
          {/* 大頭貼預留位置 */}
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <User className="w-10 h-10 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">個人資料</CardTitle>
          <CardDescription>管理您的帳號資訊與設定</CardDescription>
        </CardHeader>

        <CardContent className="grid gap-4">
          <div className="flex flex-col space-y-1 border-b pb-4">
            <span className="text-sm font-medium text-muted-foreground">
              使用者名稱
            </span>
            <span className="text-lg font-semibold">
              {user?.name || '未設定名稱'}
            </span>
          </div>
          <div className="flex flex-col space-y-1">
            <span className="text-sm font-medium text-muted-foreground">
              電子信箱
            </span>
            <span className="text-lg font-semibold">{user?.email}</span>
          </div>
        </CardContent>

        <CardFooter>
          <Button
            variant="destructive"
            className="w-full flex items-center justify-center gap-2"
            onClick={() => handleLogout()} // 登出後導回首頁
          >
            <LogOut className="w-4 h-4" />
            登出帳號
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
