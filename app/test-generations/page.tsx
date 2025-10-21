'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'

export default function TestGenerationsPage() {
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  const createTestGenerations = async () => {
    if (!session) return

    setLoading(true)
    try {
      const response = await fetch('/api/test-generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()
      
      if (data.success) {
        setResult(`✅ Successfully created ${data.generations.length} test generations!`)
      } else {
        setResult(`❌ Error: ${data.error}`)
      }
    } catch (error) {
      setResult(`❌ Error: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please sign in</h1>
          <p className="text-gray-600">You need to be signed in to create test generations.</p>
        </div>
      </div>
    )
  }

  if (session?.user?.email !== 'ronama9949@gmail.com') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600">This page is restricted to authorized users only.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Create Test Generations</h1>
          <p className="text-gray-600 mb-6">
            This will create 5 test generations in the database to populate the gallery.
          </p>
          
          <button
            onClick={createTestGenerations}
            disabled={loading}
            className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Test Generations'}
          </button>

          {result && (
            <div className="mt-4 p-4 bg-gray-100 rounded-md">
              <p className="text-sm">{result}</p>
            </div>
          )}

          <div className="mt-6 text-sm text-gray-500">
            <p><strong>Current user:</strong> {session.user.email}</p>
            <p><strong>User ID:</strong> {session.user.id}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
