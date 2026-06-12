-- Efetiva RiskFlow - Supabase Schema
-- Execute this SQL in the Supabase SQL Editor to set up the database

-- 1. Profiles (linked to auth.users via trigger)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  nome text not null,
  email text,
  perfil text not null default 'visualizador' check (perfil in ('admin', 'tecnico', 'visualizador')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Empresas
create table if not exists public.empresas (
  id text primary key,
  razao_social text not null,
  nome_fantasia text default '',
  cnpj text default '',
  cnae text default '',
  grau_risco text default '1',
  endereco text default '',
  cidade text default '',
  uf text default '',
  responsavel text default '',
  telefone text default '',
  email text default '',
  observacoes text default '',
  created_at timestamptz default now(),
  user_id uuid references auth.users(id) on delete set null
);

-- 3. Levantamentos
create table if not exists public.levantamentos (
  id text primary key,
  tipo text not null check (tipo in ('LPR', 'LPP', 'AEP')),
  codigo text not null,
  empresa_id text references public.empresas(id) on delete set null,
  empresa_nome text default '',
  cnpj text default '',
  unidade text default '',
  setor text default '',
  responsavel_empresa text default '',
  auditor_tecnico text default '',
  registro_mte text default '',
  data_levantamento date,
  data_lancamento_sgg text default '',
  responsavel_lancamento text default '',
  status text not null default 'Rascunho' check (status in ('Rascunho', 'Em campo', 'Em andamento', 'Em revisão', 'Concluído', 'Exportado')),
  percentual int default 0,
  caracteristicas jsonb default '{}'::jsonb,
  medicoes jsonb default '[]'::jsonb,
  colaboradores jsonb default '[]'::jsonb,
  riscos jsonb default '[]'::jsonb,
  controles jsonb default '[]'::jsonb,
  parecer jsonb default '{"texto": "", "editado": false}'::jsonb,
  assinatura_tecnico jsonb default '{"nomeCompleto": "", "cpf": "", "dataHora": "", "canvasData": "", "confirmada": false}'::jsonb,
  assinatura_empresa jsonb default '{"nomeCompleto": "", "cpf": "", "dataHora": "", "canvasData": "", "confirmada": false}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  user_id uuid references auth.users(id) on delete set null
);

-- 4. Relatorios
create table if not exists public.relatorios (
  id text primary key,
  levantamento_id text references public.levantamentos(id) on delete set null,
  empresa_nome text default '',
  tipo text default '',
  data text default '',
  modelo text default '',
  status text default '',
  created_at timestamptz default now(),
  user_id uuid references auth.users(id) on delete set null
);

-- Indexes
create index if not exists idx_empresas_user_id on public.empresas(user_id);
create index if not exists idx_levantamentos_user_id on public.levantamentos(user_id);
create index if not exists idx_levantamentos_empresa_id on public.levantamentos(empresa_id);
create index if not exists idx_relatorios_user_id on public.relatorios(user_id);
create index if not exists idx_relatorios_levantamento_id on public.relatorios(levantamento_id);
create index if not exists idx_levantamentos_status on public.levantamentos(status);
create index if not exists idx_levantamentos_tipo on public.levantamentos(tipo);

-- Enable Row Level Security
alter table if exists public.profiles enable row level security;
alter table if exists public.empresas enable row level security;
alter table if exists public.levantamentos enable row level security;
alter table if exists public.relatorios enable row level security;

-- RLS Policies for profiles
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- RLS Policies for empresas
create policy "Users can view their own empresas"
  on public.empresas for select
  using (auth.uid() = user_id);

create policy "Users can insert their own empresas"
  on public.empresas for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own empresas"
  on public.empresas for update
  using (auth.uid() = user_id);

create policy "Users can delete their own empresas"
  on public.empresas for delete
  using (auth.uid() = user_id);

-- RLS Policies for levantamentos
create policy "Users can view their own levantamentos"
  on public.levantamentos for select
  using (auth.uid() = user_id);

create policy "Users can insert their own levantamentos"
  on public.levantamentos for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own levantamentos"
  on public.levantamentos for update
  using (auth.uid() = user_id);

create policy "Users can delete their own levantamentos"
  on public.levantamentos for delete
  using (auth.uid() = user_id);

-- RLS Policies for relatorios
create policy "Users can view their own relatorios"
  on public.relatorios for select
  using (auth.uid() = user_id);

create policy "Users can insert their own relatorios"
  on public.relatorios for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own relatorios"
  on public.relatorios for update
  using (auth.uid() = user_id);

create policy "Users can delete their own relatorios"
  on public.relatorios for delete
  using (auth.uid() = user_id);

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, nome, email, perfil)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'nome', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data ->> 'perfil', 'visualizador')
  );
  return new;
end;
$$;

-- Trigger to auto-create profile on signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Allow public access to trigger function
grant usage on schema public to anon, authenticated;
grant all on public.profiles to anon, authenticated;
grant all on public.empresas to anon, authenticated;
grant all on public.levantamentos to anon, authenticated;
grant all on public.relatorios to anon, authenticated;
