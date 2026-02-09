'use client'

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation' // 登入成功後跳轉
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { loginSchema, type LoginInput } from '@/lib/validations/auth'
import { useAuth } from '@/context/authContext'
import { FORGOT_PASSWORD, HOME, MAP, REGISTER } from '@/constant/router'

export default function LoginPage() {
  const router = useRouter()
  const { refreshUser } = useAuth()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginInput) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const result = await response.json()

      if (!response.ok) {
        if (result.error === 'INVALID_CREDENTIALS') {
          setError('root', {
            message: '帳號或密碼錯誤，請重新輸入',
          })
          return
        }
        throw new Error(result.message || '登入失敗')
      }

      // 登入成功處理 (例如儲存 Token 或更新 Context)

      await refreshUser()
      router.push(MAP) // 跳轉至後台或首頁
    } catch (err) {
      setError('root', { message: '系統連線錯誤，請稍後再試' })
    }
  }

  return (
    <div className="container relative min-h-screen flex flex-col items-center justify-center p-4">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">歡迎回來</h1>
        <p className="text-sm text-muted-foreground">
          請輸入您的帳號密碼進行登入
        </p>
      </div>
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid gap-4"
        >
          {/* 顯示全域錯誤訊息 (例如帳密錯誤) */}
          {errors.root && (
            <div className="bg-destructive/15 p-3 rounded-md text-destructive text-sm font-medium">
              {errors.root.message}
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="email">電子郵件</Label>
            <Input
              {...register('email')}
              id="email"
              type="email"
              placeholder="name@example.com"
              disabled={isSubmitting}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">密碼</Label>
              <Link
                href={FORGOT_PASSWORD}
                // size="sm"
                className="text-xs text-primary underline-offset-4 hover:underline"
              >
                忘記密碼？
              </Link>
            </div>
            <Input
              {...register('password')}
              id="password"
              type="password"
              disabled={isSubmitting}
            />
            {errors.password && (
              <p className="text-xs text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? '登入中...' : '登入'}
          </Button>
        </form>

        <p className="px-8 text-center text-sm text-muted-foreground">
          還沒有帳號？{' '}
          <Link
            href={REGISTER}
            className="underline underline-offset-4 hover:text-primary"
          >
            立即註冊
          </Link>
        </p>
      </div>
    </div>
  )
}
