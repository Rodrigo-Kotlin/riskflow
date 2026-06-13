import { Navigate, Outlet } from 'react-router-dom'
import { useApp } from '@/components/layout/AppShell'

export function PrivateRoute() {
  const { user, supabaseReady } = useApp()

  if (!supabaseReady) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-brand-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
