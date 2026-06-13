import { supabase, supabaseConfigurado } from '@/lib/supabase'
import type { Empresa, Levantamento, Usuario } from '@/types'

function getClient() {
  if (!supabaseConfigurado || !supabase) {
    throw new Error('Servidor não configurado. Verifique as variáveis de ambiente do Supabase.')
  }
  return supabase
}

// ─── Auth ───────────────────────────────────────────────────────────────────

export async function signIn(email: string, senha: string) {
  const client = getClient()
  const { data, error } = await client.auth.signInWithPassword({ email, password: senha })
  if (error) throw new Error(tratarErroAuth(error))
  return data
}

export async function signUp(email: string, senha: string, nome: string, perfil: Usuario['perfil'] = 'visualizador') {
  const client = getClient()
  const { data, error } = await client.auth.signUp({
    email,
    password: senha,
    options: { data: { nome, perfil } },
  })
  if (error) throw new Error(tratarErroAuth(error))
  return data
}

export async function signOut() {
  const client = getClient()
  const { error } = await client.auth.signOut()
  if (error) throw new Error(tratarErroAuth(error))
}

export async function getSession() {
  const client = getClient()
  const { data, error } = await client.auth.getSession()
  if (error) throw new Error(tratarErroAuth(error))
  return data.session
}

export async function getCurrentUser() {
  const client = getClient()
  const { data, error } = await client.auth.getUser()
  if (error) throw new Error(tratarErroAuth(error))
  return data.user
}

// ─── Profile ────────────────────────────────────────────────────────────────

export async function getProfile(userId: string) {
  const client = getClient()
  const { data, error } = await client
    .from('profiles')
    .select('id, nome, email, perfil')
    .eq('id', userId)
    .single()
  if (error) throw error
  return data as { id: string; nome: string; email: string | null; perfil: string }
}

// ─── Empresas ───────────────────────────────────────────────────────────────

export async function listEmpresas(): Promise<Empresa[]> {
  const client = getClient()
  const { data, error } = await client
    .from('empresas')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data || []).map(mapEmpresaFromSupabase) as Empresa[]
}

export async function createEmpresa(empresa: Empresa) {
  const client = getClient()
  const { data: userData } = await client.auth.getUser()
  const { data, error } = await client
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
  const client = getClient()
  const { data, error } = await client
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
  const client = getClient()
  const { error } = await client.from('empresas').delete().eq('id', id)
  if (error) throw error
}

// ─── Levantamentos ──────────────────────────────────────────────────────────

export async function listLevantamentos(): Promise<Levantamento[]> {
  const client = getClient()
  const { data, error } = await client
    .from('levantamentos')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data || []).map(mapLevantamentoFromSupabase) as Levantamento[]
}

export async function getLevantamento(id: string): Promise<Levantamento | null> {
  const client = getClient()
  const { data, error } = await client
    .from('levantamentos')
    .select('*')
    .eq('id', id)
    .single()
  if (error) return null
  return mapLevantamentoFromSupabase(data) as Levantamento
}

export async function createLevantamento(levantamento: Levantamento) {
  const client = getClient()
  const { data: userData } = await client.auth.getUser()
  const payload = toSnakeCase(levantamento)
  const { data, error } = await client
    .from('levantamentos')
    .insert({ ...payload, user_id: userData?.user?.id })
    .select()
    .single()
  if (error) throw error
  return mapLevantamentoFromSupabase(data) as Levantamento
}

export async function updateLevantamento(levantamento: Levantamento) {
  const client = getClient()
  const payload = toSnakeCase(levantamento)
  const { data, error } = await client
    .from('levantamentos')
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq('id', levantamento.id)
    .select()
    .single()
  if (error) throw error
  return mapLevantamentoFromSupabase(data) as Levantamento
}

export async function deleteLevantamento(id: string) {
  const client = getClient()
  const { error } = await client.from('levantamentos').delete().eq('id', id)
  if (error) throw error
}

// ─── Error handler ──────────────────────────────────────────────────────────

function tratarErroAuth(error: any): string {
  const code = error?.code || error?.status || ''
  const message = error?.message || ''

  if (message.includes('Invalid login credentials')) return 'E-mail ou senha inválidos.'
  if (message.includes('Email not confirmed')) return 'E-mail ainda não confirmado. Verifique sua caixa de entrada.'
  if (message.includes('User already registered')) return 'Este e-mail já está cadastrado.'
  if (message.includes('Password should be at least 6 characters')) return 'A senha deve ter no mínimo 6 caracteres.'
  if (message.includes('NetworkError') || message.includes('Failed to fetch')) return 'Erro de conexão com o servidor. Verifique sua internet.'
  if (code === 'over_email_send_rate_limit') return 'Muitas tentativas. Aguarde um momento e tente novamente.'
  if (code === 'over_request_rate_limit') return 'Muitas requisições. Aguarde um instante.'

  if (import.meta.env.DEV) console.error('[Supabase Auth]', error)
  return 'Erro ao conectar ao servidor. Tente novamente mais tarde.'
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
