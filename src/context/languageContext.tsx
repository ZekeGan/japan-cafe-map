'use client'

import { Locale, translations } from '@/lib/i18n'
import React, { createContext, useContext, useState, useEffect } from 'react'

const LanguageContext = createContext({
  locale: 'en' as Locale,
  t: translations.en,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setLocale: (_l: Locale) => {},
})

export const LanguageProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const [locale, setLocale] = useState<Locale>('en')

  useEffect(() => {
    const saved = localStorage.getItem('lang') as Locale
    if (saved && saved in translations) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLocale(saved)
      return
    }

    const preferred = [...(navigator.languages ?? []), navigator.language]
    for (const lang of preferred) {
      const code = lang?.split('-')[0] as Locale
      if (code in translations) {
        setLocale(code)
        return
      }
    }
  }, [locale])

  const changeLocale = (l: Locale) => {
    setLocale(l)
    localStorage.setItem('lang', l)
  }

  return (
    <LanguageContext.Provider
      value={{ locale, t: translations[locale], setLocale: changeLocale }}
    >
      {children}
    </LanguageContext.Provider>
  )
}

export const useTranslation = () => useContext(LanguageContext)
