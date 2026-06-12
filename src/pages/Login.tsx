import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '@/components/layout/AppShell'
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth'
import { Shield, Eye, EyeOff } from 'lucide-react'
import { usuariosMock } from '@/data/mock'

export function Login() {
  const navigate = useNavigate()
  const { setUser, toasts } = useApp()
  const { signIn } = useSupabaseAuth()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [showSenha, setShowSenha] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signIn(email, senha)
      toasts.addToast('success', 'Bem-vindo!', `Você está logado no RiskFlow.`)
      navigate('/dashboard')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'E-mail ou senha inválidos.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleDemo = async () => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    if (supabaseUrl && supabaseUrl !== 'https://placeholder.supabase.co') {
      try {
        await signIn('demo@riskflow.io', 'demo123456')
        navigate('/dashboard')
        return
      } catch { /* fallback to mock */ }
    }
    const user = usuariosMock[0]
    localStorage.setItem('riskflow_auth', JSON.stringify(user))
    setUser(user)
    toasts.addToast('info', 'Modo Demonstração', 'Você está acessando com dados de demonstração.')
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-500 via-brand-600 to-brand-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-10">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-brand-500 flex items-center justify-center mx-auto mb-4">
              <Shield size={32} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-text-primary">Efetiva RiskFlow</h1>
            <p className="text-sm text-text-secondary mt-1">Gestão digital de LPR, AEP e riscos ocupacionais</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-risk-high">{error}</div>}

            <div>
              <label className="block text-xs font-medium text-text-primary mb-1">E-mail</label>
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full h-10 px-3 rounded-lg border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/70 focus:border-brand-500"
                required
              />
            </div>

            <div className="relative">
              <label className="block text-xs font-medium text-text-primary mb-1">Senha</label>
              <div className="relative">
                <input
                  type={showSenha ? 'text' : 'password'} value={senha} onChange={(e) => setSenha(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-10 px-3 pr-10 rounded-lg border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/70 focus:border-brand-500"
                  required
                />
                <button type="button" onClick={() => setShowSenha(!showSenha)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary">
                  {showSenha ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 bg-brand-500 hover:bg-brand-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button className="text-xs text-brand-500 hover:text-brand-600 font-medium">Esqueci minha senha</button>
          </div>

          <div className="mt-6 pt-6 border-t border-border">
            <button
              onClick={handleDemo}
              className="w-full h-10 border-2 border-brand-500 text-brand-500 hover:bg-brand-50 font-medium rounded-lg transition-colors"
            >
              Entrar em modo demonstração
            </button>
          </div>
        </div>
        <p className="text-center text-white/60 text-xs mt-4">© 2025 Efetiva RiskFlow — Todos os direitos reservados</p>
      </div>
    </div>
  )
}
