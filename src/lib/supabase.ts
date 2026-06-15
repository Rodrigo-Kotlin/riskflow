import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'

const rawUrl = import.meta.env.VITE_SUPABASE_URL
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY

function isSupabaseUrlValida(url: string): boolean {
  if (!url || url.includes('<') || url.includes('placeholder')) return false
  if (!url.startsWith('https://')) return false
  if (!url.includes('.supabase.co')) return false
  if (url.endsWith('/rest/v1')) return false
  return true
}

function isSupabaseKeyValida(key: string): boolean {
  if (!key) return false
  return key.startsWith('eyJ') || key.startsWith('sb_publishable_')
}

export const supabaseUrlValida = isSupabaseUrlValida(rawUrl || '')
export const supabaseKeyValida = isSupabaseKeyValida(rawKey || '')
export const supabaseConfigurado = supabaseUrlValida && supabaseKeyValida

export const supabase: SupabaseClient | null = supabaseConfigurado
  ? createClient(rawUrl, rawKey)
  : null

if (import.meta.env.DEV) {
  const formato = rawKey?.startsWith('sb_publishable_') ? 'publishable' : rawKey?.startsWith('eyJ') ? 'legacy' : 'desconhecido'
  console.log('[Supabase] URL definida:', !!rawUrl, '| Válida:', supabaseUrlValida)
  console.log('[Supabase] Key definida:', !!rawKey, '| Válida:', supabaseKeyValida, '| Formato:', formato)
}
