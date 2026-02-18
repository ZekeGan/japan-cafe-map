'use client'

import { ScrollArea } from '@/components/ui/scroll-area'
import { Cafe } from '@prisma/client'

import { useCallback, useEffect, useState } from 'react'

import { useAuth } from '@/context/authContext'
import { useRouter } from 'next/navigation'
import { MAP } from '@/constant/router'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Link2, Trash } from 'lucide-react'
import { Item, ItemActions, ItemContent, ItemTitle } from '@/components/ui/item'
import DetailLayout from '@/components/container/detailLayout'
import { Badge } from '@/components/ui/badge'

const FavoriteCafe = () => {
  const router = useRouter()
  const { user, refreshUser } = useAuth()
  const [cafeShops, setCafeShops] = useState<Cafe[] | null>(null)

  const fetchCafeShop = useCallback(async () => {
    if (!user) return

    const res = await fetch(`/api/favorite?userId=${user.id}`, {
      method: 'GET',
    })

    if (res.ok) {
      const data = await res.json()
      setCafeShops(data)
      console.log(data)
    }
  }, [user])

  const removeFavorite = async (shop: Cafe) => {
    const response = await fetch('/api/favorite', {
      method: 'POST',
      body: JSON.stringify({ userId: user?.id, cafeId: shop.id }),
    })

    if (response.ok) {
      const result = await response.json()
      console.log(result)
      refreshUser()
    }
  }

  useEffect(() => {
    if (!user) {
      router.push(MAP)
      return
    }
    const timeout = setTimeout(() => fetchCafeShop(), 0)
    return () => clearTimeout(timeout)
  }, [fetchCafeShop, router, user])

  if (!user) return null

  return (
    <DetailLayout href={MAP}>
      <ScrollArea className="h-full no-scrollbar">
        <section className="p-2 flex flex-col gap-2">
          {cafeShops &&
            cafeShops.map(shop => (
              <Item
                key={shop.id}
                variant="outline"
              >
                <ItemContent>
                  <ItemTitle>{shop.displayName}</ItemTitle>
                  <div>
                    <div className="flex gap-2">
                      {shop.hasWifi && (
                        <Badge variant="secondary">有WIFI</Badge>
                      )}
                      {shop.smokingAreaType &&
                        shop.smokingAreaType !== 'NONE' && (
                          <Badge variant="secondary">有吸菸區</Badge>
                        )}
                      {shop.outletCoverage &&
                        shop.outletCoverage !== 'NONE' && (
                          <Badge variant="secondary">有插座</Badge>
                        )}
                    </div>
                  </div>
                </ItemContent>

                <ItemActions>
                  <Button
                    variant="ghost"
                    size="icon-lg"
                  >
                    <Link href={`/map/${shop.id}`}>
                      <Link2 />
                    </Link>
                  </Button>
                  <Button
                    onClick={() => removeFavorite(shop)}
                    variant="ghost"
                    size="icon-lg"
                    className="text-red-500"
                  >
                    <Trash />
                  </Button>
                </ItemActions>
              </Item>
            ))}
        </section>
      </ScrollArea>
    </DetailLayout>
  )
}

export default FavoriteCafe
