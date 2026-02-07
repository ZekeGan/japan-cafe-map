'use client'

import Footer from '@/components/footer'
import Map from '@/components/map'
import ShopInfo from '@/components/shopInfo'
import { Cafe } from '@prisma/client'
import { useState } from 'react'

export default function Home() {
  const [shopInfo, setShopInfo] = useState<Cafe | null>(null)

  return (
    <main className="flex h-screen flex-col">
      {/* 地圖區域 */}
      <section className="flex-1 w-full relative">
        <Map setShopInfo={setShopInfo} />
      </section>

      <Footer />

      {shopInfo && (
        <ShopInfo
          shopInfo={shopInfo}
          setShopInfo={setShopInfo}
        />
      )}
    </main>
  )
}
