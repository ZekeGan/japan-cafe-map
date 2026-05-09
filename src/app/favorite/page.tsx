'use client'

import { Cafe } from '@prisma/client'
import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/context/authContext'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Link2, Trash } from 'lucide-react'
import { Item, ItemActions, ItemContent, ItemTitle } from '@/components/ui/item'
import DetailLayout from '@/components/container/detailLayout'
import { Badge } from '@/components/ui/badge'
import { useTranslation } from '@/context/languageContext'
import { Skeleton } from '@/components/ui/skeleton'
import Loading from '@/components/loading'
import { toast } from 'sonner'

const FavoriteCafe = () => {
  const { t } = useTranslation()
  const { user, refreshUser } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [cafeShops, setCafeShops] = useState<Cafe[] | null>(null)

  const fetchCafeShop = useCallback(async () => {
    if (!user) return
    try {
      setIsLoading(true)
      const res = await fetch(`/api/favorite?userId=${user.id}`, {
        method: 'GET',
      })

      if (!res.ok) {
        throw new Error('Failed to get Favorite list')
      }

      const data = await res.json()
      setCafeShops(data)
    } catch {
      toast.error(t.favorite.fetchError)
      setCafeShops([])
    } finally {
      setIsLoading(false)
    }
  }, [t.favorite.fetchError, user])

  const removeFavorite = async (shop: Cafe) => {
    try {
      setIsLoading(true)
      const res = await fetch('/api/favorite', {
        method: 'POST',
        body: JSON.stringify({ userId: user?.id, cafeId: shop.id }),
      })

      if (!res.ok) {
        throw new Error('Fail to remove Favorite')
      }

      fetchCafeShop()
    } catch {
      toast.error(t.favorite.fetchError)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCafeShop()
    }, 0)
    return () => clearTimeout(timer)
  }, [fetchCafeShop])

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
                  <div className="flex gap-2">
                    {shop.hasWifi && (
                      <Badge variant="secondary">{t.favorite.wifi}</Badge>
                    )}
                    {shop.smokingAreaType &&
                      shop.smokingAreaType !== 'NONE' && (
                        <Badge variant="secondary">{t.favorite.smoking}</Badge>
                      )}
                    {shop.outletCoverage && shop.outletCoverage !== 'NONE' && (
                      <Badge variant="secondary">{t.favorite.outlet}</Badge>
                    )}
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
        {isLoading && <Loading />}
      </section>
    </DetailLayout>
  )
}

export default FavoriteCafe
