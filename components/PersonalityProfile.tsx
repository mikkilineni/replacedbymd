import { Card, SectionHeader } from "./Card";
import type { FullRoastPayload } from "@/lib/types";

type PersonalityProfileProps = {
  personality_profile: FullRoastPayload["personality_profile"];
};

export function PersonalityProfile({ personality_profile }: PersonalityProfileProps) {
  const mono = "var(--font-jetbrains, 'JetBrains Mono', monospace)";

  return (
    <Card style={{ marginBottom: 32 }}>
      <SectionHeader text="PERSONALITY PROFILE" />

      {/* Trait pills */}
      <div
        style={{
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
          marginTop: 12,
        }}
      >
        {personality_profile.traits.map((trait, i) => (
          <span
            key={i}
            style={{
              padding: "6px 14px",
              fontSize: 12,
              color: "var(--green)",
              border: "1px solid var(--green-border)",
              borderRadius: 20,
              background: "rgba(0,255,65,0.04)",
              fontFamily: mono,
            }}
          >
            {trait}
          </span>
        ))}
      </div>

      {/* Notable patterns */}
      <div style={{ marginTop: 20 }}>
        <div
          style={{
            fontSize: 11,
            color: "var(--green-dim)",
            letterSpacing: 2,
            textTransform: "uppercase",
            marginBottom: 8,
            fontFamily: mono,
          }}
        >
          NOTABLE PATTERNS
        </div>

        {personality_profile.notable_patterns.map((pattern, i) => (
          <div
            key={i}
            style={{
              fontSize: 13,
              color: "rgba(255,255,255,0.7)",
              lineHeight: 1.7,
              marginBottom: 6,
              paddingLeft: 16,
              position: "relative",
              fontFamily: mono,
            }}
          >
            <span
              style={{ position: "absolute", left: 0, color: "var(--green)" }}
            >
              •
            </span>{" "}
            {pattern}
          </div>
        ))}
      </div>
    </Card>
  );
}
