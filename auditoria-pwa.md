# Auditoria de Configuração PWA — RiskFlow

## 1. Branch atual

| Item | Valor |
|---|---|
| Branch confirmada | `fix/auditoria-riskflow` |
| Status inicial | `nothing to commit, working tree clean` (exceto `auditoria-supabase.md` não versionado) |
| Status final | `5fa0b25 fix: revisa configuracao pwa e service worker` |
| Upstream | `origin/fix/auditoria-riskflow` |

---

## 2. Arquivos PWA encontrados

| Arquivo | Finalidade | Status | Observação |
|---|---|---|---|
| `public/manifest.json` | Manifest do PWA | ✅ Corrigido | Adicionado `scope`, `id`, `display_override` |
| `public/favicon.svg` | Favicon SVG | ✅ OK | 258 bytes, referenciado em `index.html` |
| `public/icon-192.png` | Ícone PWA 192×192 | ✅ OK | 3172 bytes, referenciado no manifest |
| `public/icon-512.png` | Ícone PWA 512×512 | ✅ OK | 12539 bytes, referenciado no manifest |
| `public/maskable-512.png` | Ícone maskable 512×512 | ✅ OK | 12539 bytes, referenciado no manifest |
| `public/icon-192.svg` | Ícone vetorial 192 | ✅ OK | 259 bytes, não referenciado (excedente) |
| `public/icon-512.svg` | Ícone vetorial 512 | ✅ OK | 261 bytes, não referenciado (excedente) |
| `index.html` | Entry point HTML | ✅ Corrigido | Adicionado `apple-touch-icon` |
| `vite.config.ts` | Config Vite + vite-plugin-pwa | ✅ OK | Sem alterações necessárias |
| `public/_headers` | Headers Netlify | ✅ OK | Security headers adequados |
| `public/_redirects` | Redirecionamentos Netlify | ✅ OK | SPA fallback `/* /index.html 200` |

---

## 3. Análise do manifest

| Propriedade | Valor atual | Status | Correção/recomendação |
|---|---|---|---|
| `name` | `Efetiva RiskFlow — LPR/AEP Digital` | ✅ OK | — |
| `short_name` | `RiskFlow` | ✅ OK | — |
| `description` | `Gestão digital de LPR, AEP e riscos ocupacionais` | ✅ OK | — |
| `start_url` | `/` | ✅ OK | — |
| `scope` | `/` | ✅ Corrigido | Adicionado explicitamente (antes: ausente, usava default `/`) |
| `id` | `/` | ✅ Corrigido | Adicionado — identidade única do app para updates |
| `display` | `standalone` | ✅ OK | — |
| `display_override` | `["window-controls-overlay", "standalone"]` | ✅ Adicionado | Melhora desktop PWA |
| `orientation` | `portrait-primary` | ✅ OK | — |
| `theme_color` | `#0B6B3A` | ✅ OK | Verde marca, consistente com `index.html` |
| `background_color` | `#F8FAFC` | ✅ OK | Cinza claro, consistente com tema |
| `lang` | `pt-BR` | ✅ OK | — |
| `icons[0].src` | `/icon-192.png` | ✅ OK | Existe, 192×192 PNG |
| `icons[1].src` | `/icon-512.png` | ✅ OK | Existe, 512×512 PNG |
| `icons[2].src` | `/maskable-512.png` | ✅ OK | Existe, 512×512 maskable |
| `icons[*].purpose` | `maskable` no terceiro ícone | ✅ OK | — |

---

## 4. Análise dos ícones

| Ícone | Caminho | Existe? | Tamanho esperado | Status |
|---|---|---|---|---|
| Favicon SVG | `/favicon.svg` | ✅ Sim | SVG | ✅ OK |
| Ícone 192×192 PNG | `/icon-192.png` | ✅ Sim | 192×192 | ✅ OK |
| Ícone 512×512 PNG | `/icon-512.png` | ✅ Sim | 512×512 | ✅ OK |
| Maskable 512×512 PNG | `/maskable-512.png` | ✅ Sim | 512×512 | ✅ OK |
| Apple Touch Icon | `/icon-192.png` | ✅ Sim | 192×192 (reutilizado) | ✅ Corrigido — adicionada tag no `index.html` |
| Ícone 192×192 SVG | `/icon-192.svg` | ✅ Sim | SVG | ⏸️ Excedente, não referenciado |
| Ícone 512×512 SVG | `/icon-512.svg` | ✅ Sim | SVG | ⏸️ Excedente, não referenciado |

---

## 5. Análise do service worker / cache

### Estratégia encontrada

O projeto usa `vite-plugin-pwa` com `registerType: 'autoUpdate'` no modo `generateSW`.

- **Plugin**: `vite-plugin-pwa` v1.3.0
- **Estratégia**: Precaching de assets estáticos (JS, CSS, HTML, PNG, SVG, WOFF2) via Workbox precache
- **Navegação**: `NavigationRoute` que serve `index.html` para rotas SPA
- **Registro**: Automático via script injetado `registerSW.js`
- **Atualização**: `autoUpdate` com `skipWaiting()` + `clientsClaim()` — nova versão assume imediatamente

### Risco de stale cache

| Risco | Status | Observação |
|---|---|---|
| Bundle antigo servido | ✅ Controlado | Precache usa hashes (revision hash nos URLs); `cleanupOutdatedCaches()` ativado |
| Cache de Supabase/API | ✅ **Ausente** | Não há `runtimeCaching` configurado. SW não intercepta chamadas a `*.supabase.co` |
| Cache de navegação velho | ✅ Controlado | `NavigationRoute` com handler bound a `index.html` (precached com hash) |
| Assets antigos acumulados | ✅ Controlado | `cleanupOutdatedCaches()` ativado |

### Risco de cache de Supabase/API

**Nenhum risco encontrado.** A configuração não possui `runtimeCaching`, portanto:

- Chamadas `supabase.co` (auth, REST, storage) **não são interceptadas** pelo SW
- Apenas assets estáticos (JS, CSS, HTML, PNG, SVG, WOFF2) e navegação SPA são gerenciados
- Estratégia de cache correta para um app PWA focado em formulários

---

## 6. Problemas encontrados

### Problema 1: `apple-touch-icon` ausente no `index.html`

- **Severidade:** Média
- **Área:** PWA / iOS
- **Arquivo:** `index.html`
- **Problema:** Sem `<link rel="apple-touch-icon">`, o iOS não exibe ícone personalizado ao adicionar à tela inicial.
- **Evidência:** Ausência da tag no `<head>`.
- **Impacto:** Usuários iOS veem ícone padrão (screenshot do app) em vez do ícone RiskFlow.
- **Correção aplicada:** Adicionado `<link rel="apple-touch-icon" href="/icon-192.png">`
- **Como testar:** Abrir no Safari iOS, adicionar à tela inicial, verificar ícone.

### Problema 2: `scope` e `id` ausentes no `manifest.json`

- **Severidade:** Baixa
- **Área:** PWA / Manifest
- **Arquivo:** `public/manifest.json`
- **Problema:** `scope` e `id` não definidos. O browser usa defaults que podem variar conforme contexto.
- **Evidência:** Ausência das propriedades no JSON.
- **Impacto:** Risco de comportamento inconsistente entre navegadores. Sem `id`, a identidade do app depende da URL do manifest.
- **Correção aplicada:** Adicionado `"scope": "/"` e `"id": "/"`.
- **Como testar:** Verificar DevTools > Application > Manifest.

### Problema 3: Sem `display_override` no `manifest.json`

- **Severidade:** Baixa
- **Área:** PWA / Desktop
- **Arquivo:** `public/manifest.json`
- **Problema:** Sem `display_override`, o PWA não usa `window-controls-overlay` no desktop.
- **Evidência:** Ausência da propriedade.
- **Impacto:** Desktop PWA não tem title bar customizada.
- **Correção aplicada:** Adicionado `"display_override": ["window-controls-overlay", "standalone"]`.
- **Como testar:** Instalar PWA no desktop Chrome, verificar title bar.

---

## 7. Correções realizadas

| Arquivo | Comportamento anterior | Comportamento novo | Justificativa |
|---|---|---|---|
| `public/manifest.json` | Sem `scope` e `id` | `scope: "/"`, `id: "/"` | Identidade explícita do PWA |
| `public/manifest.json` | Sem `display_override` | `display_override: ["window-controls-overlay", "standalone"]` | Melhora experiência desktop |
| `index.html` | Sem `apple-touch-icon` | `<link rel="apple-touch-icon" href="/icon-192.png">` | Necessário para iOS PWA |

---

## 8. Recomendações futuras

| Recomendação | Motivo | Prioridade |
|---|---|---|
| **Toast de nova versão** | `registerType: 'autoUpdate'` atualiza silenciosamente. Mudar para `registerType: 'prompt'` + `onServiceWorkerUpdate` permitiria notificar o usuário. Requer criação de componente de aviso. | Média |
| **Teste Lighthouse** | Executar Lighthouse no preview ou produção para validar pontuação PWA (installable, offline, performance). | Baixa |
| **Validação em celular real** | Testar instalação em Android (Chrome) e iOS (Safari) para verificar ícones, splash screen e comportamento offline. | Média |
| **Página offline simples** | Adicionar página offline customizada para quando o usuário estiver sem conexão e a página não estiver em cache. | Baixa |
| **Ícones SVG nos manifest** | Os SVG existentes (`icon-192.svg`, `icon-512.svg`) não são referenciados. Se o suporte a SVG icons no PWA melhorar, podem substituir os PNG. | Muito Baixa |

---

## 9. Testes executados

| Teste | Resultado esperado | Resultado obtido | Status |
|---|---|---|---|
| `npm run build` | Build concluído | Build concluído em 7.83s | ✅ Passa |
| `npm run lint` | Baseline 46/2 | Mesmo baseline (46 err, 2 warn) | ✅ Passa |
| `npm run typecheck` | Clean | Clean (sem saída) | ✅ Passa |
| `npm run preview` | Servidor inicia | Servidor inicia em `localhost:4173` | ✅ Passa |
| Manifest gerado em `dist/` | `scope`, `id`, `display_override` presentes | Presentes no JSON | ✅ OK |
| `index.html` gerado em `dist/` | `apple-touch-icon` presente | Tag presente no HTML | ✅ OK |
| Service worker gerado | Precache + NavigationRoute | `sw.js` gerado com 32 entries precached | ✅ OK |
| Cache de Supabase | Nenhuma chamada cacheada | Nenhum `runtimeCaching` configurado | ✅ OK |
| `cleanupOutdatedCaches` | Ativado | Chamada no SW gerado | ✅ OK |
| `skipWaiting` + `clientsClaim` | Ativado | Chamadas no SW gerado | ✅ OK |

---

## 10. Resultado dos comandos finais

| Comando | Status | Erro | Observação |
|---|---|---|---|
| `git status` | ✅ Limpo | — | Apenas `auditoria-supabase.md` não versionado |
| `npm run lint` | ✅ Passa (46 err / 2 warn) | — | Baseline — sem novos erros |
| `npm run typecheck` | ✅ Passa | — | Sem saída (limpo) |
| `npm run build` | ✅ Passa | — | 7.83s, chunk warning pré-existente |
| `npm run preview` | ✅ Inicia | — | `localhost:4173` |
| `git diff --stat` | ✅ 2 arquivos (4 inserções) | — | `index.html` + `public/manifest.json` |
| `git commit` | ✅ `5fa0b25` | — | Commit: `fix: revisa configuracao pwa e service worker` |
| `git push` | ✅ Push OK | — | Branch `fix/auditoria-riskflow` atualizado |

---

## 11. Itens não corrigidos nesta etapa

| Item | Motivo |
|---|---|
| Toast de nova versão | Exigiria `registerType: 'prompt'` + novo componente UI. Registrado como recomendação. |
| Página offline | Escopo fora desta etapa. Registrado como recomendação. |
| Testes Lighthouse | Requer ambiente com navegador. Recomendado para próxima etapa. |
| Teste em celular real | Requer dispositivo físico. Recomendado antes do deploy. |
| Supabase / Auth / CRUD | Escopo de etapas anteriores. |
| UI/UX ampla | Escopo de etapa anterior. |
| 46 erros de lint pré-existentes | Pré-existentes, fora do escopo. |

---

## 12. Conclusão

A auditoria PWA foi concluída com **3 correções pontuais em 2 arquivos** (+4 linhas):

| Arquivo | Correção |
|---|---|
| `public/manifest.json` | Adicionados `scope`, `id`, `display_override` |
| `index.html` | Adicionado `<link rel="apple-touch-icon">` |

**Nenhum dado foi apagado, nenhum storage foi limpo, nenhuma migration foi editada, nenhuma dependência foi instalada.**

### Configuração PWA atual:
- **Manifest**: Válido, com name, short_name, icons (192, 512, maskable), theme_color, background_color, scope, id, display, orientation
- **Service Worker**: Gerado automaticamente via `vite-plugin-pwa` (`generateSW`), com precache de 32 assets, `cleanupOutdatedCaches`, `skipWaiting`, `clientsClaim`
- **Cache**: Apenas assets estáticos são precacheados. **Supabase/API não são cacheados**
- **Atualização**: Automática (nova versão assume imediatamente)
- **iOS**: Agora com `apple-touch-icon` para instalação

### Próxima etapa recomendada:
**Testes funcionais finais, validação geral e relatório de entrega** — conforme cronograma original.
