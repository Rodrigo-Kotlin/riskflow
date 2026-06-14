-- Remove colunas setor e auditor_tecnico da tabela levantamentos

alter table if exists public.levantamentos
  drop column if exists setor,
  drop column if exists auditor_tecnico;
