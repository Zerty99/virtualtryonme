import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Проверяем доступ только для определенного email
    if (session.user.email !== 'ronama9949@gmail.com') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const body = await request.json()
    const {
      userPhoto,
      clothingPhotos,
      generatedImage,
      prompt,
      scene,
      model,
      processingTime,
      tokensUsed
    } = body

    // Валидация обязательных полей
    if (!userPhoto || !clothingPhotos || !generatedImage || !prompt) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Сохраняем генерацию в базу данных
    const generation = await prisma.generation.create({
      data: {
        userId: session.user.id,
        userPhoto,
        clothingPhotos: JSON.stringify(clothingPhotos),
        generatedImage,
        prompt,
        scene,
        model,
        processingTime,
        tokensUsed,
      },
    })

    return NextResponse.json({
      success: true,
      generation: {
        id: generation.id,
        createdAt: generation.createdAt,
      }
    })

  } catch (error) {
    console.error('Error saving generation:', error)
    return NextResponse.json(
      { error: 'Failed to save generation' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Проверяем доступ только для определенного email
    if (session.user.email !== 'ronama9949@gmail.com') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    // Получаем все генерации
    const generations = await prisma.generation.findMany({
      where: {},
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
      select: {
        id: true,
        userPhoto: true,
        clothingPhotos: true,
        generatedImage: true,
        prompt: true,
        scene: true,
        quality: true,
        feedback: true,
        isPublic: true,
        model: true,
        processingTime: true,
        tokensUsed: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    })

    // Получаем общее количество всех генераций
    const total = await prisma.generation.count({
      where: {},
    })

    return NextResponse.json({
      success: true,
      generations: generations.map(gen => ({
        ...gen,
        clothingPhotos: JSON.parse(gen.clothingPhotos),
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })

  } catch (error) {
    console.error('Error fetching generations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch generations' },
      { status: 500 }
    )
  }
}
