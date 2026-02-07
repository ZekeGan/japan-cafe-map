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
  CircleDollarSign,
  Clock,
  Coffee,
  ExternalLink,
  Heart,
  Infinity,
  MapPin,
  Pencil,
  Tent,
  Volume,
  Volume1,
  Volume2,
  VolumeX,
  Warehouse,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import Divider from '@/components/divider'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { ReportFormValues, reportSchema } from '@/lib/validations/report'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo, useState } from 'react'
import {
  Item,
  ItemActions,
  ItemContent,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item'
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group'
import Link from 'next/link'
import { useAuth } from '@/context/authContext'

const SmallLabel = ({ str }: { str: string }) => {
  return <div className="text-[9px] font-bold ">{str}</div>
}

const ShopInfo = (props: {
  shopInfo: Cafe
  setShopInfo: (shopInfo: Cafe | null) => void
}) => {
  const { shopInfo, setShopInfo } = props
  const { user, refreshUser } = useAuth()

  const hasUser = Boolean(user?.id)
  const hasReported =
    user?.reports.some(report => report.cafeId === shopInfo?.id) || false

  const form = useForm<ReportFormValues>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      cafeId: shopInfo?.id || '',
      userId: user?.id || '',

      hasWifi: shopInfo?.hasWifi || false,
      hasPowerOutlets: shopInfo?.hasPowerOutlets || false,
      outletCoverage: shopInfo?.outletCoverage || 'SOME',

      seatCapacity: shopInfo?.seatCapacity || 'LIMITED',
      noiseLevel: shopInfo?.noiseLevel || 'SILENT',

      minConsumption: shopInfo?.minConsumption || true,
      timeLimit: shopInfo?.timeLimit || false,
      isBookingRequired: shopInfo?.isBookingRequired || false,

      hasSmokingArea: shopInfo?.hasSmokingArea || false,
      smokingAreaType: shopInfo?.smokingAreaType || 'INDOOR_SEPARATED',
      allowCigaretteType: shopInfo?.allowCigaretteType || ['TRADITIONAL'],
    },
  })

  const [isEditing, setIsEditing] = useState(true)

  const onSubmit = async (data: ReportFormValues) => {
    await fetch('/api/report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    await refreshUser()

    // setIsEditing(false)
  }

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
            value: shopInfo?.timeLimit || null,
          },
          { label: '是否需要預約', value: shopInfo?.isBookingRequired || null },
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
          {hasUser && (
            <>
              {/* 工具列 */}
              <section className="p-4 flex gap-2">
                <Button
                  variant="outline"
                  className="flex align-middle gap-2"
                >
                  <Heart />
                  <span className="text-xs">Fav</span>
                </Button>
              </section>

              {/* 提供資料 */}
              {!hasReported && (
                <section className="p-4 w-full ">
                  {!isEditing ? (
                    <div>
                      <h1 className="text-center text-md font-bold mb-2">
                        是否幫忙編輯該商店資訊
                      </h1>
                      <div className="flex justify-center gap-4">
                        <Button
                          variant="outline"
                          className="gap-2"
                          onClick={() => setIsEditing(true)}
                        >
                          <Pencil className="w-4 h-4" /> <span>Yes</span>
                        </Button>
                        <Button
                          variant="outline"
                          className="gap-2"
                          onClick={() => setShopInfo(null)}
                        >
                          <X className="w-4 h-4" /> <span>No</span>
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <form
                      className="flex flex-col gap-4 pb-20"
                      onSubmit={form.handleSubmit(onSubmit)}
                    >
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
                              <Controller
                                name="hasWifi"
                                control={form.control}
                                render={({ field }) => (
                                  <ToggleGroup
                                    type="single"
                                    variant="outline"
                                    value={String(field.value)}
                                    onValueChange={val =>
                                      field.onChange(
                                        val === 'true'
                                          ? true
                                          : val === 'false'
                                            ? false
                                            : null
                                      )
                                    }
                                  >
                                    <ToggleGroupItem value="true">
                                      <Check />
                                    </ToggleGroupItem>
                                    <ToggleGroupItem value="false">
                                      <X />
                                    </ToggleGroupItem>
                                  </ToggleGroup>
                                )}
                              />
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
                              <Controller
                                name="hasPowerOutlets"
                                control={form.control}
                                render={({ field }) => (
                                  <ToggleGroup
                                    type="single"
                                    variant="outline"
                                    value={String(field.value)}
                                    onValueChange={val =>
                                      field.onChange(
                                        val === 'true'
                                          ? true
                                          : val === 'false'
                                            ? false
                                            : null
                                      )
                                    }
                                  >
                                    <ToggleGroupItem value="true">
                                      <Check />
                                    </ToggleGroupItem>
                                    <ToggleGroupItem value="false">
                                      <X />
                                    </ToggleGroupItem>
                                  </ToggleGroup>
                                )}
                              />
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
                              <Controller
                                name="outletCoverage"
                                control={form.control}
                                render={({ field }) => (
                                  <ToggleGroup
                                    type="single"
                                    variant="outline"
                                    value={field.value || ''}
                                    onValueChange={field.onChange}
                                  >
                                    <ToggleGroupItem value="NONE">
                                      <Battery />
                                    </ToggleGroupItem>
                                    <ToggleGroupItem value="SOME">
                                      <BatteryLow />
                                    </ToggleGroupItem>
                                    <ToggleGroupItem value="MOST">
                                      <BatteryMedium />
                                    </ToggleGroupItem>
                                    <ToggleGroupItem value="EVERY">
                                      <BatteryFull />
                                    </ToggleGroupItem>
                                  </ToggleGroup>
                                )}
                              />
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
                              <Controller
                                name="seatCapacity"
                                control={form.control}
                                render={({ field }) => (
                                  <ToggleGroup
                                    type="single"
                                    variant="outline"
                                    value={field.value || ''}
                                    onValueChange={field.onChange}
                                  >
                                    <ToggleGroupItem value="MINIMAL">
                                      <SmallLabel str="1-5" />
                                    </ToggleGroupItem>
                                    <ToggleGroupItem value="LIMITED">
                                      <SmallLabel str="6-15" />
                                    </ToggleGroupItem>
                                    <ToggleGroupItem value="STANDARD">
                                      <SmallLabel str="16-30" />
                                    </ToggleGroupItem>
                                    <ToggleGroupItem value="GENEROUS">
                                      <SmallLabel str="31+" />
                                    </ToggleGroupItem>
                                  </ToggleGroup>
                                )}
                              />
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
                              <Controller
                                name="noiseLevel"
                                control={form.control}
                                render={({ field }) => (
                                  <ToggleGroup
                                    type="single"
                                    variant="outline"
                                    value={field.value || ''}
                                    onValueChange={field.onChange}
                                  >
                                    <ToggleGroupItem value="SILENT">
                                      <VolumeX />
                                    </ToggleGroupItem>
                                    <ToggleGroupItem value="QUIET">
                                      <Volume />
                                    </ToggleGroupItem>
                                    <ToggleGroupItem value="MODERATE">
                                      <Volume1 />
                                    </ToggleGroupItem>
                                    <ToggleGroupItem value="VIBRANT ">
                                      <Volume2 />
                                    </ToggleGroupItem>
                                  </ToggleGroup>
                                )}
                              />
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
                              <Controller
                                name="isBookingRequired"
                                control={form.control}
                                render={({ field }) => (
                                  <ToggleGroup
                                    type="single"
                                    variant="outline"
                                    value={String(field.value)}
                                    onValueChange={val =>
                                      field.onChange(
                                        val === 'true'
                                          ? true
                                          : val === 'false'
                                            ? false
                                            : null
                                      )
                                    }
                                  >
                                    <ToggleGroupItem value="true">
                                      <Check />
                                    </ToggleGroupItem>
                                    <ToggleGroupItem value="false">
                                      <X />
                                    </ToggleGroupItem>
                                  </ToggleGroup>
                                )}
                              />
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
                              <Controller
                                name="timeLimit"
                                control={form.control}
                                render={({ field }) => (
                                  <ToggleGroup
                                    type="single"
                                    variant="outline"
                                    value={String(field.value)}
                                    onValueChange={val =>
                                      field.onChange(
                                        val === 'true'
                                          ? true
                                          : val === 'false'
                                            ? false
                                            : null
                                      )
                                    }
                                  >
                                    <ToggleGroupItem value="false">
                                      <Infinity />
                                    </ToggleGroupItem>
                                    <ToggleGroupItem value="true">
                                      <Clock />
                                    </ToggleGroupItem>
                                  </ToggleGroup>
                                )}
                              />
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
                              <Controller
                                name="minConsumption"
                                control={form.control}
                                render={({ field }) => (
                                  <ToggleGroup
                                    type="single"
                                    variant="outline"
                                    value={String(field.value)}
                                    onValueChange={val =>
                                      field.onChange(
                                        val === 'true'
                                          ? true
                                          : val === 'false'
                                            ? false
                                            : null
                                      )
                                    }
                                  >
                                    <ToggleGroupItem value="true">
                                      <Coffee />
                                    </ToggleGroupItem>
                                    <ToggleGroupItem value="false">
                                      <CircleDollarSign />
                                    </ToggleGroupItem>
                                  </ToggleGroup>
                                )}
                              />
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
                              <Controller
                                name="hasSmokingArea"
                                control={form.control}
                                render={({ field }) => (
                                  <ToggleGroup
                                    type="single"
                                    variant="outline"
                                    value={String(field.value)}
                                    onValueChange={val =>
                                      field.onChange(
                                        val === 'true'
                                          ? true
                                          : val === 'false'
                                            ? false
                                            : null
                                      )
                                    }
                                  >
                                    <ToggleGroupItem value="true">
                                      <Check />
                                    </ToggleGroupItem>
                                    <ToggleGroupItem value="false">
                                      <X />
                                    </ToggleGroupItem>
                                  </ToggleGroup>
                                )}
                              />
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
                              <Controller
                                name="smokingAreaType"
                                control={form.control}
                                render={({ field }) => (
                                  <ToggleGroup
                                    type="single"
                                    variant="outline"
                                    value={field.value || ''}
                                    onValueChange={field.onChange}
                                  >
                                    <ToggleGroupItem value="INDOOR_TABLE">
                                      <Armchair />
                                    </ToggleGroupItem>
                                    <ToggleGroupItem value="INDOOR_SEPARATED">
                                      <Warehouse />
                                    </ToggleGroupItem>
                                    <ToggleGroupItem value="OUTDOOR">
                                      <Tent />
                                    </ToggleGroupItem>
                                  </ToggleGroup>
                                )}
                              />
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
                              <Controller
                                name="allowCigaretteType"
                                control={form.control}
                                render={({ field }) => (
                                  <ToggleGroup
                                    type="multiple"
                                    variant="outline"
                                    value={field.value || []}
                                    onValueChange={field.onChange}
                                  >
                                    <ToggleGroupItem value="TRADITIONAL">
                                      <SmallLabel str="傳統" />
                                    </ToggleGroupItem>
                                    <ToggleGroupItem value="ELECTRONIC">
                                      <SmallLabel str="加熱菸" />
                                    </ToggleGroupItem>
                                    <ToggleGroupItem value="VAPE">
                                      <SmallLabel str="電子菸" />
                                    </ToggleGroupItem>
                                  </ToggleGroup>
                                )}
                              />
                            </ItemActions>
                          </Item>
                        </div>
                      </div>

                      <Button type="submit">送出</Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsEditing(false)}
                      >
                        取消
                      </Button>
                    </form>
                  )}
                </section>
              )}
              <Divider />
            </>
          )}
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
