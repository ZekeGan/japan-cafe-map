'use client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { LOGIN } from '@/constant/router'
import { useTranslation } from '@/context/languageContext'
import {
  ForgotPasswordInput,
  forgotPasswordSchema,
} from '@/lib/validations/auth'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'

export default function ForgotPassword() {
  const { t, locale } = useTranslation()
  const [message, setMessage] = useState('')

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  })

  const onSubmit = async (values: ForgotPasswordInput) => {
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email: values.email, locale }),
        headers: { 'Content-Type': 'application/json' },
      })

      if (!res.ok) {
        throw new Error('Failed to send password reset request')
      }

      setMessage(t.auth.forgotPassword.successMessage)
    } catch {
      setMessage(t.auth.forgotPassword.errorMessage)
    }
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          {t.auth.forgotPassword.title}
        </CardTitle>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="grid gap-4 pb-4">
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <Field>
                <Input
                  {...field}
                  id="email"
                  placeholder={t.auth.forgotPassword.emailPlaceholder}
                />
                {errors.email && (
                  <p className="text-xs text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </Field>
            )}
          />
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          <Button
            className="w-full"
            size="lg"
            type="submit"
          >
            {t.common.submit}
          </Button>

          {message && (
            <p className="mt-4 text-center text-destructive">{message}</p>
          )}

          <Separator />

          <Button
            variant="outline"
            className="w-full"
            asChild
          >
            <Link href={LOGIN}>{t.auth.register.backToLogin}</Link>
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
