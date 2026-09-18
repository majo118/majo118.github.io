import { useEffect, useRef, useState } from 'react'
import { MAX_MESSAGE_LEN } from '../../utils/constants.js'
import './MessageInput.css'

export default function MessageInput({ onSend, disabled }) {
  const [value, setValue] = useState('')
  const taRef = useRef(null)

  // Auto-resize
  useEffect(() => {
    const ta = taRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = Math.min(ta.scrollHeight, 200) + 'px'
  }, [value])

  function submit() {
    const v = value.trim()
    if (!v || disabled) return
    onSend(v)
    setValue('')
  }

  function onKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  return (
    <div className="lumina-input">
      <textarea
        ref={taRef}
        rows={1}
        maxLength={MAX_MESSAGE_LEN}
        placeholder="Escribe tu consulta clínica…"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={onKeyDown}
        disabled={disabled}
      />
      <button
        onClick={submit}
        disabled={disabled || !value.trim()}
        className="lumina-input__send"
        aria-label="Enviar"
      >
        ➤
      </button>
    </div>
  )
}
