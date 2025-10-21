import dotenv from 'dotenv';
dotenv.config();
import { NextRequest, NextResponse } from 'next/server'
import { removeBackgroundWithFallback } from '@/lib/image-processing'


export async function POST(request: NextRequest) {
  let userPhoto: File | null = null;
  let clothingPhotos: File[] = [];
  let scene: string = '';
  
  try {
    console.log('API Key available:', !!process.env.GOOGLE_API_KEY)
    console.log('API Key length:', process.env.GOOGLE_API_KEY?.length || 0)
    
    const contentType = request.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      // Обработка JSON запроса (от мобильного приложения)
      console.log('=== JSON REQUEST DEBUG ===')
      const jsonData = await request.json()
      console.log('JSON data received:', !!jsonData)
      console.log('User photo data:', !!jsonData.userPhoto)
      console.log('Clothing photos count:', jsonData.clothingPhotos?.length || 0)
      console.log('Scene:', jsonData.scene)
      
      // Конвертируем base64 в Buffer для совместимости с существующим кодом
      if (jsonData.userPhoto?.data) {
        const userBuffer = Buffer.from(jsonData.userPhoto.data, 'base64')
        userPhoto = new File([userBuffer], jsonData.userPhoto.name || 'user.jpg', { type: jsonData.userPhoto.mime || 'image/jpeg' })
      }
      
      if (jsonData.clothingPhotos) {
        clothingPhotos = jsonData.clothingPhotos.map((item: any, index: number) => {
          const buffer = Buffer.from(item.data, 'base64')
          return new File([buffer], item.name || `cloth_${index}.jpg`, { type: item.mime || 'image/jpeg' })
        })
      }
      
      scene = jsonData.scene || ''
      
    } else {
      // Обработка FormData запроса (от веб-приложения)
      console.log('=== FORM DATA DEBUG ===')
      console.log('Content-Type:', contentType)
      
      // Проверяем, что Content-Type поддерживает FormData
      if (!contentType.includes('multipart/form-data') && !contentType.includes('application/x-www-form-urlencoded')) {
        console.error('Unsupported Content-Type for FormData:', contentType)
        return NextResponse.json({ 
          success: false, 
          error: 'Unsupported Content-Type. Expected multipart/form-data or application/x-www-form-urlencoded' 
        })
      }
      
      const formData = await request.formData()
      const fd = formData as any
      
      userPhoto = fd.get('userPhoto') as File
      scene = fd.get('scene') as string
      
      console.log('User photo received:', !!userPhoto)
      console.log('User photo name:', userPhoto?.name)
      console.log('User photo size:', userPhoto?.size)
      console.log('User photo type:', userPhoto?.type)
      
      // Проверяем все поля формы
      console.log('All form data keys:', Array.from(fd.keys()))
      ;(Array.from(fd.entries()) as [string, any][]).forEach(([key, value]) => {
        if (value instanceof File) {
          console.log(`Form field ${key}: File ${value.name}, size ${value.size}, type ${value.type}`)
        } else {
          console.log(`Form field ${key}: ${value}`)
        }
      })
      
      // Получаем все фото одежды
      clothingPhotos = []
      for (let i = 0; i < 3; i++) {
        const photo = fd.get(`clothingPhoto${i}`) as File
        if (photo) {
          clothingPhotos.push(photo)
        }
      }
    }

    if (!userPhoto) {
      return NextResponse.json({ success: false, error: 'User photo is required' })
    }

    // Используем оригинальные изображения без изменения размера
    const userPhotoBuffer = Buffer.from(await userPhoto.arrayBuffer())
    console.log('User photo buffer size:', userPhotoBuffer.length)
    console.log('User photo first 50 bytes:', userPhotoBuffer.slice(0, 50))

    // Обрабатываем изображение человека - удаляем фон
    console.log('Starting background removal for user photo...')
    const backgroundRemovalResult = await removeBackgroundWithFallback(userPhotoBuffer)
    
    let processedUserPhotoBuffer: Buffer = userPhotoBuffer
    if (backgroundRemovalResult.success && backgroundRemovalResult.processedImageBuffer) {
      processedUserPhotoBuffer = Buffer.from(backgroundRemovalResult.processedImageBuffer)
      console.log(`Background removal successful using ${backgroundRemovalResult.service}`)
      console.log('Processed user photo buffer size:', processedUserPhotoBuffer.length)
    } else {
      console.warn('Background removal failed, using original image:', backgroundRemovalResult.error)
    }

    // clothingUrl удалён, описание больше не нужно

    // Формируем промпт для ИИ
    const basePrompt = `try these clothes on me. The person in the image has a transparent background - please maintain the person's pose and appearance while applying the clothing items naturally.`
    
    const scenePrompts = {
      office: ', in a modern office environment, professional setting, corporate atmosphere',
      restaurant: ', in an elegant restaurant, dining setting, sophisticated ambiance',
      street: ', on a busy city street, urban environment, street photography style',
      home: ', in a cozy home setting, comfortable indoor environment, natural lighting',
      beach: ', on a beautiful beach, seaside setting, sunny outdoor atmosphere',
      gym: ', in a modern gym, fitness environment, athletic setting',
      party: ', at a lively party, festive atmosphere, celebration setting',
      wedding: ', at an elegant wedding, formal ceremony setting, romantic atmosphere',
      studio: ', in a professional photo studio, clean background, studio lighting',
      nature: ', in a natural outdoor setting, scenic background, natural lighting'
    }

    let finalPrompt = basePrompt
    
    // Добавляем сцену
    if (scene && scenePrompts[scene as keyof typeof scenePrompts]) {
      finalPrompt += scenePrompts[scene as keyof typeof scenePrompts]
    }

    // Подготавливаем фото одежды без изменения размера
    const processedClothingPhotos: Buffer[] = []
    for (const photo of clothingPhotos) {
      const clothingPhotoBuffer = Buffer.from(await photo.arrayBuffer())
      processedClothingPhotos.push(clothingPhotoBuffer)
    }

    // Вызываем генерацию
    console.log('Calling generateMockImage with prompt:', finalPrompt)
    const result = await generateMockImage(processedUserPhotoBuffer, finalPrompt, processedClothingPhotos)
    console.log('Generated image URL:', result.imageUrl.substring(0, 100) + '...')

    console.log('=== SUCCESS ===')
    console.log('Generated image URL length:', result.imageUrl.length)
    console.log('Generated image URL preview:', result.imageUrl.substring(0, 100) + '...')
    
    return NextResponse.json({
      success: true,
      imageUrl: result.imageUrl,
      source: result.source,
      retries: result.retries,
      errorCode: result.errorCode
    })

  } catch (error) {
    console.error('Error generating outfit:', error)
    console.error('Error stack:', (error as Error).stack)
    
    return NextResponse.json({
      success: false,
      error: 'Error generating outfit'
    })
  }
}

// Генерация изображения с Google Gemini
type GenerationResult = { imageUrl: string; source: 'gemini' | 'fallback'; retries: number; errorCode?: string }

async function generateMockImage(userPhotoBuffer: Buffer, prompt: string, clothingPhotos: Buffer[] = []): Promise<GenerationResult> {
  try {
    // Fast fallback if no API key configured
    if (!process.env.GOOGLE_API_KEY) {
      console.warn('GOOGLE_API_KEY is missing. Using fallback image.')
      return { imageUrl: await generateFallbackImage(prompt), source: 'fallback', retries: 0, errorCode: 'NO_KEY' }
    }
    console.log('Starting Gemini API call with prompt:', prompt)
    console.log('User photo buffer size:', userPhotoBuffer.length)
    console.log('Clothing photos count:', clothingPhotos.length)
    console.log('User photo first 50 bytes:', userPhotoBuffer.slice(0, 50))
    console.log('User photo base64 preview:', userPhotoBuffer.toString('base64').substring(0, 100) + '...')
    
    // Подготавливаем части для Gemini API
    const parts = [
      {
        text: prompt
      },
      {
        text: `This is me:`
      },
      {
        inlineData: {
          data: userPhotoBuffer.toString('base64'),
          mimeType: 'image/jpeg'
        }
      }
    ]
    
    // Добавляем фото одежды
    clothingPhotos.forEach((clothingBuffer, index) => {
      parts.push({
        text: `These clothes:`
      })
      parts.push({
        inlineData: {
          data: clothingBuffer.toString('base64'),
          mimeType: 'image/jpeg'
        }
      })
    })
    
    console.log('Total parts being sent to Gemini:', parts.length)
    console.log('Parts structure:', parts.map((part, index) => ({
      index,
      type: part.text ? 'text' : 'image',
      content: part.text ? part.text.substring(0, 100) + '...' : `Image data (${part.inlineData?.data?.length || 0} chars)`
    })))
    
    // Детальная проверка каждого изображения
    parts.forEach((part, index) => {
      if (part.inlineData) {
        console.log(`Part ${index} (image):`)
        console.log(`  - MIME type: ${part.inlineData.mimeType}`)
        console.log(`  - Data length: ${part.inlineData.data.length}`)
        console.log(`  - Data preview: ${part.inlineData.data.substring(0, 50)}...`)
      } else if (part.text) {
        console.log(`Part ${index} (text): ${part.text}`)
      }
    })
    
    // Подготавливаем запрос для Gemini
    const requestBody = {
      contents: [{
        role: 'user',
        parts: parts
      }],
      generationConfig: {
        temperature: 0.6,
        topK: 32,
        topP: 0.9,
        maxOutputTokens: 1024
      },
      safetySettings: [
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' }
      ]
    }
    
    console.log('Request body size:', JSON.stringify(requestBody).length)
    console.log('Request contents count:', requestBody.contents.length)
    console.log('Request parts count:', requestBody.contents[0].parts.length)
    
    // Используем Gemini 2.5 Flash Image для генерации изображений
    // Helper to call Gemini with a timeout
    const callGeminiWithTimeout = async (timeoutMs: number) => {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort('timeout'), timeoutMs)
      try {
        const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${process.env.GOOGLE_API_KEY}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody),
          signal: controller.signal
        })
        return resp
      } finally {
        clearTimeout(timeoutId)
      }
    }

    // Single attempt with 40s timeout
    let retries = 0
    let imageResponse = await callGeminiWithTimeout(40000)

    console.log('Gemini Image API response status:', imageResponse.status)
    
    if (!imageResponse.ok) {
      const errorText = await imageResponse.text()
      console.error('Gemini Image API error:', imageResponse.status, errorText)
      // Если генерация изображения не работает, используем fallback
      return { imageUrl: await generateFallbackImage(prompt), source: 'fallback', retries, errorCode: `HTTP_${imageResponse.status}` }
    }

    const imageData = await imageResponse.json()
    console.log('Gemini Image API response:', imageData)
    
    if (imageData.candidates && imageData.candidates[0]) {
      const candidate = imageData.candidates[0]
      
      // Проверяем причину завершения
      if (candidate.finishReason === 'IMAGE_OTHER') {
        console.log('Gemini refused to generate image (IMAGE_OTHER), using fallback')
        return { imageUrl: await generateFallbackImage(prompt), source: 'fallback', retries, errorCode: 'IMAGE_OTHER' }
      }
      
      if (candidate.content) {
        // Ищем изображение в ответе
        for (const part of candidate.content.parts) {
          if (part.inlineData && part.inlineData.data) {
            console.log('Found image in response, returning base64 image')
            return { imageUrl: `data:image/png;base64,${part.inlineData.data}`, source: 'gemini', retries }
          }
        }
      }
    }
    
    // Если изображение не найдено, используем fallback
    console.log('No image found in response, using fallback')
    return { imageUrl: await generateFallbackImage(prompt), source: 'fallback', retries, errorCode: 'NO_IMAGE_IN_RESPONSE' }
    
  } catch (error) {
    console.error('Gemini API error:', error)
    const code = (error as any)?.name === 'AbortError' ? 'TIMEOUT' : 'EXCEPTION'
    const retriesCount = 0
    return { imageUrl: await generateFallbackImage(prompt), source: 'fallback', retries: retriesCount, errorCode: code }
  }
}

// Удалены продвинутые фолбэки (DALL‑E/Unsplash) для упрощения

// Заглушка для демонстрации
async function generateFallbackImage(prompt: string): Promise<string> {
  // Создаем простую заглушку без canvas
  console.log('Generating fallback image with prompt:', prompt)
  
  // Возвращаем красивый placeholder с градиентом
  const colors = ['8B5CF6', 'EC4899', '06B6D4', '10B981', 'F59E0B']
  const randomColor = colors[Math.floor(Math.random() * colors.length)]
  
  return `https://via.placeholder.com/512x512/${randomColor}/FFFFFF?text=AI+Generated+Outfit`
}

// Функция для интеграции с Google Imagen API
async function generateWithGoogleImagen(userPhotoBuffer: Buffer, prompt: string): Promise<string> {
  // Пример интеграции с Google Imagen API
  /*
  const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:generateImage', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GOOGLE_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prompt: prompt,
      image: {
        inlineData: {
          data: userPhotoBuffer.toString('base64'),
          mimeType: 'image/jpeg'
        }
      }
    })
  })

  const data = await response.json()
  return data.generatedImages[0].imageData
  */
  
  return 'https://via.placeholder.com/512x512/8B5CF6/FFFFFF?text=Google+Imagen+Result'
}

// Функция для интеграции с Replicate API
async function generateWithReplicate(userPhotoBuffer: Buffer, prompt: string): Promise<string> {
  // Пример интеграции с Replicate API
  /*
  const response = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      version: "stability-ai/stable-diffusion:27b93a2413e7f36cd83da926f3656280b2931564ff050bf9575f1fdf9bcd7478",
      input: {
        prompt: prompt,
        image: `data:image/jpeg;base64,${userPhotoBuffer.toString('base64')}`
      }
    })
  })

  const data = await response.json()
  
  // Ждем завершения генерации
  let result = data
  while (result.status === 'starting' || result.status === 'processing') {
    await new Promise(resolve => setTimeout(resolve, 1000))
    const statusResponse = await fetch(`https://api.replicate.com/v1/predictions/${data.id}`, {
      headers: {
        'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`
      }
    })
    result = await statusResponse.json()
  }

  return result.output[0]
  */
  
  return 'https://via.placeholder.com/512x512/8B5CF6/FFFFFF?text=Replicate+Result'
}
