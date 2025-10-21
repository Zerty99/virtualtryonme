import { NextRequest, NextResponse } from 'next/server'

// Простое хранение статистики в памяти (в продакшене лучше использовать базу данных)
let stats = {
  totalGenerations: 0,
  totalUsers: 0,
  generationsByScene: {} as Record<string, number>,
  generationsByLanguage: {} as Record<string, number>,
  dailyGenerations: {} as Record<string, number>,
  hourlyGenerations: {} as Record<string, number>,
  averageGenerationTime: 0,
  totalGenerationTime: 0,
  successfulGenerations: 0,
  failedGenerations: 0,
  lastUpdated: new Date().toISOString()
}

// Функция для получения статистики
export async function GET() {
  try {
    // Вычисляем дополнительные метрики
    const successRate = stats.totalGenerations > 0 
      ? (stats.successfulGenerations / stats.totalGenerations) * 100 
      : 0
    
    const averageTime = stats.successfulGenerations > 0 
      ? stats.totalGenerationTime / stats.successfulGenerations 
      : 0

    return NextResponse.json({
      success: true,
      stats: {
        ...stats,
        successRate: Math.round(successRate * 100) / 100,
        averageGenerationTimeMs: Math.round(averageTime),
        lastUpdated: stats.lastUpdated
      }
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch statistics'
    })
  }
}

// Функция для записи события статистики
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { event, data } = body

    const now = new Date()
    const today = now.toISOString().split('T')[0]
    const hour = now.getHours()

    switch (event) {
      case 'generation_started':
        stats.totalGenerations++
        stats.lastUpdated = now.toISOString()
        
        // Обновляем статистику по сценам
        if (data.scene) {
          stats.generationsByScene[data.scene] = (stats.generationsByScene[data.scene] || 0) + 1
        }
        
        // Обновляем статистику по языкам
        if (data.language) {
          stats.generationsByLanguage[data.language] = (stats.generationsByLanguage[data.language] || 0) + 1
        }
        
        // Обновляем дневную статистику
        stats.dailyGenerations[today] = (stats.dailyGenerations[today] || 0) + 1
        
        // Обновляем почасовую статистику
        stats.hourlyGenerations[hour.toString()] = (stats.hourlyGenerations[hour.toString()] || 0) + 1
        
        // Обновляем общее время генерации
        if (data.startTime) {
          stats.totalGenerationTime += data.generationTime || 0
        }
        break

      case 'generation_success':
        stats.successfulGenerations++
        break

      case 'generation_failed':
        stats.failedGenerations++
        break

      case 'user_visit':
        stats.totalUsers++
        break

      default:
        console.log('Unknown event:', event)
    }

    return NextResponse.json({
      success: true,
      message: 'Statistics updated successfully'
    })
  } catch (error) {
    console.error('Error updating stats:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to update statistics'
    })
  }
}

// Функция для сброса статистики (для тестирования)
export async function DELETE() {
  try {
    stats = {
      totalGenerations: 0,
      totalUsers: 0,
      generationsByScene: {},
      generationsByLanguage: {},
      dailyGenerations: {},
      hourlyGenerations: {},
      averageGenerationTime: 0,
      totalGenerationTime: 0,
      successfulGenerations: 0,
      failedGenerations: 0,
      lastUpdated: new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      message: 'Statistics reset successfully'
    })
  } catch (error) {
    console.error('Error resetting stats:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to reset statistics'
    })
  }
}
