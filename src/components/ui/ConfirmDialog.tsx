import { AlertTriangle } from 'lucide-react'
import { Modal } from './Modal'

interface ConfirmDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'default'
}

export function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmText = 'Confirmar', cancelText = 'Cancelar', variant = 'danger' }: ConfirmDialogProps) {
  const confirmColors = variant === 'danger' ? 'bg-risk-high hover:bg-red-700' : variant === 'warning' ? 'bg-risk-moderate hover:bg-amber-600' : 'bg-brand-500 hover:bg-brand-600'

  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <div className="text-center">
        <div className="mx-auto w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
          <AlertTriangle size={24} className="text-risk-high" />
        </div>
        <p className="text-sm text-text-secondary mb-6">{message}</p>
        <div className="flex gap-3 justify-center">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
            {cancelText}
          </button>
          <button onClick={() => { onConfirm(); onClose() }} className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${confirmColors}`}>
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  )
}
