'use client'

import { useTranslation } from '@/context/languageContext'

export default function PasswordRule() {
  const { t } = useTranslation()

  return (
    <div className="rounded-md bg-muted/50 p-3 mt-1 text-[12px]">
      <p className="font-medium mb-1">{t.auth.passwordRule.title}</p>
      <ul className="space-y-0.5 text-muted-foreground list-disc list-inside">
        <li>{t.auth.passwordRule.length}</li>
        <li>{t.auth.passwordRule.complexity}</li>
      </ul>
    </div>
  )
}
