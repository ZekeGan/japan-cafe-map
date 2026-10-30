import { CafeStatsAggregator } from '@/lib/cafeStats'
import prisma from '@/lib/db'
import { getAuthUser } from '@/lib/auth/authWrapper'
import { reportSchema } from '@/lib/validations/report'
import { NextResponse } from 'next/server'

const reportRequestSchema = reportSchema.omit({ userId: true }).extend({
  cafeId: reportSchema.shape.cafeId.regex(/^[a-f\d]{24}$/i),
})

export async function POST(request: Request) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: '請先登入' }, { status: 401 })
    }

    const result = reportRequestSchema.safeParse(
      await request.json().catch(() => null)
    )
    if (!result.success) {
      return NextResponse.json({ error: '資料格式不正確' }, { status: 400 })
    }
    const { cafeId, ...reportData } = result.data
    const userId = user.id

    const report = await prisma.$transaction(async tx => {
      // 1. 建立 Report
      const newReport = await tx.report.create({
        data: {
          user: { connect: { id: userId } },
          cafe: { connect: { id: cafeId } },
          ...reportData,
        },
      })

      // 2. 獲取所有報告並統計
      const allReports = await tx.report.findMany({ where: { cafeId } })
      const stats = new CafeStatsAggregator(allReports)

      // 3. 更新 Cafe (直接呼叫封裝好的邏輯)
      await tx.cafe.update({
        where: { id: cafeId },
        data: {
          hasWifi: stats.getMajority('hasWifi'),
          minConsumption: stats.getMajority('minConsumption'),
          timeLimit: stats.getMajority('timeLimit'),
          isBookingRequired: stats.getMajority('isBookingRequired'),

          allowCigaretteType: stats.getUnion('allowCigaretteType'),

          outletCoverage: stats.getMode('outletCoverage'),
          seatCapacity: stats.getMode('seatCapacity'),
          noiseLevel: stats.getMode('noiseLevel'),
          smokingAreaType: stats.getMode('smokingAreaType'),
        },
      })

      return newReport
    })

    return NextResponse.json({ message: '成功', data: report }, { status: 201 })
  } catch (error) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'P2002'
    ) {
      return NextResponse.json({ error: '已回報過此店家' }, { status: 409 })
    }
    return NextResponse.json({ error: '伺服器內部錯誤' }, { status: 500 })
  }
}
