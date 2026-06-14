import { supabase, supabaseConfigurado } from '@/lib/supabase'

export async function gerarCodigoDocumento(tipoDocumento: string): Promise<string> {
  if (!supabaseConfigurado || !supabase) {
    throw new Error('Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no ambiente de deploy.')
  }

  const { data, error } = await supabase.rpc('gerar_codigo_documento', {
    p_tipo_documento: tipoDocumento,
  })

  if (error) throw error
  return data as string
}
