import { useTranslation } from '@/context/languageContext'
import { Spinner } from './ui/spinner'

export default function Loading() {
  const { t } = useTranslation()
  return (
    <main className="h-screen w-screen absolute left-0 top-0 z-20 flex items-center justify-center ">
      <div className="absolute w-full h-full bg-white opacity-50" />
      <div className="flex flex-col items-center gap-2">
        <Spinner className="w-10 h-10" />
        <p className="text-gray-500 animate-pulse">{t.common.loading}</p>
      </div>
    </main>
  )
}
