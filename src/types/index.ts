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
  setor: string
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
  setor: string
  responsavelEmpresa: string
  auditorTecnico: string
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

export interface Usuario {
  id: string
  nome: string
  email: string
  senha: string
  perfil: 'admin' | 'tecnico' | 'visualizador'
}
