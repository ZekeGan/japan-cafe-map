/* eslint-disable @next/next/no-img-element */
'use client'

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
  CigaretteOff,
  CircleDollarSign,
  Clock,
  Coffee,
  Coins,
  ExternalLink,
  Heart,
  HousePlug,
  Infinity,
  MapPin,
  NotebookPen,
  NotebookPenIcon,
  Pencil,
  PersonStanding,
  Plug,
  PlugZap,
  Tent,
  Volume,
  Volume1,
  Volume2,
  VolumeX,
  Warehouse,
  Wifi,
  WifiOff,
  WindIcon,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import Divider from '@/components/divider'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { ReportFormValues, reportSchema } from '@/lib/validations/report'
import { zodResolver } from '@hookform/resolvers/zod'
import { ReactNode, useEffect, useMemo, useState } from 'react'
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
import clsx from 'clsx'

const SmallLabel = ({ str }: { str: string }) => {
  return <div className="text-[9px] font-bold ">{str}</div>
}

const EditItem = ({
  title,
  component,
}: {
  title: string
  component: ReactNode
}) => {
  return (
    <Item
      variant="outline"
      className="p-2"
    >
      <ItemContent>
        <ItemTitle>{title}</ItemTitle>
      </ItemContent>
      <ItemActions>{component}</ItemActions>
    </Item>
  )
}

const BooleanDisplayCard = ({
  onOff,
  onIcon,
  onLabel,
  offIcon,
  offLabel,
}: {
  onOff: boolean
  onIcon: ReactNode
  offIcon: ReactNode
  onLabel: string
  offLabel: string
}) => {
  return (
    <Card>
      <CardContent className="flex justify-center p-2">
        <div className="flex flex-col items-center gap-2">
          {onOff ? (
            <>
              {onIcon}
              <div className="font-bold text-sm">{onLabel}</div>
            </>
          ) : (
            <>
              {offIcon}
              <div className="font-bold text-sm">{offLabel}</div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

const ShopInfo = ({ shopInfo }: { shopInfo: Cafe | null }) => {
  const { user, refreshUser } = useAuth()

  const hasUser = Boolean(user?.id)
  const hasReported =
    user?.reports.some(report => report.cafeId === shopInfo?.id) || false
  const hasFavorited =
    user?.favorites.some(fav => fav.cafeId === shopInfo?.id) || false

  const [isEditing, setIsEditing] = useState(false)

  const form = useForm<ReportFormValues>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      cafeId: shopInfo?.id || '',
      userId: user?.id || '',

      hasWifi: shopInfo?.hasWifi || null,
      hasPowerOutlets: shopInfo?.hasPowerOutlets || null,
      outletCoverage: shopInfo?.outletCoverage || null,

      seatCapacity: shopInfo?.seatCapacity || null,
      noiseLevel: shopInfo?.noiseLevel || null,

      minConsumption: shopInfo?.minConsumption || null,
      timeLimit: shopInfo?.timeLimit || null,
      isBookingRequired: shopInfo?.isBookingRequired || null,

      hasSmokingArea: shopInfo?.hasSmokingArea || null,
      smokingAreaType: shopInfo?.smokingAreaType || null,
      allowCigaretteType: shopInfo?.allowCigaretteType || [],
    },
  })

  const onSubmit = async (data: ReportFormValues) => {
    await fetch('/api/report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    await refreshUser()
  }

  const toggleFavorite = async () => {
    try {
      const response = await fetch('/api/favorite', {
        method: 'POST',
        body: JSON.stringify({ userId: user?.id, cafeId: shopInfo?.id }),
      })

      if (response.ok) {
        const result = await response.json()
        console.log(result)
        refreshUser()
      }
    } catch (error) {
      console.error('操作失敗', error)
    }
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

  useEffect(() => {
    if (!shopInfo) form.reset()
  }, [form, shopInfo])

  if (!shopInfo) return null

  return (
    <ScrollArea className="h-full no-scrollbar">
      {/* 店名 */}
      <div className="p-4">
        <div className="text-md font-bold text-left">
          {shopInfo?.displayName}
        </div>
      </div>
      {/* 地址 */}
      <div className="px-4">
        <Item variant="outline">
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
              <Link href={shopInfo.googleMapsURI}>
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
              className={clsx(
                'flex align-middle gap-2',
                hasFavorited && 'bg-red-200'
              )}
              onClick={() => toggleFavorite()}
            >
              <Heart className={clsx(hasFavorited && 'fill-current ')} />
              <span className="text-xs">Fav</span>
            </Button>
          </section>

          {/* 提供資料 */}
          {!hasReported && (
            <>
              <Divider />
              <section className="p-4 w-full">
                {!isEditing ? (
                  <div className="flex justify-center gap-4">
                    <Button
                      variant="outline"
                      className="gap-2"
                      onClick={() => setIsEditing(true)}
                    >
                      <Pencil className="w-4 h-4" />{' '}
                      <span className="font-bold text-md">
                        幫助編輯店家資訊
                      </span>
                    </Button>
                  </div>
                ) : (
                  <form
                    className="flex flex-col gap-8 pb-20" // 稍微增加區塊間距
                    onSubmit={form.handleSubmit(onSubmit)}
                  >
                    {/* 設施區塊 */}
                    <section className="flex flex-col gap-3">
                      <h1 className="text-lg font-bold mb-2">設施</h1>

                      <EditItem
                        title="是否有WIFI"
                        component={
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
                        }
                      />

                      <EditItem
                        title="是否有插座"
                        component={
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
                        }
                      />

                      <EditItem
                        title="插座覆蓋率"
                        component={
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
                        }
                      />
                    </section>

                    {/* 環境區塊 */}
                    <section className="flex flex-col gap-3">
                      <h1 className="text-lg font-bold mb-2">環境</h1>

                      <EditItem
                        title="座位數量"
                        component={
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
                        }
                      />

                      <EditItem
                        title="噪音等級"
                        component={
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
                                <ToggleGroupItem value="VIBRANT">
                                  <Volume2 />
                                </ToggleGroupItem>
                              </ToggleGroup>
                            )}
                          />
                        }
                      />
                    </section>

                    {/* 消費區塊 */}
                    <section className="flex flex-col gap-3">
                      <h1 className="text-lg font-bold mb-2">消費</h1>

                      <EditItem
                        title="是否需要預約"
                        component={
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
                        }
                      />

                      <EditItem
                        title="使用時間限制"
                        component={
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
                        }
                      />

                      <EditItem
                        title="低消限制"
                        component={
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
                        }
                      />
                    </section>

                    {/* 吸菸區區塊 */}
                    <section className="flex flex-col gap-3">
                      <h1 className="text-lg font-bold mb-2">吸菸設定</h1>

                      <EditItem
                        title="是否有吸菸區"
                        component={
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
                        }
                      />

                      <EditItem
                        title="吸菸區類型"
                        component={
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
                        }
                      />

                      <EditItem
                        title="可吸食種類"
                        component={
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
                        }
                      />
                    </section>

                    {/* 按鈕組 */}
                    <div className="flex flex-col gap-2 mt-4">
                      <Button
                        type="submit"
                        className="w-full"
                      >
                        送出
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsEditing(false)}
                        className="w-full"
                      >
                        取消
                      </Button>
                    </div>
                  </form>
                )}
              </section>
            </>
          )}
          <Divider />
        </>
      )}
      <Divider />
      {/* Details */}
      <div className="p-4 ">
        <div className="flex flex-col gap-4">
          <section className="grid grid-cols-3 gap-2">
            <BooleanDisplayCard
              onOff={shopInfo?.hasWifi || false}
              onIcon={<Wifi />}
              offIcon={<WifiOff />}
              onLabel="提供WIFI"
              offLabel="不提供WIFI"
            />
            <BooleanDisplayCard
              onOff={!shopInfo?.hasWifi || false}
              onIcon={<Wifi />}
              offIcon={<WifiOff />}
              onLabel="提供WIFI"
              offLabel="不提供WIFI"
            />
            <BooleanDisplayCard
              onOff={shopInfo?.hasSmokingArea || false}
              onIcon={<Cigarette />}
              offIcon={<CigaretteOff />}
              onLabel="有吸菸區"
              offLabel="無吸菸區"
            />
            <BooleanDisplayCard
              onOff={!shopInfo?.hasSmokingArea || false}
              onIcon={<Cigarette />}
              offIcon={<CigaretteOff />}
              onLabel="有吸菸區"
              offLabel="無吸菸區"
            />
            <BooleanDisplayCard
              onOff={!shopInfo?.timeLimit || false}
              onIcon={<Infinity />}
              offIcon={<Clock />}
              onLabel="無限時"
              offLabel="有限時"
            />
            <BooleanDisplayCard
              onOff={shopInfo?.timeLimit || false}
              onIcon={<Infinity />}
              offIcon={<Clock />}
              onLabel="無限時"
              offLabel="有限時"
            />
            <BooleanDisplayCard
              onOff={shopInfo?.isBookingRequired || false}
              onIcon={<NotebookPen />}
              offIcon={<PersonStanding />}
              onLabel="需預訂"
              offLabel="無須預定"
            />
            <BooleanDisplayCard
              onOff={!shopInfo?.isBookingRequired || false}
              onIcon={<NotebookPen />}
              offIcon={<PersonStanding />}
              onLabel="需預訂"
              offLabel="無須預定"
            />
            <BooleanDisplayCard
              onOff={!shopInfo?.minConsumption || false}
              onIcon={<Coffee />}
              offIcon={<CircleDollarSign />}
              onLabel="一杯飲料"
              offLabel="須高消"
            />
            <BooleanDisplayCard
              onOff={shopInfo?.minConsumption || false}
              onIcon={<Coffee />}
              offIcon={<CircleDollarSign />}
              onLabel="一杯飲料"
              offLabel="須高消"
            />
            <BooleanDisplayCard
              onOff={shopInfo?.minConsumption || false}
              onIcon={<HousePlug />}
              offIcon={<PlugZap />}
              onLabel="有插座"
              offLabel="無插座"
            />
            <BooleanDisplayCard
              onOff={!shopInfo?.minConsumption || false}
              onIcon={<HousePlug />}
              offIcon={<PlugZap />}
              onLabel="有插座"
              offLabel="無插座"
            />
          </section>
          {shopDetails.map(section => {
            // if (section.items.every(i => i.value === null)) return null

            return (
              <Card
                key={section.label}
                className="w-full p-3 "
              >
                <CardContent className="p-0">
                  <h1 className="text-lg font-bold mb-2">{section.label}</h1>
                  <div>
                    {section.items.map(i => {
                      // if (i.value === null) return null
                      return (
                        <div
                          key={i.label}
                          className="grid grid-cols-3 border-b last:border-0 p-2"
                        >
                          <div className="text-sm text-gray-500">{i.label}</div>
                          <div className="col-span-2 text-sm">{i.value}</div>
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
  )
}

export default ShopInfo
