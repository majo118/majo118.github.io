# SETUP — Despliegue de Lumina Chat

Paso a paso desde cero hasta tener la app corriendo en `https://<tu-usuario>.github.io/lumina-chat/`.

---

## 0. Requisitos

- Cuenta de GitHub
- Cuenta de Supabase (free tier basta): https://supabase.com
- Node.js 20+ instalado local
- Supabase CLI (para desplegar el Edge Function): `npm i -g supabase`
- Tu webhook de n8n ya funcionando y accesible por HTTPS

---

## 1. Preparar Supabase

### 1.1 Crear proyecto
1. Entra a https://app.supabase.com → **New project**.
2. Guarda **Project URL** y **anon public key** (Settings → API).

### 1.2 Crear tablas y RLS
1. Ve a **SQL Editor**.
2. Pega el contenido de `supabase/migrations/001_initial_schema.sql`.
3. Ejecuta. Debes ver `conversations`, `messages` y las policies creadas.

### 1.3 Ajustes de Auth
1. **Authentication → Providers → Email**: activa "Confirm email" si quieres verificación (recomendado para datos clínicos).
2. **Authentication → URL Configuration**:
   - Site URL: `https://<tu-usuario>.github.io/lumina-chat/`
   - Redirect URLs: agrega esa misma URL.

---

## 2. Desplegar el Edge Function (proxy a n8n)

### 2.1 Enlazar el proyecto local
```bash
cd lumina-chat
supabase login
supabase link --project-ref <project-ref>   # el project-ref sale del dashboard
```

### 2.2 Setear los secretos del Edge Function
```bash
supabase secrets set N8N_WEBHOOK_URL="https://tu-n8n.example.com/webhook/lumina"
supabase secrets set N8N_SHARED_SECRET="$(openssl rand -hex 32)"
supabase secrets set ALLOWED_ORIGIN="https://<tu-usuario>.github.io"
```
> `SUPABASE_URL` y `SUPABASE_ANON_KEY` los inyecta Supabase automáticamente.
> Guarda el valor de `N8N_SHARED_SECRET` — lo vas a validar dentro de n8n.

### 2.3 Desplegar
```bash
supabase functions deploy chat-proxy --no-verify-jwt
```
> Usamos `--no-verify-jwt` porque **validamos el JWT nosotros mismos** dentro de la función (con `supabase.auth.getUser()`), para poder devolver mensajes de error personalizados.

### 2.4 Copiar la URL del Edge Function
Formato: `https://<project-ref>.supabase.co/functions/v1/chat-proxy`

---

## 3. Configurar n8n para validar el secreto

En el **nodo Webhook** de tu workflow de Lumina:

1. Método: **POST**
2. Response Mode: **When Last Node Finishes** (o "Respond to Webhook")
3. **Response**: JSON con la forma `{ "reply": "<texto de la IA>" }`.
4. Antes del agente, agrega un **IF node** con esta condición:
   ```
   {{ $request.headers['x-lumina-secret'] }}   ===   <el valor de N8N_SHARED_SECRET>
   ```
   Rama `false` → responder 401.
   Rama `true` → seguir al agente.

El body que recibe n8n desde el Edge Function es:
```json
{
  "userId": "uuid",
  "conversationId": "uuid",
  "message": "texto del usuario",
  "history": [{ "role": "user", "content": "..." }, { "role": "assistant", "content": "..." }]
}
```

---

## 4. Preparar el repositorio de GitHub

### 4.1 Crear el repo
```bash
cd lumina-chat
git init
git add .
git commit -m "chore: bootstrap Lumina chat"
git branch -M main
git remote add origin https://github.com/<tu-usuario>/lumina-chat.git
git push -u origin main
```

### 4.2 Activar GitHub Pages
1. Repo → **Settings → Pages**.
2. **Source**: `GitHub Actions`.

### 4.3 Secrets del repo
Repo → **Settings → Secrets and variables → Actions → New repository secret**. Crea:

| Nombre                    | Valor                                                                    |
|---------------------------|--------------------------------------------------------------------------|
| `VITE_SUPABASE_URL`       | Tu Project URL de Supabase                                               |
| `VITE_SUPABASE_ANON_KEY`  | anon public key                                                          |
| `VITE_CHAT_PROXY_URL`     | `https://<project-ref>.supabase.co/functions/v1/chat-proxy`              |

> Los tres `VITE_*` quedan embebidos en el bundle. Es **seguro** exponer la URL y anon key porque RLS los limita; el `chat-proxy` no expone n8n.

### 4.4 Hacer el primer deploy
- Haz cualquier commit y push a `main`, o corre el workflow manualmente desde **Actions → Deploy to GitHub Pages → Run workflow**.
- Al terminar, tu app estará en:
  ```
  https://<tu-usuario>.github.io/lumina-chat/#/login
  ```

---

## 5. Verificación

- [ ] Puedes crear cuenta con email + contraseña.
- [ ] Puedes iniciar sesión y ver la interfaz.
- [ ] Al enviar un mensaje aparece en la lista y se guarda en Postgres (verifica en `Table editor → messages`).
- [ ] La IA responde y su respuesta también queda guardada.
- [ ] Un usuario B no puede ver las conversaciones del usuario A (RLS).
- [ ] Si llamas al Edge Function sin JWT devuelve **401**.
- [ ] Si llamas al webhook de n8n directamente sin `X-Lumina-Secret` devuelve **401** desde el nodo IF.

---

## 6. Tipografía Railey

Si tienes la licencia de Railey:
1. Convierte a `.woff2` (recomendado) con https://transfonter.org
2. Coloca los archivos en `public/fonts/Railey.woff2` y `public/fonts/Railey.woff`
3. Push a `main` → el workflow los publica automáticamente.

Si no la tienes, la app cae automáticamente a **Raleway** (Google Fonts). Cambia el color en `theme.css` (`--lumina-brand`) si quieres otro tono.

---

## 7. Troubleshooting

| Síntoma                                          | Causa probable                                       | Fix                                                  |
|--------------------------------------------------|------------------------------------------------------|------------------------------------------------------|
| Login OK pero al enviar mensaje falla con CORS   | `ALLOWED_ORIGIN` mal seteado en el Edge Function     | `supabase secrets set ALLOWED_ORIGIN="https://…"`   |
| 401 al enviar mensaje                            | Sesión expirada o `verify_jwt` mal manejado          | Recarga; revisa que `--no-verify-jwt` esté al deploy |
| Assets no cargan (404 CSS/JS)                    | Base path incorrecto                                 | Asegúrate de que el nombre del repo sea `lumina-chat` o ajusta `VITE_BASE_PATH` en el workflow |
| "n8n error 502"                                  | Webhook down, secreto mal, o timeout                 | Revisa los logs de la función: `supabase functions logs chat-proxy` |
| Refresh de página da 404                         | Estás usando BrowserRouter en vez de HashRouter      | Ya viene configurado como HashRouter — no lo cambies |

---

## 8. Actualizaciones futuras

Cualquier push a `main` dispara el workflow y redespliega. Para actualizar el Edge Function:
```bash
supabase functions deploy chat-proxy --no-verify-jwt
```

Para agregar migraciones a la BD, crea un nuevo archivo en `supabase/migrations/` y córrelo desde el SQL Editor.
