import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react'
import { ToastMessage } from '@/hooks/useToast'
import { cn } from '@/lib/utils'

interface ToastContainerProps {
  toasts: ToastMessage[]
  onRemove: (id: string) => void
}

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
}

const styles = {
  success: 'bg-risk-low text-white',
  error: 'bg-risk-high text-white',
  info: 'bg-blue-600 text-white',
  warning: 'bg-risk-moderate text-white',
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => {
        const Icon = icons[toast.type]
        return (
          <div key={toast.id} className={cn('flex items-start gap-3 p-4 rounded-lg shadow-lg animate-slide-in', styles[toast.type])}>
            <Icon size={20} className="shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">{toast.title}</p>
              <p className="text-sm opacity-90">{toast.message}</p>
            </div>
            <button onClick={() => onRemove(toast.id)} className="shrink-0 opacity-70 hover:opacity-100" aria-label="Fechar notificação">
              <X size={16} />
            </button>
          </div>
        )
      })}
    </div>
  )
}
