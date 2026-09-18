import DOMPurify from 'dompurify'
import { marked } from 'marked'

// Configuración estricta de marked
marked.setOptions({
  breaks: true,
  gfm: true,
})

/**
 * Convierte markdown a HTML sanitizado — seguro para renderizar respuestas
 * del modelo, que pueden traer código, listas, etc.
 * El sanitizador elimina scripts, eventos inline y URLs javascript:
 */
export function renderMarkdownSafe(md) {
  if (typeof md !== 'string') return ''
  const dirty = marked.parse(md)
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'code', 'pre', 'blockquote',
      'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'a', 'hr', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
    ],
    ALLOWED_ATTR: ['href', 'title', 'target', 'rel'],
    ALLOW_DATA_ATTR: false,
  })
}

/**
 * Recorta / normaliza texto de entrada del usuario antes de mandarlo.
 */
export function sanitizeUserInput(txt, maxLen = 8000) {
  if (typeof txt !== 'string') return ''
  return txt
    .replace(/[\u0000-\u0008\u000B-\u001F\u007F]/g, '')
    .slice(0, maxLen)
    .trim()
}

/**
 * Deriva un título corto a partir de la primera pregunta.
 */
export function deriveTitle(firstMessage, maxLen = 60) {
  const clean = sanitizeUserInput(firstMessage, 200)
    .replace(/\s+/g, ' ')
    .trim()
  if (!clean) return 'Nueva conversación'
  return clean.length > maxLen ? clean.slice(0, maxLen - 1) + '…' : clean
}
