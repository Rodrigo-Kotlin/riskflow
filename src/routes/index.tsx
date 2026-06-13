import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { AuthenticatedLayout } from '@/components/layout/AuthenticatedLayout'
import { PrivateRoute } from '@/components/auth/PrivateRoute'

const Login = lazy(() => import('@/pages/Login').then(m => ({ default: m.Login })))
const Dashboard = lazy(() => import('@/pages/Dashboard').then(m => ({ default: m.Dashboard })))
const Empresas = lazy(() => import('@/pages/Empresas').then(m => ({ default: m.Empresas })))
const Levantamentos = lazy(() => import('@/pages/Levantamentos').then(m => ({ default: m.Levantamentos })))
const NovoLevantamento = lazy(() => import('@/pages/NovoLevantamento').then(m => ({ default: m.NovoLevantamento })))
const Biblioteca = lazy(() => import('@/pages/Biblioteca').then(m => ({ default: m.Biblioteca })))
const Relatorios = lazy(() => import('@/pages/Relatorios').then(m => ({ default: m.Relatorios })))
const Configuracoes = lazy(() => import('@/pages/Configuracoes').then(m => ({ default: m.Configuracoes })))

const Loading = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="animate-spin h-8 w-8 border-4 border-brand-500 border-t-transparent rounded-full" />
  </div>
)

export function AppRoutes() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
        </Route>
        <Route element={<PrivateRoute />}>
          <Route element={<AuthenticatedLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/empresas" element={<Empresas />} />
            <Route path="/levantamentos" element={<Levantamentos />} />
            <Route path="/levantamentos/novo" element={<NovoLevantamento />} />
            <Route path="/levantamentos/:id" element={<NovoLevantamento />} />
            <Route path="/biblioteca" element={<Biblioteca />} />
            <Route path="/relatorios" element={<Relatorios />} />
            <Route path="/configuracoes" element={<Configuracoes />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  )
}
