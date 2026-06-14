import { useState, useEffect } from 'react'
import { Outlet, Navigate } from 'react-router-dom'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { BottomNavigation } from './BottomNavigation'
import { OfflineBanner } from '@/components/ui/OfflineBanner'
import { useApp } from '@/contexts/AppContext'

export function AuthenticatedLayout() {
  const { user, supabaseReady } = useApp()
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('sidebar-open')
    return saved !== null ? JSON.parse(saved) : true
  })

  useEffect(() => {
    localStorage.setItem('sidebar-open', JSON.stringify(sidebarOpen))
  }, [sidebarOpen])

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

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <OfflineBanner />
      <div className="flex flex-1">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 flex flex-col min-w-0">
          <Header onMenuClick={() => setSidebarOpen(true)} />
          <main id="main-content" className="flex-1 p-4 md:p-6 lg:p-8 pb-20 lg:pb-8 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
      <BottomNavigation />
    </div>
  )
}
