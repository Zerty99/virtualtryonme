import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/database'

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { generationId, quality, feedback, isPublic } = body

    if (!generationId) {
      return NextResponse.json(
        { error: 'Generation ID is required' },
        { status: 400 }
      )
    }

    // Проверяем, что генерация принадлежит пользователю
    const existingGeneration = await prisma.generation.findFirst({
      where: {
        id: generationId,
        userId: session.user.id,
      },
    })

    if (!existingGeneration) {
      return NextResponse.json(
        { error: 'Generation not found' },
        { status: 404 }
      )
    }

    // Обновляем генерацию
    const updatedGeneration = await prisma.generation.update({
      where: {
        id: generationId,
      },
      data: {
        quality,
        feedback,
        isPublic,
      },
    })

    return NextResponse.json({
      success: true,
      generation: {
        id: updatedGeneration.id,
        quality: updatedGeneration.quality,
        feedback: updatedGeneration.feedback,
        isPublic: updatedGeneration.isPublic,
        updatedAt: updatedGeneration.updatedAt,
      }
    })

  } catch (error) {
    console.error('Error updating generation:', error)
    return NextResponse.json(
      { error: 'Failed to update generation' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const generationId = searchParams.get('id')

    if (!generationId) {
      return NextResponse.json(
        { error: 'Generation ID is required' },
        { status: 400 }
      )
    }

    // Проверяем, что генерация принадлежит пользователю
    const existingGeneration = await prisma.generation.findFirst({
      where: {
        id: generationId,
        userId: session.user.id,
      },
    })

    if (!existingGeneration) {
      return NextResponse.json(
        { error: 'Generation not found' },
        { status: 404 }
      )
    }

    // Удаляем генерацию
    await prisma.generation.delete({
      where: {
        id: generationId,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Generation deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting generation:', error)
    return NextResponse.json(
      { error: 'Failed to delete generation' },
      { status: 500 }
    )
  }
}
