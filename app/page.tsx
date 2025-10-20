'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Upload, Sparkles, User, Shirt, Download, RefreshCw, Trash2, Star, MoreVertical } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import toast from 'react-hot-toast'

interface GeneratedImage {
  id: string
  url: string
  description?: string
  timestamp: Date
}

export default function Home() {
  const [userPhoto, setUserPhoto] = useState<File | null>(null)
  const [clothingPhotos, setClothingPhotos] = useState<File[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([])
  const [selectedScene, setSelectedScene] = useState('')
  const [lang, setLang] = useState<'uk' | 'pl' | 'de' | 'en'>('en')

  // Simple i18n dictionary
  const translations: Record<string, Record<string, string>> = {
    uk: {
      header_description: 'VirtualTryOnMe — платформа віртуальної примірки, що поєднує технології та моду. Завантажуй фото, приміряй і купуй те, що справді тобі пасує.',
      user_photo: 'Фото користувача',
      drop_user: 'Перетягніть фото або натисніть для вибору',
      formats_user: 'JPG, PNG, WEBP до 10MB',
      clothes_photo: 'Фото одягу',
      drop_clothes: 'Перетягніть фото одягу або натисніть для вибору',
      formats_clothes: 'До 3 фото, JPG, PNG, WEBP до 10MB кожне',
      uploaded_ok_user: 'Фото користувача завантажено!',
      uploaded_ok_clothes_many: 'Завантажено {n} фото одягу!'
      ,scene: 'Сцена',
      scene_select: 'Оберіть сцену (необов’язково)',
      scene_office: 'Офіс',
      scene_restaurant: 'Ресторан',
      scene_street: 'Вулиця',
      scene_home: 'Вдома',
      scene_beach: 'Пляж',
      scene_gym: 'Спортзал',
      scene_party: 'Вечірка',
      scene_wedding: 'Весілля',
      scene_studio: 'Студія',
      scene_nature: 'Природа',
      generate: 'Створити образ',
      generating: 'Генеруємо образ...',
      results: 'Результати',
      empty_title: 'Згенеровані образи з’являться тут',
      empty_sub: 'Завантажте фото і створіть свій перший образ!',
      prompt_label: 'Промпт:',
      desc_label: 'Опис від Gemini AI:',
      download_title: 'Завантажити зображення',
      toast_need_user: 'Завантажте фото користувача',
      toast_need_clothes: 'Завантажте фото одягу',
      toast_generated: 'Образ згенеровано за допомогою Gemini AI!',
      toast_api_error: 'Помилка генерації образу: ',
      toast_error: 'Помилка під час генерації образу',
      delete_photo: 'Видалити фото'
    },
    pl: {
      header_description: 'VirtualTryOnMe — platforma wirtualnej przymierzalni łącząca technologię i modę. Prześlij zdjęcie, przymierz i kupuj to, co naprawdę do Ciebie pasuje.',
      user_photo: 'Zdjęcie użytkownika',
      drop_user: 'Przeciągnij zdjęcie lub kliknij, aby wybrać',
      formats_user: 'JPG, PNG, WEBP do 10MB',
      clothes_photo: 'Zdjęcia ubrań',
      drop_clothes: 'Przeciągnij zdjęcia ubrań lub kliknij, aby wybrać',
      formats_clothes: 'Do 3 zdjęć, JPG, PNG, WEBP do 10MB każde',
      uploaded_ok_user: 'Zdjęcie użytkownika przesłane!',
      uploaded_ok_clothes_many: 'Przesłano {n} zdjęć ubrań!'
      ,scene: 'Scena',
      scene_select: 'Wybierz scenę (opcjonalnie)',
      scene_office: 'Biuro',
      scene_restaurant: 'Restauracja',
      scene_street: 'Ulica',
      scene_home: 'Dom',
      scene_beach: 'Plaża',
      scene_gym: 'Siłownia',
      scene_party: 'Impreza',
      scene_wedding: 'Ślub',
      scene_studio: 'Studio',
      scene_nature: 'Natura',
      generate: 'Utwórz stylizację',
      generating: 'Tworzenie stylizacji...',
      results: 'Wyniki',
      empty_title: 'Wygenerowane obrazy pojawią się tutaj',
      empty_sub: 'Prześlij zdjęcie i utwórz swoją pierwszą stylizację!',
      prompt_label: 'Prompt:',
      desc_label: 'Opis od Gemini AI:',
      download_title: 'Pobierz obraz',
      toast_need_user: 'Prześlij zdjęcie użytkownika',
      toast_need_clothes: 'Prześlij zdjęcia ubrań',
      toast_generated: 'Stylizacja wygenerowana przez Gemini AI!',
      toast_api_error: 'Błąd generowania stylizacji: ',
      toast_error: 'Błąd podczas generowania stylizacji',
      delete_photo: 'Usuń zdjęcie'
    },
    de: {
      header_description: 'VirtualTryOnMe — Plattform für virtuelle Anproben, die Technologie und Mode verbindet. Lade ein Foto hoch, probiere an und kaufe, was dir wirklich steht.',
      user_photo: 'Nutzerfoto',
      drop_user: 'Foto hierher ziehen oder klicken, um auszuwählen',
      formats_user: 'JPG, PNG, WEBP bis 10MB',
      clothes_photo: 'Kleidungsfotos',
      drop_clothes: 'Kleidungsfotos hierher ziehen oder klicken, um auszuwählen',
      formats_clothes: 'Bis zu 3 Fotos, JPG, PNG, WEBP bis 10MB je Foto',
      uploaded_ok_user: 'Nutzerfoto hochgeladen!',
      uploaded_ok_clothes_many: '{n} Kleidungsfotos hochgeladen!'
      ,scene: 'Szene',
      scene_select: 'Szene wählen (optional)',
      scene_office: 'Büro',
      scene_restaurant: 'Restaurant',
      scene_street: 'Straße',
      scene_home: 'Zuhause',
      scene_beach: 'Strand',
      scene_gym: 'Fitnessstudio',
      scene_party: 'Party',
      scene_wedding: 'Hochzeit',
      scene_studio: 'Studio',
      scene_nature: 'Natur',
      generate: 'Look erstellen',
      generating: 'Look wird erstellt...',
      results: 'Ergebnisse',
      empty_title: 'Generierte Bilder erscheinen hier',
      empty_sub: 'Lade ein Foto hoch und erstelle deinen ersten Look!',
      prompt_label: 'Prompt:',
      desc_label: 'Beschreibung von Gemini AI:',
      download_title: 'Bild herunterladen',
      toast_need_user: 'Lade ein Nutzerfoto hoch',
      toast_need_clothes: 'Lade Kleidungsfotos hoch',
      toast_generated: 'Look mit Gemini AI generiert!',
      toast_api_error: 'Fehler beim Generieren des Looks: ',
      toast_error: 'Fehler beim Generieren des Looks',
      delete_photo: 'Foto löschen'
    },
    en: {
      header_description: 'VirtualTryOnMe — a virtual try-on platform that blends technology and fashion. Upload a photo, try on, and buy what truly suits you.',
      user_photo: 'User photo',
      drop_user: 'Drag and drop a photo or click to select',
      formats_user: 'JPG, PNG, WEBP up to 10MB',
      clothes_photo: 'Clothing photos',
      drop_clothes: 'Drag and drop clothing photos or click to select',
      formats_clothes: 'Up to 3 photos, JPG, PNG, WEBP up to 10MB each',
      uploaded_ok_user: 'User photo uploaded!',
      uploaded_ok_clothes_many: 'Uploaded {n} clothing photos!'
      ,scene: 'Scene',
      scene_select: 'Select a scene (optional)',
      scene_office: 'Office',
      scene_restaurant: 'Restaurant',
      scene_street: 'Street',
      scene_home: 'Home',
      scene_beach: 'Beach',
      scene_gym: 'Gym',
      scene_party: 'Party',
      scene_wedding: 'Wedding',
      scene_studio: 'Studio',
      scene_nature: 'Nature',
      generate: 'Generate outfit',
      generating: 'Generating outfit...',
      results: 'Results',
      empty_title: 'Generated images will appear here',
      empty_sub: 'Upload a photo and create your first outfit!',
      prompt_label: 'Prompt:',
      desc_label: 'Description by Gemini AI:',
      download_title: 'Download image',
      toast_need_user: 'Please upload a user photo',
      toast_need_clothes: 'Please upload clothing photos',
      toast_generated: 'Outfit generated with Gemini AI!',
      toast_api_error: 'Outfit generation error: ',
      toast_error: 'Error generating outfit',
      delete_photo: 'Remove photo'
    }
  }

  const t = (key: string, vars?: Record<string, string | number>) => {
    const template = translations[lang]?.[key] ?? translations['en'][key] ?? key
    if (!vars) return template
    return Object.keys(vars).reduce((acc, k) => acc.replace(`{${k}}`, String(vars[k])), template)
  }

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? window.localStorage.getItem('lang') : null
    if (saved === 'uk' || saved === 'pl' || saved === 'de' || saved === 'en') {
      setLang(saved)
    }
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('lang', lang)
    }
  }, [lang])

  const userPhotoRef = useRef<HTMLInputElement>(null)
  const clothingPhotoRef = useRef<HTMLInputElement>(null)

  const onUserPhotoDrop = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      setUserPhoto(acceptedFiles[0])
      toast.success(t('uploaded_ok_user'))
    }
  })

  const onClothingPhotoDrop = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 3,
    onDrop: (acceptedFiles) => {
      setClothingPhotos(prev => [...prev, ...acceptedFiles].slice(0, 3))
      toast.success(t('uploaded_ok_clothes_many', { n: acceptedFiles.length }))
    }
  })

  const handleUserPhotoClick = () => {
    userPhotoRef.current?.click()
  }

  const handleClothingPhotoClick = () => {
    clothingPhotoRef.current?.click()
  }

  const removeClothingPhoto = (index: number) => {
    setClothingPhotos(prev => prev.filter((_, i) => i !== index))
  }


  const generateOutfit = async () => {
    if (!userPhoto) {
      toast.error(t('toast_need_user'))
      return
    }

    if (clothingPhotos.length === 0) {
      toast.error(t('toast_need_clothes'))
      return
    }

    try {
      setIsGenerating(true)
      
      const formData = new FormData()
      formData.append('userPhoto', userPhoto)
      
      // Добавляем все фото одежды
      clothingPhotos.forEach((photo, index) => {
        formData.append(`clothingPhoto${index}`, photo)
      })
      
      if (selectedScene) {
        formData.append('scene', selectedScene)
      }

      const response = await fetch('/api/generate-outfit', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()
      console.log('API Response:', data)
      
      if (data.success) {
        console.log('Success! Image URL:', data.imageUrl)
        const newImage: GeneratedImage = {
          id: Date.now().toString(),
          url: data.imageUrl,
          description: data.description,
          timestamp: new Date()
        }
        setGeneratedImages(prev => [newImage, ...prev])
        toast.success(t('toast_generated'))
      } else {
        console.error('API Error:', data.error)
        toast.error(t('toast_api_error') + data.error)
      }
    } catch (error) {
      toast.error(t('toast_error'))
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadImage = (imageUrl: string, filename: string) => {
    const link = document.createElement('a')
    link.href = imageUrl
    link.download = filename
    link.click()
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-indigo-400/10 to-purple-400/10 rounded-full blur-3xl"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          {/* Language Selector */}
          <div className="flex justify-end mb-4">
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as any)}
              className="px-3 py-2 bg-white/70 border border-gray-200 rounded-xl text-sm text-gray-700 focus:ring-2 focus:ring-purple-500"
              title="Language"
            >
              <option value="en">English</option>
              <option value="uk">Українська</option>
              <option value="pl">Polski</option>
              <option value="de">Deutsch</option>
            </select>
          </div>
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mb-6 shadow-lg"
          >
            <Sparkles className="w-10 h-10 text-white" />
          </motion.div>
          
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent mb-6">
            VirtualTryOnMe
          </h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed mb-8">
            {t('header_description')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* User Photo */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg mr-3">
                  <User className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800">{t('user_photo')}</h2>
              </div>
              
              <div 
                {...onUserPhotoDrop.getRootProps()}
                className={`dropzone ${onUserPhotoDrop.isDragActive ? 'dropzone-active' : ''}`}
                onClick={handleUserPhotoClick}
              >
                <input {...onUserPhotoDrop.getInputProps()} ref={userPhotoRef} />
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">{t('drop_user')}</p>
                <p className="text-sm text-gray-500">{t('formats_user')}</p>
                {userPhoto && (
                  <div className="mt-4 p-2 bg-green-100 rounded-lg">
                    <p className="text-green-800 text-sm">✓ {userPhoto.name}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Clothing Photo */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg mr-3">
                  <Shirt className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800">{t('clothes_photo')}</h2>
              </div>
              
              <div 
                {...onClothingPhotoDrop.getRootProps()}
                className={`dropzone ${onClothingPhotoDrop.isDragActive ? 'dropzone-active' : ''}`}
                onClick={handleClothingPhotoClick}
              >
                <input {...onClothingPhotoDrop.getInputProps()} ref={clothingPhotoRef} />
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">{t('drop_clothes')}</p>
                <p className="text-sm text-gray-500">{t('formats_clothes')}</p>
                
                {/* Список загруженных фото */}
                {clothingPhotos.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {clothingPhotos.map((photo, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
                        <p className="text-green-800 text-sm font-medium">✓ {photo.name}</p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            removeClothingPhoto(index)
                          }}
                          className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                          title={t('delete_photo')}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>



            {/* Scene Selection */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg mr-3">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800">{t('scene')}</h2>
              </div>
              <select
                value={selectedScene}
                onChange={(e) => setSelectedScene(e.target.value)}
                className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-700"
                title={t('scene')}
              >
                <option value="">{t('scene_select')}</option>
                <option value="office">{t('scene_office')}</option>
                <option value="restaurant">{t('scene_restaurant')}</option>
                <option value="street">{t('scene_street')}</option>
                <option value="home">{t('scene_home')}</option>
                <option value="beach">{t('scene_beach')}</option>
                <option value="gym">{t('scene_gym')}</option>
                <option value="party">{t('scene_party')}</option>
                <option value="wedding">{t('scene_wedding')}</option>
                <option value="studio">{t('scene_studio')}</option>
                <option value="nature">{t('scene_nature')}</option>
              </select>
            </div>

            {/* Generate Button */}
            <button
              onClick={generateOutfit}
              disabled={isGenerating || !userPhoto || clothingPhotos.length === 0}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed shadow-lg hover:shadow-xl text-lg"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                  {t('generating')}
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  {t('generate')}
                </>
              )}
            </button>
          </motion.div>

          {/* Results Section */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg mr-3">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800">{t('results')}</h2>
              </div>
              
              {generatedImages.length === 0 ? (
                <div className="text-center py-16 text-gray-500">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Sparkles className="w-10 h-10 text-purple-400" />
                  </div>
                  <p className="text-lg font-medium text-gray-600">{t('empty_title')}</p>
                  <p className="text-sm text-gray-500 mt-2">{t('empty_sub')}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {generatedImages.map((image) => (
                    <div key={image.id} className="bg-gradient-to-br from-white/90 to-gray-50/90 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                      <div className="mb-4">
                        <img
                          src={image.url}
                          alt="Generated outfit"
                          className="w-full rounded-xl shadow-md"
                          onLoad={() => console.log('Image loaded successfully:', image.url)}
                          onError={(e) => console.error('Image failed to load:', image.url, e)}
                        />
                      </div>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="text-sm text-gray-600 mb-2">
                            {image.timestamp.toLocaleString()}
                          </p>
                          {/* Prompt hidden from user */}
                          {/* Description hidden from user */}
                        </div>
                        <button
                          onClick={() => downloadImage(image.url, `outfit-${image.id}.png`)}
                          className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                          title={t('download_title')}
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  )
}