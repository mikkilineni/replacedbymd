"use client";

import { useState } from "react";
import { Card, SectionHeader } from "./Card";
import { TerminalWindow } from "./TerminalWindow";
import type { FullRoastPayload } from "@/lib/types";

type ReplacementFilesProps = {
  name: string;
  identity: FullRoastPayload["identity"];
  soul: FullRoastPayload["soul"];
  personality_profile: FullRoastPayload["personality_profile"];
};

const TABS = [
  { key: "identity", label: "IDENTITY.MD" },
  { key: "soul", label: "SOUL.MD" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export function ReplacementFiles({
  name,
  identity,
  soul,
  personality_profile,
}: ReplacementFilesProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("identity");

  const identityContent = [
    `# IDENTITY.md — Who Am I?\n`,
    `- **Name:** ${name}`,
    `- **Creature:** ${identity.creature}`,
    `- **Vibe:** ${identity.vibe}`,
    `- **Emoji:** ${identity.emoji}`,
    `- **Aliases:** ${identity.aliases}`,
    `\n## Notes\n`,
    `Grounded primarily in LinkedIn/Proxycurl profile data and corroborating public directory references.${personality_profile.writing_style ? ` Writing style: ${personality_profile.writing_style}.` : ""}`,
  ].join("\n");

  const soulContent = [
    `# SOUL.md — Who You Are\n`,
    soul.whoYouAre,
    `\n## Core Truths\n`,
    soul.coreTruths.map((t) => `- ${t}`).join("\n"),
  ].join("\n");

  return (
    <Card style={{ marginBottom: 32 }}>
      <SectionHeader text="HERE'S YOUR REPLACEMENT" />
      <p
        style={{
          fontSize: 13,
          color: "rgba(255,255,255,0.4)",
          margin: "0 0 20px",
          fontFamily: "var(--font-jetbrains, 'JetBrains Mono', monospace)",
        }}
      >
        the soul and identity files we scraped off the internet about you.
      </p>

      {/* Tab buttons */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: "10px 20px",
              fontSize: 13,
              fontWeight: 600,
              fontFamily: "var(--font-jetbrains, 'JetBrains Mono', monospace)",
              cursor: "pointer",
              borderRadius: 6,
              border: `1px solid ${activeTab === tab.key ? "var(--green)" : "var(--green-border)"}`,
              background:
                activeTab === tab.key ? "rgba(0,255,65,0.08)" : "transparent",
              color:
                activeTab === tab.key ? "var(--green)" : "rgba(255,255,255,0.4)",
              transition: "all 0.2s",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "identity" && (
        <TerminalWindow title="IDENTITY.md">{identityContent}</TerminalWindow>
      )}
      {activeTab === "soul" && (
        <TerminalWindow title="SOUL.md">{soulContent}</TerminalWindow>
      )}
    </Card>
  );
}
