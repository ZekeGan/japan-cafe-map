'use client'

import {
  Armchair,
  Calendar,
  CalendarOff,
  Cigarette,
  CigaretteOff,
  CircleDollarSign,
  Clock,
  Coffee,
  Infinity,
  Plug,
  Unplug,
  Wifi,
  WifiOff,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useTranslation } from '@/context/languageContext'
import { FeatureItem } from '@/components/shop/shopParts'

export const ShopDetail = ({ shopInfo }: { shopInfo: CafeWithReports }) => {
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

      <section className="py-4 grid grid-cols-2 gap-2">
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
          icon={timeLimit ? <Clock /> : <Infinity />}
          label={
            timeLimit === null
              ? t.common.noData
              : timeLimit
                ? s.timeLimit.limited
                : s.timeLimit.unlimited
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
