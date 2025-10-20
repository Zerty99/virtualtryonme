import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'VirtualTryOnMe - Virtual Try-On',
  description: 'VirtualTryOnMe — a virtual try-on platform that blends technology and fashion. Upload a photo, try on, and buy what truly suits you.',
  keywords: 'virtual try-on, fashion, AI, clothing, fitting, technology, style',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
          {children}
          <Toaster position="top-right" />
        </div>
      </body>
    </html>
  )
}