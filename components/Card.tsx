import type { CSSProperties, ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
  red?: boolean; // red tint variant (stock crash card)
};

export function Card({ children, style, className = "", red = false }: CardProps) {
  return (
    <div
      className={className}
      style={{
        background: red ? "rgba(255,34,34,0.02)" : "var(--green-bg)",
        border: `1px solid ${red ? "rgba(255,34,34,0.2)" : "var(--green-border)"}`,
        borderRadius: 8,
        padding: "28px 32px",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/** Section header — uppercase monospace label */
export function SectionHeader({ text }: { text: string }) {
  return (
    <div
      style={{
        fontFamily: "var(--font-jetbrains, 'JetBrains Mono', monospace)",
        fontSize: 13,
        fontWeight: 700,
        color: "var(--green)",
        letterSpacing: 3,
        textTransform: "uppercase",
        marginBottom: 12,
      }}
    >
      {text}
    </div>
  );
}

/** Field label + value pair */
export function Field({
  label,
  children,
  green,
}: {
  label: string;
  children: ReactNode;
  green?: boolean | "italic";
}) {
  return (
    <div style={{ marginTop: 20 }}>
      <div
        style={{
          fontSize: 11,
          color: "var(--green-dim)",
          letterSpacing: 2,
          textTransform: "uppercase",
          fontFamily: "var(--font-jetbrains, 'JetBrains Mono', monospace)",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 15,
          color: green ? "var(--green)" : "#fff",
          marginTop: 4,
          lineHeight: 1.7,
          fontStyle: green === "italic" ? "italic" : undefined,
          fontFamily: "var(--font-jetbrains, 'JetBrains Mono', monospace)",
        }}
      >
        {children}
      </div>
    </div>
  );
}
