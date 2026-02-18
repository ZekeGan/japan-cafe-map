import {
  CigaratteType,
  NoiseLevel,
  OutletCoverage,
  Report,
  SeatCapacity,
  SmokingAreaType,
} from '@prisma/client'
import { z } from 'zod'

// 檢查用
// type ReportZodType = z.ZodType<Omit<Report, 'id' | 'createdAt'>>
// export const reportSchema: ReportZodType = z.object({
export const reportSchema = z.object({
  cafeId: z.string().min(1),
  userId: z.string().min(1),

  hasWifi: z.boolean().nullable(),
  outletCoverage: z.enum(OutletCoverage).nullable(),

  seatCapacity: z.enum(SeatCapacity).nullable(),
  noiseLevel: z.enum(NoiseLevel).nullable(),

  smokingAreaType: z.enum(SmokingAreaType).nullable(),
  allowCigaretteType: z.enum(CigaratteType).array(),

  minConsumption: z.boolean().nullable(),
  timeLimit: z.boolean().nullable(),
  isBookingRequired: z.boolean().nullable(),
})

// 關鍵步驟：直接從 schema 推導型別
export type ReportFormValues = z.infer<typeof reportSchema>
