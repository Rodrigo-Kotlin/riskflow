-- Efetiva RiskFlow - Setores, Cargos/Funcoes e Sequencial de Documentos
-- Migration 00002: Adiciona tabelas de catalogo e controle de codigo
-- Endurecido: RLS restrito para sequencias_documentos; RPC validado;
--              partial unique indexes; triggers updated_at; grants minimos.

-- ============================================================
-- 0. Funcao de trigger: atualiza updated_at automaticamente
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
-- 1. Tabela: setores
-- ============================================================
create table if not exists public.setores (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  ativo boolean not null default true,
  created_by uuid references auth.users(id) on delete cascade default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint setores_nome_not_empty check (trim(nome) <> '')
);

-- Limpeza: drop indice composto da versao anterior, se existir
drop index if exists idx_setores_nome_unique;

-- Impedir duplicidade entre setores padrao (case-insensitive)
create unique index if not exists idx_setores_nome_padrao
  on public.setores (lower(nome)) where created_by is null;

-- Impedir duplicidade por usuario (case-insensitive)
create unique index if not exists idx_setores_nome_usuario
  on public.setores (created_by, lower(nome)) where created_by is not null;

alter table if exists public.setores enable row level security;

do $$ begin
  drop policy if exists "setores_select_own_and_default" on public.setores;
  create policy "setores_select_own_and_default" on public.setores
    for select using (
      auth.role() = 'authenticated'
      and (created_by is null or created_by = auth.uid())
    );
end $$;

do $$ begin
  drop policy if exists "setores_insert_own" on public.setores;
  create policy "setores_insert_own" on public.setores
    for insert with check (
      auth.role() = 'authenticated'
      and created_by = auth.uid()
    );
end $$;

do $$ begin
  drop policy if exists "setores_update_own" on public.setores;
  create policy "setores_update_own" on public.setores
    for update using (
      auth.role() = 'authenticated'
      and created_by = auth.uid()
    );
end $$;

-- Sem DELETE fisico — desativacao logica via ativo=false

-- Trigger para updated_at
drop trigger if exists trg_setores_updated_at on public.setores;
create trigger trg_setores_updated_at
  before update on public.setores
  for each row execute function public.set_updated_at();

-- Setores padrao (visiveis para todos os usuarios autenticados)
insert into public.setores (nome, created_by)
select nome, null
from (values
  ('Administrativo'),
  ('Comercial'),
  ('Financeiro'),
  ('RH')
) v(nome)
where not exists (
  select 1 from public.setores s
  where s.created_by is null and lower(s.nome) = lower(v.nome)
);

-- ============================================================
-- 2. Tabela: cargos_funcoes
-- ============================================================
create table if not exists public.cargos_funcoes (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  ativo boolean not null default true,
  created_by uuid references auth.users(id) on delete cascade default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint cargos_nome_not_empty check (trim(nome) <> '')
);

-- Limpeza: drop indice composto da versao anterior
drop index if exists idx_cargos_funcoes_nome_unique;

create unique index if not exists idx_cargos_nome_padrao
  on public.cargos_funcoes (lower(nome)) where created_by is null;

create unique index if not exists idx_cargos_nome_usuario
  on public.cargos_funcoes (created_by, lower(nome)) where created_by is not null;

alter table if exists public.cargos_funcoes enable row level security;

do $$ begin
  drop policy if exists "cargos_funcoes_select_own_and_default" on public.cargos_funcoes;
  create policy "cargos_funcoes_select_own_and_default" on public.cargos_funcoes
    for select using (
      auth.role() = 'authenticated'
      and (created_by is null or created_by = auth.uid())
    );
end $$;

do $$ begin
  drop policy if exists "cargos_funcoes_insert_own" on public.cargos_funcoes;
  create policy "cargos_funcoes_insert_own" on public.cargos_funcoes
    for insert with check (
      auth.role() = 'authenticated'
      and created_by = auth.uid()
    );
end $$;

do $$ begin
  drop policy if exists "cargos_funcoes_update_own" on public.cargos_funcoes;
  create policy "cargos_funcoes_update_own" on public.cargos_funcoes
    for update using (
      auth.role() = 'authenticated'
      and created_by = auth.uid()
    );
end $$;

-- Trigger para updated_at
drop trigger if exists trg_cargos_updated_at on public.cargos_funcoes;
create trigger trg_cargos_updated_at
  before update on public.cargos_funcoes
  for each row execute function public.set_updated_at();

-- Cargos/Funcoes padrao (visiveis para todos os usuarios autenticados)
insert into public.cargos_funcoes (nome, created_by)
select nome, null
from (values
  ('Analista Administrativo'),
  ('Analista de RH'),
  ('Analista Financeiro'),
  ('Assistente Administrativo'),
  ('Auxiliar de Serviços Gerais'),
  ('Coordenador'),
  ('Diretor'),
  ('Encarregado'),
  ('Engenheiro'),
  ('Gerente'),
  ('Líder de Produção'),
  ('Motorista'),
  ('Operador'),
  ('Supervisor'),
  ('Técnico de Segurança'),
  ('Vendedor')
) v(nome)
where not exists (
  select 1 from public.cargos_funcoes c
  where c.created_by is null and lower(c.nome) = lower(v.nome)
);

-- ============================================================
-- 3. Tabela: sequencias_documentos (apenas via RPC)
-- ============================================================
create table if not exists public.sequencias_documentos (
  id uuid primary key default gen_random_uuid(),
  tipo_documento text not null,
  ano integer not null,
  ultimo_numero integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint unique_tipo_ano unique (tipo_documento, ano),
  constraint seq_tipo_documento_not_empty check (trim(tipo_documento) <> '')
);

alter table if exists public.sequencias_documentos enable row level security;

-- Nenhuma policy: default deny.
-- NENHUM usuario (anon ou authenticated) pode ler ou modificar diretamente.
-- Apenas a funcao RPC gerar_codigo_documento (security definer) pode escrever.

-- Trigger para updated_at
drop trigger if exists trg_sequencias_updated_at on public.sequencias_documentos;
create trigger trg_sequencias_updated_at
  before update on public.sequencias_documentos
  for each row execute function public.set_updated_at();

-- ============================================================
-- 4. Funcao RPC: gerar_codigo_documento (unico ponto de escrita)
-- ============================================================
create or replace function public.gerar_codigo_documento(p_tipo_documento text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_tipo text;
  v_ano int;
  v_numero int;
begin
  -- Validacao e normalizacao
  v_tipo := upper(trim(p_tipo_documento));
  if v_tipo = '' then
    raise exception 'tipo_documento nao pode ser vazio';
  end if;
  if length(v_tipo) > 10 then
    raise exception 'tipo_documento muito longo (max 10 caracteres)';
  end if;

  v_ano := extract(year from now())::int;

  insert into public.sequencias_documentos (tipo_documento, ano, ultimo_numero)
  values (v_tipo, v_ano, 1)
  on conflict (tipo_documento, ano)
  do update set ultimo_numero = public.sequencias_documentos.ultimo_numero + 1
  returning ultimo_numero into v_numero;

  return format('%s-%s/%s',
    v_tipo,
    lpad(v_numero::text, 4, '0'),
    lpad((v_ano % 100)::text, 2, '0')
  );
end;
$$;

-- Permissoes da funcao
revoke all on function public.gerar_codigo_documento(text) from public, anon;
grant execute on function public.gerar_codigo_documento(text) to authenticated;

-- ============================================================
-- 5. Permissoes de tabela (minimas necessarias)
-- ============================================================
-- setores e cargos_funcoes: acesso via RLS (necessario para authenticated)
grant all on public.setores to authenticated;
grant all on public.cargos_funcoes to authenticated;

-- sequencias_documentos: apenas via RPC — sem acesso direto
revoke all on public.sequencias_documentos from anon, authenticated;
