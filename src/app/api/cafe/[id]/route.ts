import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params // 這裡的 id 對應資料夾名稱 [id]

    // 嘗試從資料庫尋找，包含關聯的 reports
    const cafe = await prisma.cafe.findUnique({
      where: {
        // 這裡你可以根據需求決定是用資料庫自增 ID 還是 Google ID
        // 如果傳入的是 MongoDB 的 ObjectId：
        id: id,

        // 或者如果你想支援用 Google ID 查：
        // googlePlaceId: id
      },
      include: {
        reports: {
          orderBy: { createdAt: 'desc' }, // 順便把評論按時間排序
          take: 10, // 拿最近 10 筆
        },
      },
    })

    if (!cafe) {
      return NextResponse.json({ error: '找不到該店家資料' }, { status: 404 })
    }

    return NextResponse.json(cafe)
  } catch (error) {
    console.error('Fetch Cafe Error:', error)
    return NextResponse.json({ error: '伺服器內部錯誤' }, { status: 500 })
  }
}
