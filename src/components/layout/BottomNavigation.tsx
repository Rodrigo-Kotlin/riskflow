import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, ClipboardList, BarChart3, BookOpen, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

export function BottomNavigation() {
  const location = useLocation()
  const navigate = useNavigate()

  const isActive = (to: string) =>
    location.pathname === to || (to !== '/dashboard' && location.pathname.startsWith(to))

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-border safe-area-bottom">
      <div className="grid grid-cols-5 h-16">
        <NavLink
          to="/dashboard"
          className={cn(
            'flex flex-col items-center justify-center gap-0.5 transition-colors',
            isActive('/dashboard') ? 'text-brand-500' : 'text-text-secondary'
          )}
        >
          <LayoutDashboard size={20} />
          <span className="text-[10px] font-medium">Início</span>
        </NavLink>

        <NavLink
          to="/levantamentos"
          className={cn(
            'flex flex-col items-center justify-center gap-0.5 transition-colors',
            isActive('/levantamentos') ? 'text-brand-500' : 'text-text-secondary'
          )}
        >
          <ClipboardList size={20} />
          <span className="text-[10px] font-medium">LPR/AEP</span>
        </NavLink>

        <div className="flex items-center justify-center">
          <button
            onClick={() => navigate('/levantamentos/novo')}
            className="h-14 w-14 rounded-full bg-brand-500 text-white flex items-center justify-center shadow-lg -mt-5 hover:bg-brand-600 transition-colors"
            aria-label="Novo Levantamento"
          >
            <Plus size={24} />
          </button>
        </div>

        <NavLink
          to="/relatorios"
          className={cn(
            'flex flex-col items-center justify-center gap-0.5 transition-colors',
            isActive('/relatorios') ? 'text-brand-500' : 'text-text-secondary'
          )}
        >
          <BarChart3 size={20} />
          <span className="text-[10px] font-medium">Relatórios</span>
        </NavLink>

        <NavLink
          to="/biblioteca"
          className={cn(
            'flex flex-col items-center justify-center gap-0.5 transition-colors',
            isActive('/biblioteca') ? 'text-brand-500' : 'text-text-secondary'
          )}
        >
          <BookOpen size={20} />
          <span className="text-[10px] font-medium">Biblioteca</span>
        </NavLink>
      </div>
    </nav>
  )
}
