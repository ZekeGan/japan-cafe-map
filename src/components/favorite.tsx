/* eslint-disable @next/next/no-img-element */
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Cafe } from '@prisma/client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import { useAuth } from '@/context/authContext'

const FavoriteCafe = () => {
  //   const { shopInfo, setShopInfo } = props
  const { user, refreshUser } = useAuth()
  const [cafeShops, setCafeShops] = useState<Cafe[] | null>(null)

  const fetchCafeShop = useCallback(async () => {
    if (!user) return
    // const res = await fetch('/api/cafe/query', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify(user.favorites),
    // })
    // const data: Cafe[] = await res.json()
    // setCafeShops(data)
    // return user.favorites
  }, [user])

  useEffect(() => {
    if (!Boolean(cafeShops)) {
      const timeout = setTimeout(() => {
        fetchCafeShop()
      }, 0)
      return () => clearTimeout(timeout)
    }
  }, [cafeShops, fetchCafeShop])

  if (!user) return null

  return (
    <Drawer
      open={false}
      onOpenChange={open => {
        // if (!open) setShopInfo(null)
      }}
    >
      <DrawerContent className="h-[80%]">
        <ScrollArea className="h-full no-scrollbar">
          {/* 店名 */}
          <DrawerHeader className="text-left">
            <DrawerTitle className="text-md font-bold text-left">
              test
            </DrawerTitle>
          </DrawerHeader>

          <section className="">
            {user.favorites.map(shop => (
              <div key={shop.id}>{'test'}</div>
            ))}
          </section>
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  )
}

export default FavoriteCafe
