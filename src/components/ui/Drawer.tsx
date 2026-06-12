import { useEffect } from 'react'
import { X } from 'lucide-react'

interface DrawerProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  side?: 'right' | 'left' | 'bottom'
}

export function Drawer({ open, onClose, title, children, side = 'right' }: DrawerProps) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (open) window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [open, onClose])

  if (!open) return null

  const sideClasses = {
    right: 'right-0 top-0 h-full w-full max-w-md',
    left: 'left-0 top-0 h-full w-full max-w-md',
    bottom: 'bottom-0 left-0 w-full max-h-[85vh] rounded-t-2xl',
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50">
      <div className={`fixed ${sideClasses[side]} bg-white shadow-xl flex flex-col`}>
        <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
          <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
          <button onClick={onClose} className="p-1 text-text-secondary hover:text-text-primary rounded-lg hover:bg-gray-100" aria-label="Fechar">
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">{children}</div>
      </div>
    </div>
  )
}
