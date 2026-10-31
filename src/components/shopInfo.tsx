'use client'

import { ScrollArea } from '@/components/ui/scroll-area'
import { ExternalLink, Heart, MapPin, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Divider from '@/components/divider'
import { useEffect, useState } from 'react'
import {
  Item,
  ItemActions,
  ItemContent,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item'
import Link from 'next/link'
import { useAuth } from '@/context/authContext'
import clsx from 'clsx'
import { useTranslation } from '@/context/languageContext'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { ShopDetail } from '@/components/shop/shopDetail'
import { ShopForm } from '@/components/shop/shopForm'

const ShopInfo = ({ shopId }: { shopId: string | null }) => {
  const [shopInfo, setShopInfo] = useState<CafeWithReports | null>(null)
  const { user, refreshUser } = useAuth()
  const { t } = useTranslation()
  const s = t.shopInfo
  const [isEditing, setIsEditing] = useState(false)

  const hasUser = Boolean(user?.id)

  const hasReported =
    user?.reports.some(report => report.cafeId === shopInfo?.id) || false
  const hasFavorited =
    user?.favorites.some(fav => fav.cafeId === shopInfo?.id) || false

  const refreshShop = async (id: string) => {
    const response = await fetch(`/api/cafe/${id}`, { cache: 'no-store' })
    if (!response.ok) throw new Error('Failed to refresh cafe')
    const data: CafeWithReports = await response.json()
    setShopInfo(current => (current?.id === id ? data : current))
  }

  const toggleFavorite = async () => {
    if (!hasUser || !shopInfo) return

    try {
      const res = await fetch('/api/favorite', {
        method: 'POST',
        body: JSON.stringify({ userId: user?.id, cafeId: shopInfo?.id }),
      })

      if (!res.ok) {
        throw new Error('Fail to add Favorite')
      }

      const result = await res.json()
      console.log(result)
      refreshUser()
    } catch (err) {
      console.error(s.error.toggleFavoriteFailed, err)
    }
  }

  // get detail data
  useEffect(() => {
    if (!shopId) return

    const timer = setTimeout(() => {
      const getDetail = async (id: string) => {
        try {
          const response = await fetch(`/api/cafe/${id}`)
          if (response.ok) {
            const data = await response.json()
            setShopInfo(data)
          } else {
            toast.error(t.map.error.fetchShopInfoFailed, {
              position: 'top-center',
            })
          }
        } catch {
          toast.error(t.map.error.fetchShopInfoFailed, {
            position: 'top-center',
          })
        }
      }

      getDetail(shopId)
    }, 0) // 延遲時間

    return () => clearTimeout(timer)
  }, [shopId, t.map.error.fetchShopInfoFailed])

  return (
    <ScrollArea className="h-full no-scrollbar">
      {/* 店名 */}
      <section className="p-4 flex flex-col gap-2">
        {shopInfo ? (
          <>
            <span className="text-xl font-bold text-left">
              {shopInfo?.displayName}
            </span>
            {shopInfo?.businessStatus !== 'OPERATIONAL' && (
              <span className="text-sm text-destructive">
                {
                  {
                    OPERATIONAL: '',
                    CLOSED_TEMPORARILY: s.businessStatus.CLOSED_TEMPORARILY,
                    CLOSED_PERMANENTLY: s.businessStatus.CLOSED_PERMANENTLY,
                  }[shopInfo?.businessStatus]
                }
              </span>
            )}
          </>
        ) : (
          <Skeleton className="w-full h-7" />
        )}
      </section>

      {/* 地址 */}
      <section className="px-4 pb-4">
        {shopInfo ? (
          <Item
            variant="outline"
            className="rounded-4xl"
          >
            <ItemMedia>
              <MapPin className="w-4" />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>{shopInfo?.shortFormattedAddress}</ItemTitle>
            </ItemContent>
            <ItemActions>
              <Button
                size="icon"
                variant="ghost"
              >
                <Link
                  href={shopInfo?.googleMapsURI}
                  target="_blank"
                >
                  <ExternalLink />
                </Link>
              </Button>
            </ItemActions>
          </Item>
        ) : (
          <Skeleton className="w-full h-17" />
        )}
      </section>

      {/* 工具列 */}
      {hasUser && (
        <section className="px-4 pb-4 flex gap-2">
          {shopInfo ? (
            <Button
              variant="outline"
              className={clsx(
                'flex align-middle gap-2 rounded-4xl',
                hasFavorited && 'bg-red-200'
              )}
              onClick={() => toggleFavorite()}
            >
              <Heart className={clsx(hasFavorited && 'fill-current')} />
            </Button>
          ) : (
            <Skeleton className="w-full h-13" />
          )}
        </section>
      )}

      <Divider />

      <section className="p-4">
        {shopInfo ? (
          <>
            {/* Details */}
            <ShopDetail shopInfo={shopInfo} />

            {/* form */}
            {hasUser && !hasReported && (
              <>
                <Divider />
                <section className="p-4 w-full mb-10">
                  {!isEditing ? (
                    <div className="flex justify-center gap-4">
                      <Button
                        variant="outline"
                        className="rounded-full w-full"
                        onClick={() => setIsEditing(true)}
                      >
                        <Pencil className="w-4 h-4" />
                        <span className="font-bold text-md">
                          {s.button.editInfo}
                        </span>
                      </Button>
                    </div>
                  ) : (
                    <ShopForm
                      shopInfo={shopInfo}
                      setIsEditing={setIsEditing}
                      onReported={refreshShop}
                    />
                  )}
                </section>
              </>
            )}
          </>
        ) : (
          <Skeleton className="w-full h-100 " />
        )}
      </section>

      <div className="h-8" />
    </ScrollArea>
  )
}

export default ShopInfo
