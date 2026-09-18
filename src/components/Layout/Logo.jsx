// Nombre "Lumina" con tipografía Railey (fallback Raleway).
// Color exacto pedido: #741b47.
export default function Logo({ size = 40, showText = true }) {
  // Ruta pública del logo (respeta el base path configurado en Vite).
  const src = `${import.meta.env.BASE_URL}lumina-logo.png`

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
      <img
        src={src}
        alt="Lumina"
        width={size}
        height={size}
        style={{ objectFit: 'contain' }}
      />
      {showText && (
        <span
          className="brand-text"
          style={{
            fontSize: Math.round(size * 0.9),
            lineHeight: 1,
            color: '#741b47',
          }}
        >
          Lumina
        </span>
      )}
    </div>
  )
}
