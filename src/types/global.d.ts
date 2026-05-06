import { Cafe } from '@prisma/client'

declare global {
  type CafeWithReports = Cafe & { _count: { reports: number } }
}

export {}
