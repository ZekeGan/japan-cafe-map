import {
  BusinessStatus,
  Cafe,
  CigaratteType,
  NoiseLevel,
  OutletCoverage,
  SeatCapacity,
  SmokingAreaType,
} from '@prisma/client'
import { z } from 'zod'

// 檢查用
// type CafeZodType = z.ZodType<Omit<Cafe, 'id' | 'createdAt'>>
// export const cafeSchema: CafeZodType = z.object({
export const cafeSchema = z.object({
  googlePlaceId: z.string().min(1),
  displayName: z.string().min(1),
  formattedAddress: z.string().min(1),
  businessStatus: z.enum(BusinessStatus), // 營業狀態 (例如: OPERATIONAL)
  location: z.object({
    lat: z.number(),
    lng: z.number(),
  }),

  seatCapacity: z.enum(SeatCapacity).nullable(),
  wifiSpeedMbps: z.number().int().nullable(),

  hasWifi: z.boolean().nullable(),
  hasPowerOutlets: z.boolean().nullable(),
  outletCoverage: z.enum(OutletCoverage).nullable(),

  noiseLevel: z.enum(NoiseLevel).nullable(),
  isQuietZone: z.boolean().nullable(),
  hasErgonomicChairs: z.boolean().nullable(),
  hasMonitorRental: z.boolean().nullable(),
  hasPhoneBooth: z.boolean().nullable(),

  hasSmokingArea: z.boolean().nullable(),
  smokingAreaType: z.enum(SmokingAreaType).nullable(),
  cigaratteType: z.enum(CigaratteType).array(),

  minConsumption: z.string().nullable(),
  timeLimitMinutes: z.number().int().nonnegative().nullable(),
  isBookingRequired: z.boolean().nullable(),
  bookingUrl: z.string().nullable(),
})

// 關鍵步驟：直接從 schema 推導型別
export type CafeFormValues = z.infer<typeof cafeSchema>
