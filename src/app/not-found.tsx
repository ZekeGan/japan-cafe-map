import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Home, Map } from 'lucide-react'
import { HOME, MAP } from '@/constant/router'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
      <h2 className="text-4xl font-bold mb-2">404</h2>
      <p className="text-muted-foreground mb-6">哎呀！沒有這頁面...</p>

      <div className="flex gap-4">
        <Button
          asChild
          variant="default"
        >
          <Link href={HOME}>
            <Home className="mr-2 h-4 w-4" />
            回首頁
          </Link>
        </Button>
        <Button
          asChild
          variant="outline"
        >
          <Link href={MAP}>
            <Map className="mr-2 h-4 w-4" />
            去地圖找找
          </Link>
        </Button>
      </div>
    </div>
  )
}
