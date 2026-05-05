import { useTranslation } from '@/context/languageContext'

// app/cafes/[id]/loading.tsx
export default function Loading() {
  const { t } = useTranslation()
  return (
    <div className="flex h-full w-full items-center justify-center p-10">
      <div className="flex flex-col items-center gap-2">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
        <p className="text-gray-500 animate-pulse">{t.common.loading}</p>
      </div>
    </div>
  )
}
