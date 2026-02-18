'use client'

import { ScrollArea } from '@/components/ui/scroll-area'
import { Cafe } from '@prisma/client'
import {
  Armchair,
  Ban,
  Battery,
  BatteryFull,
  BatteryLow,
  BatteryMedium,
  Calendar,
  CalendarOff,
  Check,
  Cigarette,
  CigaretteOff,
  CircleDollarSign,
  Clock,
  Coffee,
  ExternalLink,
  Heart,
  Infinity,
  MapPin,
  Pencil,
  Plug,
  Tent,
  Unplug,
  Volume,
  Volume1,
  Volume2,
  VolumeX,
  Warehouse,
  Wifi,
  WifiOff,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import Divider from '@/components/divider'
import { Controller, useForm } from 'react-hook-form'
import { ReportFormValues, reportSchema } from '@/lib/validations/report'
import { zodResolver } from '@hookform/resolvers/zod'
import { ReactNode, useEffect, useState } from 'react'
import {
  Item,
  ItemActions,
  ItemContent,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import Link from 'next/link'
import { useAuth } from '@/context/authContext'
import clsx from 'clsx'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'

interface FeatureItemProps {
  icon?: React.ReactNode // 改為選填
  label: React.ReactNode
  className?: string
  isEmpty?: boolean
}

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
    <Item className="p-2">
      <ItemContent>
        <ItemTitle>{title}</ItemTitle>
      </ItemContent>
      <ItemActions>{component}</ItemActions>
    </Item>
  )
}

const FeatureItem = ({
  icon,
  label,
  className = '',
  isEmpty = false,
}: FeatureItemProps) => {
  return (
    <Item
      variant="muted"
      className={`rounded-4xl ${className} ${isEmpty ? 'opacity-50' : ''}`}
    >
      {/* 只有當 icon 存在時才渲染 Media 區塊 */}
      {icon && (
        <ItemMedia className={isEmpty ? 'text-gray-300' : ''}>{icon}</ItemMedia>
      )}
      <ItemContent className="w-full">
        <div className={isEmpty ? 'text-gray-300' : ''}>{label}</div>
      </ItemContent>
    </Item>
  )
}

const ShopDetail = ({ shopInfo }: { shopInfo: Cafe }) => {
  const {
    outletCoverage,
    hasWifi,
    seatCapacity,
    noiseLevel,
    smokingAreaType,
    allowCigaretteType,
    minConsumption,
    timeLimit,
    isBookingRequired,
  } = shopInfo

  return (
    <section className="p-4 grid grid-cols-2 gap-2">
      {/* WIFI */}
      <FeatureItem
        isEmpty={hasWifi === null}
        icon={hasWifi ? <Wifi /> : <WifiOff />}
        label={
          hasWifi === null ? 'NO DATA' : hasWifi ? '提供WIFI' : '不提供WIFI'
        }
      />

      {/* 插座 */}
      <FeatureItem
        isEmpty={outletCoverage === null}
        icon={
          outletCoverage && outletCoverage !== 'NONE' ? <Plug /> : <Unplug />
        }
        label={
          outletCoverage
            ? `${{ EVERY: '每個', MOST: '多數', SOME: '部分', NONE: '沒有' }[outletCoverage]} 位置有`
            : 'NO DATA'
        }
      />

      {/* 座位 */}
      <FeatureItem
        isEmpty={!seatCapacity}
        icon={<Armchair />}
        label={
          seatCapacity
            ? `${
                {
                  MINIMAL: '1-5',
                  LIMITED: '6-15',
                  STANDARD: '16-30',
                  GENEROUS: '31+',
                }[seatCapacity]
              } 個位置`
            : 'NO DATA'
        }
      />

      {/* 預約 */}
      <FeatureItem
        isEmpty={isBookingRequired === null}
        icon={isBookingRequired ? <Calendar /> : <CalendarOff />}
        label={
          isBookingRequired === null
            ? 'NO DATA'
            : isBookingRequired
              ? '需要預約'
              : '不需要預約'
        }
      />

      {/* 噪音 */}
      <FeatureItem
        className="col-span-2"
        isEmpty={!noiseLevel}
        label={
          <>
            {/* 標題與標籤 */}
            <div className="flex justify-between items-center mb-4">
              <div className="text-md font-medium">噪音等級</div>
              {noiseLevel && <Badge>{noiseLevel}</Badge>}
            </div>

            {/* 動態長條圖 */}
            <div className="flex items-end justify-between h-10">
              {/* 固定的容器高度讓對齊更美 */}
              {Array.from({ length: 40 }).map((_, idx) => {
                const param: Record<string, number> = {
                  SILENT: 5,
                  QUIET: 10,
                  MODERATE: 20,
                  VIBRANT: 30,
                  default: 0,
                }

                const baseHeight = noiseLevel
                  ? param[noiseLevel]
                  : param.default
                // eslint-disable-next-line react-hooks/purity
                const randomHeight = Math.floor(Math.random() * baseHeight) + 5

                return (
                  <div
                    key={idx}
                    className={`w-1 rounded-full ${noiseLevel ? 'bg-black' : 'bg-gray-300'}`}
                    style={{ height: `${randomHeight}px` }}
                  />
                )
              })}
            </div>
          </>
        }
      />

      {/* 低消 */}
      <FeatureItem
        isEmpty={minConsumption === null}
        icon={minConsumption ? <CircleDollarSign /> : <Coffee />}
        label={
          minConsumption === null
            ? 'NO DATA'
            : minConsumption
              ? '飲料加餐點'
              : '一杯飲料即可'
        }
      />

      {/* 限時 */}
      <FeatureItem
        isEmpty={timeLimit === null}
        icon={timeLimit ? <Infinity /> : <Clock />}
        label={timeLimit === null ? 'NO DATA' : timeLimit ? '無時限' : '有時限'}
      />

      {/* 抽菸 */}
      <FeatureItem
        className="col-span-2"
        isEmpty={smokingAreaType === null}
        icon={
          smokingAreaType && smokingAreaType !== 'NONE' ? (
            <Cigarette />
          ) : (
            <CigaretteOff />
          )
        }
        label={
          <div className="flex justify-between items-center w-full">
            <div>
              {
                {
                  INDOOR_SEPARATED: '專門吸菸區內可抽',
                  INDOOR_TABLE: '座位可抽',
                  OUTDOOR: '戶外可抽',
                  NONE: '不可抽菸',
                  default: 'NO DATA',
                }[smokingAreaType ?? 'default']
              }
            </div>
            {smokingAreaType &&
              smokingAreaType !== 'NONE' &&
              allowCigaretteType && (
                <div className="flex items-center gap-1">
                  {allowCigaretteType.map(d => (
                    <Badge key={d}>
                      {{
                        TRADITIONAL: '紙菸',
                        ELECTRONIC: '加熱菸',
                        VAPE: '電子菸',
                        OTHER: '其他',
                      }[d] || '其他'}
                    </Badge>
                  ))}
                </div>
              )}
          </div>
        }
      />
    </section>
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
      outletCoverage: shopInfo?.outletCoverage || null,

      seatCapacity: shopInfo?.seatCapacity || null,
      noiseLevel: shopInfo?.noiseLevel || null,

      minConsumption: shopInfo?.minConsumption || null,
      timeLimit: shopInfo?.timeLimit || null,
      isBookingRequired: shopInfo?.isBookingRequired || null,

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

  useEffect(() => {
    if (!shopInfo) form.reset()
  }, [form, shopInfo])

  if (!shopInfo) return null

  return (
    <ScrollArea className="h-full no-scrollbar">
      {/* 店名 */}
      <div className="p-4">
        <span className="text-md font-bold text-left">
          {shopInfo?.displayName}
        </span>
      </div>

      {/* 地址 */}
      <div className="px-4 pb-4">
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
              <Link href={shopInfo.googleMapsURI}>
                <ExternalLink />
              </Link>
            </Button>
          </ItemActions>
        </Item>
      </div>

      {/* 工具列 */}
      {hasUser && (
        <section className="px-4 pb-4 flex gap-2">
          <Button
            variant="outline"
            className={clsx(
              'flex align-middle gap-2 rounded-4xl',
              hasFavorited && 'bg-red-200'
            )}
            onClick={() => toggleFavorite()}
          >
            <Heart className={clsx(hasFavorited && 'fill-current ')} />
            <span className="text-xs">Fav</span>
          </Button>
        </section>
      )}

      {/* Details */}
      {shopInfo && (
        <>
          <Divider />
          <ShopDetail shopInfo={shopInfo} />
        </>
      )}

      {/* 表單 */}
      {hasUser && !hasReported && (
        <>
          <Divider />
          <section className="p-4 w-full mb-10">
            {!isEditing ? (
              <div className="flex justify-center gap-4 ">
                <Button
                  variant="outline"
                  className="rounded-full w-full"
                  onClick={() => setIsEditing(true)}
                >
                  <Pencil className="w-4 h-4" />{' '}
                  <span className="font-bold text-md">幫助編輯店家資訊</span>
                </Button>
              </div>
            ) : (
              <Card className="p-4">
                <form
                  className="flex flex-col gap-8" // 稍微增加區塊間距
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

                    {/* <EditItem
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
                    /> */}

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
                                <Ban />
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

                    {/* <EditItem
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
                    /> */}

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
                              <ToggleGroupItem value="NONE">
                                <Ban />
                              </ToggleGroupItem>
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
              </Card>
            )}
          </section>
        </>
      )}

      <div className=" h-8" />
    </ScrollArea>
  )
}

export default ShopInfo
