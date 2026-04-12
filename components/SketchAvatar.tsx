export function SketchAvatar() {
  return (
    <div
      style={{
        width: 90,
        height: 90,
        borderRadius: 12,
        border: "2px solid var(--green-border)",
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <svg width="50" height="50" viewBox="0 0 50 50" fill="none">
        <circle cx="25" cy="18" r="10" stroke="var(--green-dim)" strokeWidth="1.5" />
        <path d="M10 45 C10 32 40 32 40 45" stroke="var(--green-dim)" strokeWidth="1.5" />
        <line x1="20" y1="16" x2="22" y2="16" stroke="var(--green-dim)" strokeWidth="1.5" />
        <line x1="28" y1="16" x2="30" y2="16" stroke="var(--green-dim)" strokeWidth="1.5" />
        <path d="M22 22 Q25 25 28 22" stroke="var(--green-dim)" strokeWidth="1" />
      </svg>
    </div>
  );
}
