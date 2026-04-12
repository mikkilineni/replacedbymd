"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MatrixBG } from "@/components/MatrixBG";
import { normalizeLinkedInUrl } from "@/lib/normalize-url";

export default function LandingPage() {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [hovering, setHovering] = useState(false);
  const router = useRouter();
  const mono = "var(--font-jetbrains, 'JetBrains Mono', monospace)";

  const handleAnalyze = () => {
    const result = normalizeLinkedInUrl(url);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.push(`/results?url=${encodeURIComponent(result.url)}`);
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)", fontFamily: mono }}>
      <MatrixBG />

      <div style={{ position: "relative", zIndex: 2, maxWidth: 700, margin: "0 auto", padding: "0 20px" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            textAlign: "center",
            animation: "slideUp 0.5s ease",
          }}
        >
          {/* Tagline */}
          <div style={{ fontSize: 12, color: "var(--green-dim)", letterSpacing: 3, marginBottom: 24, textTransform: "uppercase" }}>
            // are you just a system prompt?
          </div>

          {/* Title */}
          <h1 style={{ fontSize: "clamp(42px, 10vw, 72px)", fontWeight: 700, color: "var(--green)", margin: 0, lineHeight: 1, letterSpacing: -1, textShadow: "0 0 40px rgba(0,255,65,0.3), 0 0 80px rgba(0,255,65,0.1)", animation: "glow 4s ease infinite" }}>
            Replace
          </h1>
          <h1 style={{ fontSize: "clamp(42px, 10vw, 72px)", fontWeight: 700, color: "#fff", margin: "0 0 8px", lineHeight: 1, letterSpacing: -1 }}>
            ByMd
          </h1>

          {/* Subtitle */}
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.35)", maxWidth: 420, lineHeight: 1.8, margin: "28px 0 44px" }}>
            Paste your LinkedIn URL. Find out if you can be replaced by OpenClaw. Try not to cry.
          </p>

          {/* Input */}
          <div style={{ width: "100%", maxWidth: 500 }}>
            <input
              type="text"
              value={url}
              onChange={(e) => { setUrl(e.target.value); setError(""); }}
              onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
              placeholder="https://linkedin.com/in/your-profile"
              style={{
                width: "100%",
                padding: "16px 20px",
                fontSize: 14,
                fontFamily: mono,
                background: "rgba(0,255,65,0.03)",
                border: "1px solid var(--green-border)",
                borderRadius: 8,
                color: "var(--green)",
                transition: "all 0.3s",
              }}
            />
            {error && (
              <div style={{ fontSize: 12, color: "#ff4444", marginTop: 8, textAlign: "left" }}>
                ⚠ {error}
              </div>
            )}
          </div>

          {/* CTA button */}
          <button
            onClick={handleAnalyze}
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => setHovering(false)}
            style={{
              marginTop: 24,
              padding: "16px 48px",
              fontSize: 14,
              fontWeight: 700,
              fontFamily: mono,
              color: "var(--bg)",
              background: "var(--green)",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              letterSpacing: 1,
              boxShadow: hovering ? "0 0 50px rgba(0,255,65,0.4)" : "0 0 30px rgba(0,255,65,0.25)",
              transform: hovering ? "translateY(-2px)" : "translateY(0)",
              transition: "all 0.2s",
            }}
          >
            ANALYZE →
          </button>

          {/* Footer */}
          <div style={{ marginTop: 60, fontSize: 11, color: "rgba(255,255,255,0.15)", lineHeight: 1.8, textAlign: "center" }}>
            powered by questionable AI judgement · for entertainment only · signed: md, hr division
            <br />
            <a
              href="https://ko-fi.com/sunilmikkilineni"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "rgba(255,170,0,0.5)", textDecoration: "none", marginTop: 8, display: "inline-block", transition: "color 0.2s" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "var(--yellow)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,170,0,0.5)"; }}
            >
              ☕ buy me a coffee — this costs real money to run
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
