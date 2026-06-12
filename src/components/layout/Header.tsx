import { Menu, Bell, User, LogOut } from 'lucide-react'
import { useState } from 'react'

interface HeaderProps {
  onMenuClick: () => void
  user: { nome: string; email: string } | null
  onLogout: () => void
}

export function Header({ onMenuClick, user, onLogout }: HeaderProps) {
  const [showMenu, setShowMenu] = useState(false)

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-border">
      <div className="flex items-center justify-between px-4 h-14">
        <button onClick={onMenuClick} className="lg:hidden p-2 text-text-secondary hover:text-text-primary rounded-lg hover:bg-gray-100" aria-label="Abrir menu">
          <Menu size={22} />
        </button>
        <div className="hidden lg:flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
            <span className="text-white font-bold text-sm">RF</span>
          </div>
          <span className="font-semibold text-text-primary">Efetiva RiskFlow</span>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <button className="p-2 text-text-secondary hover:text-text-primary rounded-lg hover:bg-gray-100 relative" aria-label="Notificações">
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-risk-high" />
          </button>
          <div className="relative">
            <button onClick={() => setShowMenu(!showMenu)} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100">
              <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-500 flex items-center justify-center text-xs font-bold">
                {user?.nome.charAt(0).toUpperCase() || 'U'}
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
                  <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-text-secondary hover:bg-gray-50 hover:text-text-primary">
                    <User size={16} /> Perfil
                  </button>
                  <button onClick={onLogout} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-risk-high hover:bg-red-50">
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
