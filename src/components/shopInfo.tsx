'use client'

import { ScrollArea } from '@/components/ui/scroll-area'
import { Cafe, NoiseLevel } from '@prisma/client'
import {
  Armchair,
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
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group'
import Link from 'next/link'
import { useAuth } from '@/context/authContext'
import clsx from 'clsx'
import { Badge } from './ui/badge'
import { Card } from './ui/card'

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

const ShopDetail = ({ shopInfo }: { shopInfo: Cafe }) => {
  const {
    hasPowerOutlets,
    outletCoverage,
    hasWifi,
    seatCapacity,
    noiseLevel,
    hasSmokingArea,
    smokingAreaType,
    allowCigaretteType,
    minConsumption,
    timeLimit,
    isBookingRequired,
  } = shopInfo

  return (
    <section className="p-4 grid grid-cols-2 gap-2">
      {/* WIFI */}
      <Item
        variant="muted"
        className="rounded-4xl"
      >
        <ItemMedia>{hasWifi ? <Wifi /> : <WifiOff />}</ItemMedia>
        <ItemContent>
          <ItemTitle>{hasWifi ? '提供WIFI' : '不提供WIFI'}</ItemTitle>
        </ItemContent>
      </Item>

      {/* 插座 */}
      <Item
        variant="muted"
        className="rounded-4xl"
      >
        <ItemMedia>{hasPowerOutlets ? <Plug /> : <Unplug />}</ItemMedia>
        <ItemContent>
          <ItemTitle>
            {
              {
                EVERY: '每個', // 每個位置都有
                MOST: '多數', // 多數位置有
                SOME: '部分', // 部分位置有
                NONE: '沒有', // 無,
                default: '沒有',
              }[outletCoverage ?? 'default']
            }{' '}
            位置有
          </ItemTitle>
        </ItemContent>
      </Item>

      {/* 座位 */}
      <Item
        variant="muted"
        className=" rounded-4xl"
      >
        <ItemMedia>
          <Armchair />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>
            {
              {
                MINIMAL: '1-5', // 極少座位 (例如：1-5, 適合外帶或個人)
                LIMITED: '6-15', // 少量座位 (例如：6-15, 小型店面)
                STANDARD: '16-30', // 一般規模 (例如：16-30, 標準咖啡店)
                GENEROUS: '31+', // 空間寬敞 (例如：31+, 適合多人或久坐)
                default: 'NO DATA',
              }[seatCapacity ?? 'default']
            }{' '}
            個位置
          </ItemTitle>
        </ItemContent>
      </Item>

      {/* 預約 */}
      <Item
        variant="muted"
        className=" rounded-4xl"
      >
        <ItemMedia>
          {isBookingRequired ? <Calendar /> : <CalendarOff />}
        </ItemMedia>
        <ItemContent>
          <ItemTitle>{isBookingRequired ? '需要預約' : '不需要預約'}</ItemTitle>
        </ItemContent>
      </Item>

      {/* 噪音 */}
      <Item
        variant="muted"
        className="col-span-2 rounded-4xl"
      >
        <ItemContent>
          <div className="flex justify-between items-center mb-4">
            <div className="text-md">噪音等級</div>
            <Badge>{noiseLevel ?? 'NO DATA'}</Badge>
          </div>
          <div className="flex items-center justify-between">
            {Array.from({ length: 40 }).map((_, idx) => {
              const param: Record<NoiseLevel | 'default', number> = {
                SILENT: 5,
                QUIET: 10,
                MODERATE: 20,
                VIBRANT: 30,
                default: 0,
              }
              const randomHeight =
                Math.floor(
                  // eslint-disable-next-line react-hooks/purity
                  Math.random() * param[noiseLevel ?? 'default']
                ) + 5

              return (
                <div
                  key={idx}
                  className="w-1 bg-black rounded-full "
                  style={{ height: `${randomHeight}px` }}
                />
              )
            })}
          </div>
        </ItemContent>
      </Item>

      {/* 低消 */}
      <Item
        variant="muted"
        className="rounded-4xl"
      >
        <ItemMedia>
          {minConsumption ? <CircleDollarSign /> : <Coffee />}
        </ItemMedia>
        <ItemContent>
          <ItemTitle>
            {minConsumption ? '飲料加餐點' : '一杯飲料即可'}
          </ItemTitle>
        </ItemContent>
      </Item>

      {/* 限時 */}
      <Item
        variant="muted"
        className="rounded-4xl"
      >
        <ItemMedia>{timeLimit ? <Infinity /> : <Clock />}</ItemMedia>
        <ItemContent>
          <ItemTitle>{timeLimit ? '無限制' : '有時限'}</ItemTitle>
        </ItemContent>
      </Item>

      {/* 抽菸 */}
      <Item
        variant="muted"
        className="col-span-2 rounded-4xl"
      >
        <ItemMedia>
          {hasSmokingArea ? <Cigarette /> : <CigaretteOff />}
        </ItemMedia>
        <ItemContent>
          <div className="flex justify-between items-center">
            <div>
              {
                {
                  INDOOR_SEPARATED: '專門吸菸區內可抽',
                  INDOOR_TABLE: '座位可抽',
                  OUTDOOR: '戶外可抽',
                  default: 'NO DATA',
                }[smokingAreaType ?? 'default']
              }
            </div>
            <div className="flex items-center gap-1">
              {allowCigaretteType.map(d => (
                <Badge key={d}>
                  {
                    {
                      TRADITIONAL: '紙菸', // 傳統香菸
                      ELECTRONIC: '加熱菸', // 加熱菸
                      VAPE: '電子菸', // 電子煙
                      OTHER: '其他', // 其他類型
                      default: '其他',
                    }[d ?? 'default']
                  }
                </Badge>
              ))}
            </div>
          </div>
        </ItemContent>
      </Item>
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
              </Card>
            )}
          </section>
        </>
      )}
    </ScrollArea>
  )
}

export default ShopInfo
