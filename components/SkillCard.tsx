import { Card, SectionHeader } from "./Card";
import type { FullRoastPayload } from "@/lib/types";

type SkillCardProps = {
  replacement_skill: FullRoastPayload["replacement_skill"];
};

export function SkillCard({ replacement_skill }: SkillCardProps) {
  const mono = "var(--font-jetbrains, 'JetBrains Mono', monospace)";

  return (
    <Card style={{ marginBottom: 32 }}>
      <SectionHeader text="RECOMMENDED SKILLS" />

      <div style={{ marginTop: 12 }}>
        <div
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: "var(--green)",
            marginBottom: 6,
            fontFamily: mono,
          }}
        >
          {replacement_skill.name}
        </div>

        <p
          style={{
            fontSize: 14,
            color: "rgba(255,255,255,0.6)",
            lineHeight: 1.7,
            marginBottom: 16,
            fontFamily: mono,
          }}
        >
          {replacement_skill.description}
        </p>

        <div
          style={{
            fontSize: 11,
            color: "var(--green-dim)",
            letterSpacing: 2,
            textTransform: "uppercase",
            marginBottom: 10,
            fontFamily: mono,
          }}
        >
          CAPABILITIES
        </div>

        {replacement_skill.capabilities.map((cap, i) => (
          <div
            key={i}
            style={{
              fontSize: 13,
              color: "var(--green)",
              lineHeight: 1.7,
              marginBottom: 6,
              paddingLeft: 16,
              position: "relative",
              fontFamily: mono,
            }}
          >
            <span style={{ position: "absolute", left: 0 }}>▸</span> {cap}
          </div>
        ))}
      </div>
    </Card>
  );
}
