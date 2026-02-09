import prisma from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  try {
    // 1. 從 URL 解析 userId (例如: /api/favorite?userId=xxx)
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: '請提供 userId' }, { status: 400 })
    }

    // 2. 查詢該使用者的所有收藏，並關聯咖啡廳詳細資料
    const data = await prisma.favorite.findMany({
      where: {
        userId,
      },
      include: {
        cafe: true, // 假設你的 Favorite model 裡有關聯欄位叫 cafe
      },
      orderBy: {
        createdAt: 'desc', // 按收藏時間倒序排列
      },
    })

    const favorites = data.map(d => d.cafe)

    return NextResponse.json(favorites)
  } catch (error) {
    console.error('FAVORITE_GET_ERROR', error)
    return NextResponse.json({ error: '伺服器錯誤' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { userId, cafeId } = body

    if (!userId || !cafeId) {
      return NextResponse.json({ error: '資訊不完整' }, { status: 400 })
    }

    // 1. 查找是否已經存在該收藏
    const existingFavorite = await prisma.favorite.findFirst({
      where: {
        userId: userId,
        cafeId: cafeId,
      },
    })

    if (existingFavorite) {
      // 2. 如果已存在，則執行刪除 (取消收藏)
      await prisma.favorite.delete({
        where: {
          id: existingFavorite.id,
        },
      })
      return NextResponse.json({
        message: '已從我的最愛移除',
        action: 'removed',
      })
    } else {
      // 3. 如果不存在，則執行新增
      const newFavorite = await prisma.favorite.create({
        data: {
          userId,
          cafeId,
        },
      })
      return NextResponse.json({
        message: '已加入我的最愛',
        action: 'added',
        data: newFavorite,
      })
    }
  } catch (error) {
    console.error('FAVORITE_TOGGLE_ERROR', error)
    return NextResponse.json({ error: '伺服器錯誤' }, { status: 500 })
  }
}
