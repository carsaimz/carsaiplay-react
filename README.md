# 🎬 CarsaiPlay v2.1 — React + Capacitor

Plataforma de streaming desenvolvida em **Moçambique** 🇲🇿

## Stack
| Camada       | Tecnologia |
|---|---|
| Frontend     | React 18 + TypeScript + Vite |
| Estilos      | Tailwind CSS + Framer Motion |
| Estado       | Zustand + TanStack Query |
| Mobile       | Capacitor 6 (Android) |
| Backend API  | Vercel Edge Functions (Node.js) |
| Base de dados| Neon PostgreSQL (serverless) |
| Deploy web   | Vercel |
| CI/CD        | GitHub Actions |

---

## ⚡ Início Rápido

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env
# Editar VITE_API_URL e DATABASE_URL

# 3. Criar schema no Neon
# Copiar database/schema.sql para o SQL Editor do Neon e executar

# 4. Iniciar servidor de desenvolvimento
npm run dev
```

---

## 🤖 Build Android

### Pré-requisitos
- Android Studio (com SDK 34)
- Java 17

```bash
# 1. Build web
npm run build

# 2. Sincronizar com Capacitor
npx cap sync

# 3. Abrir no Android Studio
npx cap open android

# Ou directo via linha de comando:
cd android && ./gradlew assembleDebug
```

---

## 🚀 GitHub Actions — Workflows

| Workflow | Gatilho | Descrição |
|---|---|---|
| `deploy-web.yml`  | Push `main` | Build + Deploy Vercel |
| `build-apk.yml`   | Push `main`/`develop`, PR | APK de debug |
| `release.yml`     | Tag `v*.*.*` | APK + AAB assinados + GitHub Release + Deploy |
| `checks.yml`      | Pull Requests | Lint + Build check |

### Secrets necessários no GitHub

```
VITE_API_URL            → URL da API (ex: https://carsaiplay.vercel.app/api/v1)
VERCEL_TOKEN            → Token da Vercel
VERCEL_ORG_ID           → ID da organização Vercel
VERCEL_PROJECT_ID       → ID do projecto Vercel
ANDROID_KEYSTORE_BASE64 → Keystore em base64: base64 -w0 release.keystore
KEYSTORE_PASSWORD       → Password do keystore
KEY_ALIAS               → Alias da chave
KEY_PASSWORD            → Password da chave
APP_SECRET              → String secreta para hash de passwords
DATABASE_URL            → Connection string Neon (apenas no backend/Vercel)
```

### Criar uma release

```bash
git tag v2.1.0
git push origin v2.1.0
# O workflow release.yml cria automaticamente o GitHub Release com APK + AAB
```

---

## 🗄️ Base de Dados (Neon)

1. Criar projecto em https://neon.tech
2. Copiar a connection string para `DATABASE_URL`
3. Executar `database/schema.sql` no SQL Editor
4. Adicionar `DATABASE_URL` nos Environment Variables da Vercel

### Tabelas principais
- `contents` — Filmes, Séries, Animações
- `seasons` + `episodes` — Temporadas e episódios
- `movies` + `embed_servers` — Servidores de embed
- `users` + `user_tokens` — Autenticação
- `favorites`, `watch_history`, `watch_later`, `follows`
- `ratings`, `achievements`, `user_achievements`
- `blog_posts`, `blog_categories`
- `schedule`, `notifications`, `ads`, `pages`, `settings`

---

## 📁 Estrutura do Projecto

```
carsaiplay-react/
├── .github/workflows/      # CI/CD GitHub Actions
├── api/                    # Vercel Edge Functions (Backend)
│   ├── _db.js              # Cliente Neon partilhado
│   └── v1/                 # Rotas da API
│       ├── auth/           # login, register, logout, forgot, reset
│       ├── admin/          # dashboard, content, users
│       ├── user/           # history, stats, achievements, profile
│       └── episodes/       # episódio por ID
├── database/
│   └── schema.sql          # Schema PostgreSQL completo + seed
├── public/                 # Assets estáticos
├── src/
│   ├── api/                # Clientes axios
│   ├── components/
│   │   ├── layout/         # Header, Footer, MobileNav, layouts
│   │   ├── shared/         # ProtectedRoute
│   │   └── ui/             # ContentCard, HeroSlider, ContentRow, etc.
│   ├── hooks/              # useContent, useLang
│   ├── pages/
│   │   ├── admin/          # Painel de administração
│   │   ├── auth/           # Login, Register, Forgot, Reset
│   │   └── user/           # Dashboard, Favoritos, Histórico, etc.
│   ├── store/              # Zustand (auth, settings)
│   ├── styles/             # globals.css (Tailwind)
│   ├── types/              # TypeScript types
│   └── utils/              # helpers
├── android-configs/        # Configs de referência para Android
├── capacitor.config.ts
├── vercel.json
├── vite.config.ts
├── tailwind.config.js
└── package.json
```

---

## 🌐 Suporte de Idiomas

O projecto suporta **Português (PT/MZ)** e **Inglês (EN)** de forma dinâmica.
- Todos os textos da UI são controlados pelo `useSettingsStore` (lang: `pt` | `en`)
- Conteúdo (filmes, posts, páginas) com colunas `_pt` e `_en` na BD
- Preferência guardada via `@capacitor/preferences`

---

## 📲 Android — Configurações Pós `cap add android`

Substituir os ficheiros em `android/app/src/main/res/values/` pelos da pasta `android-configs/`:
- `strings.xml`
- `colors.xml`
- `styles.xml`

Actualizar `android/app/build.gradle` com o conteúdo de `android-configs/build.gradle`.

---

## 🔑 Gerar Keystore para Release

```bash
keytool -genkey -v \
  -keystore release.keystore \
  -alias carsaiplay \
  -keyalg RSA -keysize 2048 \
  -validity 10000

# Codificar para base64 (para o GitHub Secret)
base64 -w0 release.keystore
```

---

*Desenvolvido em Moçambique 🇲🇿 · UTC+02 · CarsaiPlay © 2025*
