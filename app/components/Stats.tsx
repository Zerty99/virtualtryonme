'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, Users, Zap, Clock, TrendingUp, Globe, Calendar, Activity, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import ProgressBar from './ProgressBar'
import VercelAnalytics from './VercelAnalytics'

interface StatsData {
  totalGenerations: number
  totalUsers: number
  generationsByScene: Record<string, number>
  generationsByLanguage: Record<string, number>
  dailyGenerations: Record<string, number>
  hourlyGenerations: Record<string, number>
  successRate: number
  averageGenerationTimeMs: number
  lastUpdated: string
}

interface StatsProps {
  lang: 'uk' | 'pl' | 'de' | 'en'
}

export default function Stats({ lang }: StatsProps) {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'app' | 'vercel'>('app')

  const translations = {
    uk: {
      stats_title: 'Статистика',
      total_generations: 'Всього генерацій',
      total_users: 'Всього користувачів',
      success_rate: 'Успішність',
      avg_time: 'Середній час',
      by_scene: 'За сценами',
      by_language: 'За мовами',
      daily_stats: 'Щоденна статистика',
      hourly_stats: 'Почасова статистика',
      loading: 'Завантаження...',
      error: 'Помилка завантаження статистики',
      last_updated: 'Останнє оновлення',
      ms: 'мс',
      percent: '%',
      view_details: 'Переглянути деталі',
      app_stats: 'Статистика додатку',
      vercel_analytics: 'Аналітика Vercel'
    },
    pl: {
      stats_title: 'Statystyki',
      total_generations: 'Łączne generacje',
      total_users: 'Łączni użytkownicy',
      success_rate: 'Wskaźnik sukcesu',
      avg_time: 'Średni czas',
      by_scene: 'Według scen',
      by_language: 'Według języków',
      daily_stats: 'Statystyki dzienne',
      hourly_stats: 'Statystyki godzinowe',
      loading: 'Ładowanie...',
      error: 'Błąd ładowania statystyk',
      last_updated: 'Ostatnia aktualizacja',
      ms: 'ms',
      percent: '%',
      view_details: 'Zobacz szczegóły',
      app_stats: 'Statystyki aplikacji',
      vercel_analytics: 'Analityka Vercel'
    },
    de: {
      stats_title: 'Statistiken',
      total_generations: 'Gesamtgenerierungen',
      total_users: 'Gesamtbenutzer',
      success_rate: 'Erfolgsrate',
      avg_time: 'Durchschnittszeit',
      by_scene: 'Nach Szenen',
      by_language: 'Nach Sprachen',
      daily_stats: 'Tägliche Statistiken',
      hourly_stats: 'Stündliche Statistiken',
      loading: 'Laden...',
      error: 'Fehler beim Laden der Statistiken',
      last_updated: 'Letzte Aktualisierung',
      ms: 'ms',
      percent: '%',
      view_details: 'Details anzeigen',
      app_stats: 'App-Statistiken',
      vercel_analytics: 'Vercel Analytics'
    },
    en: {
      stats_title: 'Statistics',
      total_generations: 'Total Generations',
      total_users: 'Total Users',
      success_rate: 'Success Rate',
      avg_time: 'Average Time',
      by_scene: 'By Scene',
      by_language: 'By Language',
      daily_stats: 'Daily Statistics',
      hourly_stats: 'Hourly Statistics',
      loading: 'Loading...',
      error: 'Error loading statistics',
      last_updated: 'Last Updated',
      ms: 'ms',
      percent: '%',
      view_details: 'View Details',
      app_stats: 'App Stats',
      vercel_analytics: 'Vercel Analytics'
    }
  }

  const t = (key: string) => (translations[lang] as any)?.[key] ?? (translations['en'] as any)[key] ?? key

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/stats')
      const data = await response.json()
      
      if (data.success) {
        setStats(data.stats)
      } else {
        setError(data.error || t('error'))
      }
    } catch (err) {
      setError(t('error'))
    } finally {
      setLoading(false)
    }
  }

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

  const ChartCard = ({ title, data, type = 'bar' }: {
    title: string
    data: Record<string, number>
    type?: 'bar' | 'line'
  }) => {
    const entries = Object.entries(data).slice(0, 10) // Показываем только топ-10
    const maxValue = Math.max(...entries.map(([, value]) => value))

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300"
      >
        <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
        <div className="space-y-3">
          {entries.map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-sm text-gray-600 capitalize">{key}</span>
              <div className="flex items-center space-x-2">
                <ProgressBar value={value} maxValue={maxValue} />
                <span className="text-sm font-medium text-gray-800 w-8 text-right">{value}</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    )
  }

  if (loading) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
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
          <button
            onClick={fetchStats}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    )
  }

  if (!stats) return null

  return (
    <div className="space-y-6">
      {/* Табы */}
      <div className="flex justify-center">
        <div className="bg-white/70 rounded-xl p-1 flex">
          <button
            onClick={() => setActiveTab('app')}
            className={`px-4 py-2 rounded-lg transition-all duration-200 text-sm ${
              activeTab === 'app'
                ? 'bg-purple-500 text-white shadow-lg'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            {t('app_stats')}
          </button>
          <button
            onClick={() => setActiveTab('vercel')}
            className={`px-4 py-2 rounded-lg transition-all duration-200 text-sm ${
              activeTab === 'vercel'
                ? 'bg-purple-500 text-white shadow-lg'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            {t('vercel_analytics')}
          </button>
        </div>
      </div>

      {/* Контент в зависимости от активной вкладки */}
      {activeTab === 'app' ? (
        <>
          {/* Основные метрики */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              icon={Zap}
              title={t('total_generations')}
              value={stats.totalGenerations.toLocaleString()}
              color="purple"
            />
            <StatCard
              icon={Users}
              title={t('total_users')}
              value={stats.totalUsers.toLocaleString()}
              color="blue"
            />
            <StatCard
              icon={TrendingUp}
              title={t('success_rate')}
              value={`${stats.successRate}${t('percent')}`}
              color="green"
            />
            <StatCard
              icon={Clock}
              title={t('avg_time')}
              value={`${stats.averageGenerationTimeMs}${t('ms')}`}
              color="orange"
            />
          </div>

          {/* Графики */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard
              title={t('by_scene')}
              data={stats.generationsByScene}
            />
            <ChartCard
              title={t('by_language')}
              data={stats.generationsByLanguage}
            />
          </div>

          {/* Дополнительная информация */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-gray-500" />
                <span className="text-sm text-gray-600">{t('last_updated')}</span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-800">
                  {new Date(stats.lastUpdated).toLocaleString()}
                </span>
                <Link
                  href="/stats"
                  className="px-3 py-1 bg-purple-500 text-white text-xs rounded-lg hover:bg-purple-600 transition-colors flex items-center space-x-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>{t('view_details')}</span>
                </Link>
              </div>
            </div>
          </div>
        </>
      ) : (
        <VercelAnalytics lang={lang} />
      )}
    </div>
  )
}