/* eslint-disable @next/next/no-img-element */
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent } from '@/components/ui/card'
import { Cafe } from '@prisma/client'
import {
  Armchair,
  Battery,
  BatteryFull,
  BatteryLow,
  BatteryMedium,
  Check,
  Cigarette,
  CircleDollarSign,
  Clock,
  Coffee,
  ExternalLink,
  Heart,
  Infinity,
  MapPin,
  Pencil,
  Tent,
  User,
  Volume,
  Volume1,
  Volume2,
  VolumeX,
  Warehouse,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import Divider from '@/components/divider'
import { useForm } from 'react-hook-form'
import { CafeFormValues, cafeSchema } from '@/lib/validations/cafe'
import { zodResolver } from '@hookform/resolvers/zod'
import { defaultLagitude, defaultLongitude } from '@/constant/location'
import { useMemo } from 'react'
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item'
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group'
import Link from 'next/link'

const SmallLabel = ({ str }: { str: string }) => {
  return <div className="text-[9px] font-bold ">{str}</div>
}

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
        lat: shopInfo?.location?.lat || defaultLagitude,
        lng: shopInfo?.location?.lng || defaultLongitude,
      },
      cigaratteType: shopInfo?.cigaratteType || [],
    },
  })

  const shopDetails = useMemo(() => {
    if (!shopInfo) return []
    return [
      {
        label: '設施',
        items: [
          { label: '是否有Wi-Fi', value: shopInfo?.hasWifi || null },
          { label: '是否有插座', value: shopInfo?.hasPowerOutlets || null },
          { label: '插座覆蓋率', value: shopInfo?.outletCoverage || null },
        ],
      },
      {
        label: '環境',
        items: [
          { label: '座位數', value: shopInfo?.seatCapacity || null },
          { label: '噪音等級', value: shopInfo?.noiseLevel || null },
        ],
      },
      {
        label: '吸菸',
        items: [
          { label: '是否有吸菸區', value: shopInfo?.hasSmokingArea || null },
          { label: '吸菸區類型', value: shopInfo?.smokingAreaType || 'null' },
        ],
      },
      {
        label: '消費',
        items: [
          { label: '最低消費', value: shopInfo?.minConsumption || null },
          {
            label: '時間限制(分鐘)',
            value: shopInfo?.timeLimitMinutes || null,
          },
          { label: '是否需要預約', value: shopInfo?.isBookingRequired || null },
          { label: '預約連結', value: shopInfo?.bookingUrl || null },
        ],
      },
    ]
  }, [shopInfo])

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
          {/* 店名 */}
          <DrawerHeader className="text-left">
            <DrawerTitle className="text-md font-bold text-left">
              {shopInfo?.displayName}
            </DrawerTitle>
            <DrawerDescription className="sr-only">
              Store details and connectivity information for{' '}
              {shopInfo?.displayName}
            </DrawerDescription>
          </DrawerHeader>
          {/* 地址 */}
          <div className="p-4">
            <Item variant="outline">
              <ItemMedia>
                <MapPin className="w-4" />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>{shopInfo?.formattedAddress}</ItemTitle>
              </ItemContent>
              <ItemActions>
                <Button
                  size="sm"
                  variant="link"
                >
                  <Link href="#">
                    <ExternalLink />
                  </Link>
                </Button>
              </ItemActions>
            </Item>
          </div>
          {/* toolbar */}
          <div className="p-4 flex gap-2">
            <Button
              variant="outline"
              className="flex align-middle gap-2"
            >
              <Heart />
              <span className="text-xs">Fav</span>
            </Button>
          </div>
          <Divider />
          {/* Edit Prompt */}
          <div className="p-4 w-full ">
            {/* 請求 */}
            <div>
              <h1 className="text-center text-md font-bold mb-2">
                是否幫忙編輯該商店資訊
              </h1>
              <div className="flex justify-center gap-4">
                <Button
                  variant="outline"
                  className="flex align-middle gap-2 "
                >
                  <Pencil />
                  <span className="text-xs">Yes</span>
                </Button>
                <Button
                  variant="outline"
                  className="flex align-middle gap-2 "
                >
                  <X />
                  <span className="text-xs">No</span>
                </Button>
              </div>
            </div>
            {/* 問題 */}
            <div className="flex flex-col gap-4 pb-20">
              {/* 設施 */}
              <div>
                <h1 className="text-lg mb-2">設施</h1>
                <div className="flex flex-col gap-2">
                  {/* 是否有WIFI */}
                  <Item
                    variant="outline"
                    className="p-2"
                  >
                    <ItemContent>
                      <ItemTitle>是否有WIFI</ItemTitle>
                    </ItemContent>
                    <ItemActions>
                      <ToggleGroup
                        type="single"
                        variant="outline"
                      >
                        <ToggleGroupItem
                          value="all"
                          aria-label="Toggle all"
                        >
                          <Check />
                        </ToggleGroupItem>
                        <ToggleGroupItem
                          value="missed"
                          aria-label="Toggle missed"
                        >
                          <X />
                        </ToggleGroupItem>
                      </ToggleGroup>
                    </ItemActions>
                  </Item>
                  {/* 是否有插座 */}
                  <Item
                    variant="outline"
                    className="p-2"
                  >
                    <ItemContent>
                      <ItemTitle>是否有插座</ItemTitle>
                    </ItemContent>
                    <ItemActions>
                      <ToggleGroup
                        type="single"
                        variant="outline"
                      >
                        <ToggleGroupItem
                          value="all"
                          aria-label="Toggle all"
                        >
                          <Check />
                        </ToggleGroupItem>
                        <ToggleGroupItem
                          value="missed"
                          aria-label="Toggle missed"
                        >
                          <X />
                        </ToggleGroupItem>
                      </ToggleGroup>
                    </ItemActions>
                  </Item>
                  {/* 插座覆蓋率 */}
                  <Item
                    variant="outline"
                    className="p-2"
                  >
                    <ItemContent>
                      <ItemTitle>插座覆蓋率</ItemTitle>
                    </ItemContent>
                    <ItemActions>
                      <ToggleGroup
                        type="single"
                        variant="outline"
                      >
                        <ToggleGroupItem
                          value="none"
                          aria-label="Toggle all"
                        >
                          <Battery />
                        </ToggleGroupItem>
                        <ToggleGroupItem
                          value="some"
                          aria-label="Toggle missed"
                        >
                          <BatteryLow />
                        </ToggleGroupItem>
                        <ToggleGroupItem
                          value="most"
                          aria-label="Toggle missed"
                        >
                          <BatteryMedium />
                        </ToggleGroupItem>
                        <ToggleGroupItem
                          value="every"
                          aria-label="Toggle missed"
                        >
                          <BatteryFull />
                        </ToggleGroupItem>
                      </ToggleGroup>
                    </ItemActions>
                  </Item>
                </div>
              </div>
              {/* 環境 */}
              <div>
                <h1 className="text-lg mb-2">環境</h1>
                <div className="flex flex-col gap-2">
                  {/* 座位數量 */}
                  <Item
                    variant="outline"
                    className="p-2"
                  >
                    <ItemContent>
                      <ItemTitle>座位數量</ItemTitle>
                    </ItemContent>
                    <ItemActions>
                      <ToggleGroup
                        type="single"
                        variant="outline"
                      >
                        <ToggleGroupItem
                          value="none"
                          aria-label="Toggle all"
                        >
                          <SmallLabel str="1-5" />
                        </ToggleGroupItem>
                        <ToggleGroupItem
                          value="some"
                          aria-label="Toggle missed"
                        >
                          <SmallLabel str="6-15" />
                        </ToggleGroupItem>
                        <ToggleGroupItem
                          value="most"
                          aria-label="Toggle missed"
                        >
                          <SmallLabel str="16-30" />
                        </ToggleGroupItem>
                        <ToggleGroupItem
                          value="every"
                          aria-label="Toggle missed"
                        >
                          <SmallLabel str="31+" />
                        </ToggleGroupItem>
                      </ToggleGroup>
                    </ItemActions>
                  </Item>
                  {/* 噪音等級 */}
                  <Item
                    variant="outline"
                    className="p-2"
                  >
                    <ItemContent>
                      <ItemTitle>噪音等級</ItemTitle>
                    </ItemContent>
                    <ItemActions>
                      <ToggleGroup
                        type="single"
                        variant="outline"
                      >
                        <ToggleGroupItem
                          value="none"
                          aria-label="Toggle all"
                        >
                          <VolumeX />
                        </ToggleGroupItem>
                        <ToggleGroupItem
                          value="some"
                          aria-label="Toggle missed"
                        >
                          <Volume />
                        </ToggleGroupItem>
                        <ToggleGroupItem
                          value="most"
                          aria-label="Toggle missed"
                        >
                          <Volume1 />
                        </ToggleGroupItem>
                        <ToggleGroupItem
                          value="every"
                          aria-label="Toggle missed"
                        >
                          <Volume2 />
                        </ToggleGroupItem>
                      </ToggleGroup>
                    </ItemActions>
                  </Item>
                </div>
              </div>
              {/* 消費 */}
              <div>
                <h1 className="text-lg mb-2">消費</h1>
                <div className="flex flex-col gap-2">
                  {/* 是否需要預約 */}
                  <Item
                    variant="outline"
                    className="p-2"
                  >
                    <ItemContent>
                      <ItemTitle>是否需要預約</ItemTitle>
                    </ItemContent>
                    <ItemActions>
                      <ToggleGroup
                        type="single"
                        variant="outline"
                      >
                        <ToggleGroupItem
                          value="true"
                          aria-label="Toggle all"
                        >
                          <Check />
                        </ToggleGroupItem>
                        <ToggleGroupItem
                          value="false"
                          aria-label="Toggle missed"
                        >
                          <X />
                        </ToggleGroupItem>
                      </ToggleGroup>
                    </ItemActions>
                  </Item>
                  {/* 使用時間 */}
                  <Item
                    variant="outline"
                    className="p-2"
                  >
                    <ItemContent>
                      <ItemTitle>使用時間</ItemTitle>
                    </ItemContent>
                    <ItemActions>
                      <ToggleGroup
                        type="single"
                        variant="outline"
                      >
                        <ToggleGroup
                          type="single"
                          variant="outline"
                        >
                          <ToggleGroupItem
                            value="some"
                            aria-label="Toggle missed"
                          >
                            <Infinity />
                          </ToggleGroupItem>
                          <ToggleGroupItem value="none">
                            <Clock />
                          </ToggleGroupItem>
                        </ToggleGroup>
                      </ToggleGroup>
                    </ItemActions>
                  </Item>
                  {/* 低消 */}
                  <Item
                    variant="outline"
                    className="p-2"
                  >
                    <ItemContent>
                      <ItemTitle>低消</ItemTitle>
                    </ItemContent>
                    <ItemActions>
                      <ToggleGroup
                        type="single"
                        variant="outline"
                      >
                        <ToggleGroupItem
                          value="none"
                          aria-label="Toggle all"
                        >
                          <Coffee />
                        </ToggleGroupItem>
                        <ToggleGroupItem
                          value="most"
                          aria-label="Toggle missed"
                        >
                          <CircleDollarSign />
                        </ToggleGroupItem>
                      </ToggleGroup>
                    </ItemActions>
                  </Item>
                </div>
              </div>
              {/* 吸菸 */}
              <div>
                <h1 className="text-lg mb-2">吸菸</h1>
                <div className="flex flex-col gap-2">
                  {/* 是否有WIFI */}
                  <Item
                    variant="outline"
                    className="p-2"
                  >
                    <ItemContent>
                      <ItemTitle>是否有吸菸區</ItemTitle>
                    </ItemContent>
                    <ItemActions>
                      <ToggleGroup
                        type="single"
                        variant="outline"
                      >
                        <ToggleGroupItem
                          value="true"
                          aria-label="Toggle all"
                        >
                          <Check />
                        </ToggleGroupItem>
                        <ToggleGroupItem
                          value="false"
                          aria-label="Toggle missed"
                        >
                          <X />
                        </ToggleGroupItem>
                      </ToggleGroup>
                    </ItemActions>
                  </Item>
                  {/* 吸菸區種類 */}
                  <Item
                    variant="outline"
                    className="p-2"
                  >
                    <ItemContent>
                      <ItemTitle>吸菸區類型</ItemTitle>
                    </ItemContent>
                    <ItemActions>
                      <ToggleGroup
                        type="single"
                        variant="outline"
                      >
                        <ToggleGroup
                          type="single"
                          variant="outline"
                        >
                          <ToggleGroupItem
                            value="some"
                            aria-label="Toggle missed"
                          >
                            <Armchair />
                          </ToggleGroupItem>
                          <ToggleGroupItem
                            value="none"
                            aria-label="Toggle all"
                          >
                            <Warehouse />
                          </ToggleGroupItem>
                          <ToggleGroupItem
                            value="most"
                            aria-label="Toggle missed"
                          >
                            <Tent />
                          </ToggleGroupItem>
                        </ToggleGroup>
                      </ToggleGroup>
                    </ItemActions>
                  </Item>
                  {/* 可吸食香菸種類 */}
                  <Item
                    variant="outline"
                    className="p-2"
                  >
                    <ItemContent>
                      <ItemTitle>可吸食香菸種類</ItemTitle>
                    </ItemContent>
                    <ItemActions>
                      <ToggleGroup
                        type="multiple"
                        variant="outline"
                      >
                        <ToggleGroupItem
                          value="none"
                          aria-label="Toggle all"
                        >
                          <SmallLabel str="傳統" />
                        </ToggleGroupItem>
                        <ToggleGroupItem
                          value="most"
                          aria-label="Toggle missed"
                        >
                          <SmallLabel str="加熱菸" />
                        </ToggleGroupItem>
                        <ToggleGroupItem
                          value="every"
                          aria-label="Toggle missed"
                        >
                          <SmallLabel str="電子菸" />
                        </ToggleGroupItem>
                      </ToggleGroup>
                    </ItemActions>
                  </Item>
                </div>
              </div>

              <Button
                className="mt-10"
                type="submit"
              >
                送出
              </Button>
              <Button
                type="submit"
                variant="outline"
              >
                取消
              </Button>
            </div>
          </div>
          <Divider />
          {/* Details */}
          <div className="p-4 ">
            <div className="flex flex-col gap-4">
              {shopDetails.map(section => {
                // if (section.items.every(i => i.value === null)) return null

                return (
                  <Card
                    key={section.label}
                    className="w-full p-3 "
                  >
                    <CardContent className="p-0">
                      <h1 className="text-lg font-bold mb-2">
                        {section.label}
                      </h1>
                      <div>
                        {section.items.map(i => {
                          // if (i.value === null) return null
                          return (
                            <div
                              key={i.label}
                              className="grid grid-cols-3 border-b last:border-0 p-2"
                            >
                              <div className="text-sm text-gray-500">
                                {i.label}
                              </div>
                              <div className="col-span-2 text-sm">
                                {i.value}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
          <div className="h-10" /> {/* 留白避免底部被裁切 */}
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  )
}

export default ShopInfo
