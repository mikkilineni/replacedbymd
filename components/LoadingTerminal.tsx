"use client";

import { useEffect, useState } from "react";

const LINES = [
  "Scanning public profile data...",
  "Indexing LinkedIn buzzword density...",
  "Cross-referencing with AI capabilities...",
  "Measuring vibe moat depth...",
  "Generating IDENTITY.md...",
  "Compiling SOUL.md...",
  "Drafting retirement certificate...",
  "Calculating replacement cost...",
];

export function LoadingTerminal() {
  const [visibleLines, setVisibleLines] = useState<string[]>([]);

  useEffect(() => {
    const timers = LINES.map((line, i) =>
      setTimeout(() => setVisibleLines((prev) => [...prev, line]), i * 500),
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        animation: "fadeIn 0.4s ease",
      }}
    >
      {/* Spinner */}
      <div
        style={{
          width: 48,
          height: 48,
          border: "3px solid rgba(0,255,65,0.1)",
          borderTopColor: "var(--green)",
          borderRadius: "50%",
          animation: "spin 0.7s linear infinite",
          marginBottom: 40,
        }}
      />

      {/* Terminal lines */}
      <div
        style={{
          fontFamily: "var(--font-jetbrains, 'JetBrains Mono', monospace)",
          fontSize: 14,
          lineHeight: 2.2,
          color: "var(--green-dim)",
          textAlign: "left",
          maxWidth: 480,
          margin: "0 auto",
        }}
      >
        {visibleLines.map((line, i) => (
          <div key={i} style={{ animation: "fadeIn 0.3s ease forwards" }}>
            <span style={{ color: "var(--green)" }}>▸ </span>
            {line}
          </div>
        ))}
        {/* Blinking cursor */}
        <span
          style={{
            display: "inline-block",
            width: 9,
            height: 18,
            background: "var(--green)",
            animation: "blink 1s step-end infinite",
            verticalAlign: "middle",
            marginLeft: 2,
          }}
        />
      </div>
    </div>
  );
}
