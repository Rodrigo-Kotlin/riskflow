export type LevantamentoTipo = 'LPR' | 'LPP' | 'AEP'
export type LevantamentoStatus = 'Rascunho' | 'Em campo' | 'Em andamento' | 'Em revisão' | 'Concluído' | 'Exportado'
export type RiscoCategoria =
  | 'Ergonômicos' | 'Biomecânicos' | 'Mobiliário e Equipamentos'
  | 'Organizacionais' | 'Psicossociais/Cognitivos' | 'Ambientais'
  | 'Acidentes/Mecânicos' | 'Físicos' | 'Químicos' | 'Biológicos'
  | 'Judicial/Legislação' | 'Outros'
export type NivelRisco = 'Baixo' | 'Moderado' | 'Alto' | 'Crítico'
export type SituacaoRisco = 'Controlado' | 'Controle insuficiente' | 'Não controlado' | 'Não aplicável'
export type StatusColeta = 'Pendente' | 'Enviado' | 'Respondido' | 'Validado'
export type StatusControle = 'Pendente' | 'Em andamento' | 'Concluído' | 'Não iniciado'
export type PrioridadeControle = 'Baixa' | 'Média' | 'Alta' | 'Crítica'
export type TipoControle = 'fonte' | 'trajetória' | 'trabalhador' | 'administrativo' | 'treinamento' | 'avaliação quantitativa'

export interface Empresa {
  id: string
  razaoSocial: string
  nomeFantasia: string
  cnpj: string
  cnae: string
  grauRisco: string
  endereco: string
  cidade: string
  uf: string
  responsavel: string
  telefone: string
  email: string
  observacoes: string
  createdAt: string
}

export interface Medicao {
  id: string
  postoLocal: string
  ruidoDbA: number
  tempoExposicao: string
  iluminanciaLux: number
  temperatura: number
  umidade: number
  velocidadeAr: number
  radiacao: string
  equipamento: string
  dataHora: string
  foto: string
  observacoes: string
}

export interface Colaborador {
  id: string
  nome: string
  cargo: string
  setor: string
  posto: string
  descricaoAtividades: string
  observacoes: string
  statusColeta: StatusColeta
  qrCodeLink: string
}

export interface Risco {
  id: string
  categoria: RiscoCategoria
  perigo: string
  dano: string
  severidade: number
  probabilidade: number
  nivel: NivelRisco
  pontuacao: number
  fonteGeradora: string
  meioPropagacao: string
  tempoExposicao: string
  situacao: SituacaoRisco
  avaliacaoQuantitativa: boolean
  situacaoEncontrada: string
  controleFonte: string
  controleTrajetoria: string
  controleTrabalhador: string
  evidencias: string[]
  observacoes: string
}

export interface Controle {
  id: string
  riscoId: string
  acao: string
  origem: string
  tipo: TipoControle
  responsavel: string
  prazo: string
  prioridade: PrioridadeControle
  status: StatusControle
  custoEstimado: string
  observacoes: string
}

export interface CaracteristicasLocal {
  qtdColaboradores: number
  dimensoes: string
  comprimento: string
  largura: string
  peDireito: string
  pavimento: string
  paredesVedacao: string
  divisoria: string
  piso: string
  revestimento: string
  forro: string
  telhado: string
  iluminacaoNatural: string
  iluminacaoArtificial: string
  ventilacaoNatural: string
  ventilacaoArtificial: string
  sistemaIncendio: string
  possibilidadeGES: string
  mobiliarios: string
  maquinasEquipamentos: string
  epis: string
  epcs: string
  imagens: string[]
}

export interface ItemComQuantidade {
  nome: string
  quantidade: number
}

export interface ParecerTecnico {
  texto: string
  editado: boolean
}

export interface Assinatura {
  nomeCompleto: string
  cpf: string
  dataHora: string
  canvasData: string
  confirmada: boolean
}

export interface Levantamento {
  id: string
  tipo: LevantamentoTipo
  codigo: string
  empresaId: string
  empresaNome: string
  cnpj: string
  unidade: string
  responsavelEmpresa: string
  registroMTE: string
  dataLevantamento: string
  dataLancamentoSGG: string
  responsavelLancamento: string
  status: LevantamentoStatus
  percentual: number
  caracteristicas: CaracteristicasLocal
  medicoes: Medicao[]
  colaboradores: Colaborador[]
  riscos: Risco[]
  controles: Controle[]
  parecer: ParecerTecnico
  assinaturaTecnico: Assinatura
  assinaturaEmpresa: Assinatura
  createdAt: string
  updatedAt: string
}

export interface Relatorio {
  id: string
  levantamentoId: string
  empresaNome: string
  tipo: LevantamentoTipo
  data: string
  modelo: 'Completo' | 'Executivo'
  status: string
  createdAt: string
}

export interface Setor {
  id: string
  nome: string
  ativo: boolean
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface CargoFuncao {
  id: string
  nome: string
  ativo: boolean
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface Usuario {
  id: string
  nome: string
  email: string
  perfil: 'admin' | 'tecnico' | 'visualizador'
}

export type BibliotecaCategoria =
  | 'risco' | 'perigo_fator' | 'dano'
  | 'epi' | 'epc' | 'equipamento_medicao'
  | 'medida_controle' | 'treinamento' | 'sinalizacao'
  | 'meio_propagacao' | 'norma_referencia'
  | 'unidade_medida' | 'metodo_avaliacao'

export interface BibliotecaTecnicaItem {
  id: string
  categoria: BibliotecaCategoria
  nome: string
  descricao: string | null
  tipo: string | null
  grupo: string | null
  unidade: string | null
  codigo: string | null
  norma_referencia: string | null
  aplicacao: string | null
  observacoes: string | null
  tags: string[]
  metadados: Record<string, unknown>
  ativo: boolean
  is_padrao: boolean
  created_by: string | null
  created_at: string
  updated_at: string
}

export type BibliotecaTecnicaPayload = Omit<BibliotecaTecnicaItem, 'id' | 'created_at' | 'updated_at' | 'is_padrao' | 'created_by'>

export interface BibliotecaTecnicaFiltro {
  categoria?: BibliotecaCategoria
  search?: string
  ativo?: boolean
  apenasPadrao?: boolean
  apenasProprios?: boolean
}

export const CATEGORIAS_BIBLIOTECA: { value: BibliotecaCategoria; label: string }[] = [
  { value: 'risco', label: 'Riscos' },
  { value: 'perigo_fator', label: 'Perigos/Fatores de Risco' },
  { value: 'dano', label: 'Danos/Consequências' },
  { value: 'epi', label: 'EPIs' },
  { value: 'epc', label: 'EPCs' },
  { value: 'equipamento_medicao', label: 'Equipamentos de Medição' },
  { value: 'medida_controle', label: 'Medidas de Controle' },
  { value: 'treinamento', label: 'Treinamentos' },
  { value: 'sinalizacao', label: 'Sinalizações' },
  { value: 'meio_propagacao', label: 'Meios de Propagação' },
  { value: 'norma_referencia', label: 'Normas/Referências Técnicas' },
  { value: 'unidade_medida', label: 'Unidades de Medida' },
  { value: 'metodo_avaliacao', label: 'Métodos de Avaliação' },
]
