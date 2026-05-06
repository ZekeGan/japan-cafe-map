import { Resend } from 'resend'
import { getServerTranslation, Locale } from './i18n'

const resend = new Resend(process.env.RESEND_API_KEY)

export const sendResetPasswordEmail = async (
  email: string,
  token: string,
  locale: Locale
) => {
  const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password/${token}`
  const t = getServerTranslation(locale)

  console.log(t, locale)

  await resend.emails.send({
    from: 'onboarding@resend.dev', // 驗證網域後可換成自訂信箱
    to: email,
    subject: t.mail.resetPassword.subject,
    html: `<p>${t.mail.resetPassword.body}<a href="${resetLink}">${resetLink}</a></p>`,
  })
}
