import * as z from 'zod'

export const registerSchema = z
  .object({
    email: z.string().email({ message: '請輸入有效的電子郵件' }),
    password: z
      .string()
      .min(8, { message: '密碼至少需 8 個字元' })
      .regex(/[A-Z]/, { message: '需包含大寫字母' })
      .regex(/[a-z]/, { message: '需包含小寫字母' })
      .regex(/[0-9!@#$%^&*]/, { message: '需包含數字或特殊符號' }),
    confirmPassword: z.string(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: '兩次輸入的密碼不一致',
    path: ['confirmPassword'], // 錯誤會掛在 confirmPassword 欄位下
  })

export type RegisterInput = z.infer<typeof registerSchema>
