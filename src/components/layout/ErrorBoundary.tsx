import { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[ErrorBoundary]', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
          <div className="flex flex-col items-center text-center max-w-sm">
            <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <AlertTriangle size={28} className="text-red-500" />
            </div>
            <h1 className="text-xl font-bold text-text-primary mb-1">Algo deu errado</h1>
            <p className="text-sm text-text-secondary mb-6">
              Ocorreu um erro inesperado. Tente recarregar a página.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 h-10 px-5 bg-brand-500 hover:bg-brand-600 text-white font-medium rounded-lg transition-colors"
            >
              <RefreshCw size={18} />
              Recarregar
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
