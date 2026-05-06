import { useTranslation } from '@/context/languageContext'
import { Spinner } from './ui/spinner'

// app/cafes/[id]/loading.tsx
export default function Loading() {
  const { t } = useTranslation()
  return (
    <div className="flex h-full w-full items-center justify-center p-10">
      <div className="flex flex-col items-center gap-2">
        <Spinner className="w-10 h-10" />
        <p className="text-gray-500 animate-pulse">{t.common.loading}</p>
      </div>
    </div>
  )
}
