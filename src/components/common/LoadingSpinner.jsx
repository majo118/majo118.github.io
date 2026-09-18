export default function LoadingSpinner({ fullscreen = false, size = 24 }) {
  const style = {
    width: size,
    height: size,
    border: `3px solid var(--lumina-pink-100)`,
    borderTopColor: 'var(--lumina-brand)',
    borderRadius: '50%',
    animation: 'lumina-spin 0.9s linear infinite',
  }
  const wrap = fullscreen
    ? { display: 'grid', placeItems: 'center', height: '100vh', width: '100vw' }
    : { display: 'inline-block' }
  return (
    <div style={wrap}>
      <div style={style} />
      <style>{`@keyframes lumina-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
