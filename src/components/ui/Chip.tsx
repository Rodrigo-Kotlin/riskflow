import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ChipProps {
  label: string
  onRemove?: () => void
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
  className?: string
}

const variants: Record<string, string> = {
  default: 'bg-gray-100 text-gray-700',
  success: 'bg-green-100 text-green-700',
  warning: 'bg-amber-100 text-amber-700',
  danger: 'bg-red-100 text-red-700',
  info: 'bg-blue-100 text-blue-700',
}

export function Chip({ label, onRemove, variant = 'default', className }: ChipProps) {
  return (
    <span className={cn('inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium', variants[variant], className)}>
      {label}
      {onRemove && (
        <button onClick={onRemove} className="hover:opacity-70" aria-label="Remover">
          <X size={12} />
        </button>
      )}
    </span>
  )
}
