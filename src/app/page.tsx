'use client'

import Footer from '@/components/footer'
import Map from '@/components/map'
import ShopInfo from '@/components/shopInfo'
import { useState } from 'react'

export default function Home() {
  const [shopInfo, setShopInfo] = useState<google.maps.places.Place | null>(
    null
  )
  // console.log(shopInfo)

  return (
    <main className="flex h-screen flex-col">
      {/* 導覽列預留區 */}
      {/* <Header /> */}

      {/* 地圖區域 */}
      <section className="flex-1 w-full relative">
        <Map setShopInfo={setShopInfo} />
      </section>

      <Footer />

      <ShopInfo
        shopInfo={shopInfo}
        setShopInfo={setShopInfo}
      />
    </main>
  )
}
