import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'

function cleanEnv(value?: string): string {
  return (value || '')
    .trim()
    .replace(/^["']|["']$/g, '')
    .trim()
}

const rawUrl = cleanEnv(import.meta.env.VITE_SUPABASE_URL)
const rawKey = cleanEnv(
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
)

function isSupabaseUrlValida(url: string): boolean {
  if (!url) return false
  const lower = url.toLowerCase()

  if (lower.includes('<')) return false
  if (lower.includes('placeholder')) return false
  if (lower.includes('sua-url')) return false
  if (lower.includes('your-project')) return false
  if (!lower.startsWith('https://')) return false
  if (!lower.includes('.supabase.co')) return false
  if (lower.endsWith('/rest/v1')) return false

  return true
}

function isSupabaseKeyValida(key: string): boolean {
  if (!key) return false
  const clean = cleanEnv(key)

  if (!clean) return false
  if (clean.includes('<')) return false
  if (clean.toLowerCase().includes('placeholder')) return false
  if (clean.toLowerCase().includes('sua-chave')) return false
  if (clean.toLowerCase().includes('your-key')) return false

  return (
    clean.startsWith('eyJ') ||
    clean.startsWith('sb_publishable_')
  )
}

export const supabaseUrlValida = isSupabaseUrlValida(rawUrl)
export const supabaseKeyValida = isSupabaseKeyValida(rawKey)
export const supabaseConfigurado = supabaseUrlValida && supabaseKeyValida

export const supabase: SupabaseClient | null = supabaseConfigurado
  ? createClient(rawUrl, rawKey)
  : null

export function getSupabaseConfigStatus() {
  const keyFormat = !rawKey
    ? 'missing'
    : rawKey.startsWith('eyJ')
      ? 'legacy-jwt'
      : rawKey.startsWith('sb_publishable_')
        ? 'publishable'
        : 'invalid'

  return {
    hasUrl: Boolean(rawUrl),
    hasKey: Boolean(rawKey),
    urlValid: supabaseUrlValida,
    keyValid: supabaseKeyValida,
    keyFormat,
    configured: supabaseConfigurado,
    mode: import.meta.env.MODE,
    prod: import.meta.env.PROD,
    dev: import.meta.env.DEV,
  }
}

export function getSupabaseErrorMessage(): string | null {
  const status = getSupabaseConfigStatus()
  if (status.configured) return null
  if (!status.hasUrl) return 'VITE_SUPABASE_URL não foi injetada no build.'
  if (!status.hasKey) return 'VITE_SUPABASE_ANON_KEY não foi injetada no build.'
  if (!status.urlValid) return 'VITE_SUPABASE_URL inválida. Use a URL base do Supabase, sem /rest/v1.'
  if (!status.keyValid) return 'Chave Supabase inválida. Use legacy anon key eyJ... ou publishable key sb_publishable_...'
  return 'Configuração do Supabase incompleta.'
}

if (import.meta.env.DEV) {
  console.info('[Supabase config]', getSupabaseConfigStatus())
}
