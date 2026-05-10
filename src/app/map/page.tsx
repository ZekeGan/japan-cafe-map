'use client'

import Map from '@/components/map'
import ShopInfo from '@/components/shopInfo'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from '@/components/ui/drawer'
import { useState } from 'react'

export default function Page() {
  const [shopId, setShopId] = useState<string | null>(null)

  return (
    <main className="flex h-screen flex-col">
      {/* 地圖區域 */}
      <section className="h-full w-full relative">
        <Map setShopId={setShopId} />
      </section>

      <Drawer
        open={Boolean(shopId)}
        onOpenChange={open => {
          if (!open) setShopId(null)
        }}
      >
        <DrawerContent className="h-[80%]">
          <DrawerTitle className="sr-only">shopInfo</DrawerTitle>
          <DrawerDescription className="sr-only">shop detail</DrawerDescription>
          <ShopInfo shopId={shopId} />
        </DrawerContent>
      </Drawer>
    </main>
  )
}
