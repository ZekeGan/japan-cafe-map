// app/api/cafes/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(req: Request) {
  try {
    const body = await req.json()

    // 假設 body 包含了 Google API 的資料與你的自定義欄位
    const newCafe = await prisma.cafe.create({
      data: {
        googlePlaceId: body.googleId,
        displayName: body.name, // 對應 Google 的 displayName
        formattedAddress: body.address, // 對應 Google 的 formattedAddress
        businessStatus: body.status, // 對應 Google 的 businessStatus
        location: {
          lat: body.lat,
          lng: body.lng,
        },
      },
    })

    return NextResponse.json(newCafe, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: '創建失敗' }, { status: 500 })
  }
}
