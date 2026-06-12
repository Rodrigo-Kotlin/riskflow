import { BrowserRouter } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { ErrorBoundary } from '@/components/layout/ErrorBoundary'
import { AppRoutes } from '@/routes'

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppShell>
          <AppRoutes />
        </AppShell>
      </BrowserRouter>
    </ErrorBoundary>
  )
}
