-- Efetiva RiskFlow - Setores, Cargos/Funcoes e Sequencial de Documentos
-- Migration 00002: Adiciona tabelas de catalogo e controle de codigo

-- ============================================================
-- 1. Tabela: setores
-- ============================================================
create table if not exists public.setores (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  ativo boolean not null default true,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Evitar duplicidade de nome por usuario (case-insensitive)
create unique index if not exists idx_setores_nome_unique
  on public.setores (lower(nome), coalesce(created_by, '00000000-0000-0000-0000-000000000000'::uuid));

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

-- Setores padrao (visiveis para todos os usuarios autenticados)
insert into public.setores (nome, created_by) values
  ('Administrativo', null),
  ('Comercial', null),
  ('Financeiro', null),
  ('RH', null)
on conflict (lower(nome), coalesce(created_by, '00000000-0000-0000-0000-000000000000'::uuid)) do nothing;

-- ============================================================
-- 2. Tabela: cargos_funcoes
-- ============================================================
create table if not exists public.cargos_funcoes (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  ativo boolean not null default true,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists idx_cargos_funcoes_nome_unique
  on public.cargos_funcoes (lower(nome), coalesce(created_by, '00000000-0000-0000-0000-000000000000'::uuid));

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

-- Cargos padrao (visiveis para todos os usuarios autenticados)
insert into public.cargos_funcoes (nome, created_by) values
  ('Analista Administrativo', null),
  ('Analista de RH', null),
  ('Analista Financeiro', null),
  ('Assistente Administrativo', null),
  ('Auxiliar de Serviços Gerais', null),
  ('Coordenador', null),
  ('Diretor', null),
  ('Encarregado', null),
  ('Engenheiro', null),
  ('Gerente', null),
  ('Líder de Produção', null),
  ('Motorista', null),
  ('Operador', null),
  ('Supervisor', null),
  ('Técnico de Segurança', null),
  ('Vendedor', null)
on conflict (lower(nome), coalesce(created_by, '00000000-0000-0000-0000-000000000000'::uuid)) do nothing;

-- ============================================================
-- 3. Tabela: sequencias_documentos
-- ============================================================
create table if not exists public.sequencias_documentos (
  id uuid primary key default gen_random_uuid(),
  tipo_documento text not null,
  ano integer not null,
  ultimo_numero integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint unique_tipo_ano unique (tipo_documento, ano)
);

alter table if exists public.sequencias_documentos enable row level security;

do $$ begin
  drop policy if exists "sequencias_documentos_all_authenticated" on public.sequencias_documentos;
  create policy "sequencias_documentos_all_authenticated" on public.sequencias_documentos
    for all using (auth.role() = 'authenticated')
    with check (auth.role() = 'authenticated');
end $$;

-- ============================================================
-- 4. Funcao RPC: gerar_codigo_documento
-- ============================================================
create or replace function public.gerar_codigo_documento(p_tipo_documento text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_ano integer;
  v_numero integer;
  v_codigo text;
begin
  v_ano := extract(year from now());

  insert into public.sequencias_documentos (tipo_documento, ano, ultimo_numero)
  values (p_tipo_documento, v_ano, 1)
  on conflict (tipo_documento, ano)
  do update set ultimo_numero = sequencias_documentos.ultimo_numero + 1
  returning ultimo_numero into v_numero;

  v_codigo := format('%s-%s/%s',
    p_tipo_documento,
    lpad(v_numero::text, 4, '0'),
    lpad((v_ano % 100)::text, 2, '0')
  );

  return v_codigo;
end;
$$;

-- Garantir que apenas authenticated possa chamar a funcao
revoke execute on function public.gerar_codigo_documento(text) from public, anon;
grant execute on function public.gerar_codigo_documento(text) to authenticated;

-- ============================================================
-- 5. Concessoes
-- ============================================================
grant usage on schema public to anon, authenticated;
grant all on public.setores to anon, authenticated;
grant all on public.cargos_funcoes to anon, authenticated;
grant all on public.sequencias_documentos to anon, authenticated;
