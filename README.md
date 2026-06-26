# 🎬 CarsaiPlay v2.1 — React + Capacitor + Firebase

Plataforma de streaming desenvolvida em **Moçambique** 🇲🇿

## Stack
| Camada       | Tecnologia |
|---|---|
| Frontend     | React 18 + TypeScript + Vite |
| Estilos      | Tailwind CSS + Framer Motion |
| Estado       | Zustand + TanStack Query |
| Mobile       | Capacitor 6 (Android) |
| Firebase     | Auth (Google/Facebook) + FCM + Firestore + Analytics |
| Backend API  | Vercel Edge Functions (Node.js) |
| Base de dados| Neon PostgreSQL (serverless) |
| Deploy web   | Vercel |
| CI/CD        | GitHub Actions |

---

## ⚡ Início Rápido

```bash
# 1. Instalar dependências (gera package-lock.json automaticamente)
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env
# Editar: VITE_API_URL, DATABASE_URL, Firebase keys...

# 3. Criar schema no Neon
# Executar database/schema.sql e depois database/schema_additions.sql
# no SQL Editor do Neon Console

# 4. Iniciar servidor de desenvolvimento
npm run dev
```

> ⚠️ **Importante**: Depois do primeiro `npm install`, faz commit do `package-lock.json`
> gerado para que os workflows do GitHub Actions funcionem correctamente.

---

## 🔑 Variáveis de Ambiente

### Vercel (Production)
Adicionar em **Vercel → Project → Settings → Environment Variables**:

| Variável | Descrição |
|---|---|
| `DATABASE_URL` | Connection string Neon PostgreSQL |
| `APP_SECRET` | String secreta para hash de passwords |
| `APP_URL` | URL pública (ex: `https://carsaiplay.vercel.app`) |
| `FIREBASE_PROJECT_ID` | ID do projecto Firebase |
| `FIREBASE_API_KEY` | API Key Firebase (backend) |

### GitHub Secrets
Adicionar em **Repo → Settings → Secrets → Actions**:

| Secret | Descrição |
|---|---|
| `VITE_API_URL` | `https://carsaiplay.vercel.app/api/v1` |
| `VERCEL_TOKEN` | Token da Vercel |
| `VERCEL_ORG_ID` | ID da organização Vercel |
| `VERCEL_PROJECT_ID` | ID do projecto Vercel |
| `VITE_FIREBASE_API_KEY` | Firebase Web API Key |
| `VITE_FIREBASE_AUTH_DOMAIN` | `xxx.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | ID do projecto Firebase |
| `VITE_FIREBASE_STORAGE_BUCKET` | `xxx.appspot.com` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Sender ID |
| `VITE_FIREBASE_APP_ID` | App ID |
| `VITE_FIREBASE_VAPID_KEY` | VAPID key para web push |
| `ANDROID_KEYSTORE_BASE64` | `base64 -w0 release.keystore` |
| `KEYSTORE_PASSWORD` | Password do keystore |
| `KEY_ALIAS` | Alias da chave (ex: `carsaiplay`) |
| `KEY_PASSWORD` | Password da chave |

---

## 🤖 Build Android

```bash
# 1. Build web
npm run build

# 2. Adicionar plataforma Android (apenas 1ª vez)
npx cap add android

# 3. Copiar configs de android-configs/ para os ficheiros Android correctos
#    Ver README de android-configs/

# 4. Sincronizar
npx cap sync android

# 5. Abrir no Android Studio
npx cap open android
```

---

## 🚀 GitHub Actions — Workflows

| Workflow | Gatilho | Output |
|---|---|---|
| `deploy-web.yml`  | Push `main` | Deploy Vercel |
| `build-apk.yml`   | Push `main`/`develop`, PR | APK debug (artifact) |
| `release.yml`     | Tag `v*.*.*` | APK + AAB assinados + GitHub Release + Deploy |
| `checks.yml`      | Pull Requests | TypeCheck + Build |

### Criar uma release

```bash
git add .
git commit -m "feat: nova funcionalidade"
git tag v2.1.0
git push origin main --tags
# O workflow release.yml cria automaticamente o GitHub Release
```

---

## 🗄️ Base de Dados (Neon)

1. Criar projecto em https://neon.tech
2. Copiar connection string → `DATABASE_URL`
3. No **SQL Editor** do Neon, executar **por ordem**:
   - `database/schema.sql`
   - `database/schema_additions.sql`

---

## 🔥 Firebase

1. Criar projecto em https://console.firebase.google.com
2. Activar **Authentication** → Google + Facebook
3. Activar **Cloud Messaging** (FCM)
4. Activar **Firestore Database**
5. Activar **Analytics**
6. Copiar as keys para `.env` e GitHub Secrets

---

## 📁 Estrutura

```
carsaiplay-react/
├── .github/workflows/      # CI/CD (deploy, APK, release, checks)
├── android-configs/        # Configs de referência para Android
├── api/                    # Vercel Edge Functions
│   ├── _db.js              # Cliente Neon partilhado
│   ├── sitemap.xml.js      # Sitemap dinâmico
│   └── v1/                 # ~94 rotas REST
│       ├── auth/           # login, register, logout, forgot, reset, firebase
│       ├── admin/          # dashboard, content, users, comments, requests...
│       ├── user/           # history, stats, achievements, profiles, follows...
│       └── episodes/       # episódio por ID
├── database/
│   ├── schema.sql          # Schema base + seed
│   └── schema_additions.sql # Tabelas avançadas (comentários, perfis, FCM...)
├── public/                 # favicon, manifest, SVGs
└── src/
    ├── api/                # Clientes axios (content, auth, user)
    ├── components/
    │   ├── layout/         # Header, Footer, MobileNav, MainLayout, AdminLayout, AuthLayout
    │   ├── shared/         # ProtectedRoute
    │   └── ui/             # ContentCard, HeroSlider, ContentRow, Comments,
    │                       # StarRating, Skeleton, ReportButton, ShareButton,
    │                       # PwaInstallBanner, RandomButton, PageLoader
    ├── hooks/              # useContent, useLang, useFirebaseAuth,
    │                       # usePushNotifications, useFirebaseAnalytics,
    │                       # useRealtimeNotifications
    ├── lib/                # firebase.ts
    ├── pages/
    │   ├── admin/          # 18 páginas admin (Dashboard, Content, ContentForm,
    │   │                   # Episodes, Users, Blog, BlogForm, Comments, Requests,
    │   │                   # Categories, Schedule, Notifications, Emails, Ads,
    │   │                   # Reports, Settings, Logs, DbManager)
    │   ├── auth/           # Login (+ OAuth), Register, Forgot, Reset
    │   ├── user/           # Dashboard, Favorites, History, WatchLater,
    │   │                   # Notifications, Achievements, Profiles, Follows,
    │   │                   # Reminders, Stats, Requests, Profile, Settings
    │   └── (public)        # Home, Catalog, Content, Episode, Search, Schedule,
    │                       # Blog, BlogPost, About, Contact, Request, Terms,
    │                       # Privacy, Faq, Dmca, ApiDocs, SharedList, NotFound
    ├── store/              # authStore, settingsStore (Zustand)
    ├── styles/             # globals.css (Tailwind)
    ├── types/              # TypeScript types
    └── utils/              # helpers (imgUrl, formatDate, typeLabel...)
```

---

*CarsaiPlay © 2025 · Moçambique 🇲🇿 · UTC+02*
