'use client'

import Map from '@/components/map'
import ShopInfo from '@/components/shopInfo'
import { Drawer, DrawerContent, DrawerTitle } from '@/components/ui/drawer'
import { VisuallyHidden } from 'radix-ui'
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
          <VisuallyHidden.Root>
            <DrawerTitle className="sr-only">shopInfo</DrawerTitle>
          </VisuallyHidden.Root>
          <ShopInfo shopId={shopId} />
        </DrawerContent>
      </Drawer>
    </main>
  )
}
