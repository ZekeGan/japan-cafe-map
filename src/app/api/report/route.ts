/* eslint-disable @typescript-eslint/no-explicit-any */
import { CafeStatsAggregator } from '@/lib/cafeStats'
import prisma from '@/lib/db'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { userId, cafeId, ...reportData } = await request.json()

    if (!userId || !cafeId) {
      return NextResponse.json({ error: '缺少必要欄位' }, { status: 400 })
    }

    const result = await prisma.$transaction(async tx => {
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

    return NextResponse.json({ message: '成功', data: result }, { status: 201 })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: '伺服器內部錯誤' }, { status: 500 })
  }
}
