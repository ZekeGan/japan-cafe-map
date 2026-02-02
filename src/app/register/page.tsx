'use client'

import React from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle } from 'lucide-react' // 增加小圖標提升辨識度
import { registerSchema, type RegisterInput } from '@/lib/validations/auth'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterInput) => {
    try {
      // 模擬 API 檢查資料庫
      const response = await fetch('/api/register', {
        method: 'POST',
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const result = await response.json()
        if (result.error === 'EMAIL_EXISTS') {
          // 這裡就是關鍵：將資料庫的重複提示反映到 UI 上
          setError('email', {
            type: 'manual',
            message: '此電子郵件已被註冊，請嘗試登入或更換帳號',
          })
          return
        }
      }

      alert('註冊成功！')
      router.push('/login')
    } catch (err) {
      console.error('系統錯誤')
    }
  }

  return (
    <div className="container relative min-h-screen flex flex-col items-center justify-center p-4">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[380px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">建立新帳號</h1>
        </div>

        <div className="grid gap-6">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-4">
              {/* Email 欄位：增加動態錯誤樣式 */}
              <div className="grid gap-2">
                <Label
                  htmlFor="email"
                  className={errors.email ? 'text-destructive' : ''}
                >
                  電子郵件
                </Label>
                <div className="relative">
                  <Input
                    {...register('email')}
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    className={
                      errors.email
                        ? 'border-destructive focus-visible:ring-destructive pr-10'
                        : ''
                    }
                  />
                  {errors.email && (
                    <AlertCircle className="absolute right-3 top-2.5 h-5 w-5 text-destructive" />
                  )}
                </div>
                {/* 重複 Email 的錯誤訊息顯示 */}
                {errors.email && (
                  <p className="text-[13px] font-medium text-destructive mt-0.5">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* 密碼欄位 */}
              <div className="grid gap-2">
                <Label htmlFor="password">密碼</Label>
                <Input
                  value="Aa111111"
                  {...register('password')}
                  id="password"
                  type="password"
                  className={errors.password ? 'border-destructive' : ''}
                />
                <div className="rounded-md bg-muted/50 p-3 mt-1 text-[12px]">
                  <p className="font-medium mb-1">密碼規則：</p>
                  <ul className="space-y-0.5 text-muted-foreground list-disc list-inside">
                    <li>至少 8 個字元</li>
                    <li>包含大小寫字母與數字</li>
                  </ul>
                </div>
              </div>

              {/* 確認密碼 */}
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">確認密碼</Label>
                <Input
                  {...register('confirmPassword')}
                  value="Aa111111"
                  id="confirmPassword"
                  type="password"
                  className={errors.confirmPassword ? 'border-destructive' : ''}
                />
                {errors.confirmPassword && (
                  <p className="text-xs text-destructive">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full mt-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? '檢查中...' : '註冊帳號'}
              </Button>
            </div>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                或是
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full"
            asChild
          >
            <Link href="/login">返回登入</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
