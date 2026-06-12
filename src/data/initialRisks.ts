import { Risco } from '@/types'

export const bibliotecaRiscos: Omit<Risco, 'id'>[] = [
  {
    categoria: 'Físicos', perigo: 'Ruído contínuo', dano: 'Perda auditiva induzida por ruído (PAIR), estresse, fadiga',
    severidade: 3, probabilidade: 3, pontuacao: 9, nivel: 'Moderado',
    fonteGeradora: 'Máquinas, equipamentos, ferramentas pneumáticas', meioPropagacao: 'Ar',
    tempoExposicao: 'Jornada completa', situacao: 'Controle insuficiente', avaliacaoQuantitativa: true,
    situacaoEncontrada: 'Níveis acima de 85 dB(A) em setor produtivo',
    controleFonte: 'Enclausuramento acústico, manutenção preventiva', controleTrajetoria: 'Barreiras acústicas, tratamento acústico',
    controleTrabalhador: 'EPI auditivo (CA), treinamento', evidencias: [], observacoes: 'Realizar audiometria periódica'
  },
  {
    categoria: 'Físicos', perigo: 'Calor', dano: 'Desidratação, fadiga térmica, estresse térmico, queimaduras',
    severidade: 3, probabilidade: 3, pontuacao: 9, nivel: 'Moderado',
    fonteGeradora: 'Fornos, caldeiras, ambiente externo', meioPropagacao: 'Ar, radiação',
    tempoExposicao: 'Jornada parcial', situacao: 'Controle insuficiente', avaliacaoQuantitativa: true,
    situacaoEncontrada: 'Temperatura acima do limite de tolerância',
    controleFonte: 'Isolamento térmico, ventilação exaustora', controleTrajetoria: 'Ventilação geral, barreiras refletivas',
    controleTrabalhador: 'Hidratação, pausas, EPI adequado', evidencias: [], observacoes: 'Avaliar IBUTG'
  },
  {
    categoria: 'Físicos', perigo: 'Iluminação inadequada', dano: 'Fadiga visual, ofuscamento, acidentes, desconforto',
    severidade: 2, probabilidade: 3, pontuacao: 6, nivel: 'Moderado',
    fonteGeradora: 'Luminárias inadequadas, falta de manutenção', meioPropagacao: 'Luz',
    tempoExposicao: 'Jornada completa', situacao: 'Controle insuficiente', avaliacaoQuantitativa: true,
    situacaoEncontrada: 'Iluminância abaixo do recomendado pela NBR 5413',
    controleFonte: 'Luminárias adequadas, complementação', controleTrajetoria: 'Refletores, distribuição uniforme',
    controleTrabalhador: 'Pausas, exame oftalmológico', evidencias: [], observacoes: 'Conforme NBR 5413'
  },
  {
    categoria: 'Químicos', perigo: 'Poeiras minerais', dano: 'Pneumoconioses, silicose, fibrose pulmonar',
    severidade: 4, probabilidade: 3, pontuacao: 12, nivel: 'Alto',
    fonteGeradora: 'Processos de britagem, moagem, corte', meioPropagacao: 'Ar',
    tempoExposicao: 'Jornada parcial', situacao: 'Controle insuficiente', avaliacaoQuantitativa: true,
    situacaoEncontrada: 'Geração de poeira em operações de corte',
    controleFonte: 'Aspiração localizada, ventilação exaustora, processo úmido', controleTrajetoria: 'Enclausuramento, barreiras',
    controleTrabalhador: 'Respirador adequado (CA), treinamento', evidencias: [], observacoes: 'Realizar monitoramento ambiental'
  },
  {
    categoria: 'Químicos', perigo: 'Produtos químicos (solventes, ácidos, álcalis)', dano: 'Dermatites, intoxicação, queimaduras químicas, danos ao SNC',
    severidade: 4, probabilidade: 3, pontuacao: 12, nivel: 'Alto',
    fonteGeradora: 'Processos de limpeza, pintura, laboratório', meioPropagacao: 'Ar, contato, ingestão',
    tempoExposicao: 'Jornada parcial', situacao: 'Controlado', avaliacaoQuantitativa: true,
    situacaoEncontrada: 'Manuseio de produtos químicos sem FISPQ disponível',
    controleFonte: 'Substituição por produto menos nocivo, automação', controleTrajetoria: 'Exaustão, ventilação',
    controleTrabalhador: 'EPI químico (CA), treinamento, FISPQ', evidencias: [], observacoes: 'Exigir FISPQ de todos os produtos'
  },
  {
    categoria: 'Biológicos', perigo: 'Agentes biológicos (bactérias, vírus, fungos)', dano: 'Infecções, doenças ocupacionais, alergias',
    severidade: 4, probabilidade: 2, pontuacao: 8, nivel: 'Moderado',
    fonteGeradora: 'Material biológico, contato com pessoas/animais', meioPropagacao: 'Ar, contato, vetores',
    tempoExposicao: 'Jornada parcial', situacao: 'Controlado', avaliacaoQuantitativa: false,
    situacaoEncontrada: 'Exposição potencial a agentes biológicos',
    controleFonte: 'Autoclave, desinfecção, procedimentos operacionais', controleTrajetoria: 'Barreiras físicas, ventilação',
    controleTrabalhador: 'EPI, vacinação, treinamento', evidencias: [], observacoes: 'Manter programa de vacinação atualizado'
  },
  {
    categoria: 'Ergonômicos', perigo: 'Postura em pé prolongada', dano: 'Varizes, dores lombares, fadiga, problemas circulatórios',
    severidade: 2, probabilidade: 4, pontuacao: 8, nivel: 'Moderado',
    fonteGeradora: 'Posto de trabalho sem assento, processo produtivo', meioPropagacao: 'N/A',
    tempoExposicao: 'Jornada completa', situacao: 'Controle insuficiente', avaliacaoQuantitativa: false,
    situacaoEncontrada: 'Trabalhadores permanecem em pé durante toda jornada',
    controleFonte: 'Redesenho do posto, rodízio de tarefas', controleTrajetoria: 'N/A',
    controleTrabalhador: 'Pausas, ginástica laboral, calçado adequado', evidencias: [], observacoes: 'Avaliar necessidade de assentos'
  },
  {
    categoria: 'Biomecânicos', perigo: 'Levantamento manual de cargas', dano: 'Lombalgia, hérnia de disco, lesões musculares',
    severidade: 3, probabilidade: 4, pontuacao: 12, nivel: 'Alto',
    fonteGeradora: 'Movimentação de materiais, estoque', meioPropagacao: 'N/A',
    tempoExposicao: 'Jornada parcial', situacao: 'Controle insuficiente', avaliacaoQuantitativa: false,
    situacaoEncontrada: 'Levantamento de cargas acima de 25 kg sem auxílio',
    controleFonte: 'Carros hidráulicos, paleteiras, talhas, esteiras', controleTrajetoria: 'N/A',
    controleTrabalhador: 'Treinamento de biomecânica, rodízio, pausas', evidencias: [], observacoes: 'Aplicar equação NIOSH'
  },
  {
    categoria: 'Biomecânicos', perigo: 'Movimentos repetitivos', dano: 'LER/DORT, tendinite, síndrome do túnel do carpo',
    severidade: 3, probabilidade: 4, pontuacao: 12, nivel: 'Alto',
    fonteGeradora: 'Linha de produção, digitação, montagem', meioPropagacao: 'N/A',
    tempoExposicao: 'Jornada completa', situacao: 'Controle insuficiente', avaliacaoQuantitativa: false,
    situacaoEncontrada: 'Ciclo repetitivo inferior a 30 segundos',
    controleFonte: 'Automação, rodízio, ferramentas adequadas', controleTrajetoria: 'N/A',
    controleTrabalhador: 'Pausas, ginástica laboral, adequação ergonômica', evidencias: [], observacoes: 'Aplicar metodologia OCRA'
  },
  {
    categoria: 'Acidentes/Mecânicos', perigo: 'Queda de mesmo nível', dano: 'Contusões, fraturas, torções, escoriações',
    severidade: 2, probabilidade: 3, pontuacao: 6, nivel: 'Moderado',
    fonteGeradora: 'Piso irregular, obstáculos, superfície molhada', meioPropagacao: 'N/A',
    tempoExposicao: 'Jornada completa', situacao: 'Controle insuficiente', avaliacaoQuantitativa: false,
    situacaoEncontrada: 'Piso com desníveis e presença de cabos',
    controleFonte: 'Piso antiderrapante, sinalização, organização', controleTrajetoria: 'N/A',
    controleTrabalhador: 'Calçado adequado (CA), treinamento', evidencias: [], observacoes: 'Manter 5S'
  },
  {
    categoria: 'Acidentes/Mecânicos', perigo: 'Choque elétrico', dano: 'Queimaduras, parada cardíaca, óbito',
    severidade: 5, probabilidade: 2, pontuacao: 10, nivel: 'Alto',
    fonteGeradora: 'Quadros elétricos, equipamentos sem aterramento', meioPropagacao: 'Eletricidade',
    tempoExposicao: 'Jornada parcial', situacao: 'Controlado', avaliacaoQuantitativa: false,
    situacaoEncontrada: 'Instalações elétricas sem proteção diferencial',
    controleFonte: 'Aterramento, DR, disjuntores, NR-10', controleTrajetoria: 'Isolamento, barreiras',
    controleTrabalhador: 'EPI elétrico (CA), treinamento NR-10', evidencias: [], observacoes: 'Atender NR-10'
  },
  {
    categoria: 'Acidentes/Mecânicos', perigo: 'Máquinas e equipamentos sem proteção', dano: 'Esmagamento, amputação, laceração, óbito',
    severidade: 5, probabilidade: 3, pontuacao: 15, nivel: 'Alto',
    fonteGeradora: 'Máquinas sem dispositivos de segurança', meioPropagacao: 'N/A',
    tempoExposicao: 'Jornada parcial', situacao: 'Não controlado', avaliacaoQuantitativa: false,
    situacaoEncontrada: 'Prensa sem sensor de segurança e sem duplo acionamento',
    controleFonte: 'Dispositivos de segurança, enclausuramento, NR-12', controleTrajetoria: 'Barreiras, zona de segurança',
    controleTrabalhador: 'Treinamento NR-12, procedimentos bloqueio/etiquetagem', evidencias: [], observacoes: 'Adequar à NR-12'
  },
  {
    categoria: 'Organizacionais', perigo: 'Demandas cognitivas elevadas', dano: 'Estresse, fadiga mental, erro humano',
    severidade: 2, probabilidade: 3, pontuacao: 6, nivel: 'Moderado',
    fonteGeradora: 'Multitarefa, pressão por resultados, complexidade', meioPropagacao: 'N/A',
    tempoExposicao: 'Jornada completa', situacao: 'Controle insuficiente', avaliacaoQuantitativa: false,
    situacaoEncontrada: 'Alta demanda de atenção com múltiplas tarefas simultâneas',
    controleFonte: 'Redesenho de processos, pausas programadas', controleTrajetoria: 'N/A',
    controleTrabalhador: 'Treinamento, organização do trabalho', evidencias: [], observacoes: 'Avaliar carga mental'
  },
  {
    categoria: 'Psicossociais/Cognitivos', perigo: 'Pressão de tempo', dano: 'Estresse, ansiedade, burnout, absenteísmo',
    severidade: 3, probabilidade: 3, pontuacao: 9, nivel: 'Moderado',
    fonteGeradora: 'Metas agressivas, prazos curtos', meioPropagacao: 'N/A',
    tempoExposicao: 'Jornada completa', situacao: 'Controle insuficiente', avaliacaoQuantitativa: false,
    situacaoEncontrada: 'Cobrança excessiva por produtividade',
    controleFonte: 'Planejamento realista, redistribuição de tarefas', controleTrajetoria: 'N/A',
    controleTrabalhador: 'Acompanhamento psicológico, feedback', evidencias: [], observacoes: 'Avaliar clima organizacional'
  },
  {
    categoria: 'Psicossociais/Cognitivos', perigo: 'Baixa autonomia', dano: 'Desmotivação, frustração, baixa produtividade',
    severidade: 2, probabilidade: 3, pontuacao: 6, nivel: 'Moderado',
    fonteGeradora: 'Gestão centralizadora, falta de participação', meioPropagacao: 'N/A',
    tempoExposicao: 'Jornada completa', situacao: 'Controlado', avaliacaoQuantitativa: false,
    situacaoEncontrada: 'Trabalhadores sem autonomia para decisões',
    controleFonte: 'Gestão participativa, delegação', controleTrajetoria: 'N/A',
    controleTrabalhador: 'Capacitação, empowerment', evidencias: [], observacoes: 'Programa de desenvolvimento de lideranças'
  },
  {
    categoria: 'Psicossociais/Cognitivos', perigo: 'Conflitos interpessoais', dano: 'Estresse, violência psicológica, absenteísmo',
    severidade: 2, probabilidade: 2, pontuacao: 4, nivel: 'Baixo',
    fonteGeradora: 'Comunicação ineficaz, assédio moral', meioPropagacao: 'N/A',
    tempoExposicao: 'Jornada parcial', situacao: 'Controlado', avaliacaoQuantitativa: false,
    situacaoEncontrada: 'Relatos de conflitos entre equipes',
    controleFonte: 'Mediação, código de conduta, canal de denúncias', controleTrajetoria: 'N/A',
    controleTrabalhador: 'Treinamento de comunicação não violenta', evidencias: [], observacoes: 'Implementar canal de denúncias'
  },
]
