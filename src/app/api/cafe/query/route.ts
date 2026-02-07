import { defaultLagitude, defaultLongitude } from '@/constant/location'
import prisma from '@/lib/db'
import { Cafe } from '@prisma/client'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const places: Cafe[] = await request.json() // 建議傳入整個基本物件陣列

    if (!Array.isArray(places)) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
    }

    // 1. 批量操作：確保資料庫裡有這些 Cafe
    // 這裡示範用迴圈處理 upsert（適合資料量不大時），保證每筆都有在 DB
    const results = await Promise.all(
      places.map(async p => {
        return prisma.cafe.upsert({
          where: { googlePlaceId: p.id },
          update: {}, // 如果已存在，不更新任何欄位 (保留你的擴充資料)
          create: {
            googlePlaceId: p.id,
            displayName: p.displayName,
            formattedAddress: p.formattedAddress,
            businessStatus: p.businessStatus,
            location: {
              lat: p.location?.lat || defaultLagitude,
              lng: p.location?.lng || defaultLongitude,
            },
          },
        })
      })
    )

    return NextResponse.json(results)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 })
  }
}
