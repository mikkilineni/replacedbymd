import { Card, SectionHeader } from "./Card";
import type { FullRoastPayload } from "@/lib/types";

type StockCrashProps = {
  stock: FullRoastPayload["stock"];
};

export function StockCrash({ stock }: StockCrashProps) {
  return (
    <Card red style={{ marginBottom: 32 }}>
      <SectionHeader text="MARKET IMPACT" />
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 16,
          flexWrap: "wrap",
          marginTop: 12,
        }}
      >
        <span
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: "#fff",
            letterSpacing: 2,
            fontFamily: "var(--font-jetbrains, 'JetBrains Mono', monospace)",
          }}
        >
          ${stock.ticker}
        </span>
        <span
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: "var(--red)",
            textShadow: "0 0 12px rgba(255,34,34,0.4)",
            fontFamily: "var(--font-jetbrains, 'JetBrains Mono', monospace)",
          }}
        >
          {stock.crash_percentage}
        </span>
      </div>
      <p
        style={{
          fontSize: 14,
          color: "rgba(255,255,255,0.6)",
          lineHeight: 1.7,
          marginTop: 12,
          fontFamily: "var(--font-jetbrains, 'JetBrains Mono', monospace)",
        }}
      >
        {stock.headline}
      </p>
    </Card>
  );
}
