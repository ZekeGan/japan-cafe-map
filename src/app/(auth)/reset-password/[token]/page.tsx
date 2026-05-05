'use client'
import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Controller, useForm } from 'react-hook-form'
import { ResetPasswordInput, resetPasswordSchema } from '@/lib/validations/auth'
import { Input } from '@/components/ui/input'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Field } from '@/components/ui/field'
import PasswordRule from '@/components/passwordRule'
import { LOGIN } from '@/constant/router'
import { useTranslation } from '@/context/languageContext'

export default function ResetPassword() {
  const { t } = useTranslation() // 初始化翻譯函數
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<{
    type: 'success' | 'error'
    msg: string
  } | null>(null)

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  })

  async function onSubmit(values: ResetPasswordInput) {
    setLoading(true)
    setStatus(null)

    const res = await fetch(`/api/auth/reset-password/${params.token}`, {
      method: 'POST',
      body: JSON.stringify({ password: values.password }),
      headers: { 'Content-Type': 'application/json' },
    })

    setLoading(false)
    if (res.ok) {
      // 語系化成功訊息
      setStatus({ type: 'success', msg: t.auth.resetPassword.success })
      setTimeout(() => router.push(LOGIN), 2000)
    } else {
      // 語系化錯誤訊息
      setStatus({ type: 'error', msg: t.auth.resetPassword.error })
    }
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl">{t.auth.resetPassword.title}</CardTitle>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="grid gap-4 pb-4">
          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <Field>
                <Input
                  {...field}
                  id="password"
                  placeholder={t.auth.resetPassword.passwordPlaceholder}
                  disabled={loading}
                />
                {errors.password && (
                  <p className="text-xs text-destructive">
                    {errors.password.message}
                  </p>
                )}
              </Field>
            )}
          />

          <PasswordRule />

          <Controller
            name="confirmPassword"
            control={control}
            render={({ field }) => (
              <Field>
                <Input
                  {...field}
                  id="confirmPassword"
                  placeholder={t.auth.resetPassword.confirmPasswordPlaceholder}
                  disabled={loading}
                />
                {errors.confirmPassword && (
                  <p className="text-xs text-destructive">
                    {errors.confirmPassword?.message}
                  </p>
                )}
              </Field>
            )}
          />
        </CardContent>

        <CardFooter className="flex flex-col">
          <Button
            className="w-full"
            size="lg"
            type="submit"
            disabled={loading}
          >
            {t.common.submit}
          </Button>

          {status && (
            <p className="mt-4 text-center text-destructive">{status?.msg}</p>
          )}
        </CardFooter>
      </form>
    </Card>
  )
}
