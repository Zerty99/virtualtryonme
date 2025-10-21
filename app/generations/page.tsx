'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import { Star, Download, Trash2, Eye, EyeOff } from 'lucide-react'

interface Generation {
  id: string
  userPhoto: string
  clothingPhotos: Array<{
    name: string
    size: number
    type: string
    data: string
  }>
  generatedImage: string
  prompt: string
  scene?: string
  quality?: number
  feedback?: string
  isPublic: boolean
  model?: string
  processingTime?: number
  tokensUsed?: number
  createdAt: string
  updatedAt: string
}

interface GenerationsResponse {
  success: boolean
  generations: Generation[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export default function GenerationsPage() {
  const { data: session, status } = useSession()
  const [generations, setGenerations] = useState<Generation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    if (status === 'authenticated') {
      fetchGenerations()
    }
  }, [status, currentPage])

  const fetchGenerations = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/generations?page=${currentPage}&limit=12`)
      const data: GenerationsResponse = await response.json()
      
      if (data.success) {
        setGenerations(data.generations)
        setTotalPages(data.pagination.pages)
      } else {
        setError('Failed to fetch generations')
      }
    } catch (err) {
      setError('Error loading generations')
    } finally {
      setLoading(false)
    }
  }

  const updateGeneration = async (id: string, updates: { quality?: number; feedback?: string; isPublic?: boolean }) => {
    try {
      const response = await fetch(`/api/generations/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })
      
      if (response.ok) {
        // Обновляем локальное состояние
        setGenerations(prev => 
          prev.map(gen => 
            gen.id === id ? { ...gen, ...updates } : gen
          )
        )
      }
    } catch (err) {
      console.error('Error updating generation:', err)
    }
  }

  const deleteGeneration = async (id: string) => {
    if (!confirm('Are you sure you want to delete this generation?')) return
    
    try {
      const response = await fetch(`/api/generations/${id}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        setGenerations(prev => prev.filter(gen => gen.id !== id))
      }
    } catch (err) {
      console.error('Error deleting generation:', err)
    }
  }

  const downloadImage = (imageUrl: string, filename: string) => {
    const link = document.createElement('a')
    link.href = imageUrl
    link.download = filename
    link.click()
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your generations...</p>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please sign in</h1>
          <p className="text-gray-600">You need to be signed in to view your generations.</p>
        </div>
      </div>
    )
  }

  // Проверяем доступ только для определенного email
  if (session?.user?.email !== 'ronama9949@gmail.com') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600">This page is restricted to authorized users only.</p>
          <p className="text-sm text-gray-500 mt-2">Current user: {session?.user?.email}</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Generations</h1>
          <p className="mt-2 text-gray-600">View and manage your AI-generated outfit images</p>
        </div>

        {generations.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No generations yet</h3>
            <p className="text-gray-600">Start creating outfit images to see them here!</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {generations.map((generation) => (
                <div key={generation.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="relative bg-gray-100 flex items-center justify-center">
                    <Image
                      src={generation.generatedImage}
                      alt="Generated outfit"
                      width={400}
                      height={400}
                      className="max-w-full max-h-64 object-contain"
                    />
                    <div className="absolute top-2 right-2 flex gap-2">
                      <button
                        onClick={() => updateGeneration(generation.id, { isPublic: !generation.isPublic })}
                        className={`p-2 rounded-full ${
                          generation.isPublic 
                            ? 'bg-green-500 text-white' 
                            : 'bg-gray-500 text-white'
                        }`}
                        title={generation.isPublic ? 'Make private' : 'Make public'}
                      >
                        {generation.isPublic ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => deleteGeneration(generation.id)}
                        className="p-2 bg-red-500 text-white rounded-full"
                        title="Delete generation"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {generation.scene || 'Outfit Generation'}
                      </h3>
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => updateGeneration(generation.id, { quality: star })}
                            className={`${
                              star <= (generation.quality || 0)
                                ? 'text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          >
                            <Star className="h-4 w-4 fill-current" />
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {generation.prompt}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{new Date(generation.createdAt).toLocaleDateString()}</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => downloadImage(generation.generatedImage, `outfit-${generation.id}.png`)}
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                        >
                          <Download className="h-3 w-3" />
                          Download
                        </button>
                      </div>
                    </div>
                    
                    {generation.feedback && (
                      <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600">
                        {generation.feedback}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  
                  <span className="px-4 py-2 text-sm text-gray-700">
                    Page {currentPage} of {totalPages}
                  </span>
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
