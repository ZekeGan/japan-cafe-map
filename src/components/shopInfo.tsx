'use client'

import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Armchair,
  Calendar,
  CalendarOff,
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
  Unplug,
  Wifi,
  WifiOff,
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
import { useTranslation } from '@/context/languageContext'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

interface FeatureItemProps {
  icon?: React.ReactNode
  label: React.ReactNode
  className?: string
  isEmpty?: boolean
}

const SmallLabel = ({ str }: { str: string }) => {
  return <div className="text-xs font-bold">{str}</div>
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
        <ItemTitle className="pb-1 text-sm">{title}</ItemTitle>
        {component}
      </ItemContent>
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
      {icon && (
        <ItemMedia className={isEmpty ? 'text-gray-400' : ''}>{icon}</ItemMedia>
      )}
      <ItemContent className="w-full">
        <div className={isEmpty ? 'text-gray-400' : ''}>{label}</div>
      </ItemContent>
    </Item>
  )
}

const ToggleButton = ({
  children,
  values,
  onChange,
  value,
  className = '',
}: {
  children: React.ReactNode
  values: string[]
  onChange: (values: string[]) => void
  value: string
  className?: string
}) => {
  return (
    <Button
      variant="outline"
      className={clsx(
        'rounded-none shadow-none',
        values.includes(value) ? 'bg-accent!' : 'bg-white!',
        className
      )}
      type="button"
      onClick={() => {
        if (values.includes(value)) {
          onChange(values.filter((v: string) => v !== value))
        } else {
          onChange([...values, value])
        }
      }}
    >
      {children}
    </Button>
  )
}

const ShopDetail = ({ shopInfo }: { shopInfo: CafeWithReports }) => {
  const { t } = useTranslation()
  const s = t.shopInfo

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
    <>
      {shopInfo._count.reports > 0 && (
        <div>
          <Badge variant="outline">
            {t.shopInfo.report.report_count.replace(
              '{count}',
              String(shopInfo._count.reports)
            )}
          </Badge>
        </div>
      )}

      <section className="pt-4 grid grid-cols-2 gap-2">
        {/* WIFI */}
        <FeatureItem
          isEmpty={hasWifi === null}
          icon={hasWifi ? <Wifi /> : <WifiOff />}
          label={
            hasWifi === null
              ? t.common.noData
              : hasWifi
                ? s.wifi.available
                : s.wifi.unavailable
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
              ? s.outlet[outletCoverage as keyof typeof s.outlet]
              : t.common.noData
          }
        />

        {/* 座位 */}
        <FeatureItem
          isEmpty={!seatCapacity}
          icon={<Armchair />}
          label={
            seatCapacity
              ? s.seat[seatCapacity as keyof typeof s.seat]
              : t.common.noData
          }
        />

        {/* 預約 */}
        <FeatureItem
          isEmpty={isBookingRequired === null}
          icon={isBookingRequired ? <Calendar /> : <CalendarOff />}
          label={
            isBookingRequired === null
              ? t.common.noData
              : isBookingRequired
                ? s.booking.required
                : s.booking.notRequired
          }
        />

        {/* 噪音 */}
        <FeatureItem
          className="col-span-2"
          isEmpty={!noiseLevel}
          label={
            <>
              <div className="flex justify-between items-center mb-4">
                <div className="text-md font-medium">{s.noise.label}</div>
                {noiseLevel && (
                  <Badge>{s.noise[noiseLevel as keyof typeof s.noise]}</Badge>
                )}
              </div>

              <div className="flex items-end justify-between h-10">
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
                  const randomHeight =
                    // eslint-disable-next-line react-hooks/purity
                    Math.floor(Math.random() * baseHeight) + 5

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
              ? t.common.noData
              : minConsumption
                ? s.minConsumption.required
                : s.minConsumption.oneDrink
          }
        />

        {/* 限時 */}
        <FeatureItem
          isEmpty={timeLimit === null}
          icon={timeLimit ? <Infinity /> : <Clock />}
          label={
            timeLimit === null
              ? t.common.noData
              : timeLimit
                ? s.timeLimit.unlimited
                : s.timeLimit.limited
          }
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
                {smokingAreaType
                  ? (s.smoking[smokingAreaType as keyof typeof s.smoking] ??
                    t.common.noData)
                  : t.common.noData}
              </div>
              {smokingAreaType &&
                smokingAreaType !== 'NONE' &&
                allowCigaretteType && (
                  <div className="flex items-center justify-end gap-1 flex-wrap ">
                    {allowCigaretteType.map(d => (
                      <Badge key={d}>
                        {s.cigaretteType[d as keyof typeof s.cigaretteType] ??
                          s.cigaretteType.OTHER}
                      </Badge>
                    ))}
                  </div>
                )}
            </div>
          }
        />
      </section>
    </>
  )
}

const ShopForm = ({
  shopInfo,
  setIsEditing,
}: {
  shopInfo: CafeWithReports
  setIsEditing: (isEditing: boolean) => void
}) => {
  const { user, refreshUser } = useAuth()
  const { t } = useTranslation()
  const s = t.shopInfo
  const f = s.form

  const form = useForm<ReportFormValues>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      cafeId: shopInfo?.id || '',
      userId: user?.id || '',
      hasWifi: null,
      outletCoverage: null,
      seatCapacity: null,
      noiseLevel: null,
      minConsumption: null,
      timeLimit: null,
      isBookingRequired: null,
      smokingAreaType: null,
      allowCigaretteType: [],
    },
  })

  const onSubmit = async (data: ReportFormValues) => {
    await fetch('/api/report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    await refreshUser()
  }

  useEffect(() => {
    if (!shopInfo) form.reset()
  }, [form, shopInfo])

  return (
    <Card className="p-4">
      <form
        className="flex flex-col gap-8"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        {/* 設施 */}
        <section className="flex flex-col gap-3">
          <h1 className="text-lg font-bold mb-2">{f.section.facility}</h1>

          <EditItem
            title={f.field.hasWifi}
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
                        val === 'true' ? true : val === 'false' ? false : null
                      )
                    }
                  >
                    <ToggleGroupItem value="true">
                      <SmallLabel str={t.common.yes} />
                    </ToggleGroupItem>
                    <ToggleGroupItem value="false">
                      <SmallLabel str={t.common.no} />
                    </ToggleGroupItem>
                  </ToggleGroup>
                )}
              />
            }
          />

          <EditItem
            title={f.field.outletCoverage}
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
                      <SmallLabel str={f.outlet.NONE} />
                    </ToggleGroupItem>
                    <ToggleGroupItem value="SOME">
                      <SmallLabel str={f.outlet.SOME} />
                    </ToggleGroupItem>
                    <ToggleGroupItem value="MOST">
                      <SmallLabel str={f.outlet.MOST} />
                    </ToggleGroupItem>
                    <ToggleGroupItem value="EVERY">
                      <SmallLabel str={f.outlet.EVERY} />
                    </ToggleGroupItem>
                  </ToggleGroup>
                )}
              />
            }
          />
        </section>

        {/* 環境 */}
        <section className="flex flex-col gap-3">
          <h1 className="text-lg font-bold mb-2">{f.section.environment}</h1>

          <EditItem
            title={f.field.seatCapacity}
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
            title={f.field.noiseLevel}
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
                      <SmallLabel str={s.noise.SILENT} />
                    </ToggleGroupItem>
                    <ToggleGroupItem value="QUIET">
                      <SmallLabel str={s.noise.QUIET} />
                    </ToggleGroupItem>
                    <ToggleGroupItem value="MODERATE">
                      <SmallLabel str={s.noise.MODERATE} />
                    </ToggleGroupItem>
                    <ToggleGroupItem value="VIBRANT">
                      <SmallLabel str={s.noise.VIBRANT} />
                    </ToggleGroupItem>
                  </ToggleGroup>
                )}
              />
            }
          />
        </section>

        {/* 消費 */}
        <section className="flex flex-col gap-3">
          <h1 className="text-lg font-bold mb-2">{f.section.consumption}</h1>

          <EditItem
            title={f.field.isBookingRequired}
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
                        val === 'true' ? true : val === 'false' ? false : null
                      )
                    }
                  >
                    <ToggleGroupItem value="true">
                      <SmallLabel str={t.common.yes} />
                    </ToggleGroupItem>
                    <ToggleGroupItem value="false">
                      <SmallLabel str={t.common.no} />
                    </ToggleGroupItem>
                  </ToggleGroup>
                )}
              />
            }
          />

          <EditItem
            title={f.field.timeLimit}
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
                        val === 'true' ? true : val === 'false' ? false : null
                      )
                    }
                  >
                    <ToggleGroupItem value="false">
                      <SmallLabel str={f.timeLimit.unlimited} />
                    </ToggleGroupItem>
                    <ToggleGroupItem value="true">
                      <SmallLabel str={f.timeLimit.limited} />
                    </ToggleGroupItem>
                  </ToggleGroup>
                )}
              />
            }
          />

          <EditItem
            title={f.field.minConsumption}
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
                        val === 'true' ? true : val === 'false' ? false : null
                      )
                    }
                  >
                    <ToggleGroupItem value="true">
                      <SmallLabel str={f.minConsumption.required} />
                    </ToggleGroupItem>
                    <ToggleGroupItem value="false">
                      <SmallLabel str={f.minConsumption.oneDrink} />
                    </ToggleGroupItem>
                  </ToggleGroup>
                )}
              />
            }
          />
        </section>

        {/* 吸菸 */}
        <section className="flex flex-col gap-3">
          <h1 className="text-lg font-bold mb-2">{f.section.smoking}</h1>

          <EditItem
            title={f.field.smokingAreaType}
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
                      <SmallLabel str={f.smokingAreaType.NONE} />
                    </ToggleGroupItem>
                    <ToggleGroupItem value="INDOOR_TABLE">
                      <SmallLabel str={f.smokingAreaType.INDOOR_TABLE} />
                    </ToggleGroupItem>
                    <ToggleGroupItem value="INDOOR_SEPARATED">
                      <SmallLabel str={f.smokingAreaType.INDOOR_SEPARATED} />
                    </ToggleGroupItem>
                    <ToggleGroupItem value="OUTDOOR">
                      <SmallLabel str={f.smokingAreaType.OUTDOOR} />
                    </ToggleGroupItem>
                  </ToggleGroup>
                )}
              />
            }
          />

          <EditItem
            title={f.field.allowCigaretteType}
            component={
              <Controller
                name="allowCigaretteType"
                control={form.control}
                render={({ field }) => (
                  <div className="flex ">
                    <ToggleButton
                      className="rounded-l-sm"
                      values={field.value}
                      onChange={field.onChange}
                      value="TRADITIONAL"
                    >
                      <SmallLabel str={f.cigaretteType.TRADITIONAL} />
                    </ToggleButton>
                    <ToggleButton
                      values={field.value}
                      onChange={field.onChange}
                      value="ELECTRONIC"
                    >
                      <SmallLabel str={f.cigaretteType.ELECTRONIC} />
                    </ToggleButton>
                    <ToggleButton
                      className="rounded-r-sm"
                      values={field.value}
                      onChange={field.onChange}
                      value="VAPE"
                    >
                      <SmallLabel str={f.cigaretteType.VAPE} />
                    </ToggleButton>
                  </div>
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
            {t.common.submit}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsEditing(false)}
            className="w-full"
          >
            {t.common.cancel}
          </Button>
        </div>
      </form>
    </Card>
  )
}

const ShopInfo = ({ shopId }: { shopId: string | null }) => {
  const [shopInfo, setShopInfo] = useState<CafeWithReports | null>(null)
  const { user, refreshUser } = useAuth()
  const { t } = useTranslation()
  const s = t.shopInfo

  const hasUser = Boolean(user?.id)
  const hasReported =
    user?.reports.some(report => report.cafeId === shopInfo?.id) || false
  const hasFavorited =
    user?.favorites.some(fav => fav.cafeId === shopInfo?.id) || false

  const [isEditing, setIsEditing] = useState(false)

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
