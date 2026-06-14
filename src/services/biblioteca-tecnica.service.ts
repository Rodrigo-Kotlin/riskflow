import { supabase, supabaseConfigurado } from '@/lib/supabase'
import type { BibliotecaTecnicaItem, BibliotecaTecnicaPayload, BibliotecaCategoria } from '@/types'

function getClient() {
  if (!supabaseConfigurado || !supabase) {
    throw new Error('Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no ambiente de deploy.')
  }
  return supabase
}

export async function listarItensBiblioteca(): Promise<BibliotecaTecnicaItem[]> {
  const client = getClient()
  const { data, error } = await client
    .from('biblioteca_tecnica')
    .select('*')
    .eq('ativo', true)
    .order('nome', { ascending: true })
  if (error) throw error
  return (data || []) as BibliotecaTecnicaItem[]
}

export async function buscarItensBiblioteca(
  categoria: BibliotecaCategoria,
  search?: string
): Promise<BibliotecaTecnicaItem[]> {
  const client = getClient()
  let query = client
    .from('biblioteca_tecnica')
    .select('*')
    .eq('categoria', categoria)
    .eq('ativo', true)
    .order('nome', { ascending: true })
  if (search) {
    query = query.ilike('nome', `%${search}%`)
  }
  const { data, error } = await query
  if (error) throw error
  return (data || []) as BibliotecaTecnicaItem[]
}

export async function listarItensPorCategoria(): Promise<Record<BibliotecaCategoria, BibliotecaTecnicaItem[]>> {
  const itens = await listarItensBiblioteca()
  const agrupado = {} as Record<BibliotecaCategoria, BibliotecaTecnicaItem[]>
  for (const item of itens) {
    if (!agrupado[item.categoria]) agrupado[item.categoria] = []
    agrupado[item.categoria].push(item)
  }
  return agrupado
}

export async function criarItemBiblioteca(payload: BibliotecaTecnicaPayload): Promise<BibliotecaTecnicaItem> {
  const client = getClient()
  const { data, error } = await client
    .from('biblioteca_tecnica')
    .insert({
      categoria: payload.categoria,
      nome: payload.nome.trim(),
      descricao: payload.descricao,
      tipo: payload.tipo,
      grupo: payload.grupo,
      unidade: payload.unidade,
      codigo: payload.codigo,
      norma_referencia: payload.norma_referencia,
      aplicacao: payload.aplicacao,
      observacoes: payload.observacoes,
      tags: payload.tags || [],
      metadados: payload.metadados || {},
    })
    .select('*')
    .single()
  if (error) {
    if (error.code === '23505') throw new Error('Já existe um item com este nome nesta categoria.')
    throw error
  }
  return data as BibliotecaTecnicaItem
}

export async function atualizarItemBiblioteca(
  id: string,
  payload: Partial<BibliotecaTecnicaPayload>
): Promise<BibliotecaTecnicaItem> {
  const client = getClient()
  const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (payload.nome !== undefined) updateData.nome = payload.nome.trim()
  if (payload.descricao !== undefined) updateData.descricao = payload.descricao
  if (payload.tipo !== undefined) updateData.tipo = payload.tipo
  if (payload.grupo !== undefined) updateData.grupo = payload.grupo
  if (payload.unidade !== undefined) updateData.unidade = payload.unidade
  if (payload.codigo !== undefined) updateData.codigo = payload.codigo
  if (payload.norma_referencia !== undefined) updateData.norma_referencia = payload.norma_referencia
  if (payload.aplicacao !== undefined) updateData.aplicacao = payload.aplicacao
  if (payload.observacoes !== undefined) updateData.observacoes = payload.observacoes
  if (payload.tags !== undefined) updateData.tags = payload.tags
  if (payload.metadados !== undefined) updateData.metadados = payload.metadados
  const { data, error } = await client
    .from('biblioteca_tecnica')
    .update(updateData)
    .eq('id', id)
    .select('*')
    .single()
  if (error) {
    if (error.code === '23505') throw new Error('Já existe um item com este nome nesta categoria.')
    throw error
  }
  return data as BibliotecaTecnicaItem
}

export async function desativarItemBiblioteca(id: string): Promise<void> {
  const client = getClient()
  const { error } = await client
    .from('biblioteca_tecnica')
    .update({ ativo: false, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}

export async function reativarItemBiblioteca(id: string): Promise<void> {
  const client = getClient()
  const { error } = await client
    .from('biblioteca_tecnica')
    .update({ ativo: true, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}
