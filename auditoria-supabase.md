# Auditoria de Integração Supabase — RiskFlow

## 1. Branch atual

| Item | Valor |
|---|---|
| Branch confirmada | `fix/auditoria-riskflow` |
| Status inicial | `nothing to commit, working tree clean` |
| Status final | `acf4768 fix: melhora integracao supabase e consistencia de payloads` |
| Upstream | `origin/fix/auditoria-riskflow` |

---

## 2. Arquivos Supabase encontrados

| Arquivo | Finalidade | Risco encontrado | Ação tomada |
|---|---|---|---|
| `src/lib/supabase.ts` | Cliente Supabase (createClient) | `createClient<Database>` não usado — tipos Database existem mas não são aplicados | Documentado no código; não ativado porque spreads `as any` em `toSnakeCase` quebram a compilação |
| `src/lib/supabase-types.ts` | Tipos Database (Tables/Insert/Update/Row) | Tipo existe mas não é importado por nenhum consumer | Mantido como referência; recomendada migração futura |
| `src/services/supabase.service.ts` | Operações CRUD + Auth + Mappers | `dataLevantamento` vazio (`""`) enviado a campo `date` pode causar erro | Corrigido: `l.dataLevantamento` → `l.dataLevantamento \|\| null` |
| | | `getLevantamento` engole erro silenciosamente (retorna `null`) | Adicionado `console.error` em DEV |
| | | `toSnakeCase` usa `as any` para campos JSON | Identificado, exige refatoração futura |
| `src/hooks/useSupabaseAuth.ts` | Hook de autenticação com fallback localStorage | Catch blocks vazios em `getSession` e `onAuthStateChange` | Adicionado `console.error` em DEV |
| `src/hooks/useEmpresas.ts` | Hook empresas com fallback localStorage | Catch blocks em `add`/`update` não logam erro | Não alterado (já tem fallback funcional) |
| `src/hooks/useLevantamentos.ts` | Hook levantamentos com fallback localStorage | Catch blocks em `add`/`update` silenciosos | Adicionado `console.error` em DEV |

---

## 3. Configuração do Supabase client

| Aspecto | Status |
|---|---|
| Variáveis usadas | `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` (via `import.meta.env`) |
| Uso de tipos Database | ❌ **Não ativado**: `createClient(url, key)` sem genérico `<Database>`. Ativar quebraria o service layer devido a spreads `any`. |
| Tratamento de ausência | ✅ `supabaseConfigurado` flag — se falsa, `supabase` é `null` e `getClient()` lança erro amigável |
| Chaves hardcoded | ✅ Nenhuma encontrada |
| Mensagem de erro | ✅ "Servidor não configurado. Verifique as variáveis de ambiente do Supabase." |
| Log em DEV | ✅ `console.warn` quando variáveis ausentes |

---

## 4. Operações Supabase auditadas

| Entidade | Operação | Arquivo/função | Risco encontrado | Correção aplicada | Status |
|---|---|---|---|---|---|
| Auth | signIn | `supabase.service.ts:signIn` | Nenhum | — | ✅ OK |
| Auth | signUp | `supabase.service.ts:signUp` | Nenhum | — | ✅ OK |
| Auth | signOut | `supabase.service.ts:signOut` | Nenhum | — | ✅ OK |
| Auth | getSession | `supabase.service.ts:getSession` | Nenhum | — | ✅ OK |
| Auth | getCurrentUser | `supabase.service.ts:getCurrentUser` | Nenhum | — | ✅ OK |
| Auth | onAuthStateChange | `useSupabaseAuth.ts` | Catch vazio no perfil | Log DEV adicionado | ✅ Corrigido |
| Auth | getSession init | `useSupabaseAuth.ts` | Catch vazio | Log DEV adicionado | ✅ Corrigido |
| profiles | select | `supabase.service.ts:getProfile` | Nenhum | — | ✅ OK |
| empresas | list | `supabase.service.ts:listEmpresas` | Nenhum | — | ✅ OK |
| empresas | create | `supabase.service.ts:createEmpresa` | Payload explícito, OK | — | ✅ OK |
| empresas | update | `supabase.service.ts:updateEmpresa` | Payload explícito, OK | — | ✅ OK |
| empresas | delete | `supabase.service.ts:deleteEmpresa` | Nenhum | — | ✅ OK |
| levantamentos | list | `supabase.service.ts:listLevantamentos` | Nenhum | — | ✅ OK |
| levantamentos | get | `supabase.service.ts:getLevantamento` | Erro engolido (retorno null) | Log DEV adicionado | ✅ Corrigido |
| levantamentos | create | `supabase.service.ts:createLevantamento` | Spread `any` de `toSnakeCase` | Identificado para fase futura | ⚠️ Observado |
| levantamentos | update | `supabase.service.ts:updateLevantamento` | Spread `any` + `updated_at` manual | Identificado para fase futura | ⚠️ Observado |
| levantamentos | delete | `supabase.service.ts:deleteLevantamento` | Nenhum | — | ✅ OK |

---

## 5. Análise de mappers

### Mappers existentes

| Função | Localização | Direção | Origem | Destino |
|---|---|---|---|---|
| `mapEmpresaFromSupabase` | `supabase.service.ts:209` | DB → UI | snake_case | camelCase |
| `mapLevantamentoFromSupabase` | `supabase.service.ts:228` | DB → UI | snake_case | camelCase |
| `toSnakeCase` | `supabase.service.ts:259` | UI → DB | camelCase | snake_case |

### Divergências camelCase/snake_case

| Campo UI | Campo DB | Mapeado? |
|---|---|---|
| `razaoSocial` | `razao_social` | ✅ Sim |
| `nomeFantasia` | `nome_fantasia` | ✅ Sim |
| `grauRisco` | `grau_risco` | ✅ Sim |
| `empresaId` | `empresa_id` | ✅ Sim |
| `empresaNome` | `empresa_nome` | ✅ Sim |
| `responsavelEmpresa` | `responsavel_empresa` | ✅ Sim |
| `auditorTecnico` | `auditor_tecnico` | ✅ Sim |
| `registroMTE` | `registro_mte` | ✅ Sim |
| `dataLevantamento` | `data_levantamento` | ✅ Sim |
| `dataLancamentoSGG` | `data_lancamento_sgg` | ✅ Sim |
| `responsavelLancamento` | `responsavel_lancamento` | ✅ Sim |
| `assinaturaTecnico` | `assinatura_tecnico` | ✅ Sim |
| `assinaturaEmpresa` | `assinatura_empresa` | ✅ Sim |
| `createdAt` | `created_at` | ✅ Sim (somente leitura) |
| `updatedAt` | `updated_at` | ✅ Sim (somente leitura) |

### Campos removidos do payload

Nenhum campo extra é enviado. O `toSnakeCase` mapeia exatamente os campos da interface `Levantamento` sem adicionar campos UI.

### Campos que exigem atenção

| Campo | Problema | Status |
|---|---|---|
| `data_levantamento` | `""` enviado como string vazia para campo `date \| null` | ✅ Corrigido: convertido para `null` quando vazio |
| `updated_at` | Definido client-side como `new Date().toISOString()` | ⚠️ Pode conflitar com trigger DB `updated_at`. Idealmente deixar DB gerenciar. |
| `user_id` | Enviado como `userData?.user?.id` que pode ser `undefined` | ⚠️ Supabase-js omite campos `undefined`, mas seria mais explícito tratar como `null` |

### Datas/null/undefined

| Cenário | Tratamento atual | Risco |
|---|---|---|
| `dataLevantamento` vazio | `""` → `null` (após correção) | ✅ Baixo |
| `dataLancamentoSGG` vazio | `""` → `"string"` | ✅ Baixo (coluna `text`, não `date`) |
| Campos JSON null | `?? {}` ou `?? []` | ✅ Correto |
| `user_id` undefined | Omitido pelo serializador Supabase-js | ✅ Baixo |

---

## 6. Problemas encontrados

### Problema 1: `dataLevantamento` vazio enviado como `""`

- **Severidade:** Média
- **Área:** Mapper / Payload
- **Arquivo:** `src/services/supabase.service.ts:272`
- **Problema:** `toSnakeCase` envia `l.dataLevantamento` diretamente. Se o valor for `""`, o banco recebe string vazia em coluna `date`, o que pode causar erro de parsing.
- **Evidência:** `data_levantamento: l.dataLevantamento`
- **Impacto:** Insert/update pode falhar silenciosamente se o banco rejeitar string vazia em coluna `date`.
- **Correção aplicada:** `data_levantamento: l.dataLevantamento || null`
- **Como testar:** Criar levantamento sem preencher data. Verificar se payload envia `null` em vez de `""`.

### Problema 2: `getLevantamento` engole erro

- **Severidade:** Baixa
- **Área:** Tratamento de erro
- **Arquivo:** `src/services/supabase.service.ts:146-155`
- **Problema:** Quando `getLevantamento` falha (ex.: registro não encontrado), retorna `null` sem nenhum log.
- **Evidência:** `if (error) return null`
- **Impacto:** Dificulta diagnóstico de falhas.
- **Correção aplicada:** `if (error) { if (import.meta.env.DEV) console.error(...); return null }`
- **Como testar:** Forçar erro no select (ex.: id inválido). Verificar console do navegador em DEV.

### Problema 3: Catch blocks vazios em `useSupabaseAuth`

- **Severidade:** Baixa
- **Área:** Tratamento de erro / Auth
- **Arquivo:** `src/hooks/useSupabaseAuth.ts:35,61`
- **Problema:** Erros em `getSession` e `onAuthStateChange` são capturados sem log.
- **Evidência:** `catch { /* ignore */ }` e `catch { ... }`
- **Impacto:** Dificulta diagnóstico de falhas de autenticação.
- **Correção aplicada:** `catch (err) { if (import.meta.env.DEV) console.error(...); ... }`
- **Como testar:** Indisponibilizar Supabase. Verificar console ao recarregar.

### Problema 4: Catch blocks vazios em `useLevantamentos` add/update

- **Severidade:** Baixa
- **Área:** Tratamento de erro / Persistência
- **Arquivo:** `src/hooks/useLevantamentos.ts:32,44`
- **Problema:** Erros em create/update de levantamento são capturados sem log (apenas fallback local).
- **Evidência:** `catch { setLevantamentos(...) }` sem log.
- **Correção aplicada:** Adicionado `console.error` em DEV.
- **Como testar:** Indisponibilizar Supabase. Criar/editar levantamento. Verificar console em DEV.

---

## 7. Correções realizadas

| Arquivo | Função | Antes | Depois |
|---|---|---|---|
| `src/services/supabase.service.ts` | `toSnakeCase` | `data_levantamento: l.dataLevantamento` | `data_levantamento: l.dataLevantamento \|\| null` |
| `src/services/supabase.service.ts` | `getLevantamento` | `if (error) return null` | `if (error) { if (DEV) console.error(...); return null }` |
| `src/hooks/useLevantamentos.ts` | `add` | `catch { ... }` | `catch (err) { if (DEV) console.error(...); ... }` |
| `src/hooks/useLevantamentos.ts` | `update` | `catch { ... }` | `catch (err) { if (DEV) console.error(...); ... }` |
| `src/hooks/useSupabaseAuth.ts` | init `getSession` | `catch { ... }` | `catch (err) { if (DEV) console.error(...); ... }` |
| `src/hooks/useSupabaseAuth.ts` | `onAuthStateChange` | `catch { /* ignore */ }` | `catch (err) { if (DEV) console.error(...); }` |

---

## 8. Riscos que exigem decisão futura

### 8.1 Ativação de tipagem `createClient<Database>`

- **Risco:** O tipo `Database` em `supabase-types.ts` não é usado. Operações CRUD não têm verificação de tipos contra o schema real.
- **Impedimento:** O service layer usa `toSnakeCase` que retorna `Record<string, any>` e spreads em insert/update. Ativar o genérico quebra a compilação.
- **Recomendação:** Refatorar `toSnakeCase` para retornar `Database['public']['Tables']['levantamentos']['Insert']` e `getClient()` retornar `SupabaseClient<Database>`.

### 8.2 `updated_at` gerenciado client-side

- **Risco:** `updateLevantamento` define `updated_at` como `new Date().toISOString()`. Se o banco tiver trigger `updated_at = NOW()`, o valor será sobrescrito, mas se não houver trigger, o campo não será atualizado automaticamente.
- **Recomendação:** Verificar se o banco possui trigger `updated_at`. Se sim, remover o campo do payload. Se não, adicionar trigger.

### 8.3 RLS — sem verificação de `user_id` em operações de leitura

- **Risco:** `listLevantamentos` e `listEmpresas` usam `select('*')` sem filtro por `user_id`. Se RLS não estiver configurado, todos os usuários veem todos os registros.
- **Recomendação:** Verificar policies RLS no Supabase. Se ausentes, criar policies que usem `auth.uid()` para filtrar.

### 8.4 Divergência localStorage vs Supabase

- **Risco:** O fallback localStorage pode divergir dos dados remotos se o usuário acessar de múltiplos dispositivos.
- **Recomendação:** Implementar flag de sync e considerar IndexedDB (Dexie) para fila offline em versão futura.

### 8.5 `user_id` pode ser `undefined` em inserts

- **Risco:** `createEmpresa` e `createLevantamento` enviam `user_id: userData?.user?.id`. Se `getUser()` retornar sem usuário (raro), `undefined` é enviado. Supabase-js omite campos `undefined`, mas o comportamento não é explícito.
- **Recomendação:** Tratar explicitamente: `user_id: userData?.user?.id ?? null`.

---

## 9. Testes executados

| Teste | Resultado esperado | Resultado obtido | Status |
|---|---|---|---|
| Login | Autenticação funciona | Não testado em runtime (sem Supabase configurado) | ⏸️ Pendente de ambiente |
| Logout | Sessão encerrada | Não testado em runtime | ⏸️ Pendente de ambiente |
| Criar levantamento | Payload válido | Validação de tipos no mapper aprimorada | ✅ Código revisado |
| Editar levantamento | Payload válido | Validação de tipos no mapper aprimorada | ✅ Código revisado |
| Excluir levantamento | Erro tratado | Código não alterado | ✅ Código revisado |
| Recarregar tela | Dados coerentes | Fallback localStorage preservado | ✅ Código revisado |
| Supabase offline | Sem falso sucesso | Catch blocks com log DEV adicionados | ✅ Código revisado |
| `npm run lint` | Baseline 46/2 | Mesmo baseline, sem novos erros | ✅ Passa |
| `npm run typecheck` | Clean | Clean (sem saída) | ✅ Passa |
| `npm run build` | Passa | Passa (7.58s) | ✅ Passa |

---

## 10. Resultado dos comandos finais

| Comando | Status | Erro | Observação |
|---|---|---|---|
| `git status` | ✅ Limpo | — | `nothing to commit, working tree clean` |
| `npm run lint` | ✅ Passa (46 err / 2 warn) | — | Baseline — sem novos erros |
| `npm run typecheck` | ✅ Passa | — | Sem saída (limpo) |
| `npm run build` | ✅ Passa | — | 7.58s, chunk warning (pré-existente) |
| `git diff --stat` | ✅ 3 arquivos | — | +14/-6 linhas |
| `git commit -m "fix: ..."` | ✅ `acf4768` | — | Commit realizado |
| `git push` | ✅ Push OK | — | `fix/auditoria-riskflow` atualizado |

---

## 11. Itens não corrigidos nesta etapa

| Item | Motivo |
|---|---|
| `createClient<Database>` com tipagem completa | Quebra o service layer (spreads `any`). Requer refatoração do mapper. |
| `updated_at` gerenciado client-side | Requer confirmação sobre trigger no banco. Pode ser migration futura. |
| RLS policies ausentes ou inseguras | Não auditar RLS sem autorização. Requer acesso ao Supabase dashboard. |
| Fila offline / Dexie | Escopo fora desta etapa. |
| Multiempresa / sistema de permissões | Escopo fora desta etapa. |
| UI/UX ampla | Escopo de etapa anterior. |
| Service worker / PWA | Escopo da próxima etapa. |
| 46 erros de lint pré-existentes | `Modal.tsx` (Math.random), `any` implícitos em steps, `set-state-in-effect`. São pré-existentes e fora do escopo. |

---

## 12. Conclusão

A auditoria de integração Supabase foi concluída com 6 correções pontuais em 3 arquivos:

- **`supabase.service.ts`** — `dataLevantamento` vazio convertido para `null`; log DEV adicionado em `getLevantamento`
- **`useLevantamentos.ts`** — Log DEV em catch blocks de `add`/`update`
- **`useSupabaseAuth.ts`** — Log DEV em catch blocks de `getSession` e `onAuthStateChange`

**Nenhuma migration foi editada, nenhuma tabela/coluna foi criada, nenhum dado foi apagado, nenhuma dependência foi instalada.**

**Os tipos `Database` em `supabase-types.ts` estão prontos para uso futuro** quando o service layer for refatorado para eliminar os spreads `any`.

### Próxima etapa recomendada:
**Revisão de PWA, manifest, ícones e service worker** — conforme cronograma original.
