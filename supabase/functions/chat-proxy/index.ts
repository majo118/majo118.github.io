// ============================================================
// chat-proxy  —  Edge Function que expone el agente n8n de forma segura
// ------------------------------------------------------------
// Flujo:
//   [Frontend] --JWT Supabase--> [Edge Function] --secret header--> [n8n webhook]
//
// El navegador NUNCA ve la URL de n8n ni el secreto compartido.
// La función valida que el usuario esté autenticado en Supabase,
// aplica un rate limit muy simple por usuario, sanea el payload y
// reenvía al webhook de n8n con un header X-Lumina-Secret.
// ============================================================
//
// Secretos requeridos (setear con: supabase secrets set KEY=value):
//   - N8N_WEBHOOK_URL      : URL completa del webhook de n8n
//   - N8N_SHARED_SECRET    : cadena aleatoria larga; valídala en n8n
//   - SUPABASE_URL         : ya la inyecta Supabase
//   - SUPABASE_ANON_KEY    : ya la inyecta Supabase
// ============================================================

// deno-lint-ignore-file no-explicit-any
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4'

const N8N_WEBHOOK_URL   = Deno.env.get('N8N_WEBHOOK_URL')   ?? ''
const N8N_SHARED_SECRET = Deno.env.get('N8N_SHARED_SECRET') ?? ''
const SUPABASE_URL      = Deno.env.get('SUPABASE_URL')      ?? ''
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') ?? ''

// --- CORS -----------------------------------------------------
// Ajusta ALLOWED_ORIGIN a tu dominio de GitHub Pages en producción,
// p.ej. "https://usuario.github.io"
const ALLOWED_ORIGIN = Deno.env.get('ALLOWED_ORIGIN') ?? '*'

const corsHeaders = {
  'Access-Control-Allow-Origin':  ALLOWED_ORIGIN,
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Vary': 'Origin',
}

// --- Rate limit en memoria ------------------------------------
// Es un balde por usuario; se pierde entre invocaciones frías, pero
// sirve para frenar loops. Para algo serio, usa una tabla o Upstash.
const buckets = new Map<string, { count: number; reset: number }>()
const RATE_LIMIT      = 30       // requests
const RATE_WINDOW_MS  = 60_000   // por minuto

function rateLimited(userId: string): boolean {
  const now = Date.now()
  const b = buckets.get(userId)
  if (!b || b.reset < now) {
    buckets.set(userId, { count: 1, reset: now + RATE_WINDOW_MS })
    return false
  }
  b.count += 1
  return b.count > RATE_LIMIT
}

// --- Helpers --------------------------------------------------
function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function sanitize(s: unknown, maxLen = 8000): string {
  if (typeof s !== 'string') return ''
  // quitar caracteres de control excepto \n \t
  return s.replace(/[\u0000-\u0008\u000B-\u001F\u007F]/g, '').slice(0, maxLen)
}

// --- Handler --------------------------------------------------
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST')    return json({ error: 'Method not allowed' }, 405)

  try {
    // 1) Autenticación: exigir JWT del usuario en Authorization
    const authHeader = req.headers.get('Authorization') ?? ''
    if (!authHeader.startsWith('Bearer ')) {
      return json({ error: 'Missing bearer token' }, 401)
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    })

    const { data: userData, error: userErr } = await supabase.auth.getUser()
    if (userErr || !userData?.user) {
      return json({ error: 'Invalid session' }, 401)
    }
    const user = userData.user

    // 2) Rate limit
    if (rateLimited(user.id)) {
      return json({ error: 'Rate limit exceeded' }, 429)
    }

    // 3) Payload
    const body = await req.json().catch(() => null) as any
    if (!body || typeof body !== 'object') return json({ error: 'Bad payload' }, 400)

    const message        = sanitize(body.message, 8000)
    const conversationId = sanitize(body.conversationId, 64)
    const historyRaw     = Array.isArray(body.history) ? body.history : []

    if (!message)         return json({ error: 'Empty message' }, 400)
    if (!conversationId)  return json({ error: 'Missing conversationId' }, 400)

    const history = historyRaw
      .slice(-20) // últimos 20 turnos como contexto
      .map((m: any) => ({
        role:    m?.role === 'assistant' ? 'assistant' : 'user',
        content: sanitize(m?.content, 4000),
      }))
      .filter((m: any) => m.content)

    // 4) Verificar que la conversación exista y pertenezca al usuario
    const { data: conv, error: convErr } = await supabase
      .from('conversations')
      .select('id, user_id')
      .eq('id', conversationId)
      .single()

    if (convErr || !conv || conv.user_id !== user.id) {
      return json({ error: 'Conversation not found' }, 404)
    }

    // 5) Llamada al webhook de n8n
    if (!N8N_WEBHOOK_URL || !N8N_SHARED_SECRET) {
      return json({ error: 'Server not configured' }, 500)
    }

    const n8nRes = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Lumina-Secret': N8N_SHARED_SECRET,
      },
      body: JSON.stringify({
        userId: user.id,
        conversationId,
        message,
        history,
      }),
    })

    if (!n8nRes.ok) {
      const txt = await n8nRes.text().catch(() => '')
      console.error('n8n error', n8nRes.status, txt)
      return json({ error: 'Upstream agent error' }, 502)
    }

    // n8n puede responder como { reply: "..." } o texto plano.
    const contentType = n8nRes.headers.get('content-type') ?? ''
    let reply = ''
    if (contentType.includes('application/json')) {
      const j: any = await n8nRes.json()
      reply = j?.reply ?? j?.output ?? j?.text ?? JSON.stringify(j)
    } else {
      reply = await n8nRes.text()
    }

    return json({ reply: sanitize(reply, 16000) })
  } catch (err) {
    console.error(err)
    return json({ error: 'Internal error' }, 500)
  }
})
