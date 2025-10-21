'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, Users, Eye, Clock, TrendingUp, Globe, Calendar, Activity, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import ProgressBar from './ProgressBar'

interface VercelAnalyticsData {
  pageViews: number
  uniqueVisitors: number
  topPages: Array<{ path: string; views: number }>
  topCountries: Array<{ country: string; visitors: number }>
  topDevices: Array<{ device: string; visitors: number }>
  topBrowsers: Array<{ browser: string; visitors: number }>
  hourlyStats: Array<{ hour: number; views: number }>
  dailyStats: Array<{ date: string; views: number }>
}

interface VercelAnalyticsProps {
  lang: 'uk' | 'pl' | 'de' | 'en'
}

export default function VercelAnalytics({ lang }: VercelAnalyticsProps) {
  const [analytics, setAnalytics] = useState<VercelAnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const translations = {
    uk: {
      vercel_analytics: 'Аналітика Vercel',
      page_views: 'Перегляди сторінок',
      unique_visitors: 'Унікальні відвідувачі',
      top_pages: 'Популярні сторінки',
      top_countries: 'Країни відвідувачів',
      top_devices: 'Пристрої',
      top_browsers: 'Браузери',
      hourly_stats: 'Почасова статистика',
      daily_stats: 'Щоденна статистика',
      loading: 'Завантаження...',
      error: 'Помилка завантаження аналітики',
      no_data: 'Дані аналітики ще не доступні',
      note: 'Примітка: Дані Vercel Analytics можуть з\'явитися через 30 секунд після відвідування сайту'
    },
    pl: {
      vercel_analytics: 'Analityka Vercel',
      page_views: 'Wyświetlenia stron',
      unique_visitors: 'Unikalni odwiedzający',
      top_pages: 'Popularne strony',
      top_countries: 'Kraje odwiedzających',
      top_devices: 'Urządzenia',
      top_browsers: 'Przeglądarki',
      hourly_stats: 'Statystyki godzinowe',
      daily_stats: 'Statystyki dzienne',
      loading: 'Ładowanie...',
      error: 'Błąd ładowania analityki',
      no_data: 'Dane analityki nie są jeszcze dostępne',
      note: 'Uwaga: Dane Vercel Analytics mogą pojawić się po 30 sekundach od odwiedzenia strony'
    },
    de: {
      vercel_analytics: 'Vercel Analytics',
      page_views: 'Seitenaufrufe',
      unique_visitors: 'Eindeutige Besucher',
      top_pages: 'Beliebte Seiten',
      top_countries: 'Besucherländer',
      top_devices: 'Geräte',
      top_browsers: 'Browser',
      hourly_stats: 'Stündliche Statistiken',
      daily_stats: 'Tägliche Statistiken',
      loading: 'Laden...',
      error: 'Fehler beim Laden der Analytics',
      no_data: 'Analytics-Daten sind noch nicht verfügbar',
      note: 'Hinweis: Vercel Analytics-Daten können nach 30 Sekunden nach dem Besuch der Website erscheinen'
    },
    en: {
      vercel_analytics: 'Vercel Analytics',
      page_views: 'Page Views',
      unique_visitors: 'Unique Visitors',
      top_pages: 'Top Pages',
      top_countries: 'Top Countries',
      top_devices: 'Top Devices',
      top_browsers: 'Top Browsers',
      hourly_stats: 'Hourly Statistics',
      daily_stats: 'Daily Statistics',
      loading: 'Loading...',
      error: 'Error loading analytics',
      no_data: 'Analytics data not yet available',
      note: 'Note: Vercel Analytics data may appear after 30 seconds of visiting the site'
    }
  }

  const t = (key: string) => (translations[lang] as any)?.[key] ?? (translations['en'] as any)[key] ?? key

  useEffect(() => {
    // Симуляция данных Vercel Analytics
    // В реальном приложении здесь был бы API вызов к Vercel Analytics
    const mockAnalytics: VercelAnalyticsData = {
      pageViews: 1247,
      uniqueVisitors: 342,
      topPages: [
        { path: '/', views: 856 },
        { path: '/stats', views: 234 },
        { path: '/api/stats', views: 157 }
      ],
      topCountries: [
        { country: 'United States', visitors: 156 },
        { country: 'Germany', visitors: 89 },
        { country: 'Poland', visitors: 67 },
        { country: 'Ukraine', visitors: 30 }
      ],
      topDevices: [
        { device: 'Desktop', visitors: 198 },
        { device: 'Mobile', visitors: 112 },
        { device: 'Tablet', visitors: 32 }
      ],
      topBrowsers: [
        { browser: 'Chrome', visitors: 189 },
        { browser: 'Safari', visitors: 78 },
        { browser: 'Firefox', visitors: 45 },
        { browser: 'Edge', visitors: 30 }
      ],
      hourlyStats: Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        views: Math.floor(Math.random() * 50) + 10
      })),
      dailyStats: Array.from({ length: 7 }, (_, i) => ({
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        views: Math.floor(Math.random() * 200) + 50
      }))
    }

    // Симуляция загрузки
    setTimeout(() => {
      setAnalytics(mockAnalytics)
      setLoading(false)
    }, 1500)
  }, [])

  const StatCard = ({ icon: Icon, title, value, subtitle, color = 'blue' }: {
    icon: any
    title: string
    value: string | number
    subtitle?: string
    color?: 'blue' | 'green' | 'purple' | 'orange' | 'red'
  }) => {
    const colorClasses = {
      blue: 'from-blue-500 to-blue-600',
      green: 'from-green-500 to-green-600',
      purple: 'from-purple-500 to-purple-600',
      orange: 'from-orange-500 to-orange-600',
      red: 'from-red-500 to-red-600'
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">{title}</p>
            <p className="text-3xl font-bold text-gray-800">{value}</p>
            {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
          </div>
          <div className={`p-3 bg-gradient-to-br ${colorClasses[color]} rounded-xl`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </motion.div>
    )
  }

  const ChartCard = ({ title, data, maxItems = 5 }: {
    title: string
    data: Array<{ [key: string]: any }>
    maxItems?: number
  }) => {
    const entries = data.slice(0, maxItems)
    const maxValue = Math.max(...entries.map(item => Object.values(item)[1] as number))

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300"
      >
        <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
        <div className="space-y-3">
          {entries.map((item, index) => {
            const key = Object.keys(item)[0]
            const value = Object.values(item)[1] as number
            return (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 capitalize">{key}</span>
                <div className="flex items-center space-x-2">
                  <ProgressBar value={value} maxValue={maxValue} />
                  <span className="text-sm font-medium text-gray-800 w-8 text-right">{value}</span>
                </div>
              </div>
            )
          })}
        </div>
      </motion.div>
    )
  }

  if (loading) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-600">{t('loading')}</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
        <div className="text-center py-8">
          <p className="text-red-500 mb-4">{error}</p>
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
        <div className="text-center py-8">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <BarChart3 className="w-10 h-10 text-blue-400" />
          </div>
          <p className="text-lg font-medium text-gray-600 mb-2">{t('no_data')}</p>
          <p className="text-sm text-gray-500">{t('note')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="text-center">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
          {t('vercel_analytics')}
        </h2>
        <p className="text-gray-600">{t('note')}</p>
      </div>

      {/* Основные метрики */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard
          icon={Eye}
          title={t('page_views')}
          value={analytics.pageViews.toLocaleString()}
          color="blue"
        />
        <StatCard
          icon={Users}
          title={t('unique_visitors')}
          value={analytics.uniqueVisitors.toLocaleString()}
          color="green"
        />
      </div>

      {/* Графики */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title={t('top_pages')}
          data={analytics.topPages.map(item => ({ [item.path]: item.views }))}
        />
        <ChartCard
          title={t('top_countries')}
          data={analytics.topCountries.map(item => ({ [item.country]: item.visitors }))}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title={t('top_devices')}
          data={analytics.topDevices.map(item => ({ [item.device]: item.visitors }))}
        />
        <ChartCard
          title={t('top_browsers')}
          data={analytics.topBrowsers.map(item => ({ [item.browser]: item.visitors }))}
        />
      </div>
    </div>
  )
}
