import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    // 這裡的 id 對應資料夾名稱 [id]
    const { id } = await props.params

    // 嘗試從資料庫尋找，包含關聯的 reports
    const cafe = await prisma.cafe.findUnique({
      where: {
        id,
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
