import { supabase, supabaseConfigurado } from '@/lib/supabase'
import type { CargoFuncao } from '@/types'

function getClient() {
  if (!supabaseConfigurado || !supabase) {
    throw new Error('Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no ambiente de deploy.')
  }
  return supabase
}

export async function listarCargosFuncoes(): Promise<CargoFuncao[]> {
  const client = getClient()
  const { data, error } = await client
    .from('cargos_funcoes')
    .select('id, nome, ativo, created_by, created_at, updated_at')
    .eq('ativo', true)
    .order('nome', { ascending: true })
  if (error) throw error
  return (data || []) as CargoFuncao[]
}

export async function criarCargoFuncao(nome: string): Promise<CargoFuncao> {
  const client = getClient()
  const { data, error } = await client
    .from('cargos_funcoes')
    .insert({ nome: nome.trim() })
    .select('id, nome, ativo, created_by, created_at, updated_at')
    .single()
  if (error) {
    if (error.code === '23505') throw new Error('Este cargo/função já existe.')
    throw error
  }
  return data as CargoFuncao
}

export async function atualizarCargoFuncao(id: string, nome: string): Promise<CargoFuncao> {
  const client = getClient()
  const { data, error } = await client
    .from('cargos_funcoes')
    .update({ nome: nome.trim(), updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('id, nome, ativo, created_by, created_at, updated_at')
    .single()
  if (error) {
    if (error.code === '23505') throw new Error('Este cargo/função já existe.')
    throw error
  }
  return data as CargoFuncao
}

export async function desativarCargoFuncao(id: string): Promise<void> {
  const client = getClient()
  const { error } = await client
    .from('cargos_funcoes')
    .update({ ativo: false, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}
