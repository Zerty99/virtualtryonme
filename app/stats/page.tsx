'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  BarChart3, 
  Users, 
  Zap, 
  Clock, 
  TrendingUp, 
  Globe, 
  Calendar, 
  Activity,
  ArrowLeft,
  RefreshCw,
  Download,
  Filter
} from 'lucide-react'
import Link from 'next/link'
import ProgressBar from '../components/ProgressBar'
import VercelAnalytics from '../components/VercelAnalytics'

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

export default function StatsPage() {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState<'app' | 'vercel'>('app')

  const fetchStats = async () => {
    try {
      setRefreshing(true)
      const response = await fetch('/api/stats')
      const data = await response.json()
      
      if (data.success) {
        setStats(data.stats)
        setError(null)
      } else {
        setError(data.error || 'Error loading statistics')
      }
    } catch (err) {
      setError('Error loading statistics')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  const StatCard = ({ icon: Icon, title, value, subtitle, color = 'blue', trend }: {
    icon: any
    title: string
    value: string | number
    subtitle?: string
    color?: 'blue' | 'green' | 'purple' | 'orange' | 'red'
    trend?: number
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
            {trend !== undefined && (
              <div className="flex items-center mt-2">
                <TrendingUp className={`w-4 h-4 ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`} />
                <span className={`text-sm ml-1 ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {trend >= 0 ? '+' : ''}{trend}%
                </span>
              </div>
            )}
          </div>
          <div className={`p-3 bg-gradient-to-br ${colorClasses[color]} rounded-xl`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </motion.div>
    )
  }

  const ChartCard = ({ title, data, type = 'bar', maxItems = 10 }: {
    title: string
    data: Record<string, number>
    type?: 'bar' | 'line'
    maxItems?: number
  }) => {
    const entries = Object.entries(data)
      .sort(([, a], [, b]) => b - a)
      .slice(0, maxItems)
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

  const exportStats = () => {
    if (!stats) return
    
    const exportData = {
      ...stats,
      exportedAt: new Date().toISOString(),
      exportedBy: 'VirtualTryOnMe Stats Page'
    }
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `virtual-try-on-stats-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
            <span className="ml-3 text-gray-600 text-lg">Loading statistics...</span>
          </div>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
          <div className="text-center py-16">
            <p className="text-red-500 mb-4 text-lg">{error}</p>
            <button
              onClick={fetchStats}
              className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </main>
    )
  }

  if (!stats) return null

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <Link 
              href="/"
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to App</span>
            </Link>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={exportStats}
                className="px-4 py-2 bg-white/70 border border-gray-200 rounded-xl text-sm text-gray-700 hover:bg-white/90 transition-colors flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
              <button
                onClick={fetchStats}
                disabled={refreshing}
                className="px-4 py-2 bg-white/70 border border-gray-200 rounded-xl text-sm text-gray-700 hover:bg-white/90 transition-colors flex items-center space-x-2 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>
          
          <div className="text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent mb-4">
              Detailed Statistics
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              Comprehensive analytics for VirtualTryOnMe platform
            </p>
            
            {/* Табы */}
            <div className="flex justify-center mb-8">
              <div className="bg-white/70 rounded-xl p-1 flex">
                <button
                  onClick={() => setActiveTab('app')}
                  className={`px-6 py-2 rounded-lg transition-all duration-200 ${
                    activeTab === 'app'
                      ? 'bg-purple-500 text-white shadow-lg'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  App Statistics
                </button>
                <button
                  onClick={() => setActiveTab('vercel')}
                  className={`px-6 py-2 rounded-lg transition-all duration-200 ${
                    activeTab === 'vercel'
                      ? 'bg-purple-500 text-white shadow-lg'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Vercel Analytics
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Контент в зависимости от активной вкладки */}
        {activeTab === 'app' ? (
          <>
            {/* Main Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={Zap}
            title="Total Generations"
            value={stats.totalGenerations.toLocaleString()}
            color="purple"
          />
          <StatCard
            icon={Users}
            title="Total Users"
            value={stats.totalUsers.toLocaleString()}
            color="blue"
          />
          <StatCard
            icon={TrendingUp}
            title="Success Rate"
            value={`${stats.successRate}%`}
            color="green"
          />
          <StatCard
            icon={Clock}
            title="Average Time"
            value={`${stats.averageGenerationTimeMs}ms`}
            color="orange"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <ChartCard
            title="Generations by Scene"
            data={stats.generationsByScene}
          />
          <ChartCard
            title="Generations by Language"
            data={stats.generationsByLanguage}
          />
        </div>

        {/* Time-based Statistics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <ChartCard
            title="Daily Generations (Last 7 Days)"
            data={stats.dailyGenerations}
            maxItems={7}
          />
          <ChartCard
            title="Hourly Distribution"
            data={stats.hourlyGenerations}
            maxItems={24}
          />
        </div>

            {/* Additional Information */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Activity className="w-5 h-5 text-gray-500" />
                  <span className="text-sm text-gray-600">Last Updated</span>
                </div>
                <span className="text-sm text-gray-800">
                  {new Date(stats.lastUpdated).toLocaleString()}
                </span>
              </div>
            </div>
          </>
        ) : (
          <VercelAnalytics lang="en" />
        )}
      </div>
    </main>
  )
}
