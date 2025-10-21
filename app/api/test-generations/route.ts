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

    // Создаем тестовые генерации
    const testGenerations = [
      {
        userId: session.user.id,
        userPhoto: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
        clothingPhotos: JSON.stringify([
          { name: 'shirt1.jpg', size: 1024, type: 'image/jpeg', data: 'test_data_1' },
          { name: 'pants1.jpg', size: 1024, type: 'image/jpeg', data: 'test_data_2' }
        ]),
        generatedImage: 'https://via.placeholder.com/512x512/FF6B6B/FFFFFF?text=Casual+Outfit',
        prompt: 'Create a casual outfit for a sunny day at the park',
        scene: 'Park',
        model: 'gemini-2.5-flash-image',
        processingTime: 2500,
        tokensUsed: null,
      },
      {
        userId: session.user.id,
        userPhoto: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
        clothingPhotos: JSON.stringify([
          { name: 'dress1.jpg', size: 1024, type: 'image/jpeg', data: 'test_data_3' },
          { name: 'shoes1.jpg', size: 1024, type: 'image/jpeg', data: 'test_data_4' }
        ]),
        generatedImage: 'https://via.placeholder.com/512x512/4ECDC4/FFFFFF?text=Formal+Dress',
        prompt: 'Design an elegant formal dress for a business meeting',
        scene: 'Office',
        model: 'gemini-2.5-flash-image',
        processingTime: 3200,
        tokensUsed: null,
      },
      {
        userId: session.user.id,
        userPhoto: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
        clothingPhotos: JSON.stringify([
          { name: 'jacket1.jpg', size: 1024, type: 'image/jpeg', data: 'test_data_5' },
          { name: 'jeans1.jpg', size: 1024, type: 'image/jpeg', data: 'test_data_6' }
        ]),
        generatedImage: 'https://via.placeholder.com/512x512/45B7D1/FFFFFF?text=Street+Style',
        prompt: 'Create a trendy street style outfit for urban exploration',
        scene: 'Street',
        model: 'gemini-2.5-flash-image',
        processingTime: 2800,
        tokensUsed: null,
      },
      {
        userId: session.user.id,
        userPhoto: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
        clothingPhotos: JSON.stringify([
          { name: 'sweater1.jpg', size: 1024, type: 'image/jpeg', data: 'test_data_7' },
          { name: 'skirt1.jpg', size: 1024, type: 'image/jpeg', data: 'test_data_8' }
        ]),
        generatedImage: 'https://via.placeholder.com/512x512/96CEB4/FFFFFF?text=Cozy+Look',
        prompt: 'Design a cozy winter outfit for staying warm indoors',
        scene: 'Home',
        model: 'gemini-2.5-flash-image',
        processingTime: 2100,
        tokensUsed: null,
      },
      {
        userId: session.user.id,
        userPhoto: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
        clothingPhotos: JSON.stringify([
          { name: 'blazer1.jpg', size: 1024, type: 'image/jpeg', data: 'test_data_9' },
          { name: 'trousers1.jpg', size: 1024, type: 'image/jpeg', data: 'test_data_10' }
        ]),
        generatedImage: 'https://via.placeholder.com/512x512/FFEAA7/FFFFFF?text=Business+Attire',
        prompt: 'Create a professional business attire for important meetings',
        scene: 'Conference Room',
        model: 'gemini-2.5-flash-image',
        processingTime: 3500,
        tokensUsed: null,
      }
    ]

    // Создаем генерации в базе данных
    const createdGenerations = []
    for (const generationData of testGenerations) {
      const generation = await prisma.generation.create({
        data: generationData,
      })
      createdGenerations.push(generation)
    }

    return NextResponse.json({
      success: true,
      message: `Created ${createdGenerations.length} test generations`,
      generations: createdGenerations.map(gen => ({
        id: gen.id,
        scene: gen.scene,
        createdAt: gen.createdAt,
      }))
    })

  } catch (error) {
    console.error('Error creating test generations:', error)
    return NextResponse.json(
      { error: 'Failed to create test generations' },
      { status: 500 }
    )
  }
}
