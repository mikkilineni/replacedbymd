import type { ReactNode } from "react";

type TerminalWindowProps = {
  title: string;
  children: ReactNode;
  maxHeight?: number;
};

const TRAFFIC_LIGHTS = ["#ff5f56", "#ffbd2e", "#27ca3f"];

export function TerminalWindow({ title, children, maxHeight = 440 }: TerminalWindowProps) {
  return (
    <div
      style={{
        background: "rgba(0,0,0,0.6)",
        border: "1px solid var(--green-border)",
        borderRadius: 8,
        overflow: "hidden",
      }}
    >
      {/* Title bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "10px 14px",
          borderBottom: "1px solid var(--green-border)",
        }}
      >
        {TRAFFIC_LIGHTS.map((color, i) => (
          <div
            key={i}
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: color,
              flexShrink: 0,
            }}
          />
        ))}
        <span
          style={{
            fontFamily: "var(--font-jetbrains, 'JetBrains Mono', monospace)",
            fontSize: 13,
            color: "var(--green)",
            marginLeft: 8,
          }}
        >
          {title}
        </span>
      </div>

      {/* Content */}
      <div
        style={{
          padding: "20px 24px",
          fontFamily: "var(--font-jetbrains, 'JetBrains Mono', monospace)",
          fontSize: 13.5,
          color: "var(--green)",
          lineHeight: 1.75,
          whiteSpace: "pre-wrap",
          maxHeight,
          overflowY: "auto",
        }}
      >
        {children}
      </div>
    </div>
  );
}
