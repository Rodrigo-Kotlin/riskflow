export const STATUS_LEVANTAMENTO = {
  RASCUNHO: 'Rascunho',
  EM_CAMPO: 'Em campo',
  EM_ANDAMENTO: 'Em andamento',
  EM_REVISAO: 'Em revisão',
  CONCLUIDO: 'Concluído',
  EXPORTADO: 'Exportado',
} as const

export const NIVEIS_RISCO = {
  CRITICO: 'Crítico',
  ALTO: 'Alto',
  MODERADO: 'Moderado',
  BAIXO: 'Baixo',
} as const

export const TIPOS_CONTROLE = [
  'fonte',
  'trajetória',
  'trabalhador',
  'administrativo',
  'treinamento',
  'avaliação quantitativa',
] as const

export const CATEGORIAS_PERIGO = [
  'Ergonômicos',
  'Biomecânicos',
  'Mobiliário e Equipamentos',
  'Organizacionais',
  'Psicossociais/Cognitivos',
  'Ambientais',
  'Acidentes/Mecânicos',
  'Físicos',
  'Químicos',
  'Biológicos',
  'Judicial/Legislação',
  'Outros',
] as const

export const TIPOS_LEVANTAMENTO = ['LPR', 'LPP', 'AEP'] as const

export const STATUS_COLETA = {
  PENDENTE: 'Pendente',
  ENVIADO: 'Enviado',
  RESPONDIDO: 'Respondido',
  VALIDADO: 'Validado',
} as const

export const STATUS_CONTROLE = {
  PENDENTE: 'Pendente',
  EM_ANDAMENTO: 'Em andamento',
  CONCLUIDO: 'Concluído',
  NAO_INICIADO: 'Não iniciado',
} as const

export const PRIORIDADE_CONTROLE = {
  BAIXA: 'Baixa',
  MEDIA: 'Média',
  ALTA: 'Alta',
  CRITICA: 'Crítica',
} as const

export const SITUACAO_RISCO = {
  CONTROLADO: 'Controlado',
  CONTROLE_INSUFICIENTE: 'Controle insuficiente',
  NAO_CONTROLADO: 'Não controlado',
  NAO_APLICAVEL: 'Não aplicável',
} as const
