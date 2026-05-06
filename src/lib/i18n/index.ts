import zh from './locales/zh.json'
import en from './locales/en.json'
import ja from './locales/ja.json'

export const translations = { zh, en, ja }
export type Locale = 'zh' | 'en' | 'ja'

export const getServerTranslation = (lang: Locale) => {
  return translations[lang] || translations.en
}
