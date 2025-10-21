'use client'

interface ProgressBarProps {
  value: number
  maxValue: number
  className?: string
}

export default function ProgressBar({ value, maxValue, className = '' }: ProgressBarProps) {
  const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0
  
  return (
    <div className={`w-32 bg-gray-200 rounded-full h-2 ${className}`}>
      <div 
        className="progress-bar-dynamic"
        style={{ width: `${Math.min(percentage, 100)}%` }}
      />
    </div>
  )
}
