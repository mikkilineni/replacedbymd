"use client";

import { useEffect, useState } from "react";

type MetricBarProps = {
  label: string;
  score: number; // 0–100
  delay?: number; // ms before animating in
};

function getGradient(score: number): string {
  if (score <= 40) return "linear-gradient(90deg, #00ff41, #66ff88)";
  if (score <= 70) return "linear-gradient(90deg, #00ff41, #ffaa00)";
  return "linear-gradient(90deg, #00ff41, #ff6600)";
}

export function MetricBar({ label, score, delay = 0 }: MetricBarProps) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setWidth(score), delay);
    return () => clearTimeout(timer);
  }, [score, delay]);

  return (
    <div style={{ marginBottom: 20 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 6,
          fontFamily: "var(--font-jetbrains, 'JetBrains Mono', monospace)",
          fontSize: 14,
        }}
      >
        <span style={{ color: "rgba(255,255,255,0.85)" }}>{label}</span>
        <span style={{ color: "var(--green)", fontWeight: 700 }}>{score}</span>
      </div>
      <div
        style={{
          height: 8,
          background: "rgba(255,255,255,0.05)",
          borderRadius: 4,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${width}%`,
            background: getGradient(score),
            borderRadius: 4,
            transition: "width 1.2s cubic-bezier(0.22,1,0.36,1)",
            boxShadow: "0 0 12px rgba(0,255,65,0.3)",
          }}
        />
      </div>
    </div>
  );
}
