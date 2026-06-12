import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  icon: LucideIcon
  label: string
  value: string | number
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
  onClick?: () => void
  className?: string
}

const iconBg: Record<string, string> = {
  default: 'bg-gray-100 text-text-secondary',
  success: 'bg-green-50 text-risk-low',
  warning: 'bg-amber-50 text-risk-moderate',
  danger: 'bg-red-50 text-risk-high',
  info: 'bg-blue-50 text-blue-600',
}

export function StatCard({ icon: Icon, label, value, variant = 'default', onClick, className }: StatCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-start gap-4 p-4 bg-card border border-border rounded-xl hover:shadow-md transition-all text-left w-full',
        onClick && 'cursor-pointer',
        className
      )}
    >
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${iconBg[variant]}`}>
        <Icon size={20} />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold text-text-primary">{value}</p>
        <p className="text-xs text-text-secondary">{label}</p>
      </div>
    </button>
  )
}
