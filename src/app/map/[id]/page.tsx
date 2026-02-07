import ShopInfo from '@/components/shopInfo'
import { Button } from '@/components/ui/button'
import { MAP } from '@/constant/router'
import prisma from '@/lib/db'
import { ArrowLeftFromLine, ChevronLeft, MoveLeft } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function CafePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  // 1. 直接從資料庫抓取，不要 fetch 自己！
  const data = await prisma.cafe.findUnique({
    where: {
      // 這裡要確認你的 Prisma Schema 裡是用 id 還是 googlePlaceId
      googlePlaceId: id,
    },
  })

  // 2. 如果找不到資料，直接顯示 404
  if (!data) {
    notFound()
  }

  return (
    <div>
      <section className="border-b-2 px-4 py-1 flex align-middle">
        <Button
          variant="ghost"
          size="icon-lg"
        >
          <Link href={MAP}>
            <ChevronLeft />
          </Link>
        </Button>
      </section>
      <ShopInfo shopInfo={data} />
    </div>
  )
}
