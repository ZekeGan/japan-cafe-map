import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export const sendResetPasswordEmail = async (email: string, token: string) => {
  const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password/${token}`

  await resend.emails.send({
    from: 'onboarding@resend.dev', // 驗證網域後可換成自訂信箱
    to: email,
    subject: '重設您的密碼',
    html: `<p>點擊此處重設密碼：<a href="${resetLink}">${resetLink}</a></p>`,
  })
}
