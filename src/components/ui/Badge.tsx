import { cn } from '@/lib/utils'
import { AlertOctagon, AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react'

interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'risk-low' | 'risk-moderate' | 'risk-high' | 'risk-critical'
  children: React.ReactNode
  className?: string
}

const variants: Record<string, string> = {
  default: 'bg-gray-100 text-gray-700',
  success: 'bg-green-50 text-risk-low border border-green-200',
  warning: 'bg-amber-50 text-amber-800 border border-amber-200',
  danger: 'bg-red-50 text-risk-high border border-red-200',
  info: 'bg-blue-50 text-blue-700 border border-blue-200',
  'risk-low': 'bg-green-50 text-green-700 border border-green-200',
  'risk-moderate': 'bg-amber-50 text-amber-800 border border-amber-200',
  'risk-high': 'bg-red-50 text-red-700 border border-red-200',
  'risk-critical': 'bg-red-100 text-red-900 border border-red-300',
}

const riskIcons: Record<string, React.ReactNode> = {
  'risk-critical': <AlertOctagon size={12} aria-hidden="true" className="shrink-0" />,
  'risk-high': <AlertTriangle size={12} aria-hidden="true" className="shrink-0" />,
  'risk-moderate': <AlertCircle size={12} aria-hidden="true" className="shrink-0" />,
  'risk-low': <CheckCircle size={12} aria-hidden="true" className="shrink-0" />,
}

export function Badge({ variant = 'default', children, className }: BadgeProps) {
  return (
    <span className={cn('inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium', variants[variant], className)}>
      {riskIcons[variant]}
      {children}
    </span>
  )
}
