import { Menu, Bell, User, LogOut, Wifi, WifiOff } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'
import { useApp } from '@/contexts/AppContext'

interface HeaderProps {
  onMenuClick: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user, signOut, toasts } = useApp()
  const navigate = useNavigate()
  const [showMenu, setShowMenu] = useState(false)
  const online = useOnlineStatus()
  const notificationCount = 0

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-border">
      <div className="flex items-center justify-between px-4 h-14">
        <button onClick={onMenuClick} className="lg:hidden p-2 text-text-secondary hover:text-text-primary rounded-lg hover:bg-gray-100" aria-label="Abrir menu">
          <Menu size={22} />
        </button>

        <div className="hidden lg:block" />

        <div className="flex items-center gap-2 ml-auto">
          <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs text-text-secondary" aria-live="polite">
            {online ? <Wifi size={14} className="text-risk-low" /> : <WifiOff size={14} className="text-risk-moderate" />}
            <span>{online ? 'Online' : 'Offline'}</span>
          </div>

          <button onClick={() => toasts.addToast('info', 'Notificações', 'Nenhuma notificação no momento.')} className="p-2 text-text-secondary hover:text-text-primary rounded-lg hover:bg-gray-100 relative" aria-label="Notificações">
            <Bell size={20} />
            {notificationCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-risk-high text-white text-[11px] font-bold flex items-center justify-center">
                {notificationCount > 9 ? '9+' : notificationCount}
              </span>
            )}
          </button>

          <div className="relative">
            <button onClick={() => setShowMenu(!showMenu)} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100">
              <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-500 flex items-center justify-center text-xs font-bold">
                {user?.nome?.charAt(0).toUpperCase() || 'U'}
              </div>
              <span className="hidden sm:block text-sm font-medium text-text-primary max-w-[120px] truncate">{user?.nome || 'Usuário'}</span>
            </button>
            {showMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 top-full mt-1 w-56 bg-white border border-border rounded-xl shadow-lg z-50 py-1">
                  <div className="px-4 py-2 border-b border-border">
                    <p className="text-sm font-medium text-text-primary">{user?.nome}</p>
                    <p className="text-xs text-text-secondary">{user?.email}</p>
                  </div>
                  <button onClick={() => { setShowMenu(false); navigate('/configuracoes') }} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-text-secondary hover:bg-gray-50 hover:text-text-primary">
                    <User size={16} /> Perfil
                  </button>
                  <button onClick={signOut} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-risk-high hover:bg-red-50">
                    <LogOut size={16} /> Sair
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
