import DetailLayout from '@/components/container/detailLayout'
import ShopInfo from '@/components/shopInfo'
import prisma from '@/lib/db'

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
    <DetailLayout>
      <ShopInfo shopInfo={data} />
    </DetailLayout>
  )
}
