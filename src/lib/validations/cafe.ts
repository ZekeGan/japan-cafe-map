import { z } from 'zod'

const OutletCoverageEnum = z.enum(['NONE', 'SOME', 'MANY', 'MOST_SEATS'])
const NoiseLevelEnum = z.enum(['QUIET', 'NORMAL', 'LIVELY'])
const SmokingAreaTypeEnum = z.enum(['INDOOR', 'OUTDOOR', 'SEPARATED'])
const BusinessStatusTypeEnum = z.enum([
  'CLOSED_PERMANENTLY',
  'CLOSED_TEMPORARILY',
  'OPERATIONAL',
])

export const cafeSchema = z.object({
  googlePlaceId: z.string().min(1),
  displayName: z.string().min(1),
  formattedAddress: z.string().min(1),
  businessStatus: BusinessStatusTypeEnum, // 營業狀態 (例如: OPERATIONAL)
  location: z
    .object({
      lat: z.number().optional(),
      lng: z.number().optional(),
    })
    .optional(),

  // 使用 .preprocess 或明確的類型處理來確保不會推導出 unknown
  seatCapacityMax: z.number().int().optional(),
  wifiSpeedMbps: z.number().int().optional(),

  hasWifi: z.boolean().optional(),
  hasPowerOutlets: z.boolean().optional(),
  outletCoverage: OutletCoverageEnum.optional(),

  noiseLevel: NoiseLevelEnum.optional,
  isQuietZone: z.boolean().optional(),
  hasErgonomicChairs: z.boolean().optional(),
  hasMonitorRental: z.boolean().optional(),
  hasPhoneBooth: z.boolean().optional(),

  hasSmokingArea: z.boolean().optional(),
  smokingAreaType: SmokingAreaTypeEnum.optional(),

  minConsumption: z.string().optional(),
  timeLimitMinutes: z.number().int().nonnegative().optional(),
  isBookingRequired: z.boolean().optional(),
  bookingUrl: z.string().optional(),
})

// 關鍵步驟：直接從 schema 推導型別
export type CafeFormValues = z.infer<typeof cafeSchema>
