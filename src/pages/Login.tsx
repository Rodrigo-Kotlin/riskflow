import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '@/components/layout/AppShell'
import { signIn } from '@/services/supabase.service'
import { Shield, Eye, EyeOff, Loader2 } from 'lucide-react'

export function Login() {
  const navigate = useNavigate()
  const { user, supabaseReady, signOut } = useApp()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [showSenha, setShowSenha] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [touched, setTouched] = useState({ email: false, senha: false })

  const enableDemo = import.meta.env.VITE_ENABLE_DEMO_DATA === 'true'
  const currentYear = new Date().getFullYear()

  useEffect(() => {
    if (supabaseReady && user) {
      navigate('/dashboard', { replace: true })
    }
  }, [user, supabaseReady, navigate])

  const emailError = touched.email && !email.trim()
  const senhaError = touched.senha && !senha.trim()
  const isValid = email.trim() && senha.trim()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setTouched({ email: true, senha: true })
    if (!email.trim() || !senha.trim()) return
    setError('')
    setLoading(true)
    try {
      await signIn(email, senha)
      navigate('/dashboard')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'E-mail ou senha inválidos.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleDemo = async () => {
    setLoading(true)
    setError('')
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      if (supabaseUrl && supabaseUrl !== 'https://placeholder.supabase.co') {
        try {
          await signIn('demo@riskflow.io', 'demo123456')
          navigate('/dashboard')
          return
        } catch { /* fallback */ }
      }
      const { usuariosMock } = await import('@/data/mock')
      const userData = usuariosMock[0]
      localStorage.setItem('riskflow_auth', JSON.stringify(userData))
      window.location.reload()
    } catch {
      setError('Erro ao carregar modo demonstração.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-brand-500 via-brand-600 to-brand-800 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md flex flex-col min-h-[100dvh] md:min-h-0 md:block">
        <div className="flex-1 flex flex-col justify-center md:block">
          <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-10">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-brand-500 flex items-center justify-center mx-auto mb-4">
                <Shield size={32} className="text-white" />
              </div>
              <h1 className="text-2xl font-bold text-text-primary">Efetiva RiskFlow</h1>
              <p className="text-sm text-text-secondary mt-1">Gestão digital de LPR, AEP e riscos ocupacionais</p>
              <p className="text-xs text-text-secondary mt-3 leading-relaxed max-w-xs mx-auto">
                Controle levantamentos, riscos, evidências e relatórios em um único ambiente digital.
              </p>
            </div>

            <form onSubmit={handleLogin} noValidate className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-risk-high">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="login-email" className="block text-xs font-medium text-text-primary mb-1">
                  E-mail <span className="text-risk-high">*</span>
                </label>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setTouched(p => ({ ...p, email: true })) }}
                  onBlur={() => setTouched(p => ({ ...p, email: true }))}
                  placeholder="seu@email.com"
                  autoComplete="email"
                  className={`w-full h-10 px-3 rounded-lg border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/70 focus:border-brand-500 transition-colors ${
                    emailError ? 'border-risk-high' : 'border-border'
                  }`}
                  required
                />
                {emailError && (
                  <p className="text-xs text-risk-high mt-1">O e-mail é obrigatório.</p>
                )}
              </div>

              <div>
                <label htmlFor="login-senha" className="block text-xs font-medium text-text-primary mb-1">
                  Senha <span className="text-risk-high">*</span>
                </label>
                <div className="relative">
                  <input
                    id="login-senha"
                    type={showSenha ? 'text' : 'password'}
                    value={senha}
                    onChange={(e) => { setSenha(e.target.value); setTouched(p => ({ ...p, senha: true })) }}
                    onBlur={() => setTouched(p => ({ ...p, senha: true }))}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className={`w-full h-10 px-3 pr-10 rounded-lg border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/70 focus:border-brand-500 transition-colors ${
                      senhaError ? 'border-risk-high' : 'border-border'
                    }`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowSenha(!showSenha)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
                    aria-label={showSenha ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    {showSenha ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {senhaError && (
                  <p className="text-xs text-risk-high mt-1">A senha é obrigatória.</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || !isValid}
                className="w-full h-10 bg-brand-500 hover:bg-brand-600 disabled:bg-brand-300 text-white font-medium rounded-lg transition-colors disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><Loader2 size={18} className="animate-spin" /> Entrando...</>
                ) : (
                  'Entrar'
                )}
              </button>
            </form>

            <div className="mt-4 text-center">
              <button className="text-xs text-brand-500 hover:text-brand-600 font-medium transition-colors">
                Esqueci minha senha
              </button>
            </div>

            {enableDemo && (
              <div className="mt-6 pt-6 border-t border-border">
                <button
                  onClick={handleDemo}
                  disabled={loading}
                  className="w-full h-10 border-2 border-brand-500 text-brand-500 hover:bg-brand-50 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <><Loader2 size={18} className="animate-spin" /> Carregando...</>
                  ) : (
                    'Entrar em modo demonstração'
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        <footer className="text-center text-white/60 text-xs py-4 md:pt-4 md:pb-0">
          © {currentYear} Efetiva RiskFlow — Todos os direitos reservados
        </footer>
      </div>
    </div>
  )
}
