/* eslint-disable @typescript-eslint/no-explicit-any */
import { Report } from '@prisma/client'

export class CafeStatsAggregator {
  private reports: Report[]
  private minValid: number
  private total: number

  constructor(reports: Report[], minValid = 2) {
    this.reports = reports
    this.minValid = minValid
    this.total = reports.length
  }

  // 處理布林值：過半數原則
  getMajority(key: keyof Report): boolean | null {
    const valid = this.reports.filter(
      r => r[key] !== null && r[key] !== undefined
    )
    if (valid.length < this.minValid) return null

    const trueCount = valid.filter(r => r[key] === true).length
    return trueCount > valid.length / 2
  }

  // 處理 Enum：眾數原則
  getMode<T>(key: keyof Report): T | null {
    const counts: Record<string, number> = {}
    let validCount = 0

    this.reports.forEach(r => {
      const val = r[key] as unknown as string
      if (val) {
        counts[val] = (counts[val] || 0) + 1
        validCount++
      }
    })

    if (validCount < this.minValid) return null

    const keys = Object.keys(counts)
    return keys.reduce((a, b) => (counts[a] > counts[b] ? a : b)) as T
  }

  // 處理陣列：聯集與雜訊過濾
  getUnion<T extends string>(key: keyof Report): T[] {
    const validReports = this.reports.filter(
      r => Array.isArray(r[key]) && (r[key] as any).length > 0
    )
    if (validReports.length < this.minValid) return []

    const counts: Record<string, number> = {}
    validReports.forEach(r => {
      ;(r[key] as T[]).forEach(item => {
        counts[item] = (counts[item] || 0) + 1
      })
    })

    // 保留出現率超過 20% 的項目
    return Object.keys(counts).filter(
      item => counts[item] > this.total * 0.2
    ) as T[]
  }
}
