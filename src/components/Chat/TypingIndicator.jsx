export default function TypingIndicator() {
  return (
    <div className="lumina-msg lumina-msg--ai">
      <div className="lumina-msg__avatar" aria-hidden>✦</div>
      <div className="lumina-msg__bubble" aria-live="polite">
        <span className="lumina-typing">
          <i /><i /><i />
        </span>
        <style>{`
          .lumina-typing { display: inline-flex; gap: 4px; align-items: center; height: 20px; }
          .lumina-typing i {
            width: 6px; height: 6px; border-radius: 50%;
            background: var(--lumina-brand);
            animation: lumina-bounce 1s infinite ease-in-out;
          }
          .lumina-typing i:nth-child(2) { animation-delay: 0.15s; }
          .lumina-typing i:nth-child(3) { animation-delay: 0.30s; }
          @keyframes lumina-bounce {
            0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
            40%           { transform: translateY(-4px); opacity: 1; }
          }
        `}</style>
      </div>
    </div>
  )
}
