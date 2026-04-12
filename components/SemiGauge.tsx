"use client";

import { useEffect, useState } from "react";
import { getScoreTier } from "@/lib/types";

type SemiGaugeProps = {
  score: number;
  size?: number;
};

export function SemiGauge({ score, size = 260 }: SemiGaugeProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const tier = getScoreTier(score);

  useEffect(() => {
    const start = Date.now();
    const duration = 1800;

    const tick = () => {
      const progress = Math.min((Date.now() - start) / duration, 1);
      // Cubic ease-out
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(eased * score));
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }, [score]);

  const r = (size - 24) / 2;
  const cx = size / 2;
  const cy = size / 2 + 10;
  const halfCirc = Math.PI * r;
  const dashOffset = halfCirc - (displayValue / 100) * halfCirc;

  const arc = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`;

  return (
    <div style={{ textAlign: "center" }}>
      <svg
        width={size}
        height={size * 0.58}
        viewBox={`0 0 ${size} ${size * 0.58}`}
      >
        {/* Track */}
        <path
          d={arc}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="12"
          strokeLinecap="round"
        />
        {/* Fill */}
        <path
          d={arc}
          fill="none"
          stroke={tier.color}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={halfCirc}
          strokeDashoffset={dashOffset}
          style={{
            filter: `drop-shadow(0 0 16px ${tier.color}80)`,
            transition: "stroke-dashoffset 0.05s linear",
          }}
        />
        {/* Score number */}
        <text
          x={cx}
          y={cy - 20}
          textAnchor="middle"
          fill={tier.color}
          style={{
            fontFamily: "var(--font-jetbrains, 'JetBrains Mono', monospace)",
            fontSize: size * 0.22,
            fontWeight: 700,
          }}
        >
          {displayValue}
        </text>
        {/* /100 label */}
        <text
          x={cx}
          y={cy + 2}
          textAnchor="middle"
          fill="rgba(255,255,255,0.3)"
          style={{
            fontFamily: "var(--font-jetbrains, 'JetBrains Mono', monospace)",
            fontSize: 14,
          }}
        >
          / 100
        </text>
      </svg>
      <div
        style={{
          fontFamily: "var(--font-jetbrains, 'JetBrains Mono', monospace)",
          fontSize: 14,
          fontWeight: 700,
          letterSpacing: 3,
          color: tier.color,
          marginTop: -4,
          textShadow: `0 0 20px ${tier.color}60`,
        }}
      >
        {tier.label}
      </div>
    </div>
  );
}
