'use client'

import Map from '@/components/map'
import ShopInfo from '@/components/shopInfo'
import { useState } from 'react'

export default function Home() {
  const [shopInfo, setShopInfo] = useState<CafeShop | null>(null)
  // console.log(shopInfo)

  return (
    <main className="flex h-screen flex-col">
      {/* 導覽列預留區 */}
      <header className="h-16 bg-white border-b flex items-center px-6 shadow-sm z-10">
        <h1 className="text-xl font-bold text-gray-800">Cafe Finder</h1>
      </header>

      {/* 地圖區域 */}
      <section className="flex-1 w-full relative">
        <Map setShopInfo={setShopInfo} />
      </section>

      <ShopInfo
        shopInfo={shopInfo}
        setShopInfo={setShopInfo}
      />
    </main>
  )
}
