import { supabase, supabaseConfigurado } from '@/lib/supabase'
import { listarSetores, criarSetor } from './setores.service'
import { listarCargosFuncoes, criarCargoFuncao } from './cargos.service'

export async function migrateLocalCatalogsToSupabase(): Promise<void> {
  if (!supabaseConfigurado || !supabase) return

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
  } catch {
    return
  }

  const setoresLocal = localStorage.getItem('riskflow_setores')
  const cargosLocal = localStorage.getItem('riskflow_cargos')

  if (setoresLocal) {
    try {
      const nomes: string[] = JSON.parse(setoresLocal)
      const existentes = await listarSetores()
      const nomesExistentes = new Set(existentes.map(s => s.nome.toLowerCase()))
      for (const nome of nomes) {
        if (!nomesExistentes.has(nome.toLowerCase())) {
          try { await criarSetor(nome) } catch { /* duplicata ou erro — ignora */ }
        }
      }
      localStorage.removeItem('riskflow_setores')
      if (import.meta.env.DEV) console.log('[Migrate] riskflow_setores migrados com sucesso.')
    } catch (err) {
      if (import.meta.env.DEV) console.warn('[Migrate] Erro ao migrar riskflow_setores:', err)
    }
  }

  if (cargosLocal) {
    try {
      const nomes: string[] = JSON.parse(cargosLocal)
      const existentes = await listarCargosFuncoes()
      const nomesExistentes = new Set(existentes.map(c => c.nome.toLowerCase()))
      for (const nome of nomes) {
        if (!nomesExistentes.has(nome.toLowerCase())) {
          try { await criarCargoFuncao(nome) } catch { /* duplicata ou erro — ignora */ }
        }
      }
      localStorage.removeItem('riskflow_cargos')
      if (import.meta.env.DEV) console.log('[Migrate] riskflow_cargos migrados com sucesso.')
    } catch (err) {
      if (import.meta.env.DEV) console.warn('[Migrate] Erro ao migrar riskflow_cargos:', err)
    }
  }
}
