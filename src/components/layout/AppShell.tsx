import { useEffect, createContext, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { ToastContainer } from '@/components/ui/Toast'
import { useToast } from '@/hooks/useToast'
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth'
import { Usuario } from '@/types'
import { migrateLocalCatalogsToSupabase } from '@/services/migrate-local'

interface AppContextType {
  user: Usuario | null
  setUser: (u: Usuario | null) => void
  toasts: ReturnType<typeof useToast>
  supabaseReady: boolean
  signOut: () => Promise<void>
}

const AppContext = createContext<AppContextType>(null!)

export const useApp = () => useContext(AppContext)

export function AppShell({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const toasts = useToast()
  const { user, setUser, loading: authLoading, signOut } = useSupabaseAuth()

  const handleLogout = async () => {
    try {
      await signOut()
    } catch {
      // fallback: always clear local state
    }
    setUser(null)
    localStorage.removeItem('riskflow_auth')
    navigate('/login')
  }

  useEffect(() => {
    if (!authLoading && !user) {
      const isLoginPage = window.location.pathname === '/login'
      if (!isLoginPage) {
        navigate('/login', { replace: true })
      }
    }
  }, [user, authLoading, navigate])

  useEffect(() => {
    if (user) {
      migrateLocalCatalogsToSupabase()
    }
  }, [user])

  return (
    <AppContext.Provider value={{ user, setUser, toasts, supabaseReady: !authLoading, signOut: handleLogout }}>
      {children}
      <ToastContainer toasts={toasts.toasts} onRemove={toasts.removeToast} />
    </AppContext.Provider>
  )
}
