import { Empresa, Usuario, Levantamento } from '@/types'
import { today } from '@/lib/utils'

export const usuariosMock: Usuario[] = [
  { id: 'u1', nome: 'Carlos Silva', email: 'carlos@efetiva.com', senha: 'riskflow', perfil: 'admin' },
  { id: 'u2', nome: 'Ana Oliveira', email: 'ana@efetiva.com', senha: 'riskflow', perfil: 'tecnico' },
  { id: 'u3', nome: 'Pedro Santos', email: 'pedro@efetiva.com', senha: 'riskflow', perfil: 'visualizador' },
]

export const empresasMock: Empresa[] = [
  {
    id: 'e1', razaoSocial: 'Metalúrgica ABC Ltda', nomeFantasia: 'Metal ABC',
    cnpj: '12.345.678/0001-90', cnae: '24.31-2', grauRisco: '3',
    endereco: 'Av. Industrial, 1500', cidade: 'São Paulo', uf: 'SP',
    responsavel: 'João Ferreira', telefone: '(11) 3456-7890', email: 'joao@metalabc.com.br',
    observacoes: 'Indústria de médio porte, 200 colaboradores', createdAt: '2025-01-15'
  },
  {
    id: 'e2', razaoSocial: 'Construtora Nova Era Ltda', nomeFantasia: 'Nova Era',
    cnpj: '23.456.789/0001-01', cnae: '41.20-6', grauRisco: '4',
    endereco: 'Rua dos Engenheiros, 500', cidade: 'Campinas', uf: 'SP',
    responsavel: 'Maria Costa', telefone: '(19) 3456-7891', email: 'maria@novaera.com.br',
    observacoes: 'Obras em andamento em 3 frentes de trabalho', createdAt: '2025-02-20'
  },
  {
    id: 'e3', razaoSocial: 'Indústria Química Sul Ltda', nomeFantasia: 'Química Sul',
    cnpj: '34.567.890/0001-12', cnae: '20.11-4', grauRisco: '4',
    endereco: 'Rodovia BR-101, km 45', cidade: 'Porto Alegre', uf: 'RS',
    responsavel: 'Roberto Almeida', telefone: '(51) 3456-7892', email: 'roberto@quimicasul.com.br',
    observacoes: 'Produtos químicos perigosos, PGR vigente', createdAt: '2025-03-10'
  },
  {
    id: 'e4', razaoSocial: 'Supermercado Bom Preço S.A.', nomeFantasia: 'Bom Preço',
    cnpj: '45.678.901/0001-23', cnae: '47.11-3', grauRisco: '2',
    endereco: 'Rua das Flores, 200', cidade: 'Belo Horizonte', uf: 'MG',
    responsavel: 'Lucia Martins', telefone: '(31) 3456-7893', email: 'lucia@bompreco.com.br',
    observacoes: 'Rede com 5 lojas, 600 colaboradores no total', createdAt: '2025-04-05'
  },
  {
    id: 'e5', razaoSocial: 'Hospital São Lucas Ltda', nomeFantasia: 'Hospital São Lucas',
    cnpj: '56.789.012/0001-34', cnae: '86.10-1', grauRisco: '3',
    endereco: 'Av. da Saúde, 1000', cidade: 'Curitiba', uf: 'PR',
    responsavel: 'Dr. Paulo Mendes', telefone: '(41) 3456-7894', email: 'paulo@hospitalsaolucas.com.br',
    observacoes: 'Hospital geral, 300 leitos, 800 colaboradores', createdAt: '2025-05-12'
  },
]

export function criarLevantamentosMock(): Levantamento[] {
  const hoje = today()
  return [
    {
      id: 'l1', tipo: 'LPR', codigo: 'LPR-2025-001',
      empresaId: 'e1', empresaNome: 'Metalúrgica ABC Ltda',
      cnpj: '12.345.678/0001-90', unidade: 'Matriz', setor: 'Produção',
      responsavelEmpresa: 'João Ferreira', auditorTecnico: 'Carlos Silva',
      registroMTE: 'MTE 12345', dataLevantamento: '2025-06-10',
      dataLancamentoSGG: '2025-06-15', responsavelLancamento: 'Ana Oliveira',
      status: 'Em andamento', percentual: 65,
      caracteristicas: {
        setor: 'Produção', qtdColaboradores: 45, dimensoes: '40x25m',
        peDireito: '8m', pavimento: 'Térreo', paredesVedacao: 'Alvenaria',
        divisoria: 'N/A', piso: 'Concreto industrial', revestimento: 'Pintura epóxi',
        forro: 'Não possui', telhado: 'Metálico', iluminacaoNatural: 'Telhas translúcidas',
        iluminacaoArtificial: 'Lâmpadas LED industriais', ventilacaoNatural: 'Portas laterais',
        ventilacaoArtificial: 'Exaustores eólicos', sistemaIncendio: 'Hidrantes e extintores',
        possibilidadeGES: 'Sim', mobiliarios: 'Bancadas, armários, prateleiras',
        maquinasEquipamentos: 'Prensas, tornos, fresadoras, soldas',
        epis: 'Protetor auditivo (CA 12345), óculos (CA 23456)', epcs: 'Sistema de exaustão',
        imagens: []
      },
      medicoes: [
        { id: 'm1', postoLocal: 'Setor Prensa #1', ruidoDbA: 92, tempoExposicao: '8h', iluminanciaLux: 350, temperatura: 28, umidade: 65, velocidadeAr: 0.3, radiacao: 'N/A', equipamento: 'Decibelímetro Delta OHM', dataHora: hoje, foto: '', observacoes: 'Ruído acima do limite' },
        { id: 'm2', postoLocal: 'Setor Torno #2', ruidoDbA: 88, tempoExposicao: '8h', iluminanciaLux: 400, temperatura: 26, umidade: 60, velocidadeAr: 0.2, radiacao: 'N/A', equipamento: 'Decibelímetro Delta OHM', dataHora: hoje, foto: '', observacoes: '' },
      ],
      colaboradores: [
        { id: 'c1', nome: 'José Santos', cargo: 'Operador de Prensa', setor: 'Produção', posto: 'Prensa #1', descricaoAtividades: 'Operação de prensa hidráulica', observacoes: '', statusColeta: 'Respondido', qrCodeLink: 'https://coleta.riskflow.io/l1-c1' },
        { id: 'c2', nome: 'Antonio Lima', cargo: 'Torneiro Mecânico', setor: 'Produção', posto: 'Torno #2', descricaoAtividades: 'Usinagem de peças metálicas', observacoes: '', statusColeta: 'Pendente', qrCodeLink: 'https://coleta.riskflow.io/l1-c2' },
      ],
      riscos: [
        {
          id: 'r1', categoria: 'Físicos', perigo: 'Ruído contínuo', dano: 'Perda auditiva induzida por ruído (PAIR)',
          severidade: 3, probabilidade: 3, pontuacao: 9, nivel: 'Moderado',
          fonteGeradora: 'Prensas hidráulicas', meioPropagacao: 'Ar',
          tempoExposicao: '8h/dia', situacao: 'Controle insuficiente', avaliacaoQuantitativa: true,
          situacaoEncontrada: 'Níveis acima de 85 dB(A)', controleFonte: 'Enclausuramento acústico',
          controleTrajetoria: 'Barreira acústica', controleTrabalhador: 'Protetor auricular (CA 12345)',
          evidencias: [], observacoes: 'Realizar audiometria'
        },
        {
          id: 'r2', categoria: 'Acidentes/Mecânicos', perigo: 'Máquinas e equipamentos sem proteção', dano: 'Esmagamento, amputação',
          severidade: 5, probabilidade: 2, pontuacao: 10, nivel: 'Alto',
          fonteGeradora: 'Prensa sem sensor de segurança', meioPropagacao: 'N/A',
          tempoExposicao: '8h/dia', situacao: 'Não controlado', avaliacaoQuantitativa: false,
          situacaoEncontrada: 'Prensa sem duplo acionamento e sem proteção', controleFonte: 'Instalação de sensor de segurança NR-12',
          controleTrajetoria: 'Barreira de proteção', controleTrabalhador: 'Treinamento NR-12, LOTO',
          evidencias: [], observacoes: 'Prioridade máxima'
        },
        {
          id: 'r3', categoria: 'Ergonômicos', perigo: 'Postura em pé prolongada', dano: 'Varizes, dores lombares',
          severidade: 2, probabilidade: 4, pontuacao: 8, nivel: 'Moderado',
          fonteGeradora: 'Posto de trabalho sem assento', meioPropagacao: 'N/A',
          tempoExposicao: '8h/dia', situacao: 'Controle insuficiente', avaliacaoQuantitativa: false,
          situacaoEncontrada: 'Operadores em pé durante toda jornada', controleFonte: 'Bancos semi-sentados',
          controleTrajetoria: 'N/A', controleTrabalhador: 'Pausas, ginástica laboral',
          evidencias: [], observacoes: ''
        },
      ],
      controles: [
        { id: 'ct1', riscoId: 'r1', acao: 'Instalar enclausuramento acústico na prensa #1', origem: 'Ruído', tipo: 'fonte', responsavel: 'Engenharia', prazo: '2025-08-30', prioridade: 'Alta', status: 'Pendente', custoEstimado: 'R$ 15.000', observacoes: '' },
        { id: 'ct2', riscoId: 'r2', acao: 'Instalar sensor de segurança e duplo acionamento', origem: 'Máquina sem proteção', tipo: 'fonte', responsavel: 'Manutenção', prazo: '2025-07-15', prioridade: 'Crítica', status: 'Pendente', custoEstimado: 'R$ 8.500', observacoes: 'Atender NR-12' },
        { id: 'ct3', riscoId: 'r3', acao: 'Adquirir bancos semi-sentados para posto operacional', origem: 'Postura', tipo: 'trabalhador', responsavel: 'SST', prazo: '2025-09-15', prioridade: 'Média', status: 'Pendente', custoEstimado: 'R$ 3.200', observacoes: '' },
      ],
      parecer: { texto: '', editado: false },
      assinaturaTecnico: { nomeCompleto: '', cpf: '', dataHora: '', canvasData: '', confirmada: false },
      assinaturaEmpresa: { nomeCompleto: '', cpf: '', dataHora: '', canvasData: '', confirmada: false },
      createdAt: '2025-06-10', updatedAt: hoje
    },
    {
      id: 'l2', tipo: 'AEP', codigo: 'AEP-2025-001',
      empresaId: 'e2', empresaNome: 'Construtora Nova Era Ltda',
      cnpj: '23.456.789/0001-01', unidade: 'Obra Centro', setor: 'Canteiro de Obras',
      responsavelEmpresa: 'Maria Costa', auditorTecnico: 'Ana Oliveira',
      registroMTE: 'MTE 23456', dataLevantamento: '2025-07-05',
      dataLancamentoSGG: '', responsavelLancamento: '',
      status: 'Rascunho', percentual: 20,
      caracteristicas: {
        setor: 'Canteiro de Obras', qtdColaboradores: 35, dimensoes: '30x50m',
        peDireito: 'Aberto', pavimento: 'Térreo + 1º andar', paredesVedacao: 'Alvenaria em execução',
        divisoria: 'N/A', piso: 'Terra batida', revestimento: 'N/A',
        forro: 'Não possui', telhado: 'N/A', iluminacaoNatural: 'Aberto',
        iluminacaoArtificial: 'Holofotes LED', ventilacaoNatural: 'Sim',
        ventilacaoArtificial: 'Não possui', sistemaIncendio: 'Extintores',
        possibilidadeGES: 'Sim', mobiliarios: 'Almoxarifado, vestiários',
        maquinasEquipamentos: 'Betoneira, guincho, serra circular',
        epis: 'Capacete (CA 34567), bota (CA 45678)', epcs: 'Sinalização',
        imagens: []
      },
      medicoes: [],
      colaboradores: [
        { id: 'c3', nome: 'Mário Oliveira', cargo: 'Pedreiro', setor: 'Canteiro', posto: 'Alvenaria', descricaoAtividades: 'Assentamento de blocos', observacoes: '', statusColeta: 'Pendente', qrCodeLink: 'https://coleta.riskflow.io/l2-c3' },
      ],
      riscos: [
        {
          id: 'r4', categoria: 'Acidentes/Mecânicos', perigo: 'Queda de altura', dano: 'Fraturas, traumatismo, óbito',
          severidade: 5, probabilidade: 3, pontuacao: 15, nivel: 'Alto',
          fonteGeradora: 'Trabalho em altura sem proteção', meioPropagacao: 'N/A',
          tempoExposicao: '4h/dia', situacao: 'Não controlado', avaliacaoQuantitativa: false,
          situacaoEncontrada: 'Ausência de guarda-corpo e linha de vida', controleFonte: 'Guarda-corpo, linha de vida, cinto de segurança',
          controleTrajetoria: 'Redes de proteção', controleTrabalhador: 'Cinto de segurança tipo paraquedista (CA), treinamento NR-35',
          evidencias: [], observacoes: 'Adequar à NR-35'
        },
      ],
      controles: [
        { id: 'ct4', riscoId: 'r4', acao: 'Instalar guarda-corpo e linha de vida', origem: 'Queda', tipo: 'fonte', responsavel: 'Engenharia', prazo: '2025-08-01', prioridade: 'Crítica', status: 'Pendente', custoEstimado: 'R$ 12.000', observacoes: '' },
      ],
      parecer: { texto: '', editado: false },
      assinaturaTecnico: { nomeCompleto: '', cpf: '', dataHora: '', canvasData: '', confirmada: false },
      assinaturaEmpresa: { nomeCompleto: '', cpf: '', dataHora: '', canvasData: '', confirmada: false },
      createdAt: '2025-07-05', updatedAt: hoje
    },
    {
      id: 'l3', tipo: 'LPP', codigo: 'LPP-2025-001',
      empresaId: 'e3', empresaNome: 'Indústria Química Sul Ltda',
      cnpj: '34.567.890/0001-12', unidade: 'Matriz', setor: 'Produção Química',
      responsavelEmpresa: 'Roberto Almeida', auditorTecnico: 'Carlos Silva',
      registroMTE: 'MTE 34567', dataLevantamento: '2025-08-01',
      dataLancamentoSGG: '2025-08-10', responsavelLancamento: 'Ana Oliveira',
      status: 'Concluído', percentual: 100,
      caracteristicas: {
        setor: 'Produção Química', qtdColaboradores: 25, dimensoes: '50x30m',
        peDireito: '12m', pavimento: 'Térreo', paredesVedacao: 'Alvenaria com revestimento epóxi',
        divisoria: 'N/A', piso: 'Concreto com revestimento químico', revestimento: 'Epóxi',
        forro: 'Não possui', telhado: 'Metálico', iluminacaoNatural: 'Telhas translúcidas',
        iluminacaoArtificial: 'Lâmpadas LED à prova de explosão', ventilacaoNatural: 'Portas laterais',
        ventilacaoArtificial: 'Sistema de exaustão química', sistemaIncendio: 'Sprinklers, extintores CO2',
        possibilidadeGES: 'Sim', mobiliarios: 'Bancadas inox, armários químicos',
        maquinasEquipamentos: 'Reatores, bombas, tanques de mistura',
        epis: 'Respirador (CA 56789), luva química (CA 67890)', epcs: 'Chuveiro de emergência, lava-olhos',
        imagens: []
      },
      medicoes: [
        { id: 'm3', postoLocal: 'Setor Reatores', ruidoDbA: 78, tempoExposicao: '6h', iluminanciaLux: 450, temperatura: 24, umidade: 55, velocidadeAr: 0.4, radiacao: 'N/A', equipamento: 'Multímetro ambiental', dataHora: hoje, foto: '', observacoes: '' },
      ],
      colaboradores: [
        { id: 'c4', nome: 'Fábio Souza', cargo: 'Operador Químico', setor: 'Produção', posto: 'Reator #1', descricaoAtividades: 'Operação de reatores químicos', observacoes: '', statusColeta: 'Validado', qrCodeLink: 'https://coleta.riskflow.io/l3-c4' },
      ],
      riscos: [
        {
          id: 'r5', categoria: 'Químicos', perigo: 'Produtos químicos (solventes, ácidos, álcalis)', dano: 'Dermatites, intoxicação, queimaduras químicas',
          severidade: 4, probabilidade: 3, pontuacao: 12, nivel: 'Alto',
          fonteGeradora: 'Reatores e tubulações', meioPropagacao: 'Ar, contato',
          tempoExposicao: '6h/dia', situacao: 'Controlado', avaliacaoQuantitativa: true,
          situacaoEncontrada: 'Manuseio de produtos perigosos com controle existente',
          controleFonte: 'Automação de processos', controleTrajetoria: 'Exaustão química',
          controleTrabalhador: 'EPI químico, treinamento', evidencias: [], observacoes: 'Manter controles existentes'
        },
      ],
      controles: [
        { id: 'ct5', riscoId: 'r5', acao: 'Manter sistema de exaustão e EPIs verificados', origem: 'Produtos químicos', tipo: 'trajetória', responsavel: 'SST', prazo: '2025-12-31', prioridade: 'Média', status: 'Concluído', custoEstimado: 'R$ 0', observacoes: 'Já implementado' },
      ],
      parecer: { texto: 'Após análise técnica do setor de Produção Química da Indústria Química Sul Ltda, foram identificados riscos químicos controlados. Recomenda-se a manutenção dos controles existentes e a realização de monitoramento ambiental semestral.', editado: false },
      assinaturaTecnico: { nomeCompleto: 'Carlos Silva', cpf: '123.456.789-00', dataHora: hoje, canvasData: '', confirmada: true },
      assinaturaEmpresa: { nomeCompleto: 'Roberto Almeida', cpf: '987.654.321-00', dataHora: hoje, canvasData: '', confirmada: true },
      createdAt: '2025-08-01', updatedAt: hoje
    },
  ]
}
