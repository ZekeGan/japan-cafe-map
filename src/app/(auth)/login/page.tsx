'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { loginSchema, type LoginInput } from '@/lib/validations/auth'
import { useAuth } from '@/context/authContext'
import { FORGOT_PASSWORD, MAP, REGISTER } from '@/constant/router'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useTranslation } from '@/context/languageContext'

export default function LoginPage() {
  const { t } = useTranslation() // 初始化翻譯函數
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
            message: t.auth.login.error.invalid, // 錯誤訊息語系化
          })
          return
        }
        throw new Error(result.message || t.auth.login.error.failed)
      }

      await refreshUser()
      router.push(MAP)
    } catch {
      setError('root', { message: t.auth.login.error.system })
    }
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          {t.auth.login.title}
        </CardTitle>
      </CardHeader>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid gap-4"
      >
        <CardContent className="flex flex-col justify-center space-y-6">
          {errors.root && (
            <div className="bg-destructive/15 p-3 rounded-md text-destructive text-sm font-medium">
              {errors.root.message}
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="email">{t.auth.login.email}</Label>
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
              <Label htmlFor="password">{t.auth.login.password}</Label>
              <Link
                href={FORGOT_PASSWORD}
                className="text-xs text-primary underline-offset-4 hover:underline"
              >
                {t.auth.login.forgotPassword}
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
        </CardContent>

        <CardFooter>
          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? t.auth.login.submitting : t.common.submit}
          </Button>
        </CardFooter>
      </form>

      <p className="px-8 pb-6 text-center text-sm text-muted-foreground">
        {t.auth.login.noAccount}{' '}
        <Link
          href={REGISTER}
          className="underline underline-offset-4 hover:text-primary"
        >
          {t.auth.login.registerNow}
        </Link>
      </p>
    </Card>
  )
}
