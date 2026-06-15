import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim()
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()

function isValidSupabaseUrl(value: string | undefined): value is string {
  if (!value || value.toLowerCase().includes('placeholder')) return false
  try {
    const url = new URL(value)
    return (
      url.protocol === 'https:' &&
      (url.hostname.endsWith('.supabase.co') ||
        url.hostname === 'localhost' ||
        url.hostname === '127.0.0.1')
    )
  } catch {
    return false
  }
}

function isPublicSupabaseKey(value: string | undefined): value is string {
  if (!value || value.toLowerCase().includes('placeholder')) return false
  if (value.startsWith('sb_secret_')) return false
  if (value.toLowerCase().includes('service_role')) return false
  return value.length > 20
}

export const supabaseConfigurado =
  isValidSupabaseUrl(supabaseUrl) && isPublicSupabaseKey(supabaseAnonKey)

export const supabase: SupabaseClient | null = supabaseConfigurado
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null

if (!supabaseConfigurado && import.meta.env.DEV) {
  console.warn(
    '[Supabase] Variáveis de ambiente ausentes ou inválidas. Verifique VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.'
  )
}

export function getSupabaseClient(): SupabaseClient {
  if (!supabase) {
    throw new Error(
      'Servidor não configurado. Verifique as variáveis de ambiente do Supabase.'
    )
  }
  return supabase
}
