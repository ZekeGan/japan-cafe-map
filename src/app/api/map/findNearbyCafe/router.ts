import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { googlePlaceIds } = body // 預期格式為 { "ids": ["id1", "id2", ...] }

    // 1. 基本驗證：確保 ids 存在且為陣列
    if (!googlePlaceIds || !Array.isArray(googlePlaceIds)) {
      return NextResponse.json(
        { error: 'INVALID_INPUT', message: '必須提供 ID 陣列' },
        { status: 400 }
      )
    }

    // 2. 使用 Prisma 的 in 語法進行批次查找
    const cafes = await prisma.cafe.findMany({
      where: {
        googlePlaceId: {
          in: googlePlaceIds,
        },
      },
      // 如果需要，可以在這裡加入 select 篩選需要的欄位
      //   select: {
      //     id: true,
      //     name: true,
      //     address: true,
      //     images: true,
      //     // ...其他需要的欄位
      //   }
    })

    // 3. 回傳結果
    return NextResponse.json(cafes, { status: 200 })
  } catch (error) {
    console.error('FETCH_CAFES_ERROR:', error)
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: '伺服器錯誤' },
      { status: 500 }
    )
  }
}
