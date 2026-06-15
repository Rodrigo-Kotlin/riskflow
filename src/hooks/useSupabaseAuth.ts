import { useState, useEffect, useCallback } from 'react'
import { supabase, supabaseConfigurado } from '@/lib/supabase'
import { getProfile, signIn as supabaseSignIn, signOut as supabaseSignOut } from '@/services/supabase.service'
import type { Usuario } from '@/types'

export function useSupabaseAuth() {
  const [user, setUser] = useState<Usuario | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const init = async () => {
      if (!supabaseConfigurado || !supabase) {
        setLoading(false)
        return
      }

      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!cancelled && session?.user) {
          const profile = await getProfile(session.user.id)
          if (!cancelled) {
            setUser({
              id: session.user.id,
              nome: profile?.nome || (session.user.user_metadata?.nome as string) || session.user.email?.split('@')[0] || '',
              email: profile?.email || session.user.email || '',
              perfil: (profile?.perfil as Usuario['perfil']) || (session.user.user_metadata?.perfil as Usuario['perfil']) || 'visualizador',
            })
          }
        }
      } catch (err) {
        if (import.meta.env.DEV && !cancelled) console.error('[useSupabaseAuth] getSession error:', err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    init()

    if (!supabaseConfigurado || !supabase) return

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        try {
          const profile = await getProfile(session.user.id)
          const u: Usuario = {
            id: session.user.id,
            nome: profile?.nome || (session.user.user_metadata?.nome as string) || session.user.email?.split('@')[0] || '',
            email: profile?.email || session.user.email || '',
            perfil: (profile?.perfil as Usuario['perfil']) || (session.user.user_metadata?.perfil as Usuario['perfil']) || 'visualizador',
          }
          setUser(u)
        } catch (err) {
          if (import.meta.env.DEV) console.error('[useSupabaseAuth] profile on signin error:', err)
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
      }
    })

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [])

  const signIn = useCallback(async (email: string, senha: string) => {
    const result = await supabaseSignIn(email, senha)
    return result
  }, [])

  const signOut = useCallback(async () => {
    await supabaseSignOut()
    setUser(null)
  }, [])

  return { user, setUser, loading, signIn, signOut }
}
