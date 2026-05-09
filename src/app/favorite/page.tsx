'use client'

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
import { useTranslation } from '@/context/languageContext'
import { Skeleton } from '@/components/ui/skeleton'

const FavoriteCafe = () => {
  const { t } = useTranslation() // 初始化翻譯函數
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
    }
  }, [user])

  const removeFavorite = async (shop: Cafe) => {
    const response = await fetch('/api/favorite', {
      method: 'POST',
      body: JSON.stringify({ userId: user?.id, cafeId: shop.id }),
    })

    if (response.ok) {
      refreshUser()
      // 移除後重新取得清單以更新 UI
      fetchCafeShop()
    }
  }

  useEffect(() => {
    if (!user) {
      router.push(MAP)
      return
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCafeShop()
  }, [fetchCafeShop, router, user])

  if (!user) return null

  return (
    <DetailLayout>
      <section className="p-2 flex flex-col gap-2">
        {cafeShops ? (
          cafeShops && cafeShops.length > 0 ? (
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
                        <Badge variant="secondary">{t.favorite.wifi}</Badge>
                      )}
                      {shop.smokingAreaType &&
                        shop.smokingAreaType !== 'NONE' && (
                          <Badge variant="secondary">
                            {t.favorite.smoking}
                          </Badge>
                        )}
                      {shop.outletCoverage &&
                        shop.outletCoverage !== 'NONE' && (
                          <Badge variant="secondary">{t.favorite.outlet}</Badge>
                        )}
                    </div>
                  </div>
                </ItemContent>

                <ItemActions>
                  <Button
                    variant="ghost"
                    size="icon-lg"
                    asChild
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
            ))
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              {t.favorite.noData}
            </div>
          )
        ) : (
          Array.from({ length: 5 }).map((_, index) => (
            <Skeleton
              key={index}
              className="w-full h-18"
            />
          ))
        )}
      </section>
    </DetailLayout>
  )
}

export default FavoriteCafe
