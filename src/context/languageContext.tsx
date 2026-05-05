'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import zh from '../locales/zh.json'
import en from '../locales/en.json'

const translations = { zh, en }
type Locale = 'zh' | 'en'

const LanguageContext = createContext({
  locale: 'zh' as Locale,
  t: zh,
  setLocale: (_l: Locale) => {},
})

export const LanguageProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const [locale, setLocale] = useState<Locale>('zh')

  useEffect(() => {
    const saved = localStorage.getItem('lang') as Locale
    if (saved && saved in translations) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLocale(saved)
      return
    }

    // 依序嘗試 navigator.languages（完整清單）或 navigator.language（單一值）
    const preferred = [...(navigator.languages ?? []), navigator.language]
    for (const lang of preferred) {
      const code = lang?.split('-')[0] as Locale
      if (code in translations) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLocale(code)
        return
      }
    }
    // 全部不符合則維持預設 'zh'
  }, [])

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
