import { useState, useEffect, createContext, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { BottomNavigation } from './BottomNavigation'
import { OfflineBanner } from '@/components/ui/OfflineBanner'
import { ToastContainer } from '@/components/ui/Toast'
import { useToast } from '@/hooks/useToast'
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth'
import { Usuario } from '@/types'

interface AppContextType {
  user: Usuario | null
  setUser: (u: Usuario | null) => void
  toasts: ReturnType<typeof useToast>
  supabaseReady: boolean
}

const AppContext = createContext<AppContextType>(null!)

export const useApp = () => useContext(AppContext)

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('sidebar-open')
    return saved !== null ? JSON.parse(saved) : true
  })

  useEffect(() => {
    localStorage.setItem('sidebar-open', JSON.stringify(sidebarOpen))
  }, [sidebarOpen])
  const navigate = useNavigate()
  const toasts = useToast()
  const { user, setUser, loading: authLoading, signOut } = useSupabaseAuth()

  const handleLogout = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <AppContext.Provider value={{ user, setUser, toasts, supabaseReady: !authLoading }}>
      <div className="min-h-screen bg-surface flex flex-col">
        <OfflineBanner />
        <div className="flex flex-1">
          <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <div className="flex-1 flex flex-col min-w-0">
            {user && <Header onMenuClick={() => setSidebarOpen(true)} user={user} onLogout={handleLogout} />}
            <main id="main-content" className="flex-1 p-4 md:p-6 lg:p-8 pb-20 lg:pb-8 overflow-auto">
              {children}
            </main>
          </div>
        </div>
        {user && <BottomNavigation />}
        <ToastContainer toasts={toasts.toasts} onRemove={toasts.removeToast} />
      </div>
    </AppContext.Provider>
  )
}
