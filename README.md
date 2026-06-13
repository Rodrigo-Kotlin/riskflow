<div align="center">
  <img src="public/icon-192.png" alt="RiskFlow" width="80" height="80" />
  <h1 align="center">Efetiva RiskFlow</h1>
  <p align="center">Plataforma digital para gestão de LPR, AEP e riscos ocupacionais</p>
  <p align="center">
    <img src="https://img.shields.io/badge/version-1.0.0-0B6B3A?style=flat-square" alt="Version" />
    <img src="https://img.shields.io/badge/license-MIT-0B6B3A?style=flat-square" alt="License" />
    <img src="https://img.shields.io/badge/stack-React%20%7C%20Supabase%20%7C%20Tailwind-0B6B3A?style=flat-square" alt="Stack" />
    <img src="https://img.shields.io/badge/PWA-✓-0B6B3A?style=flat-square" alt="PWA" />
  </p>
</div>

---

**Efetiva RiskFlow** é um aplicativo web progressivo (PWA) desenvolvido para simplificar e digitalizar o processo de elaboração de **Laudos Periciais de Riscos (LPR)**, **Laudos Técnicos de Periculosidade (LPP)** e **Análise Ergonômica Preliminar (AEP)**.

O sistema guia o usuário por um fluxo de 8 etapas — desde a identificação da empresa contratante até a assinatura digital do parecer técnico — com suporte a medições ambientais, inventário de riscos, plano de ação e geração de relatórios em PDF.

## Funcionalidades

- **Autenticação** — Login e cadastro com Supabase Auth; fallback offline com localStorage
- **Gestão de Empresas** — Cadastro completo (CNPJ, CNAE, grau de risco, endereço, contato)
- **Levantamentos** — Criação, edição, duplicação e exclusão de laudos técnicos
- **Wizard de 8 etapas**:
  1. Identificação do cliente e dados gerais
  2. Características do local avaliado
  3. Medições pontuais (ruído, iluminância, temperatura, umidade etc.)
  4. Colaboradores e atividades
  5. Inventário de perigos e riscos (com cálculo automático de nível)
  6. Plano de ação / controles
  7. Parecer técnico (com sugestão automática)
  8. Revisão e assinaturas digitais
- **Biblioteca de Riscos** — Base de consulta com riscos, EPIs, EPCs e equipamentos pré-cadastrados
- **Relatórios** — Geração de PDF completo ou executivo com `@react-pdf/renderer`
- **Modo escuro** — Alternância com persistência via classe CSS
- **Exportação/Importação** — Backup completo dos dados em JSON
- **PWA** — Instalável em dispositivos móveis e desktop
- **Offline-first** — Dados armazenados localmente com sincronização via Supabase

## Stack

| Camada | Tecnologia |
|--------|-----------|
| **Frontend** | React 18, TypeScript, Tailwind CSS, Vite 6 |
| **Roteamento** | React Router DOM v6 (lazy loading) |
| **Formulários** | React Hook Form + Zod |
| **Backend** | Supabase (Auth, PostgreSQL, Row-Level Security) |
| **PDF** | @react-pdf/renderer |
| **Ícones** | Lucide React |
| **PWA** | vite-plugin-pwa (Workbox) |
| **Deploy** | Cloudflare Pages |
| **Ícone** | Icones da coleção Efetiva RiskFlow |

## Estrutura do Projeto

```
riskflow/
├── public/                        # Assets estáticos e config Cloudflare
│   ├── _redirects                 # SPA routing (/* → /index.html)
│   ├── _headers                   # Headers de segurança
│   ├── manifest.json              # PWA manifest
│   └── *.png / *.svg              # Favicon e ícones
├── supabase/
│   └── migrations/
│       └── 00001_initial.sql      # Schema: profiles, empresas, levantamentos, relatorios + RLS
├── src/
│   ├── components/
│   │   ├── auth/                  # PrivateRoute (guarda de autenticação)
│   │   ├── forms/                 # FormSection, SignaturePad, Stepper
│   │   ├── layout/                # AppShell, AuthLayout, AuthenticatedLayout, Sidebar, Header etc.
│   │   ├── report/                # ReportDocument (PDF), ReportPreview
│   │   ├── risk/                  # RiskCard, RiskDrawer, RiskTable
│   │   └── ui/                    # Badge, Chip, ConfirmDialog, Drawer, EmptyState, Modal etc.
│   ├── constants/                 # Enumerações (status, categorias) e labels
│   ├── data/                      # Mock data + biblioteca de riscos inicial
│   ├── hooks/                     # useSupabaseAuth, useEmpresas, useLevantamentos etc.
│   ├── lib/                       # Supabase client, storage helpers, utils
│   ├── pages/
│   │   ├── steps/                 # Step01–Step08 (wizard de levantamento)
│   │   ├── Login.tsx              # Tela de login/cadastro
│   │   ├── Dashboard.tsx          # Painel principal com estatísticas
│   │   ├── Empresas.tsx           # CRUD de empresas
│   │   ├── Levantamentos.tsx      # Listagem e CRUD de laudos
│   │   ├── NovoLevantamento.tsx   # Orquestrador do wizard
│   │   ├── Biblioteca.tsx         # Consulta de riscos, EPIs, EPCs
│   │   ├── Relatorios.tsx         # Geração de relatórios PDF
│   │   └── Configuracoes.tsx      # Ajustes do sistema
│   ├── routes/                    # Definição de rotas com lazy loading
│   ├── services/                  # Camada de API Supabase (CRUD + mappers)
│   ├── styles/                    # Globais CSS (Tailwind layers, print styles)
│   └── types/                     # Interfaces TypeScript (Empresa, Levantamento, Usuario etc.)
├── .env.example                   # Template de variáveis de ambiente
├── wrangler.toml                  # Configuração Cloudflare Pages
├── vite.config.ts                 # Config Vite + PWA + alias @
├── tailwind.config.js             # Tema customizado (cores brand, risco)
└── tsconfig.json                  # Config TypeScript
```

## Começando

### Pré-requisitos

- Node.js 18+
- npm 9+
- Conta no [Supabase](https://supabase.com) (projeto criado)
- (Opcional) Conta no [Cloudflare](https://cloudflare.com) para deploy

### Instalação

```bash
git clone https://github.com/Rodrigo-Kotlin/riskflow.git
cd riskflow
npm install
```

### Configuração

Copie o arquivo de ambiente e preencha as variáveis:

```bash
cp .env.example .env
```

| Variável | Descrição |
|----------|-----------|
| `VITE_SUPABASE_URL` | URL do seu projeto Supabase |
| `VITE_SUPABASE_ANON_KEY` | Chave anônima do Supabase |
| `VITE_ENABLE_DEMO_DATA` | `true` para exibir botão de demonstração |

### Banco de Dados

Execute o script SQL em `supabase/migrations/00001_initial.sql` no SQL Editor do Supabase para criar as tabelas, políticas de segurança e o trigger de criação automática de perfil.

### Desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:5173](http://localhost:5173).

## Deploy (Cloudflare Pages)

1. Conecte o repositório no dashboard do [Cloudflare Pages](https://pages.cloudflare.com)
2. Configure:
   - **Build command:** `npm run build`
   - **Output directory:** `dist`
3. Adicione as variáveis de ambiente (Production):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_ENABLE_DEMO_DATA=false`
4. Deploy via CLI (opcional):

```bash
npx wrangler pages deploy dist --project-name=efetiva-riskflow
```

O arquivo `public/_redirects` já configura o roteamento SPA (`/*` → `/index.html`) e `public/_headers` aplica headers de segurança.

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia servidor de desenvolvimento |
| `npm run build` | Compila TypeScript + empacota com Vite |
| `npm run preview` | Pré-visualiza o build de produção |

## Licença

Distribuído sob licença MIT. Copyright © 2026 **Efetiva RiskFlow**.
