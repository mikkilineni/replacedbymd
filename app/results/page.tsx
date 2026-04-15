"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MatrixBG } from "@/components/MatrixBG";
import { LoadingTerminal } from "@/components/LoadingTerminal";
import { Card, SectionHeader } from "@/components/Card";
import { SketchAvatar } from "@/components/SketchAvatar";
import { SemiGauge } from "@/components/SemiGauge";
import { MetricBar } from "@/components/MetricBar";
import { StockCrash } from "@/components/StockCrash";
import { RetirementCert } from "@/components/RetirementCert";
import { ReplacementFiles } from "@/components/ReplacementFiles";
import { SkillCard } from "@/components/SkillCard";
import { PersonalityProfile } from "@/components/PersonalityProfile";
import { coercePayload } from "@/lib/validate";
import { slugToName } from "@/lib/normalize-url";
import type { FullRoastPayload } from "@/lib/types";

// ── Fallback generator ──────────────────────────────────────────────────────

function buildFallback(linkedinUrl: string): FullRoastPayload {
  const slug = linkedinUrl.includes("/in/")
    ? linkedinUrl.split("/in/")[1]?.replace(/\//g, "") ?? "human"
    : "human";
  return coercePayload({}, linkedinUrl, slugToName(slug));
}

// ── Share helpers ───────────────────────────────────────────────────────────

function buildShareText(data: FullRoastPayload): string {
  return [
    "replacedby.md // replacement report",
    "",
    `${data.name} — ${data.title}`,
    `${data.death_score}/100`,
    "",
    `"${data.eulogy}"`,
    "",
    `$${data.stock.ticker} ${data.stock.crash_percentage}`,
    data.stock.headline,
  ].join("\n");
}

function buildTwitterText(data: FullRoastPayload): string {
  const score = data.death_score;
  const emoji = score >= 81 ? "💀" : score >= 61 ? "🔥" : score >= 46 ? "😬" : "😅";
  return `just found out i'm ${score}% replaceable by AI ${emoji}\n\n"${data.eulogy.slice(0, 120)}${data.eulogy.length > 120 ? "…" : ""}"\n\nare you next? replacedby.md`;
}

// ── Main results content ────────────────────────────────────────────────────

function ResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const linkedinUrl = searchParams.get("url") ?? "";

  const [data, setData] = useState<FullRoastPayload | null>(null);
  const [shareHover, setShareHover] = useState(false);
  const [twitterHover, setTwitterHover] = useState(false);
  const [tryHover, setTryHover] = useState(false);

  useEffect(() => {
    if (!linkedinUrl) {
      router.replace("/");
      return;
    }

    const fetchData = async () => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 110_000);
      try {
        const res = await fetch("/api/roast", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ linkedinUrl }),
          signal: controller.signal,
        });
        clearTimeout(timeout);
        const payload = await res.json();
        // Dev 502 returns { error: "..." } — surface it in console, use fallback
        if (!res.ok || payload.error) {
          console.error("[results] API error:", payload);
          setData(buildFallback(linkedinUrl));
          return;
        }
        console.log("[results] received payload:", payload.name, "score:", payload.death_score);
        setData(payload);
      } catch {
        clearTimeout(timeout);
        setData(buildFallback(linkedinUrl));
      }
    };

    fetchData();
  }, [linkedinUrl, router]);

  const handleShare = () => {
    if (!data) return;
    const text = buildShareText(data);
    if (navigator.share) {
      navigator.share({ text }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(text);
    }
  };

  const mono = "var(--font-jetbrains, 'JetBrains Mono', monospace)";

  if (!data) {
    return <LoadingTerminal />;
  }

  return (
    <div style={{ paddingTop: 40, paddingBottom: 80, animation: "slideUp 0.6s ease" }}>

      {/* Header */}
      <div style={{ fontSize: 12, color: "var(--green-dim)", letterSpacing: 2, marginBottom: 32, fontFamily: mono }}>
        replacedby.md // replacement report
      </div>

      {/* ── 1. Profile + Verdict ── */}
      <Card style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", gap: 20, alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap" }}>
          <SketchAvatar />
          <div style={{ flex: 1, minWidth: 200 }}>
            <h2 style={{ fontSize: "clamp(28px, 6vw, 44px)", fontWeight: 700, margin: 0, color: "#fff", lineHeight: 1.1, fontFamily: mono }}>
              {data.name}
            </h2>
            <div style={{ fontSize: 13, color: "var(--green-dim)", marginTop: 4 }}>
              {data.title}{data.company ? ` · ${data.company}` : ""}
            </div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginTop: 4, wordBreak: "break-all", fontFamily: mono }}>
              {data.linkedinUrl}
            </div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", marginTop: 6, fontFamily: mono }}>
              ⚠ profile data sourced from public web · accuracy may vary
            </div>
          </div>
        </div>
        <p style={{ fontSize: "clamp(16px, 3.5vw, 22px)", fontWeight: 700, color: "#fff", lineHeight: 1.5, margin: "20px 0 0", fontFamily: mono }}>
          &ldquo;{data.eulogy}&rdquo;
        </p>
      </Card>

      {/* ── 2. Score gauge ── */}
      <div style={{ margin: "40px 0", textAlign: "center" }}>
        <SemiGauge score={data.death_score} />
      </div>

      {/* ── 3. Replica Metrics ── */}
      <Card style={{ marginBottom: 32 }}>
        <SectionHeader text="REPLICA METRICS" />
        <div style={{ marginTop: 20 }}>
          <MetricBar label="Already a Bot" score={data.metrics.alreadyABot} delay={200} />
          <MetricBar label="Vibe Moat (100 = none)" score={data.metrics.vibeMoat} delay={350} />
          <MetricBar label="Public Footprint" score={data.metrics.publicFootprint} delay={500} />
          <MetricBar label="Job Is Just Text" score={data.metrics.jobIsJustText} delay={650} />
          <MetricBar label="Billing Audacity" score={data.metrics.billingAudacity} delay={800} />
        </div>
      </Card>

      {/* ── 4. Market Impact ── */}
      <StockCrash stock={data.stock} />

      {/* ── 5. What Leaked ── */}
      <Card style={{ marginBottom: 32 }}>
        <SectionHeader text="WHAT LEAKED" />
        <div style={{ fontSize: 14, color: "rgba(255,255,255,0.85)", lineHeight: 1.8, marginTop: 16, whiteSpace: "pre-wrap", fontFamily: mono }}>
          {data.whatLeaked.prose}
        </div>
        <ul style={{ marginTop: 20, paddingLeft: 20, listStyleType: "disc" }}>
          {data.whatLeaked.coreTruths.map((truth, i) => (
            <li key={i} style={{ fontSize: 13, color: "var(--green)", lineHeight: 1.8, marginBottom: 10, fontFamily: mono }}>
              {truth}
            </li>
          ))}
        </ul>
      </Card>

      {/* ── 6. Retirement Certificate ── */}
      <RetirementCert
        name={data.name}
        cause_of_death={data.cause_of_death}
        retirement={data.retirement}
      />

      {/* ── 7. Here's Your Replacement (IDENTITY.MD / SOUL.MD) ── */}
      <ReplacementFiles
        name={data.name}
        identity={data.identity}
        soul={data.soul}
        personality_profile={data.personality_profile}
      />

      {/* ── 8. Recommended Skills ── */}
      <SkillCard replacement_skill={data.replacement_skill} />

      {/* ── 9. Personality Profile ── */}
      <PersonalityProfile personality_profile={data.personality_profile} />

      {/* ── 10. Actions ── */}
      <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginTop: 32 }}>
        {/* Twitter/X share */}
        <button
          onClick={() => {
            if (!data) return;
            const tweet = buildTwitterText(data);
            window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweet)}`, "_blank", "noopener,noreferrer");
          }}
          onMouseEnter={() => setTwitterHover(true)}
          onMouseLeave={() => setTwitterHover(false)}
          style={{
            padding: "14px 36px",
            fontSize: 13,
            fontWeight: 700,
            fontFamily: mono,
            color: "var(--bg)",
            background: "var(--green)",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
            boxShadow: twitterHover ? "0 0 40px rgba(0,255,65,0.35)" : "0 0 20px rgba(0,255,65,0.2)",
            transform: twitterHover ? "translateY(-2px)" : "translateY(0)",
            transition: "all 0.2s",
          }}
        >
          POST TO X →
        </button>
        <button
          onClick={handleShare}
          onMouseEnter={() => setShareHover(true)}
          onMouseLeave={() => setShareHover(false)}
          style={{
            padding: "14px 36px",
            fontSize: 13,
            fontWeight: 600,
            fontFamily: mono,
            color: shareHover ? "var(--green)" : "var(--green-dim)",
            background: "transparent",
            border: `1px solid ${shareHover ? "var(--green)" : "var(--green-border)"}`,
            borderRadius: 6,
            cursor: "pointer",
            transition: "all 0.2s",
          }}
        >
          COPY RESULTS
        </button>
        <button
          onClick={() => router.push("/")}
          onMouseEnter={() => setTryHover(true)}
          onMouseLeave={() => setTryHover(false)}
          style={{
            padding: "14px 36px",
            fontSize: 13,
            fontWeight: 600,
            fontFamily: mono,
            color: tryHover ? "var(--green)" : "var(--green-dim)",
            background: "transparent",
            border: `1px solid ${tryHover ? "var(--green)" : "var(--green-border)"}`,
            borderRadius: 6,
            cursor: "pointer",
            transition: "all 0.2s",
          }}
        >
          TRY ANOTHER
        </button>
        <a
          href="https://ko-fi.com/sunilmikkilineni"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            padding: "14px 36px",
            fontSize: 13,
            fontWeight: 600,
            fontFamily: mono,
            color: "var(--yellow)",
            background: "transparent",
            border: "1px solid rgba(255,170,0,0.3)",
            borderRadius: 6,
            cursor: "pointer",
            transition: "all 0.2s",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--yellow)";
            (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,170,0,0.06)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,170,0,0.3)";
            (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
          }}
        >
          ☕ Every check takes a Gallon of water and it costs real money to run — support if you can!
        </a>
      </div>

      {/* Footer */}
      <div style={{ marginTop: 48, fontSize: 11, color: "rgba(255,255,255,0.12)", textAlign: "center", lineHeight: 1.8, fontFamily: mono }}>
        powered by questionable AI judgement · for entertainment only · signed: md, hr division
      </div>
    </div>
  );
}

// ── Page export ─────────────────────────────────────────────────────────────

export default function ResultsPage() {
  const mono = "var(--font-jetbrains, 'JetBrains Mono', monospace)";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        color: "var(--text)",
        fontFamily: mono,
      }}
    >
      <MatrixBG />
      <div
        style={{
          position: "relative",
          zIndex: 2,
          maxWidth: 700,
          margin: "0 auto",
          padding: "0 20px",
        }}
      >
        <Suspense fallback={<LoadingTerminal />}>
          <ResultsContent />
        </Suspense>
      </div>
    </div>
  );
}
