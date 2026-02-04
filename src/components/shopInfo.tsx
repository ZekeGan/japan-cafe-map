/* eslint-disable @next/next/no-img-element */
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { ScrollArea } from './ui/scroll-area'
import { Card, CardContent } from '@/components/ui/card'
import { Cafe } from '@prisma/client'
import { ExternalLink, Heart, MapPin, Pencil } from 'lucide-react'
import { Button } from './ui/button'
import Divider from './divider'
import { useForm } from 'react-hook-form'
import { CafeFormValues, cafeSchema } from '@/lib/validations/cafe'
import { zodResolver } from '@hookform/resolvers/zod'

const infoItems = [
  { label: 'seat Capacity Max', value: '123' },
  { label: 'has Wifi', value: '20250202' },
  { label: 'wifi SpeedMbps', value: '20250202' },
  { label: 'has Power Outlets', value: '20250202' },
  { label: 'outlet Coverage', value: '20250202' },
]

const ShopInfo = (props: {
  shopInfo: Cafe | null
  setShopInfo: (shopInfo: google.maps.places.Place | null) => void
}) => {
  const { shopInfo, setShopInfo } = props

  const form = useForm<CafeFormValues>({
    resolver: zodResolver(cafeSchema),
    defaultValues: {
      googlePlaceId: shopInfo?.googlePlaceId || '',
      displayName: shopInfo?.displayName || '',
      formattedAddress: shopInfo?.formattedAddress || '',
      businessStatus: shopInfo?.businessStatus || 'OPERATIONAL',
      location: {
        lat: shopInfo!.location?.lat || undefined,
        lng: shopInfo!.location?.lng || undefined,
      },
    },
  })
  if (!shopInfo) return null
  return (
    <Drawer
      open={Boolean(shopInfo)}
      onOpenChange={open => {
        if (!open) setShopInfo(null)
      }}
    >
      <DrawerContent className="h-[80%]">
        <ScrollArea className="h-full no-scrollbar">
          <DrawerHeader className="text-left">
            <DrawerTitle className="text-md font-bold text-left">
              {shopInfo?.displayName}
            </DrawerTitle>
            <DrawerDescription className="sr-only">
              Store details and connectivity information for{' '}
              {shopInfo?.displayName}
            </DrawerDescription>
          </DrawerHeader>
          <div className="flex gap-3 items-center p-4">
            <div className="w-fit">
              <MapPin />
            </div>

            <div className="text-sm text-gray-600">
              {shopInfo?.formattedAddress}
            </div>

            <Button
              variant="link"
              className="p-0"
            >
              <ExternalLink />
            </Button>
          </div>
          <Divider />
          <div className="p-4 flex gap-2">
            <Button
              variant="outline"
              className="flex align-middle gap-2"
            >
              <Pencil />
              <span className="text-xs">Edit</span>
            </Button>
            <Button
              variant="outline"
              className="flex align-middle gap-2"
            >
              <Heart />
              <span className="text-xs">Fav</span>
            </Button>
          </div>
          <Divider />
          <div className="p-4 ">
            {/* Details */}
            <div className="flex flex-col gap-5">
              {[1, 2, 3].map((_, idx) => (
                <Card
                  key={idx}
                  className="w-full"
                >
                  <CardContent>
                    <h1 className="text-lg font-bold mb-2">核心連接性</h1>
                    <div>
                      {infoItems.map(i => (
                        <div
                          key={i.label}
                          className="grid grid-cols-3 border-b last:border-0 p-2"
                        >
                          <div className="text-sm text-gray-500">{i.label}</div>
                          <div className="col-span-2 text-sm">{i.value}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          <div className="h-10" /> {/* 留白避免底部被裁切 */}
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  )
}

export default ShopInfo
