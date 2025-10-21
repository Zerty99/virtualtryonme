import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
// import { PrismaAdapter } from '@auth/prisma-adapter'
// import { PrismaClient } from '@prisma/client'

// const prisma = new PrismaClient()

// Проверяем переменные окружения
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
const NEXTAUTH_URL = process.env.NEXTAUTH_URL
const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET

// Отладочные console.log
console.log('Google ID:', process.env.GOOGLE_CLIENT_ID)
console.log('Google Secret:', process.env.GOOGLE_CLIENT_SECRET)

// Временная проверка переменных окружения
console.log('GOOGLE_CLIENT_ID =', process.env.GOOGLE_CLIENT_ID);
console.log('NEXTAUTH_URL =', process.env.NEXTAUTH_URL);

// Debug: проверяем переменные окружения
console.log('🔍 Environment variables check:')
console.log('GOOGLE_CLIENT_ID:', GOOGLE_CLIENT_ID ? '✅ Set' : '❌ Missing')
console.log('GOOGLE_CLIENT_SECRET:', GOOGLE_CLIENT_SECRET ? '✅ Set' : '❌ Missing')
console.log('NEXTAUTH_URL:', NEXTAUTH_URL ? '✅ Set' : '❌ Missing')
console.log('NEXTAUTH_SECRET:', NEXTAUTH_SECRET ? '✅ Set' : '❌ Missing')

// Проверяем наличие обязательных переменных
if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  throw new Error('Missing Google OAuth credentials. Please check your .env file.')
}

if (!NEXTAUTH_SECRET) {
  throw new Error('Missing NEXTAUTH_SECRET. Please check your .env file.')
}

const handler = NextAuth({
  // adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    session: async ({ session, token }) => {
      if (session?.user && token?.sub) {
        session.user.id = token.sub
      }
      return session
    },
    jwt: async ({ user, token }) => {
      if (user) {
        token.uid = user.id
      }
      return token
    },
  },
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/auth/signin',
    signUp: '/auth/signup',
  },
})

export { handler as GET, handler as POST }
