import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabaseConfigurado = !!(supabaseUrl && supabaseAnonKey)

export const supabase: SupabaseClient | null = supabaseConfigurado
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

if (import.meta.env.DEV) {
  if (supabaseConfigurado) {
    console.log('[Supabase] Configurado:', String(supabaseUrl).slice(0, 30) + '...')
  } else {
    console.warn('[Supabase] Variáveis de ambiente ausentes. Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.')
  }
}
