-- Efetiva RiskFlow - Biblioteca Tecnica
-- Migration 00003: Catalogo centralizado de itens tecnicos (riscos, EPIs, EPCs, etc.)

-- ============================================================
-- 0. Funcao de trigger (reutiliza se ja existe)
-- ============================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================
-- 1. Tabela: biblioteca_tecnica
-- ============================================================
create table if not exists public.biblioteca_tecnica (
  id uuid primary key default gen_random_uuid(),
  categoria text not null,
  nome text not null,
  descricao text,
  tipo text,
  grupo text,
  unidade text,
  codigo text,
  norma_referencia text,
  aplicacao text,
  observacoes text,
  tags text[] not null default '{}',
  metadados jsonb not null default '{}'::jsonb,
  ativo boolean not null default true,
  is_padrao boolean not null default false,
  created_by uuid references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint bt_categoria_not_empty check (trim(categoria) <> ''),
  constraint bt_nome_not_empty check (trim(nome) <> ''),
  constraint bt_padrao_created_by_check check (
    (is_padrao = true and created_by is null) or
    (is_padrao = false and created_by = auth.uid())
  )
);

-- Impedir duplicidade entre itens padrao (case-insensitive)
create unique index if not exists idx_bt_nome_padrao
  on public.biblioteca_tecnica (categoria, lower(nome)) where is_padrao = true and created_by is null;

-- Impedir duplicidade por usuario (case-insensitive)
create unique index if not exists idx_bt_nome_usuario
  on public.biblioteca_tecnica (categoria, created_by, lower(nome)) where is_padrao = false and created_by is not null;

-- Indices de performance
create index if not exists idx_bt_categoria on public.biblioteca_tecnica (categoria);
create index if not exists idx_bt_ativo on public.biblioteca_tecnica (ativo);
create index if not exists idx_bt_created_by on public.biblioteca_tecnica (created_by);
create index if not exists idx_bt_lower_nome on public.biblioteca_tecnica (lower(nome));
create index if not exists idx_bt_tags on public.biblioteca_tecnica using gin (tags);
create index if not exists idx_bt_metadados on public.biblioteca_tecnica using gin (metadados);

alter table if exists public.biblioteca_tecnica enable row level security;

-- ============================================================
-- 2. RLS Policies
-- ============================================================

do $$ begin
  drop policy if exists "bt_select_own_and_padrao" on public.biblioteca_tecnica;
  create policy "bt_select_own_and_padrao" on public.biblioteca_tecnica
    for select using (
      auth.role() = 'authenticated'
      and (
        (is_padrao = true and created_by is null)
        or created_by = auth.uid()
      )
    );
end $$;

do $$ begin
  drop policy if exists "bt_insert_own" on public.biblioteca_tecnica;
  create policy "bt_insert_own" on public.biblioteca_tecnica
    for insert with check (
      auth.role() = 'authenticated'
      and created_by = auth.uid()
      and is_padrao = false
    );
end $$;

do $$ begin
  drop policy if exists "bt_update_own" on public.biblioteca_tecnica;
  create policy "bt_update_own" on public.biblioteca_tecnica
    for update using (
      auth.role() = 'authenticated'
      and created_by = auth.uid()
      and is_padrao = false
    );
end $$;

-- Sem DELETE fisico — desativacao logica via ativo=false

-- ============================================================
-- 3. Trigger updated_at
-- ============================================================
drop trigger if exists trg_bt_updated_at on public.biblioteca_tecnica;
create trigger trg_bt_updated_at
  before update on public.biblioteca_tecnica
  for each row execute function public.set_updated_at();

-- ============================================================
-- 4. Permissoes de tabela
-- ============================================================
grant select, insert, update on public.biblioteca_tecnica to authenticated;
revoke all on public.biblioteca_tecnica from anon;

-- ============================================================
-- 5. Seeds: Itens padrao iniciais
-- ============================================================

-- Helper: insert idempotente
do language plpgsql $$
begin

-- -------------------------------------------------------
-- 5.1 RISCOS
-- -------------------------------------------------------
insert into public.biblioteca_tecnica (categoria, nome, descricao, tipo, grupo, is_padrao)
select 'risco', nome, descricao, tipo, grupo, true from (values
  -- Fisicos
  ('Ruído', 'Exposição a níveis sonoros elevados que podem causar danos auditivos e extra-auditivos', 'Físico', 'Ruído'),
  ('Calor', 'Exposição ao calor excessivo gerando estresse térmico e fadiga', 'Físico', 'Térmico'),
  ('Frio', 'Exposição ao frio intenso podendo causar hipotermia e lesões', 'Físico', 'Térmico'),
  ('Vibração de corpo inteiro', 'Vibração transmitida a todo o corpo, comum em operação de veículos e máquinas', 'Físico', 'Vibração'),
  ('Vibração de mãos e braços', 'Vibração localizada transmitida pelas mãos ao usar ferramentas vibratórias', 'Físico', 'Vibração'),
  ('Radiações ionizantes', 'Exposição a radiações como raios-X, gama e partículas alfa/beta', 'Físico', 'Radiação'),
  ('Radiações não ionizantes', 'Exposição a radiações como ultravioleta, infravermelho, micro-ondas', 'Físico', 'Radiação'),
  ('Umidade', 'Exposição a ambientes úmidos ou atividades com água', 'Físico', 'Térmico'),
  ('Pressões anormais', 'Trabalho em ambientes com pressão atmosférica alterada', 'Físico', 'Pressão'),
  ('Iluminação inadequada', 'Níveis insuficientes ou excessivos de iluminação no ambiente', 'Físico', 'Iluminação'),
  ('Ventilação inadequada', 'Circulação de ar insuficiente ou inadequada no ambiente', 'Físico', 'Ventilação'),
  -- Quimicos
  ('Poeiras minerais', 'Partículas sólidas minerais suspensas no ar', 'Químico', 'Poeiras'),
  ('Poeiras vegetais', 'Partículas sólidas de origem vegetal suspensas no ar', 'Químico', 'Poeiras'),
  ('Fumos metálicos', 'Partículas metálicas resultantes de processos de fusão e solda', 'Químico', 'Fumos'),
  ('Névoas', 'Gotículas líquidas suspensas no ar geradas por processos de aspersão', 'Químico', 'Aerossóis'),
  ('Neblinas', 'Partículas líquidas finamente dispersas no ar', 'Químico', 'Aerossóis'),
  ('Gases', 'Substâncias no estado gasoso com potencial tóxico ou asfixiante', 'Químico', 'Gases'),
  ('Vapores orgânicos', 'Vapores de solventes e compostos orgânicos voláteis', 'Químico', 'Vapores'),
  ('Produtos saneantes', 'Produtos de limpeza e desinfecção com agentes químicos', 'Químico', 'Produtos químicos'),
  ('Solventes', 'Substâncias utilizadas para dissolução que podem causar danos à saúde', 'Químico', 'Produtos químicos'),
  ('Óleos e graxas', 'Lubrificantes e graxas com potencial de contato dérmico e ingestão', 'Químico', 'Produtos químicos'),
  ('Hidrocarbonetos', 'Compostos derivados de petróleo com potencial cancerígeno', 'Químico', 'Produtos químicos'),
  ('Ácidos', 'Substâncias ácidas corrosivas com alto potencial de dano', 'Químico', 'Produtos químicos'),
  ('Álcalis', 'Bases fortes corrosivas que podem causar queimaduras químicas', 'Químico', 'Produtos químicos'),
  ('Agrotóxicos', 'Defensivos agrícolas com alto potencial tóxico', 'Químico', 'Produtos químicos'),
  ('Sílica livre cristalina', 'Partículas de sílica cristalina causadoras de silicose', 'Químico', 'Poeiras'),
  ('Fibras respiráveis', 'Fibras minerais ou sintéticas inaláveis com potencial cancerígeno', 'Químico', 'Fibras'),
  -- Biologicos
  ('Vírus', 'Agentes virais com potencial de infecção e transmissão', 'Biológico', 'Micro-organismos'),
  ('Bactérias', 'Micro-organismos bacterianos com potencial de infecção', 'Biológico', 'Micro-organismos'),
  ('Fungos', ' Micro-organismos fúngicos que podem causar alergias e infecções', 'Biológico', 'Micro-organismos'),
  ('Parasitas', 'Organismos parasitas com potencial de infestação', 'Biológico', 'Parasitas'),
  ('Protozoários', 'Micro-organismos protozoários causadores de doenças', 'Biológico', 'Micro-organismos'),
  ('Material biológico', 'Exposição a fluidos e tecidos biológicos', 'Biológico', 'Material biológico'),
  ('Sangue e fluidos corporais', 'Contato com sangue e fluidos corporais com risco de contaminação', 'Biológico', 'Material biológico'),
  ('Resíduos orgânicos', 'Manuseio de resíduos orgânicos com potencial biológico', 'Biológico', 'Resíduos'),
  ('Animais peçonhentos', 'Animais peçonhentos como serpentes, escorpiões e aranhas', 'Biológico', 'Animais'),
  ('Vetores transmissores', 'Insetos e animais transmissores de doenças', 'Biológico', 'Vetores'),
  -- Ergonomicos
  ('Postura em pé prolongada', 'Permanência em posição ortostática por longos períodos', 'Ergonômico', 'Postura'),
  ('Postura sentada prolongada', 'Permanência sentado por longos períodos sem variação postural', 'Ergonômico', 'Postura'),
  ('Flexão de tronco', 'Flexão repetitiva ou mantida do tronco durante atividades', 'Ergonômico', 'Postura'),
  ('Torção de tronco', 'Movimentos de torção do tronco durante tarefas', 'Ergonômico', 'Postura'),
  ('Alcance excessivo', 'Necessidade de alcance além da zona de conforto', 'Ergonômico', 'Movimento'),
  ('Levantamento manual de cargas', 'Levantamento de cargas de forma manual sem auxílio mecânico', 'Ergonômico', 'Manuseio de cargas'),
  ('Transporte manual de cargas', 'Transporte de cargas manualmente por distâncias', 'Ergonômico', 'Manuseio de cargas'),
  ('Empurrar ou puxar cargas', 'Força exercida para movimentar cargas horizontalmente', 'Ergonômico', 'Manuseio de cargas'),
  ('Movimentos repetitivos', 'Ciclos de movimento repetitivos com alta frequência', 'Ergonômico', 'Movimento'),
  ('Sobrecarga de membros superiores', 'Esforço excessivo dos membros superiores em tarefas', 'Ergonômico', 'Sobrecarga'),
  ('Sobrecarga lombar', 'Esforço excessivo da região lombar durante atividades', 'Ergonômico', 'Sobrecarga'),
  ('Trabalho em ritmo intenso', 'Ritmo de trabalho acelerado sem pausas adequadas', 'Ergonômico', 'Organizacional'),
  ('Mobiliário inadequado', 'Móveis e equipamentos não ajustados ao trabalhador', 'Ergonômico', 'Mobiliário'),
  -- Psicossociais
  ('Sobrecarga de trabalho', 'Volume excessivo de tarefas além da capacidade do trabalhador', 'Psicossocial', 'Organizacional'),
  ('Baixa autonomia', 'Falta de controle sobre o próprio trabalho e decisões', 'Psicossocial', 'Organizacional'),
  ('Conflitos interpessoais', 'Relações conflituosas entre colegas e lideranças', 'Psicossocial', 'Relacional'),
  ('Assédio moral', 'Conduta abusiva com humilhação e constrangimento repetitivos', 'Psicossocial', 'Relacional'),
  ('Assédio sexual', 'Condutas de conotação sexual não consentidas no ambiente de trabalho', 'Psicossocial', 'Relacional'),
  ('Violência no trabalho', 'Atos de agressão física ou verbal no ambiente laboral', 'Psicossocial', 'Relacional'),
  ('Exigências emocionais elevadas', 'Demanda emocional intensa no contato com público ou situações críticas', 'Psicossocial', 'Emocional'),
  ('Comunicação deficiente', 'Falhas na comunicação entre equipes e lideranças', 'Psicossocial', 'Organizacional'),
  ('Falta de apoio da liderança', 'Ausência de suporte e feedback por parte dos superiores', 'Psicossocial', 'Organizacional'),
  ('Jornada excessiva', 'Horas extras frequentes além da jornada regular', 'Psicossocial', 'Organizacional'),
  ('Trabalho em turnos', 'Trabalho em horários noturnos ou alternados afetando o ciclo circadiano', 'Psicossocial', 'Organizacional'),
  ('Monotonia', 'Tarefas repetitivas e monótonas sem variação', 'Psicossocial', 'Organizacional'),
  ('Pressão por metas', 'Cobrança excessiva por cumprimento de metas e resultados', 'Psicossocial', 'Organizacional'),
  -- Acidentes/Mecanicos
  ('Queda de mesmo nível', 'Queda no mesmo plano devido a piso escorregadio ou obstáculos', 'Acidente/Mecânico', 'Queda'),
  ('Queda de nível diferente', 'Queda de altura entre planos diferentes', 'Acidente/Mecânico', 'Queda'),
  ('Queda de objetos', 'Objetos que caem de altura sobre o trabalhador', 'Acidente/Mecânico', 'Impacto'),
  ('Projeção de partículas', 'Partículas lançadas durante processos como esmeril e corte', 'Acidente/Mecânico', 'Impacto'),
  ('Cortes e perfurações', 'Ferimentos causados por objetos cortantes ou perfurantes', 'Acidente/Mecânico', 'Contato'),
  ('Prensagem/esmagamento', 'Partes do corpo prensadas entre superfícies ou máquinas', 'Acidente/Mecânico', 'Contato'),
  ('Aprisionamento', 'Trabalhador preso em máquinas ou entre objetos', 'Acidente/Mecânico', 'Contato'),
  ('Atropelamento', 'Atropelamento por veículos internos ou externos', 'Acidente/Mecânico', 'Impacto'),
  ('Colisão', 'Choque entre veículos, pessoas ou objetos', 'Acidente/Mecânico', 'Impacto'),
  ('Choque elétrico', 'Passagem de corrente elétrica pelo corpo', 'Acidente/Mecânico', 'Elétrico'),
  ('Arco elétrico', 'Descarga elétrica através do ar causando queimaduras', 'Acidente/Mecânico', 'Elétrico'),
  ('Incêndio', 'Fogo descontrolado com danos materiais e pessoais', 'Acidente/Mecânico', 'Incêndio'),
  ('Explosão', 'Liberação violenta de energia com ondas de choque', 'Acidente/Mecânico', 'Explosão'),
  ('Soterramento', 'Cobertura por terra, areia ou materiais desabados', 'Acidente/Mecânico', 'Impacto'),
  ('Afogamento', 'Aspiração de líquidos causando asfixia', 'Acidente/Mecânico', 'Submersão'),
  ('Ataque de animais', 'Ataques por animais no ambiente de trabalho', 'Acidente/Mecânico', 'Animais'),
  ('Picada de animais peçonhentos', 'Picadas de animais venenosos', 'Acidente/Mecânico', 'Animais'),
  ('Queimadura por contato', 'Queimadura ao tocar superfícies quentes', 'Acidente/Mecânico', 'Térmico'),
  ('Queimadura química', 'Queimadura causada por produtos químicos corrosivos', 'Acidente/Mecânico', 'Químico'),
  ('Trabalho em altura', 'Atividades realizadas acima de 2m do nível inferior', 'Acidente/Mecânico', 'Altura'),
  ('Espaço confinado', 'Área com ventilação limitada e riscos de atmosfera perigosa', 'Acidente/Mecânico', 'Confinado'),
  ('Movimentação de máquinas', 'Operação de máquinas com partes móveis expostas', 'Acidente/Mecânico', 'Máquinas'),
  ('Trânsito interno de veículos', 'Circulação de veículos dentro das instalações', 'Acidente/Mecânico', 'Veículos')
) v(nome, descricao, tipo, grupo)
where not exists (
  select 1 from public.biblioteca_tecnica bt
  where bt.categoria = 'risco' and bt.is_padrao = true and lower(bt.nome) = lower(v.nome)
);

-- -------------------------------------------------------
-- 5.2 PERIGOS / FATORES DE RISCO
-- -------------------------------------------------------
insert into public.biblioteca_tecnica (categoria, nome, descricao, tipo, grupo, is_padrao)
select 'perigo_fator', nome, descricao, tipo, grupo, true from (values
  ('Máquina sem proteção', 'Máquina operando sem dispositivo de segurança', 'Mecânico', 'Máquinas'),
  ('Parte móvel exposta', 'Componentes móveis de máquinas sem proteção adequada', 'Mecânico', 'Máquinas'),
  ('Piso escorregadio', 'Superfície de piso com baixa aderência', 'Ambiental', 'Piso'),
  ('Piso irregular', 'Superfície com desníveis e irregularidades', 'Ambiental', 'Piso'),
  ('Área sem sinalização', 'Local sem sinalização de segurança adequada', 'Ambiental', 'Sinalização'),
  ('Acesso obstruído', 'Via de acesso bloqueada por materiais ou equipamentos', 'Ambiental', 'Organização'),
  ('Iluminação insuficiente', 'Nível de iluminância abaixo do recomendado', 'Ambiental', 'Iluminação'),
  ('Ventilação insuficiente', 'Renovação de ar inadequada no ambiente', 'Ambiental', 'Ventilação'),
  ('Instalação elétrica danificada', 'Fiação ou equipamentos elétricos com danos visíveis', 'Elétrico', 'Instalação'),
  ('Cabo elétrico exposto', 'Condutores elétricos sem isolamento adequado', 'Elétrico', 'Instalação'),
  ('Tomada sobrecarregada', 'Uso excessivo de equipamentos na mesma tomada', 'Elétrico', 'Instalação'),
  ('Ferramenta manual inadequada', 'Ferramenta em más condições ou inadequada para a tarefa', 'Mecânico', 'Ferramentas'),
  ('Ferramenta elétrica sem proteção', 'Ferramenta elétrica com dispositivo de segurança ausente', 'Mecânico', 'Ferramentas'),
  ('Produto químico sem identificação', 'Recipiente sem rotulagem adequada', 'Químico', 'Armazenamento'),
  ('Armazenamento inadequado de químicos', 'Produtos químicos armazenados em locais inadequados', 'Químico', 'Armazenamento'),
  ('Falta de FISPQ/FDS', 'Ficha de informação de segurança para produtos químicos ausente', 'Químico', 'Documentação'),
  ('Recipiente sem rotulagem', 'Embalagens sem identificação do conteúdo', 'Químico', 'Armazenamento'),
  ('Poeira em suspensão', 'Partículas sólidas dispersas no ar', 'Ambiental', 'Poeira'),
  ('Ruído de máquinas', 'Nível de ruído gerado por máquinas em operação', 'Físico', 'Ruído'),
  ('Superfície quente', 'Superfícies aquecidas que podem causar queimaduras', 'Térmico', 'Calor'),
  ('Chama aberta', 'Presença de chamas desprotegidas no ambiente', 'Incêndio', 'Fonte de ignição'),
  ('Trabalho próximo a veículos', 'Atividades realizadas em áreas com circulação de veículos', 'Mecânico', 'Veículos'),
  ('Carga suspensa', 'Materiais suspensos por equipamentos de içamento', 'Mecânico', 'Içamento'),
  ('Ausência de guarda-corpo', 'Proteção contra quedas em altura ausente', 'Estrutural', 'Proteção coletiva'),
  ('Abertura no piso', 'Aberturas no piso sem proteção adequada', 'Estrutural', 'Piso'),
  ('Escada inadequada', 'Escada em más condições ou inadequada para uso', 'Mecânico', 'Acesso'),
  ('Andaime irregular', 'Andaime montado incorretamente ou sem inspeção', 'Estrutural', 'Trabalho em altura'),
  ('Trabalho em altura sem proteção', 'Atividade em altura sem sistema de proteção contra quedas', 'Mecânico', 'Trabalho em altura'),
  ('Espaço confinado sem controle de entrada', 'Entrada em espaço confinado sem procedimentos de segurança', 'Mecânico', 'Espaço confinado'),
  ('Ausência de bloqueio e etiquetagem', 'Falta de procedimento LOTO para manutenção', 'Elétrico', 'Bloqueio'),
  ('Organização inadequada do posto', 'Posto de trabalho desorganizado', 'Ergonômico', 'Organização'),
  ('Excesso de materiais no posto', 'Acúmulo excessivo de materiais no local de trabalho', 'Ergonômico', 'Organização'),
  ('Mobiliário inadequado', 'Móveis inadequados à atividade ou ao trabalhador', 'Ergonômico', 'Mobiliário'),
  ('Equipamento sem manutenção', 'Equipamento operando sem manutenção preventiva', 'Mecânico', 'Manutenção'),
  ('Extintor vencido', 'Extintor com prazo de validade expirado', 'Incêndio', 'Combate a incêndio'),
  ('Rota de fuga obstruída', 'Caminho de evacuação bloqueado por materiais', 'Incêndio', 'Emergência'),
  ('Sinalização de emergência ausente', 'Placas de emergência e rotas de fuga não sinalizadas', 'Incêndio', 'Sinalização'),
  ('Falta de treinamento', 'Trabalhador sem treinamento adequado para a atividade', 'Organizacional', 'Treinamento'),
  ('Procedimento inexistente', 'Ausência de procedimento escrito para a atividade', 'Organizacional', 'Documentação'),
  ('Supervisão insuficiente', 'Falta de supervisão adequada durante as atividades', 'Organizacional', 'Gestão')
) v(nome, descricao, tipo, grupo)
where not exists (
  select 1 from public.biblioteca_tecnica bt
  where bt.categoria = 'perigo_fator' and bt.is_padrao = true and lower(bt.nome) = lower(v.nome)
);

-- -------------------------------------------------------
-- 5.3 DANOS
-- -------------------------------------------------------
insert into public.biblioteca_tecnica (categoria, nome, descricao, is_padrao)
select 'dano', nome, descricao, true from (values
  ('Perda auditiva induzida por ruído', 'Diminuição da capacidade auditiva decorrente de exposição ao ruído'),
  ('Estresse térmico', 'Sobrecarga do sistema termorregulador por calor ou frio excessivo'),
  ('Queimadura', 'Lesão tecidual causada por calor, frio, químico ou eletricidade'),
  ('Hipotermia', 'Redução da temperatura corporal abaixo do normal'),
  ('Lesão musculoesquelética', 'Dano a músculos, tendões, ligamentos ou articulações'),
  ('Lombalgia', 'Dor na região lombar de origem musculoesquelética'),
  ('Tendinite', 'Inflamação de tendões por esforço repetitivo'),
  ('Dermatite', 'Inflamação da pele causada por agentes químicos ou físicos'),
  ('Intoxicação', 'Envenenamento por absorção de substâncias tóxicas'),
  ('Irritação respiratória', 'Inflamação das vias aéreas por agentes irritantes'),
  ('Asfixia', 'Impedimento da respiração por falta de oxigênio'),
  ('Silicose', 'Doença pulmonar causada pela inalação de sílica cristalina'),
  ('Pneumoconiose', 'Doença pulmonar por acumulo de poeiras minerais'),
  ('Infecção', 'Invasão e multiplicação de micro-organismos no organismo'),
  ('Perfuração', 'Ferimento penetrante causado por objeto pontiagudo'),
  ('Corte', 'Ferimento com separação de tecidos por objeto cortante'),
  ('Fratura', 'Quebra ou fissura de osso'),
  ('Entorse', 'Lesão ligamentar por torção articular'),
  ('Contusão', 'Lesão por impacto sem rompimento da pele'),
  ('Esmagamento', 'Lesão por compressão intensa de tecidos'),
  ('Amputação', 'Remoção traumática de membro ou parte dele'),
  ('Choque elétrico', 'Passagem de corrente elétrica pelo corpo'),
  ('Parada cardiorrespiratória', 'Cessação dos batimentos cardíacos e respiração'),
  ('Queda com lesão grave', 'Queda resultando em lesões significativas'),
  ('Trauma craniano', 'Lesão na cabeça com potencial dano cerebral'),
  ('Lesão ocular', 'Dano ao olho por corpo estranho ou agente químico'),
  ('Incêndio com danos pessoais', 'Queimaduras e lesões decorrentes de incêndio'),
  ('Explosão com danos pessoais', 'Lesões causadas por onda de choque e estilhaços'),
  ('Transtorno relacionado ao estresse', 'Alterações psicológicas decorrentes do estresse laboral'),
  ('Ansiedade relacionada ao trabalho', 'Transtorno de ansiedade desencadeado por fatores ocupacionais'),
  ('Exaustão mental', 'Esgotamento psicológico por sobrecarga mental'),
  ('Afastamento do trabalho', 'Incapacidade temporária ou permanente para o trabalho'),
  ('Óbito', 'Morte decorrente de acidente ou doença ocupacional')
) v(nome, descricao)
where not exists (
  select 1 from public.biblioteca_tecnica bt
  where bt.categoria = 'dano' and bt.is_padrao = true and lower(bt.nome) = lower(v.nome)
);

-- -------------------------------------------------------
-- 5.4 EPIs
-- -------------------------------------------------------
insert into public.biblioteca_tecnica (categoria, nome, descricao, grupo, is_padrao)
select 'epi', nome, descricao, grupo, true from (values
  ('Capacete de segurança com jugular', 'Proteção da cabeça contra impactos com jugular de fixação', 'Cabeça'),
  ('Capacete classe B', 'Capacete com isolamento elétrico classe B', 'Cabeça'),
  ('Boné de segurança', 'Proteção leve da cabeça contra impactos leves', 'Cabeça'),
  ('Óculos de segurança incolor', 'Proteção ocular contra impactos com lente incolor', 'Ocular/Facial'),
  ('Óculos de segurança escuro', 'Proteção ocular com lente escura para ambientes externos', 'Ocular/Facial'),
  ('Óculos ampla visão', 'Óculos com campo visual ampliado', 'Ocular/Facial'),
  ('Protetor facial', 'Proteção completa do rosto contra impactos e respingos', 'Ocular/Facial'),
  ('Máscara de solda', 'Proteção facial e ocular para soldagem', 'Ocular/Facial'),
  ('Lente para solda', 'Lente filtrante para proteção durante soldagem', 'Ocular/Facial'),
  ('Protetor auditivo tipo plug', 'Protetor auricular inserido no canal auditivo', 'Auditivo'),
  ('Protetor auditivo tipo concha', 'Protetor auricular externo tipo concha', 'Auditivo'),
  ('Protetor auditivo acoplável ao capacete', 'Protetor auditivo para acoplamento em capacete', 'Auditivo'),
  ('Respirador PFF1', 'Peça facial filtrante classe PFF1 para poeiras e névoas', 'Respiratório'),
  ('Respirador PFF2', 'Peça facial filtrante classe PFF2 para fumos e névoas tóxicas', 'Respiratório'),
  ('Respirador PFF3', 'Peça facial filtrante classe PFF3 para partículas tóxicas', 'Respiratório'),
  ('Respirador semifacial', 'Respirador com filtro substituível de peça semifacial', 'Respiratório'),
  ('Respirador facial inteira', 'Respirador com filtro substituível de peça facial inteira', 'Respiratório'),
  ('Filtro químico para vapores orgânicos', 'Filtro para vapores de compostos orgânicos', 'Respiratório'),
  ('Filtro químico para gases ácidos', 'Filtro para gases e vapores ácidos', 'Respiratório'),
  ('Filtro combinado', 'Filtro para proteção combinada contra partículas e gases', 'Respiratório'),
  ('Respirador motorizado', 'Respirador com ventilação motorizada para maior conforto', 'Respiratório'),
  ('Respirador autônomo', 'Equipamento autônomo de respiração com cilindro de ar', 'Respiratório'),
  ('Luva de vaqueta', 'Luva de couro para proteção contra abrasão e calor moderado', 'Mãos'),
  ('Luva de raspa', 'Luva de couro resistente para proteção mecânica', 'Mãos'),
  ('Luva nitrílica', 'Luva de borracha nitrílica para proteção química', 'Mãos'),
  ('Luva de PVC', 'Luva de PVC para proteção contra produtos químicos', 'Mãos'),
  ('Luva de látex', 'Luva de látex natural para proteção biológica', 'Mãos'),
  ('Luva anticorte', 'Luva com resistência ao corte por fibras de alta tenacidade', 'Mãos'),
  ('Luva térmica', 'Luva com isolamento térmico para calor ou frio', 'Mãos'),
  ('Luva isolante de borracha', 'Luva para proteção contra choques elétricos', 'Mãos'),
  ('Luva para produtos químicos', 'Luva específica para manuseio de produtos químicos agressivos', 'Mãos'),
  ('Calçado de segurança com biqueira', 'Calçado com biqueira de proteção contra impactos', 'Pés'),
  ('Calçado de segurança sem biqueira', 'Calçado de segurança sem biqueira para atividades leves', 'Pés'),
  ('Botina de segurança', 'Botina com biqueira de proteção para apoio de tornozelo', 'Pés'),
  ('Bota de PVC', 'Bota impermeável para atividades em ambientes úmidos', 'Pés'),
  ('Bota de borracha', 'Bota de borracha para proteção contra água e produtos químicos', 'Pés'),
  ('Calçado isolante elétrico', 'Calçado com isolamento elétrico certificado', 'Pés'),
  ('Avental de raspa', 'Avental de couro para proteção do tronco', 'Corpo'),
  ('Avental impermeável', 'Avental impermeável contra líquidos e produtos químicos', 'Corpo'),
  ('Avental químico', 'Avental resistente a produtos químicos agressivos', 'Corpo'),
  ('Vestimenta de proteção química', 'Macacão para proteção química nível A, B ou C', 'Corpo'),
  ('Vestimenta antichama', 'Vestimenta com retardante de chama', 'Corpo'),
  ('Vestimenta de alta visibilidade', 'Colete ou jaqueta refletiva com alta visibilidade', 'Corpo'),
  ('Macacão de proteção', 'Macacão para proteção geral do corpo', 'Corpo'),
  ('Capa de chuva', 'Vestimenta impermeável para proteção contra chuva', 'Corpo'),
  ('Cinturão tipo paraquedista', 'Cinturão de segurança para trabalho em altura', 'Queda'),
  ('Talabarte simples', 'Talabarte de posicionamento para trabalho em altura', 'Queda'),
  ('Talabarte duplo em Y', 'Talabarte duplo com dois conectores para ancoragem alternada', 'Queda'),
  ('Talabarte com absorvedor de energia', 'Talabarte com absorvedor de impacto para queda', 'Queda'),
  ('Trava-quedas', 'Dispositivo de bloqueio automático em caso de queda', 'Queda'),
  ('Conector/mosquetão', 'Conector metálico com trava para sistema de queda', 'Queda'),
  ('Linha de vida individual', 'Cabo flexível para ancoragem de talabarte', 'Queda')
) v(nome, descricao, grupo)
where not exists (
  select 1 from public.biblioteca_tecnica bt
  where bt.categoria = 'epi' and bt.is_padrao = true and lower(bt.nome) = lower(v.nome)
);

-- -------------------------------------------------------
-- 5.5 EPCs
-- -------------------------------------------------------
insert into public.biblioteca_tecnica (categoria, nome, descricao, is_padrao)
select 'epc', nome, descricao, true from (values
  ('Guarda-corpo', 'Barreira física contra quedas em bordas e aberturas'),
  ('Rodapé de proteção', 'Barreira inferior para evitar queda de materiais'),
  ('Corrimão', 'Suporte para mãos em escadas e rampas'),
  ('Tela de proteção', 'Tela para contenção de partículas e materiais'),
  ('Rede de proteção', 'Rede para amortecimento de queda de altura'),
  ('Linha de vida coletiva', 'Cabo horizontal de ancoragem coletiva'),
  ('Plataforma de trabalho', 'Superfície elevada para trabalho seguro'),
  ('Sinalização de segurança', 'Placas e avisos de segurança'),
  ('Fita de isolamento', 'Fita para delimitação de áreas de risco'),
  ('Barreira física', 'Barreira rígida para isolamento de áreas perigosas'),
  ('Cone de sinalização', 'Cone para sinalização temporária de obstáculos'),
  ('Cavalete de isolamento', 'Cavalete para isolamento de áreas de trabalho'),
  ('Proteção de partes móveis de máquinas', 'Dispositivo de proteção em máquinas'),
  ('Enclausuramento acústico', 'Cabine ou barreira acústica para isolamento de ruído'),
  ('Exaustão localizada', 'Sistema de captação de poluentes na fonte'),
  ('Ventilação geral', 'Sistema de ventilação para renovação de ar'),
  ('Capela de exaustão química', 'Cabine para manipulação segura de produtos químicos'),
  ('Chuveiro de emergência', 'Equipamento para descontaminação de emergência'),
  ('Lava-olhos de emergência', 'Equipamento para lavagem ocular de emergência'),
  ('Kit de contenção de derramamento', 'Material para absorção de vazamentos químicos'),
  ('Sistema de aterramento', 'Aterramento elétrico de equipamentos e estruturas'),
  ('Dispositivo DR', 'Dispositivo diferencial residual para proteção elétrica'),
  ('Bloqueio e etiquetagem LOTO', 'Sistema de bloqueio e etiquetagem de energia'),
  ('Extintor de incêndio', 'Equipamento portátil de combate a incêndio'),
  ('Hidrante', 'Ponto de água para combate a incêndio'),
  ('Alarme de incêndio', 'Sistema de alerta sonoro para emergências'),
  ('Detector de fumaça', 'Sensor automático de detecção de fumaça'),
  ('Sprinkler', 'Sistema automático de supressão de incêndio'),
  ('Iluminação de emergência', 'Iluminação para evacuação em caso de falha elétrica'),
  ('Sinalização de rota de fuga', 'Placas indicativas de saída de emergência'),
  ('Porta corta-fogo', 'Porta com resistência ao fogo para compartimentação'),
  ('Proteção contra queda de materiais', 'Sistema para retenção de materiais em altura'),
  ('Piso antiderrapante', 'Piso com tratamento antiderrapante'),
  ('Tapete isolante', 'Tapete com isolamento elétrico'),
  ('Barreiras contra radiação', 'Barreiras para proteção radiológica'),
  ('Tripé de resgate', 'Tripé para resgate em espaço confinado'),
  ('Guincho de resgate', 'Equipamento de içamento para resgate'),
  ('Cilindro de ar comprimido para resgate', 'Fonte de ar para respiração em emergências'),
  ('Ponte para içamento', 'Estrutura para movimentação de cargas'),
  ('Trava para escada', 'Dispositivo de segurança em escadas fixas')
) v(nome, descricao)
where not exists (
  select 1 from public.biblioteca_tecnica bt
  where bt.categoria = 'epc' and bt.is_padrao = true and lower(bt.nome) = lower(v.nome)
);

-- -------------------------------------------------------
-- 5.6 EQUIPAMENTOS DE MEDICAO
-- -------------------------------------------------------
insert into public.biblioteca_tecnica (categoria, nome, descricao, grupo, is_padrao)
select 'equipamento_medicao', nome, descricao, grupo, true from (values
  ('Dosímetro de ruído', 'Medidor integrado de exposição ao ruído', 'Ruído'),
  ('Medidor de nível de pressão sonora', 'Medidor instantâneo de ruído ambiental', 'Ruído'),
  ('Decibelímetro', 'Instrumento para medição de nível sonoro', 'Ruído'),
  ('Calibrador acústico', 'Equipamento para calibração de medidores de ruído', 'Ruído'),
  ('Analisador de frequência', 'Analisador de espectro em bandas de oitava', 'Ruído'),
  ('Medidor de IBUTG', 'Medidor de índice de bulbo úmido e termômetro de globo', 'Calor'),
  ('Termômetro de globo', 'Medidor de temperatura radiante', 'Calor'),
  ('Termohigrômetro', 'Medidor de temperatura e umidade', 'Calor'),
  ('Anemômetro', 'Medidor de velocidade do ar', 'Calor'),
  ('Termoanemômetro', 'Medidor de temperatura e velocidade do ar', 'Calor'),
  ('Termômetro infravermelho', 'Medidor de temperatura sem contato', 'Calor'),
  ('Câmera termográfica', 'Câmera para imageamento térmico', 'Calor'),
  ('Luxímetro', 'Medidor de nível de iluminância', 'Iluminação'),
  ('Bomba de amostragem individual', 'Bomba para coleta pessoal de aerodispersoides', 'Químico'),
  ('Bomba de amostragem de área', 'Bomba para coleta ambiental de aerodispersoides', 'Químico'),
  ('Calibrador de vazão', 'Equipamento para calibração de bombas de amostragem', 'Químico'),
  ('Detector multigases', 'Detector portátil para múltiplos gases', 'Químico'),
  ('Explosímetro', 'Detector de atmosfera explosiva', 'Químico'),
  ('Oxímetro', 'Medidor de concentração de oxigênio', 'Químico'),
  ('Medidor de VOC', 'Detector de compostos orgânicos voláteis', 'Químico'),
  ('Amostrador de poeira', 'Coletor de poeira para análise gravimétrica', 'Químico'),
  ('Medidor de vibração de corpo inteiro', 'Medidor de vibração transmitida ao corpo', 'Vibração'),
  ('Medidor de vibração de mãos e braços', 'Medidor de vibração localizada', 'Vibração'),
  ('Acelerômetro triaxial', 'Sensor de aceleração em três eixos', 'Vibração'),
  ('Medidor de radiação ionizante', 'Detector de radiação alfa, beta, gama e raios-X', 'Radiação'),
  ('Dosímetro individual de radiação', 'Dosímetro pessoal para monitoração de radiação', 'Radiação'),
  ('Manômetro', 'Medidor de pressão', 'Pressão'),
  ('Multímetro', 'Instrumento para medições elétricas diversas', 'Elétrica'),
  ('Alicate amperímetro', 'Medidor de corrente elétrica sem contato', 'Elétrica'),
  ('Medidor de resistência de isolamento', 'Megômetro para medição de isolamento elétrico', 'Elétrica'),
  ('Trena', 'Fita métrica manual', 'Diversos'),
  ('Trena a laser', 'Medidor de distância a laser', 'Diversos'),
  ('Cronômetro', 'Medidor de tempo', 'Diversos'),
  ('Câmera fotográfica', 'Câmera para registro de evidências', 'Diversos')
) v(nome, descricao, grupo)
where not exists (
  select 1 from public.biblioteca_tecnica bt
  where bt.categoria = 'equipamento_medicao' and bt.is_padrao = true and lower(bt.nome) = lower(v.nome)
);

-- -------------------------------------------------------
-- 5.7 MEDIDAS DE CONTROLE
-- -------------------------------------------------------
insert into public.biblioteca_tecnica (categoria, nome, descricao, tipo, is_padrao)
select 'medida_controle', nome, descricao, tipo, true from (values
  ('Eliminar a fonte de risco', 'Remoção completa da fonte geradora do risco', 'Eliminação'),
  ('Substituir produto químico perigoso', 'Troca por produto menos nocivo à saúde', 'Substituição'),
  ('Substituir processo manual por mecanizado', 'Automação de processos manuais', 'Substituição'),
  ('Substituir equipamento ruidoso por modelo silencioso', 'Troca por equipamento com menor emissão de ruído', 'Substituição'),
  ('Instalar proteção física', 'Instalação de barreiras e dispositivos de segurança', 'Engenharia'),
  ('Instalar exaustão localizada', 'Sistema de captação de poluentes na fonte geradora', 'Engenharia'),
  ('Melhorar ventilação', 'Adequação do sistema de ventilação geral', 'Engenharia'),
  ('Enclausurar fonte de ruído', 'Isolamento acústico da fonte de ruído', 'Engenharia'),
  ('Instalar barreira acústica', 'Barreira para atenuação sonora no trajeto', 'Engenharia'),
  ('Automatizar operação', 'Automação de operação para afastar o trabalhador', 'Engenharia'),
  ('Adequar iluminação', 'Adequação dos níveis de iluminância ao recomendado', 'Engenharia'),
  ('Instalar guarda-corpo', 'Proteção coletiva contra quedas em altura', 'Engenharia'),
  ('Instalar piso antiderrapante', 'Tratamento de piso para evitar escorregamentos', 'Engenharia'),
  ('Adequar layout do posto', 'Reorganização do leiaute para melhor ergonomia', 'Engenharia'),
  ('Adequar mobiliário', 'Ajuste de móveis e equipamentos ao trabalhador', 'Engenharia'),
  ('Instalar sistema de aterramento', 'Aterramento elétrico de equipamentos', 'Engenharia'),
  ('Elaborar procedimento operacional', 'Criação de procedimento escrito seguro', 'Administrativo'),
  ('Implantar permissão de trabalho', 'Sistema de autorização para atividades críticas', 'Administrativo'),
  ('Realizar treinamento', 'Capacitação dos trabalhadores para a atividade', 'Administrativo'),
  ('Realizar inspeção periódica', 'Inspeções regulares de segurança', 'Administrativo'),
  ('Implantar checklist operacional', 'Lista de verificação para operação segura', 'Administrativo'),
  ('Implantar manutenção preventiva', 'Programa de manutenção preventiva de equipamentos', 'Administrativo'),
  ('Implantar bloqueio e etiquetagem', 'Sistema de bloqueio de fontes de energia', 'Administrativo'),
  ('Sinalizar área de risco', 'Sinalização de advertência da área perigosa', 'Administrativo'),
  ('Restringir acesso', 'Controle de acesso a áreas de risco', 'Administrativo'),
  ('Realizar rodízio de trabalhadores', 'Alternância de trabalhadores em diferentes postos', 'Administrativo'),
  ('Definir pausas', 'Estabelecimento de pausas regulares durante a jornada', 'Administrativo'),
  ('Monitorar exposição ocupacional', 'Avaliação periódica da exposição a agentes', 'Administrativo'),
  ('Fornecer EPI adequado', 'Disponibilização de EPI conforme o risco', 'EPI'),
  ('Treinar quanto ao uso do EPI', 'Orientação sobre uso correto do EPI', 'EPI'),
  ('Fiscalizar uso do EPI', 'Supervisão do uso efetivo do EPI', 'EPI'),
  ('Verificar CA válido', 'Certificado de aprovação do EPI dentro da validade', 'EPI')
) v(nome, descricao, tipo)
where not exists (
  select 1 from public.biblioteca_tecnica bt
  where bt.categoria = 'medida_controle' and bt.is_padrao = true and lower(bt.nome) = lower(v.nome)
);

-- -------------------------------------------------------
-- 5.8 TREINAMENTOS
-- -------------------------------------------------------
insert into public.biblioteca_tecnica (categoria, nome, descricao, is_padrao)
select 'treinamento', nome, descricao, true from (values
  ('Integração de segurança', 'Treinamento inicial para novos colaboradores'),
  ('Ordem de serviço de segurança', 'Treinamento de Ordem de Serviço para função'),
  ('Treinamento de EPI', 'Orientações sobre uso e conservação de EPIs'),
  ('Treinamento de PGR/GRO', 'Programa de Gerenciamento de Riscos'),
  ('Treinamento de ergonomia', 'Orientações ergonômicas para atividades'),
  ('Treinamento de prevenção de acidentes', 'Prevenção de acidentes do trabalho'),
  ('Treinamento de combate a incêndio', 'Técnicas de combate a princípios de incêndio'),
  ('Treinamento de evacuação de emergência', 'Procedimentos de evacuação em emergências'),
  ('Treinamento de primeiros socorros', 'Noções básicas de primeiros socorros'),
  ('NR-05 CIPA/CIPAA', 'Treinamento da Comissão Interna de Prevenção de Acidentes'),
  ('NR-06 EPI', 'Treinamento conforme NR-06 sobre Equipamentos de Proteção Individual'),
  ('NR-10 Segurança em instalações elétricas', 'Treinamento de segurança em eletricidade'),
  ('NR-12 Segurança em máquinas e equipamentos', 'Treinamento de operação segura de máquinas'),
  ('NR-17 Ergonomia', 'Treinamento de ergonomia conforme NR-17'),
  ('NR-20 Inflamáveis e combustíveis', 'Treinamento para manuseio de inflamáveis'),
  ('NR-33 Espaço confinado', 'Treinamento para trabalho em espaço confinado'),
  ('NR-35 Trabalho em altura', 'Treinamento para trabalho em altura'),
  ('Bloqueio e etiquetagem LOTO', 'Treinamento de procedimentos de bloqueio'),
  ('Direção defensiva', 'Treinamento de direção segura'),
  ('Operação segura de ferramentas manuais', 'Uso correto de ferramentas manuais'),
  ('Manuseio de produtos químicos', 'Procedimentos seguros com produtos químicos'),
  ('Prevenção de assédio e violência no trabalho', 'Treinamento sobre assédio moral e sexual'),
  ('Riscos psicossociais', 'Identificação e prevenção de riscos psicossociais')
) v(nome, descricao)
where not exists (
  select 1 from public.biblioteca_tecnica bt
  where bt.categoria = 'treinamento' and bt.is_padrao = true and lower(bt.nome) = lower(v.nome)
);

-- -------------------------------------------------------
-- 5.9 SINALIZACOES
-- -------------------------------------------------------
insert into public.biblioteca_tecnica (categoria, nome, descricao, is_padrao)
select 'sinalizacao', nome, descricao, true from (values
  ('Uso obrigatório de capacete', 'Placa de obrigatoriedade do uso de capacete'),
  ('Uso obrigatório de óculos de segurança', 'Placa de obrigatoriedade de óculos'),
  ('Uso obrigatório de protetor auditivo', 'Placa de obrigatoriedade de protetor auricular'),
  ('Uso obrigatório de respirador', 'Placa de obrigatoriedade de máscara respiratória'),
  ('Uso obrigatório de luvas', 'Placa de obrigatoriedade de uso de luvas'),
  ('Uso obrigatório de calçado de segurança', 'Placa de obrigatoriedade de calçado de segurança'),
  ('Uso obrigatório de cinto de segurança', 'Placa de obrigatoriedade de cinto de segurança'),
  ('Área restrita', 'Placa de área com acesso restrito'),
  ('Perigo alta tensão', 'Placa de advertência de alta tensão elétrica'),
  ('Perigo inflamável', 'Placa de advertência de material inflamável'),
  ('Perigo explosivo', 'Placa de advertência de risco de explosão'),
  ('Perigo produto químico', 'Placa de advertência de produto químico perigoso'),
  ('Perigo queda de nível', 'Placa de advertência de desnível'),
  ('Perigo carga suspensa', 'Placa de advertência de movimentação de cargas'),
  ('Perigo máquinas em movimento', 'Placa de advertência de partes móveis'),
  ('Rota de fuga', 'Placa indicativa de rota de evacuação'),
  ('Saída de emergência', 'Placa indicativa de saída de emergência'),
  ('Extintor de incêndio', 'Placa indicativa de localização de extintor'),
  ('Hidrante', 'Placa indicativa de hidrante'),
  ('Alarme de incêndio', 'Placa de acionador manual de alarme'),
  ('Ponto de encontro', 'Placa indicativa de ponto de encontro em emergência'),
  ('Chuveiro de emergência', 'Placa indicativa de chuveiro de segurança'),
  ('Lava-olhos', 'Placa indicativa de lava-olhos de emergência'),
  ('Proibido fumar', 'Placa proibitiva de fumar no local'),
  ('Proibido acesso pessoas não autorizadas', 'Placa proibitiva de entrada de estranhos'),
  ('Atenção piso molhado', 'Placa de advertência de piso escorregadio'),
  ('Atenção empilhadeiras', 'Placa de advertência de circulação de empilhadeiras'),
  ('Atenção tráfego de veículos', 'Placa de advertência de tráfego interno')
) v(nome, descricao)
where not exists (
  select 1 from public.biblioteca_tecnica bt
  where bt.categoria = 'sinalizacao' and bt.is_padrao = true and lower(bt.nome) = lower(v.nome)
);

-- -------------------------------------------------------
-- 5.10 MEIOS DE PROPAGACAO
-- -------------------------------------------------------
insert into public.biblioteca_tecnica (categoria, nome, is_padrao)
select 'meio_propagacao', nome, true from (values
  ('Ar'), ('Caminhar'), ('Condução, convecção e/ou radiação'), ('Contato'),
  ('Cutânea ou dérmica'), ('Digestiva ou oral'), ('Luz'), ('Movimento/ação'),
  ('Não aplicável'), ('Parenteral'), ('Percepção'), ('Posto de trabalho'),
  ('Respiratória'), ('Sobrecarga biomecânica'), ('Sonora')
) v(nome)
where not exists (
  select 1 from public.biblioteca_tecnica bt
  where bt.categoria = 'meio_propagacao' and bt.is_padrao = true and lower(bt.nome) = lower(v.nome)
);

-- -------------------------------------------------------
-- 5.11 NORMAS / REFERENCIAS TECNICAS
-- -------------------------------------------------------
insert into public.biblioteca_tecnica (categoria, nome, descricao, codigo, is_padrao)
select 'norma_referencia', nome, descricao, codigo, true from (values
  ('Disposições Gerais e Gerenciamento de Riscos Ocupacionais', 'Estabelece as disposições gerais e o gerenciamento de riscos ocupacionais', 'NR-01'),
  ('Equipamento de Proteção Individual', 'Dispõe sobre o uso e fornecimento de EPIs', 'NR-06'),
  ('Programa de Controle Médico de Saúde Ocupacional', 'Estabelece a obrigatoriedade do PCMSO', 'NR-07'),
  ('Avaliação e Controle das Exposições Ocupacionais', 'Critérios para avaliação de agentes ambientais', 'NR-09'),
  ('Segurança em Instalações e Serviços em Eletricidade', 'Requisitos de segurança em eletricidade', 'NR-10'),
  ('Segurança no Trabalho em Máquinas e Equipamentos', 'Medidas de segurança em máquinas', 'NR-12'),
  ('Atividades e Operações Insalubres', 'Caracterização de insalubridade', 'NR-15'),
  ('Atividades e Operações Perigosas', 'Caracterização de periculosidade', 'NR-16'),
  ('Ergonomia', 'Parâmetros ergonômicos no trabalho', 'NR-17'),
  ('Segurança e Saúde na Indústria da Construção', 'Condições de segurança na construção', 'NR-18'),
  ('Segurança com Inflamáveis e Combustíveis', 'Manuseio de inflamáveis e combustíveis', 'NR-20'),
  ('Proteção Contra Incêndios', 'Medidas de proteção contra incêndio', 'NR-23'),
  ('Segurança e Saúde em Espaços Confinados', 'Trabalho seguro em espaços confinados', 'NR-33'),
  ('Trabalho em Altura', 'Requisitos para trabalho em altura', 'NR-35'),
  ('Avaliação da Exposição Ocupacional ao Ruído', 'Procedimento técnico para avaliação de ruído', 'NHO-01'),
  ('Avaliação da Exposição Ocupacional ao Calor', 'Procedimento técnico para avaliação de calor', 'NHO-06'),
  ('Instalações elétricas de baixa tensão', 'Norma de instalações elétricas prediais', 'ABNT NBR 5410'),
  ('Iluminação de ambientes de trabalho', 'Requisitos de iluminância para ambientes internos', 'ABNT NBR ISO/CIE 8995-1')
) v(nome, descricao, codigo)
where not exists (
  select 1 from public.biblioteca_tecnica bt
  where bt.categoria = 'norma_referencia' and bt.is_padrao = true and lower(bt.nome) = lower(v.nome)
);

-- -------------------------------------------------------
-- 5.12 UNIDADES DE MEDIDA
-- -------------------------------------------------------
insert into public.biblioteca_tecnica (categoria, nome, is_padrao)
select 'unidade_medida', nome, true from (values
  ('dB(A)'), ('dB(C)'), ('%'), ('ppm'), ('mg/m³'), ('fibra/cm³'), ('m/s²'),
  ('lux'), ('°C'), ('IBUTG'), ('m'), ('cm'), ('mm'), ('kg'), ('L'),
  ('min'), ('h'), ('µSv/h'), ('mA'), ('V'), ('A'), ('Ohm'), ('W/m²'),
  ('m/s'), ('mg/m³'), ('°C'), ('°F'), ('kPa'), ('bar')
) v(nome)
where not exists (
  select 1 from public.biblioteca_tecnica bt
  where bt.categoria = 'unidade_medida' and bt.is_padrao = true and lower(bt.nome) = lower(v.nome)
);

-- -------------------------------------------------------
-- 5.13 METODOS DE AVALIACAO
-- -------------------------------------------------------
insert into public.biblioteca_tecnica (categoria, nome, descricao, is_padrao)
select 'metodo_avaliacao', nome, descricao, true from (values
  ('Avaliação qualitativa', 'Avaliação baseada em observação e critérios subjetivos'),
  ('Avaliação quantitativa', 'Avaliação baseada em medições instrumentais'),
  ('Inspeção visual', 'Vistoria técnica do ambiente de trabalho'),
  ('Entrevista com trabalhador', 'Levantamento de informações com o colaborador'),
  ('Análise documental', 'Revisão de documentos e registros existentes'),
  ('Observação da atividade', 'Acompanhamento da execução da tarefa'),
  ('Checklist técnico', 'Verificação sistemática com lista de itens'),
  ('Medição pontual', 'Medição em ponto específico do ambiente'),
  ('Dosimetria', 'Medição integrada ao longo da jornada'),
  ('Amostragem pessoal', 'Coleta de amostra junto ao trabalhador'),
  ('Amostragem de área', 'Coleta de amostra ambiental'),
  ('Monitoramento contínuo', 'Medição contínua com equipamento fixo'),
  ('Avaliação ergonômica preliminar', 'Análise inicial de riscos ergonômicos'),
  ('Análise ergonômica do trabalho', 'Análise aprofundada da atividade'),
  ('Matriz de risco', 'Matriz de probabilidade x severidade'),
  ('Método NIOSH', 'Equação para levantamento manual de cargas'),
  ('OWAS', 'Método de análise postural'),
  ('RULA', 'Rapid Upper Limb Assessment'),
  ('REBA', 'Rapid Entire Body Assessment'),
  ('COPSOQ', 'Questionário psicossocial de Copenhagen'),
  ('HSE-IT', 'Indicador de tensão do HSE')
) v(nome, descricao)
where not exists (
  select 1 from public.biblioteca_tecnica bt
  where bt.categoria = 'metodo_avaliacao' and bt.is_padrao = true and lower(bt.nome) = lower(v.nome)
);

end $$;
