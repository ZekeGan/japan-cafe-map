'use client'

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function LoginPage() {
  return (
    <div className="container relative min-h-screen ">
      <div className=" px-6 pt-6">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          {/* Header 部分 */}
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">登入帳號</h1>
          </div>

          {/* 表單內容 */}
          <div className="grid gap-6">
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
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">密碼</Label>
                    <Button
                      variant="link"
                      className="px-0 font-normal text-xs"
                      asChild
                    >
                      <Link href="/forgotPassword">忘記密碼？</Link>
                    </Button>
                  </div>
                  <Input
                    id="password"
                    type="password"
                  />
                </div>
                <Button type="button">登入</Button>
              </div>
            </form>

            {/* 分隔線 */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  或者繼續使用
                </span>
              </div>
            </div>

            {/* 註冊按鈕 - 改為 Outline 增加層次感 */}
            <Button
              variant="outline"
              type="button"
              asChild
            >
              <Link href="/register">註冊新帳號</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
