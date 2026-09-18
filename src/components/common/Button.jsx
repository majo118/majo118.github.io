export default function Button({
  children,
  variant = 'primary',
  disabled,
  loading,
  type = 'button',
  onClick,
  style = {},
  ...rest
}) {
  const base = {
    borderRadius: 'var(--radius-md)',
    padding: '0.65rem 1.1rem',
    fontWeight: 600,
    border: '1px solid transparent',
    transition: 'all 0.15s ease',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    minHeight: 40,
    opacity: disabled || loading ? 0.6 : 1,
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    ...style,
  }
  const variants = {
    primary: {
      background: 'var(--lumina-brand)',
      color: 'white',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--lumina-brand)',
      border: '1px solid var(--lumina-pink-200)',
    },
    subtle: {
      background: 'var(--lumina-pink-50)',
      color: 'var(--lumina-brand)',
    },
    danger: {
      background: 'transparent',
      color: 'var(--lumina-danger)',
      border: '1px solid var(--lumina-pink-200)',
    },
  }
  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      style={{ ...base, ...variants[variant] }}
      {...rest}
    >
      {loading ? '…' : children}
    </button>
  )
}
