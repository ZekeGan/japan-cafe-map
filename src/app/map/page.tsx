'use client'

import Footer from '@/components/footer'
import Map from '@/components/map'
import ShopInfo from '@/components/shopInfo'
import { Drawer, DrawerContent, DrawerTitle } from '@/components/ui/drawer'
import { Cafe } from '@prisma/client'
import { VisuallyHidden } from 'radix-ui'
import { useState } from 'react'

export default function Page() {
  const [shopInfo, setShopInfo] = useState<Cafe | null>(null)

  return (
    <main className="flex h-screen flex-col">
      {/* 地圖區域 */}
      <section className="h-full w-full relative">
        <Map setShopInfo={setShopInfo} />
      </section>

      <Drawer
        open={Boolean(shopInfo)}
        onOpenChange={open => {
          if (!open) setShopInfo(null)
        }}
      >
        <DrawerContent className="h-[80%]">
          <VisuallyHidden.Root>
            <DrawerTitle className="sr-only">shopInfo</DrawerTitle>
          </VisuallyHidden.Root>
          <ShopInfo shopInfo={shopInfo} />
        </DrawerContent>
      </Drawer>
    </main>
  )
}
