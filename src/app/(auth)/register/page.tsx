'use client'

import Link from 'next/link'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { registerSchema, type RegisterInput } from '@/lib/validations/auth'
import { useRouter } from 'next/navigation'
import { LOGIN } from '@/constant/router'
import { Separator } from '@/components/ui/separator'
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field'
import PasswordRule from '@/components/passwordRule'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useTranslation } from '@/context/languageContext'
import { toast } from 'sonner'

export default function RegisterPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterInput) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      })

      const result = await res.json()
      if (!res.ok) {
        if (result.error === 'EMAIL_EXISTS') {
          setError('email', {
            type: 'manual',
            message: t.auth.register.error.emailExists,
          })
          return
        }
      }

      toast.success(t.auth.register.success)
      setTimeout(() => {
        router.push(LOGIN)
      }, 1000)
    } catch (err) {
      toast.error(t.auth.register.error.system)
      console.error(t.auth.register.error.system, err)
    }
  }

  return (
    <main className="flex flex-col space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            {t.auth.register.title}
          </CardTitle>
        </CardHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid gap-4"
        >
          <CardContent className="grid gap-4 pb-4">
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel htmlFor="email">
                    {t.auth.register.email}
                  </FieldLabel>
                  <Input
                    {...field}
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
                    <FieldDescription className="text-red-600">
                      {errors.email.message}
                    </FieldDescription>
                  )}
                </Field>
              )}
            />

            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel htmlFor="password">
                    {t.auth.register.password}
                  </FieldLabel>
                  <Input
                    {...field}
                    id="password"
                    type="password"
                    className={errors.password ? 'border-destructive' : ''}
                  />
                </Field>
              )}
            />

            <PasswordRule />

            <Controller
              name="confirmPassword"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel htmlFor="confirmPassword">
                    {t.auth.register.confirmPassword}
                  </FieldLabel>
                  <Input
                    {...field}
                    id="confirmPassword"
                    type="password"
                    className={
                      errors.confirmPassword ? 'border-destructive' : ''
                    }
                  />
                  {errors.confirmPassword && (
                    <FieldDescription className="text-red-600">
                      {errors.confirmPassword.message}
                    </FieldDescription>
                  )}
                </Field>
              )}
            />
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full mt-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? t.auth.register.checking : t.common.submit}
            </Button>

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
    </main>
  )
}
