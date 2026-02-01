'use client'

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ChevronLeft } from 'lucide-react' // 記得確保有安裝 lucide-react

export default function ForgotPasswordPage() {
  return (
    <div className="container relative min-h-screen flex flex-col items-center justify-center p-4">
      {/* 返回按鈕：放在左上角或表單上方 */}
      <div className="absolute top-4 left-4 md:top-8 md:left-8">
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="gap-1"
        >
          <Link href="/login">
            <ChevronLeft className="h-4 w-4" />
            返回登入
          </Link>
        </Button>
      </div>

      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        {/* Header 部分 */}
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">忘記密碼？</h1>
          <p className="text-sm text-muted-foreground text-balance">
            別擔心！請輸入您註冊時使用的電子郵件，我們將發送密碼重設連結給您。
          </p>
        </div>

        {/* 表單內容 */}
        <div className="grid gap-4">
          <form>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">電子郵件</Label>
                <Input
                  id="email"
                  placeholder="name@example.com"
                  type="email"
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect="off"
                />
              </div>
              <Button
                type="button"
                className="w-full"
              >
                發送重設連結
              </Button>
            </div>
          </form>
        </div>

        {/* 輔助說明 */}
        <p className="px-8 text-center text-xs text-muted-foreground">
          如果您沒有收到郵件，請檢查您的垃圾郵件匣或{' '}
          <button className="underline underline-offset-4 hover:text-primary">
            重新發送
          </button>
        </p>
      </div>
    </div>
  )
}
