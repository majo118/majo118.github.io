# Lumina Chat

Interfaz web para el agente RAG de **Lumina** (asistente de guías de práctica clínica obstétricas). Frontend React estático desplegable en **GitHub Pages**, con **Supabase** para autenticación e historial, y un **Edge Function** que actúa de proxy seguro hacia el webhook de **n8n**.

---

## Arquitectura

```
┌──────────────┐   HTTPS + JWT   ┌────────────────────┐   secret header   ┌──────────┐
│  Frontend    │ ──────────────▶ │  Supabase Edge Fn  │ ─────────────────▶│  n8n     │
│  React (GH   │                 │  chat-proxy        │                   │  webhook │
│  Pages)      │ ◀────────────── │  (Deno)            │ ◀─────────────── │  agente  │
└──────┬───────┘   reply JSON    └─────────┬──────────┘                   └──────────┘
       │                                    │
       │  supabase-js (JWT + RLS)           │  supabase-js (server key)
       ▼                                    ▼
┌────────────────────────────────────────────────────┐
│  Supabase Auth + Postgres (RLS)                    │
│   - auth.users        (email / password)           │
│   - conversations     (una fila por chat)          │
│   - messages          (role/user/assistant)        │
└────────────────────────────────────────────────────┘
```

### Por qué este diseño

- **GitHub Pages solo aloja estático** → el frontend es una SPA de Vite/React (con `HashRouter` para evitar 404 en refresh).
- **Datos sensibles** → todos los mensajes viven en Postgres de Supabase con **Row Level Security**: cada usuario solo puede leer/escribir sus propias filas.
- **Webhook de n8n nunca en el navegador** → el frontend habla con un **Edge Function** en Supabase; el Edge Function valida el JWT del usuario y llama al webhook con un `X-Lumina-Secret`. Ni la URL de n8n ni el secreto son públicos.
- **Costo: $0** → GitHub Pages, Supabase free tier (incluye Auth, Postgres y Edge Functions), y tu instancia de n8n.

---

## Estructura del repositorio

```
lumina-chat/
├── .github/workflows/deploy.yml       # Build + deploy a GH Pages
├── public/
│   ├── lumina-logo.png                # Logo
│   └── fonts/                         # Coloca aquí Railey.woff2
├── src/
│   ├── main.jsx  App.jsx
│   ├── contexts/AuthContext.jsx
│   ├── hooks/    useAuth · useChat · useConversations
│   ├── services/ supabase · auth · chat · ai
│   ├── utils/    security · constants
│   ├── styles/   theme.css · fonts.css · global.css
│   ├── components/
│   │   ├── Auth/     Login · SignUp · AuthLayout
│   │   ├── Chat/     ChatWindow · MessageList · Message · MessageInput · TypingIndicator
│   │   ├── Sidebar/  Sidebar · ConversationList · ConversationItem
│   │   ├── Layout/   Header · Logo
│   │   └── common/   Button · LoadingSpinner · ProtectedRoute
│   └── pages/    LoginPage · SignUpPage · ChatPage
├── supabase/
│   ├── migrations/001_initial_schema.sql
│   └── functions/chat-proxy/index.ts
├── .env.example
├── index.html · vite.config.js · package.json
└── SETUP.md                           # Pasos de despliegue
```

---

## Stack

| Pieza       | Tecnología                          |
|-------------|-------------------------------------|
| UI          | React 18 + Vite 5                   |
| Ruteo       | react-router-dom (HashRouter)       |
| Auth + DB   | Supabase (Auth + Postgres + RLS)    |
| Proxy IA    | Supabase Edge Function (Deno)       |
| Agente      | n8n (webhook con secret)            |
| Hosting     | GitHub Pages                        |
| Seguridad   | JWT, RLS, DOMPurify, rate limit     |

---

## Instalación local

```bash
git clone https://github.com/<tu-usuario>/lumina-chat.git
cd lumina-chat
cp .env.example .env       # y llenar las variables
npm install
npm run dev                # http://localhost:5173
```

---

## Despliegue

Ver **[SETUP.md](./SETUP.md)** para el paso a paso completo (Supabase, Edge Function, n8n, GitHub Pages).

---

## Seguridad — resumen

- Contraseñas hasheadas y gestionadas por Supabase Auth (nunca las tocas).
- Sesiones con JWT que rota automáticamente.
- **RLS activa** en `conversations` y `messages`: aunque alguien tenga la anon key, solo ve sus filas.
- Frontend saniza input con `sanitizeUserInput` y renderiza markdown de la IA con **DOMPurify** (sin `dangerouslySetInnerHTML` sin sanear).
- El Edge Function valida el JWT, aplica rate limit (30 req/min por usuario) y verifica que la conversación pertenezca al usuario antes de llamar a n8n.
- Webhook de n8n se protege con `X-Lumina-Secret` que solo vive en las variables secretas del Edge Function.
- CORS del Edge Function debe restringirse al dominio de GitHub Pages en producción (`ALLOWED_ORIGIN`).

---

## Personalización de marca

- Paleta en `src/styles/theme.css` (variables CSS). Deriva del logo: rosados del cuerpo + glow amarillo + magenta profundo `#741b47`.
- Tipografía "Railey" para el nombre **Lumina** — coloca `Railey.woff2` en `public/fonts/`. Fallback público: **Raleway** de Google Fonts.
- Logo en `public/lumina-logo.png`. Reemplázalo cuando tengas la versión final.

---

## Licencia

Uso académico. Lumina y contenido asociado son propiedad del equipo PD2 / Uniandes.
