'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function TestAuth() {
  const { data: session, status } = useSession()
  const router = useRouter()

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-2xl shadow-xl text-center">
          <h1 className="text-2xl font-bold text-gray-900">Не авторизован</h1>
          <p className="text-gray-600">Для доступа к этой странице необходимо войти в систему</p>
          <div className="space-y-4">
            <Link 
              href="/auth/signin"
              className="block w-full py-3 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Войти
            </Link>
            <Link 
              href="/auth/signup"
              className="block w-full py-3 px-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              Зарегистрироваться
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-2xl shadow-xl">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Добро пожаловать!</h1>
          <p className="text-gray-600">Вы успешно авторизованы</p>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900">Информация о пользователе:</h3>
            <div className="mt-2 space-y-1 text-sm text-gray-600">
              <p><strong>Имя:</strong> {session.user?.name}</p>
              <p><strong>Email:</strong> {session.user?.email}</p>
              <p><strong>ID:</strong> {session.user?.id}</p>
            </div>
          </div>

          {session.user?.image && (
            <div className="text-center">
              <img 
                src={session.user.image} 
                alt="Profile" 
                className="w-20 h-20 rounded-full mx-auto"
              />
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="w-full py-3 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Выйти
            </button>
            
            <Link 
              href="/"
              className="block w-full py-3 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-center"
            >
              На главную
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
