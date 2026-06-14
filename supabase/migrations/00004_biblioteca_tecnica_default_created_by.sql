-- Efetiva RiskFlow - Fix: default auth.uid() para created_by
-- Migration 00004: Adiciona default ausente na coluna created_by da biblioteca_tecnica

alter table if exists public.biblioteca_tecnica
  alter column created_by set default auth.uid();
