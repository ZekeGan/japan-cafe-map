import prisma from '@/lib/db'
import { NextResponse } from 'next/server'

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
