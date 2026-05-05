'use client'

import Loading from '@/components/loading'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { LOGIN } from '@/constant/router'
import { useAuth } from '@/context/authContext'
import { useTranslation } from '@/context/languageContext'
import { LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function ProfilePage() {
  const { t } = useTranslation() // 初始化翻譯功能
  const router = useRouter()
  const { user, isLoading, refreshUser } = useAuth()

  // 處理載入狀態
  if (isLoading) return <Loading />

  const handleLogout = async () => {
    // 呼叫後端 API 清除 Cookie
    const res = await fetch('/api/auth/logout', { method: 'POST' })

    if (res.ok) {
      refreshUser()
      router.push(LOGIN)
    }
  }

  return (
    <Card className="w-full shadow-lg">
      <CardHeader className="space-y-1 flex flex-col items-center">
        <CardTitle className="text-2xl font-bold">{t.profile.title}</CardTitle>
      </CardHeader>

      <CardContent className="grid gap-4">
        <div className="flex flex-col space-y-1 border-b pb-4">
          <span className="text-sm font-medium text-muted-foreground">
            {t.profile.usernameLabel}
          </span>
          <span className="text-lg font-semibold">
            {user?.name || t.profile.defaultName}
          </span>
        </div>
        <div className="flex flex-col space-y-1">
          <span className="text-sm font-medium text-muted-foreground">
            {t.profile.emailLabel}
          </span>
          <span className="text-lg font-semibold">{user?.email}</span>
        </div>
      </CardContent>

      <CardFooter>
        <Button
          variant="destructive"
          className="w-full flex items-center justify-center gap-2"
          onClick={() => handleLogout()}
        >
          <LogOut className="w-4 h-4" />
          {t.profile.logout}
        </Button>
      </CardFooter>
    </Card>
  )
}
