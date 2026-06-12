import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Building2, ClipboardList, BookOpen, FileText, Settings, X
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarProps {
  open: boolean
  onClose: () => void
}

const links = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/empresas', icon: Building2, label: 'Empresas' },
  { to: '/levantamentos', icon: ClipboardList, label: 'Levantamentos' },
  { to: '/biblioteca', icon: BookOpen, label: 'Biblioteca' },
  { to: '/relatorios', icon: FileText, label: 'Relatórios' },
  { to: '/configuracoes', icon: Settings, label: 'Configurações' },
]

export function Sidebar({ open, onClose }: SidebarProps) {
  const location = useLocation()

  return (
    <>
      <div className={`fixed inset-0 z-40 bg-black/30 lg:hidden ${open ? 'block' : 'hidden'}`} onClick={onClose} />
      <aside className={`fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-border transform transition-transform duration-200 lg:translate-x-0 lg:static lg:z-auto ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between h-14 px-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">RF</span>
            </div>
            <div>
              <span className="font-semibold text-text-primary text-sm">Efetiva RiskFlow</span>
              <span className="block text-[10px] text-text-secondary">LPR/AEP Digital</span>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden p-1 text-text-secondary hover:text-text-primary rounded" aria-label="Fechar menu">
            <X size={20} />
          </button>
        </div>
        <nav className="p-3 space-y-1">
          {links.map((link) => {
            const isActive = location.pathname === link.to || (link.to !== '/dashboard' && location.pathname.startsWith(link.to))
            return (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive ? 'bg-brand-500 text-white' : 'text-text-secondary hover:bg-gray-100 hover:text-text-primary'
                )}
              >
                <link.icon size={20} />
                {link.label}
              </NavLink>
            )
          })}
        </nav>
        <div className="absolute bottom-4 left-3 right-3 p-3 rounded-lg bg-gradient-to-r from-brand-500/10 to-brand-lighter/10 border border-brand-200">
          <p className="text-xs font-medium text-brand-500">RiskFlow v1.0</p>
          <p className="text-[10px] text-text-secondary">Pronto para uso em campo</p>
        </div>
      </aside>
    </>
  )
}
