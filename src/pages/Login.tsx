import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '@/contexts/AppContext'
import { supabaseConfigurado } from '@/lib/supabase'
import { signIn, signUp } from '@/services/supabase.service'
import { Eye, EyeOff, Loader2, UserPlus, LogIn } from 'lucide-react'

export function Login() {
  const navigate = useNavigate()
  const { user, supabaseReady } = useApp()
  const [modo, setModo] = useState<'login' | 'cadastro'>('login')
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [showSenha, setShowSenha] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sucesso, setSucesso] = useState('')
  const [showForgot, setShowForgot] = useState(false)
  const [touched, setTouched] = useState({ nome: false, email: false, senha: false, confirmar: false })

  const enableDemo = import.meta.env.VITE_ENABLE_DEMO_DATA === 'true'
  const currentYear = new Date().getFullYear()
  const isLogin = modo === 'login'

  useEffect(() => {
    if (supabaseReady && user) {
      navigate('/dashboard', { replace: true })
    }
  }, [user, supabaseReady, navigate])

  const toggleModo = () => {
    setModo(isLogin ? 'cadastro' : 'login')
    setError('')
    setSucesso('')
    setTouched({ nome: false, email: false, senha: false, confirmar: false })
  }

  const nomeError = touched.nome && !nome.trim()
  const emailError = touched.email && !email.trim()
  const senhaError = touched.senha && !senha.trim()
  const confirmarError = touched.confirmar && senha !== confirmarSenha
  const camposValidos = isLogin
    ? email.trim() && senha.trim()
    : nome.trim() && email.trim() && senha.trim() && senha === confirmarSenha && senha.length >= 6

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setTouched({ nome: true, email: true, senha: true, confirmar: true })
    if (!camposValidos) return
    if (!supabaseConfigurado) {
      setError('Servidor não configurado. Verifique as variáveis de ambiente do Supabase.')
      return
    }
    setError('')
    setSucesso('')
    setLoading(true)
    try {
      if (isLogin) {
        await signIn(email, senha)
        navigate('/dashboard')
      } else {
        await signUp(email, senha, nome)
        setSucesso('Conta criada com sucesso! Faça login para continuar.')
        setModo('login')
        setSenha('')
        setConfirmarSenha('')
        setTouched({ nome: false, email: false, senha: false, confirmar: false })
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro inesperado. Tente novamente.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleDemo = async () => {
    setLoading(true)
    setError('')
    try {
      if (!supabaseConfigurado) {
        setError('Servidor não configurado. Modo demonstração indisponível.')
        return
      }
      await signIn('demo@riskflow.io', 'demo123456')
      navigate('/dashboard')
    } catch {
      setError('Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.')
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
                <img src="/icon-96x96.png" alt="RiskFlow" className="w-12 h-12" />
              </div>
              <h1 className="text-2xl font-bold text-text-primary">Efetiva RiskFlow</h1>
              <p className="text-sm text-text-secondary mt-1">Gestão digital de LPR, AEP e riscos ocupacionais</p>
              <p className="text-xs text-text-secondary mt-3 leading-relaxed max-w-xs mx-auto">
                Controle levantamentos, riscos, evidências e relatórios em um único ambiente digital.
              </p>
            </div>

            <form onSubmit={handleLogin} noValidate className="space-y-4">
              {!supabaseConfigurado && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800" role="alert">
                  Servidor não configurado. Verifique as variáveis de ambiente do Supabase.
                </div>
              )}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-risk-high" role="alert">
                  {error}
                </div>
              )}
              {sucesso && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-risk-low" role="status">
                  {sucesso}
                </div>
              )}

              {!isLogin && (
                <div>
                  <label htmlFor="cad-nome" className="block text-xs font-medium text-text-primary mb-1">
                    Nome completo <span className="text-risk-high">*</span>
                  </label>
                  <input
                    id="cad-nome"
                    type="text"
                    value={nome}
                    onChange={(e) => { setNome(e.target.value); setTouched(p => ({ ...p, nome: true })) }}
                    onBlur={() => setTouched(p => ({ ...p, nome: true }))}
                    placeholder="Seu nome"
                    autoComplete="name"
                    className={`w-full h-10 px-3 rounded-lg border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/70 focus:border-brand-500 transition-colors ${
                      nomeError ? 'border-risk-high' : 'border-border'
                    }`}
                  />
                  {nomeError && <p className="text-xs text-risk-high mt-1">O nome é obrigatório.</p>}
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
                />
                {emailError && <p className="text-xs text-risk-high mt-1">O e-mail é obrigatório.</p>}
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
                    autoComplete={isLogin ? 'current-password' : 'new-password'}
                    className={`w-full h-10 px-3 pr-10 rounded-lg border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/70 focus:border-brand-500 transition-colors ${
                      senhaError ? 'border-risk-high' : 'border-border'
                    }`}
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
                {senhaError && <p className="text-xs text-risk-high mt-1">A senha é obrigatória.</p>}
              </div>

              {!isLogin && (
                <div>
                  <label htmlFor="cad-confirmar" className="block text-xs font-medium text-text-primary mb-1">
                    Confirmar senha <span className="text-risk-high">*</span>
                  </label>
                  <input
                    id="cad-confirmar"
                    type="password"
                    value={confirmarSenha}
                    onChange={(e) => { setConfirmarSenha(e.target.value); setTouched(p => ({ ...p, confirmar: true })) }}
                    onBlur={() => setTouched(p => ({ ...p, confirmar: true }))}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    className={`w-full h-10 px-3 rounded-lg border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/70 focus:border-brand-500 transition-colors ${
                      confirmarError ? 'border-risk-high' : 'border-border'
                    }`}
                  />
                  {confirmarError && <p className="text-xs text-risk-high mt-1">As senhas não conferem.</p>}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !camposValidos}
                className="w-full h-10 bg-brand-500 hover:bg-brand-600 disabled:bg-brand-300 text-white font-medium rounded-lg transition-colors disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><Loader2 size={18} className="animate-spin" /> {isLogin ? 'Entrando...' : 'Criando conta...'}</>
                ) : isLogin ? (
                  <><LogIn size={18} /> Entrar</>
                ) : (
                  <><UserPlus size={18} /> Criar conta</>
                )}
              </button>
            </form>

            <div className="mt-5 text-center space-y-2">
              {isLogin && (
                <button type="button" onClick={() => setShowForgot(true)} className="text-xs text-brand-500 hover:text-brand-600 font-medium transition-colors py-2">
                  Esqueci minha senha
                </button>
              )}
              {showForgot && (
                <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-3 py-2 rounded-lg" role="alert">
                  Funcionalidade em desenvolvimento. Entre em contato com o suporte para redefinir sua senha.
                </div>
              )}
              <div>
                <button
                  type="button"
                  onClick={toggleModo}
                  className="text-xs text-text-secondary hover:text-text-primary font-medium transition-colors"
                >
                  {isLogin ? (
                    <>Não tem conta? <span className="text-brand-500">Criar conta</span></>
                  ) : (
                    <>Já tem conta? <span className="text-brand-500">Fazer login</span></>
                  )}
                </button>
              </div>
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
