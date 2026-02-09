import DetailLayout from '@/components/container/detailLayout'
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
      id,
    },
  })

  // 2. 如果找不到資料，直接顯示 404
  if (!data) {
    notFound()
  }

  return (
    <DetailLayout href={MAP}>
      <ShopInfo shopInfo={data} />
    </DetailLayout>
  )
}
