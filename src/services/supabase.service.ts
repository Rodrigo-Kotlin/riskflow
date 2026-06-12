import { supabase } from '@/lib/supabase'
import type { Empresa, Levantamento, Usuario } from '@/types'

// ─── Auth ───────────────────────────────────────────────────────────────────

export async function signIn(email: string, senha: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha })
  if (error) throw error
  return data
}

export async function signUp(email: string, senha: string, nome: string, perfil: Usuario['perfil'] = 'visualizador') {
  const { data, error } = await supabase.auth.signUp({
    email,
    password: senha,
    options: { data: { nome, perfil } },
  })
  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession()
  if (error) throw error
  return data.session
}

export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser()
  if (error) throw error
  return data.user
}

// ─── Profile ────────────────────────────────────────────────────────────────

export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, nome, email, perfil')
    .eq('id', userId)
    .single()
  if (error) throw error
  return data as { id: string; nome: string; email: string | null; perfil: string }
}

// ─── Empresas ───────────────────────────────────────────────────────────────

export async function listEmpresas(): Promise<Empresa[]> {
  const { data, error } = await supabase
    .from('empresas')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data || []).map(mapEmpresaFromSupabase) as Empresa[]
}

export async function createEmpresa(empresa: Empresa) {
  const { data: userData } = await supabase.auth.getUser()
  const { data, error } = await supabase
    .from('empresas')
    .insert({
      id: empresa.id,
      razao_social: empresa.razaoSocial,
      nome_fantasia: empresa.nomeFantasia,
      cnpj: empresa.cnpj,
      cnae: empresa.cnae,
      grau_risco: empresa.grauRisco,
      endereco: empresa.endereco,
      cidade: empresa.cidade,
      uf: empresa.uf,
      responsavel: empresa.responsavel,
      telefone: empresa.telefone,
      email: empresa.email,
      observacoes: empresa.observacoes,
      user_id: userData?.user?.id,
    })
    .select()
    .single()
  if (error) throw error
  return mapEmpresaFromSupabase(data)
}

export async function updateEmpresa(empresa: Empresa) {
  const { data, error } = await supabase
    .from('empresas')
    .update({
      razao_social: empresa.razaoSocial,
      nome_fantasia: empresa.nomeFantasia,
      cnpj: empresa.cnpj,
      cnae: empresa.cnae,
      grau_risco: empresa.grauRisco,
      endereco: empresa.endereco,
      cidade: empresa.cidade,
      uf: empresa.uf,
      responsavel: empresa.responsavel,
      telefone: empresa.telefone,
      email: empresa.email,
      observacoes: empresa.observacoes,
    })
    .eq('id', empresa.id)
    .select()
    .single()
  if (error) throw error
  return mapEmpresaFromSupabase(data)
}

export async function deleteEmpresa(id: string) {
  const { error } = await supabase.from('empresas').delete().eq('id', id)
  if (error) throw error
}

// ─── Levantamentos ──────────────────────────────────────────────────────────

export async function listLevantamentos(): Promise<Levantamento[]> {
  const { data, error } = await supabase
    .from('levantamentos')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data || []).map(mapLevantamentoFromSupabase) as Levantamento[]
}

export async function getLevantamento(id: string): Promise<Levantamento | null> {
  const { data, error } = await supabase
    .from('levantamentos')
    .select('*')
    .eq('id', id)
    .single()
  if (error) return null
  return mapLevantamentoFromSupabase(data) as Levantamento
}

export async function createLevantamento(levantamento: Levantamento) {
  const { data: userData } = await supabase.auth.getUser()
  const payload = toSnakeCase(levantamento)
  const { data, error } = await supabase
    .from('levantamentos')
    .insert({ ...payload, user_id: userData?.user?.id })
    .select()
    .single()
  if (error) throw error
  return mapLevantamentoFromSupabase(data) as Levantamento
}

export async function updateLevantamento(levantamento: Levantamento) {
  const payload = toSnakeCase(levantamento)
  const { data, error } = await supabase
    .from('levantamentos')
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq('id', levantamento.id)
    .select()
    .single()
  if (error) throw error
  return mapLevantamentoFromSupabase(data) as Levantamento
}

export async function deleteLevantamento(id: string) {
  const { error } = await supabase.from('levantamentos').delete().eq('id', id)
  if (error) throw error
}

// ─── Mappers ────────────────────────────────────────────────────────────────

function mapEmpresaFromSupabase(data: any): Empresa {
  return {
    id: data.id,
    razaoSocial: data.razao_social || '',
    nomeFantasia: data.nome_fantasia || '',
    cnpj: data.cnpj || '',
    cnae: data.cnae || '',
    grauRisco: data.grau_risco || '1',
    endereco: data.endereco || '',
    cidade: data.cidade || '',
    uf: data.uf || '',
    responsavel: data.responsavel || '',
    telefone: data.telefone || '',
    email: data.email || '',
    observacoes: data.observacoes || '',
    createdAt: data.created_at || '',
  }
}

function mapLevantamentoFromSupabase(data: any): Levantamento {
  return {
    id: data.id,
    tipo: data.tipo,
    codigo: data.codigo || '',
    empresaId: data.empresa_id || '',
    empresaNome: data.empresa_nome || '',
    cnpj: data.cnpj || '',
    unidade: data.unidade || '',
    setor: data.setor || '',
    responsavelEmpresa: data.responsavel_empresa || '',
    auditorTecnico: data.auditor_tecnico || '',
    registroMTE: data.registro_mte || '',
    dataLevantamento: data.data_levantamento || '',
    dataLancamentoSGG: data.data_lancamento_sgg || '',
    responsavelLancamento: data.responsavel_lancamento || '',
    status: data.status,
    percentual: data.percentual || 0,
    caracteristicas: data.caracteristicas ?? {},
    medicoes: data.medicoes ?? [],
    colaboradores: data.colaboradores ?? [],
    riscos: data.riscos ?? [],
    controles: data.controles ?? [],
    parecer: data.parecer ?? { texto: '', editado: false },
    assinaturaTecnico: data.assinatura_tecnico ?? { nomeCompleto: '', cpf: '', dataHora: '', canvasData: '', confirmada: false },
    assinaturaEmpresa: data.assinatura_empresa ?? { nomeCompleto: '', cpf: '', dataHora: '', canvasData: '', confirmada: false },
    createdAt: data.created_at || '',
    updatedAt: data.updated_at || '',
  }
}

function toSnakeCase(l: Levantamento): Record<string, any> {
  return {
    id: l.id,
    tipo: l.tipo,
    codigo: l.codigo,
    empresa_id: l.empresaId,
    empresa_nome: l.empresaNome,
    cnpj: l.cnpj,
    unidade: l.unidade,
    setor: l.setor,
    responsavel_empresa: l.responsavelEmpresa,
    auditor_tecnico: l.auditorTecnico,
    registro_mte: l.registroMTE,
    data_levantamento: l.dataLevantamento,
    data_lancamento_sgg: l.dataLancamentoSGG,
    responsavel_lancamento: l.responsavelLancamento,
    status: l.status,
    percentual: l.percentual,
    caracteristicas: l.caracteristicas as any,
    medicoes: l.medicoes as any,
    colaboradores: l.colaboradores as any,
    riscos: l.riscos as any,
    controles: l.controles as any,
    parecer: l.parecer as any,
    assinatura_tecnico: l.assinaturaTecnico as any,
    assinatura_empresa: l.assinaturaEmpresa as any,
  }
}
