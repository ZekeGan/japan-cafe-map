import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const {
      userId,
      cafeId,
      hasWifi,
      hasPowerOutlets,
      outletCoverage,
      seatCapacity,
      noiseLevel,
      hasSmokingArea,
      smokingAreaType,
      allowCigaretteType,
      minConsumption,
      timeLimit,
      isBookingRequired,
    } = body

    // 1. 基礎驗證
    if (!userId || !cafeId) {
      return NextResponse.json(
        { error: '缺少必要的 userId 或 cafeId' },
        { status: 400 }
      )
    }

    // 2. 建立 Report
    const newReport = await prisma.report.create({
      data: {
        // 使用 connect 關聯已存在的 User 與 Cafe
        user: { connect: { id: userId } },
        cafe: { connect: { id: cafeId } },

        hasWifi,
        hasPowerOutlets,
        outletCoverage,
        seatCapacity,
        noiseLevel,
        hasSmokingArea,
        smokingAreaType,
        allowCigaretteType,
        minConsumption,
        timeLimit,
        isBookingRequired,
      },
    })

    return NextResponse.json(
      { message: '報告建立成功', data: newReport },
      { status: 201 }
    )
  } catch (error) {
    // 3. 處理重複提交 (Unique constraint failed)
    // if (error.code === 'P2002') {
    //   return NextResponse.json(
    //     { error: '重複提交', message: '您已經評價過這間咖啡廳了。' },
    //     { status: 409 }
    //   )
    // }

    console.error('API Error:', error)
    return NextResponse.json({ error: '伺服器內部錯誤' }, { status: 500 })
  }
}
