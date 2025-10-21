import axios from 'axios';
import FormData from 'form-data';

export interface BackgroundRemovalResult {
  success: boolean;
  processedImageBuffer?: Buffer;
  error?: string;
  service?: string;
}

/**
 * Удаляет фон с изображения человека используя различные API сервисы
 */
export async function removeBackground(
  imageBuffer: Buffer, 
  service: 'removebg' | 'clipdrop' | 'replicate' = 'removebg'
): Promise<BackgroundRemovalResult> {
  try {
    switch (service) {
      case 'removebg':
        return await removeBackgroundWithRemoveBg(imageBuffer);
      case 'clipdrop':
        return await removeBackgroundWithClipdrop(imageBuffer);
      case 'replicate':
        return await removeBackgroundWithReplicate(imageBuffer);
      default:
        throw new Error(`Unsupported service: ${service}`);
    }
  } catch (error) {
    console.error(`Background removal failed with ${service}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Удаление фона через Remove.bg API
 */
async function removeBackgroundWithRemoveBg(imageBuffer: Buffer): Promise<BackgroundRemovalResult> {
  const apiKey = process.env.REMOVEBG_API_KEY;
  
  if (!apiKey) {
    console.warn('REMOVEBG_API_KEY not found, skipping background removal');
    return {
      success: false,
      error: 'REMOVEBG_API_KEY not configured'
    };
  }

  try {
    const formData = new FormData();
    formData.append('image_file', imageBuffer, {
      filename: 'user.jpg',
      contentType: 'image/jpeg'
    });
    formData.append('size', 'auto');
    formData.append('format', 'png');

    const response = await axios.post('https://api.remove.bg/v1.0/removebg', formData, {
      headers: {
        ...formData.getHeaders(),
        'X-Api-Key': apiKey
      },
      responseType: 'arraybuffer',
      timeout: 30000
    });

    return {
      success: true,
      processedImageBuffer: Buffer.from(response.data),
      service: 'removebg'
    };
  } catch (error) {
    console.error('Remove.bg API error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Remove.bg API error'
    };
  }
}

/**
 * Удаление фона через Clipdrop API
 */
async function removeBackgroundWithClipdrop(imageBuffer: Buffer): Promise<BackgroundRemovalResult> {
  const apiKey = process.env.CLIPDROP_API_KEY;
  
  if (!apiKey) {
    console.warn('CLIPDROP_API_KEY not found, skipping background removal');
    return {
      success: false,
      error: 'CLIPDROP_API_KEY not configured'
    };
  }

  try {
    const formData = new FormData();
    formData.append('image_file', imageBuffer, {
      filename: 'user.jpg',
      contentType: 'image/jpeg'
    });

    const response = await axios.post('https://clipdrop-api.co/remove-background/v1', formData, {
      headers: {
        ...formData.getHeaders(),
        'x-api-key': apiKey
      },
      responseType: 'arraybuffer',
      timeout: 30000
    });

    return {
      success: true,
      processedImageBuffer: Buffer.from(response.data),
      service: 'clipdrop'
    };
  } catch (error) {
    console.error('Clipdrop API error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Clipdrop API error'
    };
  }
}

/**
 * Удаление фона через Replicate API
 */
async function removeBackgroundWithReplicate(imageBuffer: Buffer): Promise<BackgroundRemovalResult> {
  const apiToken = process.env.REPLICATE_API_TOKEN;
  
  if (!apiToken) {
    console.warn('REPLICATE_API_TOKEN not found, skipping background removal');
    return {
      success: false,
      error: 'REPLICATE_API_TOKEN not configured'
    };
  }

  try {
    // Создаем prediction
    const predictionResponse = await axios.post('https://api.replicate.com/v1/predictions', {
      version: "cjwbw/rembg:fb8af171cfa1616ddcf1242c093f9c46bcada5ad4cf6f2fbe8b81b330ec5c003",
      input: {
        image: `data:image/jpeg;base64,${imageBuffer.toString('base64')}`
      }
    }, {
      headers: {
        'Authorization': `Token ${apiToken}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    const predictionId = predictionResponse.data.id;
    
    // Ждем завершения обработки
    let result = predictionResponse.data;
    while (result.status === 'starting' || result.status === 'processing') {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const statusResponse = await axios.get(`https://api.replicate.com/v1/predictions/${predictionId}`, {
        headers: {
          'Authorization': `Token ${apiToken}`
        }
      });
      
      result = statusResponse.data;
    }

    if (result.status === 'succeeded' && result.output) {
      // Скачиваем результат
      const imageResponse = await axios.get(result.output, {
        responseType: 'arraybuffer',
        timeout: 30000
      });

      return {
        success: true,
        processedImageBuffer: Buffer.from(imageResponse.data),
        service: 'replicate'
      };
    } else {
      throw new Error(`Replicate processing failed: ${result.status}`);
    }
  } catch (error) {
    console.error('Replicate API error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Replicate API error'
    };
  }
}

/**
 * Пробует удалить фон используя доступные сервисы в порядке приоритета
 */
export async function removeBackgroundWithFallback(imageBuffer: Buffer): Promise<BackgroundRemovalResult> {
  const services: Array<'removebg' | 'clipdrop' | 'replicate'> = ['removebg', 'clipdrop', 'replicate'];
  
  for (const service of services) {
    console.log(`Trying background removal with ${service}...`);
    const result = await removeBackground(imageBuffer, service);
    
    if (result.success) {
      console.log(`Background removal successful with ${service}`);
      return result;
    } else {
      console.warn(`Background removal failed with ${service}: ${result.error}`);
    }
  }
  
  // Если все сервисы недоступны, возвращаем оригинальное изображение
  console.warn('All background removal services failed, using original image');
  return {
    success: true,
    processedImageBuffer: imageBuffer,
    service: 'none'
  };
}
