import { supabase, supabaseConfigurado } from '@/lib/supabase'
import type { Setor } from '@/types'

function getClient() {
  if (!supabaseConfigurado || !supabase) {
    throw new Error('Supabase não configurado. Verifique se VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY foram injetadas no build.')
  }
  return supabase
}

export async function listarSetores(): Promise<Setor[]> {
  const client = getClient()
  const { data, error } = await client
    .from('setores')
    .select('id, nome, ativo, created_by, created_at, updated_at')
    .eq('ativo', true)
    .order('nome', { ascending: true })
  if (error) throw error
  return (data || []) as Setor[]
}

export async function criarSetor(nome: string): Promise<Setor> {
  const client = getClient()
  const { data, error } = await client
    .from('setores')
    .insert({ nome: nome.trim() })
    .select('id, nome, ativo, created_by, created_at, updated_at')
    .single()
  if (error) {
    if (error.code === '23505') throw new Error('Este setor já existe.')
    throw error
  }
  return data as Setor
}

export async function atualizarSetor(id: string, nome: string): Promise<Setor> {
  const client = getClient()
  const { data, error } = await client
    .from('setores')
    .update({ nome: nome.trim(), updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('id, nome, ativo, created_by, created_at, updated_at')
    .single()
  if (error) {
    if (error.code === '23505') throw new Error('Este setor já existe.')
    throw error
  }
  return data as Setor
}

export async function desativarSetor(id: string): Promise<void> {
  const client = getClient()
  const { error } = await client
    .from('setores')
    .update({ ativo: false, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}
