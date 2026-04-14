"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { MatrixBG } from "@/components/MatrixBG";
import { normalizeLinkedInUrl } from "@/lib/normalize-url";

export default function LandingPage() {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [hovering, setHovering] = useState(false);
  const [count, setCount] = useState(47382);
  const router = useRouter();
  const mono = "var(--font-jetbrains, 'JetBrains Mono', monospace)";

  // Slowly tick the counter up — random increment every 4-10s
  const countRef = useRef(47382);
  useEffect(() => {
    const tick = () => {
      const increment = Math.floor(Math.random() * 3) + 1; // 1–3 per tick
      countRef.current += increment;
      setCount(countRef.current);
      // Schedule next tick: 4–10 seconds
      const delay = 4000 + Math.random() * 6000;
      timer = setTimeout(tick, delay);
    };
    let timer = setTimeout(tick, 4000 + Math.random() * 6000);
    return () => clearTimeout(timer);
  }, []);

  const handleAnalyze = () => {
    const result = normalizeLinkedInUrl(url);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.push(`/results?url=${encodeURIComponent(result.url)}`);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setUrl(text);
      setError("");
    } catch {
      // clipboard access denied — no-op
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)", fontFamily: mono }}>
      <MatrixBG />

      {/* Top-right nav */}
      <div style={{ position: "fixed", top: 20, right: 20, zIndex: 10 }}>
        <a
          href="https://ko-fi.com/sunilmikkilineni"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: 11,
            color: "rgba(255,170,0,0.6)",
            textDecoration: "none",
            border: "1px solid rgba(255,170,0,0.2)",
            borderRadius: 20,
            padding: "6px 12px",
            transition: "all 0.2s",
            fontFamily: mono,
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.color = "var(--yellow)";
            (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,170,0,0.5)";
            (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,170,0,0.05)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,170,0,0.6)";
            (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,170,0,0.2)";
            (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
          }}
        >
          ☕ support this
        </a>
      </div>

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
          {/* Tagline — best copy, should be prominent */}
          <div style={{ fontSize: "clamp(14px, 2vw, 18px)", color: "var(--green-dim)", letterSpacing: 1, marginBottom: 20 }}>
            // are you just a system prompt?
          </div>

          {/* Title — intentional lockup, one line */}
          <h1
            style={{
              fontSize: "clamp(48px, 11vw, 80px)",
              fontWeight: 700,
              margin: "0 0 28px",
              lineHeight: 1,
              letterSpacing: -2,
              animation: "glow 4s ease infinite",
              whiteSpace: "nowrap",
            }}
          >
            <span style={{ color: "var(--green)", textShadow: "0 0 40px rgba(0,255,65,0.3), 0 0 80px rgba(0,255,65,0.1)" }}>Replace</span>
            <span style={{ color: "#fff" }}>ByMd</span>
          </h1>

          {/* Subtitle */}
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.35)", maxWidth: 420, lineHeight: 1.8, margin: "0 0 44px" }}>
            Paste your LinkedIn URL. Find out if you can be replaced by OpenClaw. Try not to cry.
          </p>

          {/* Input with icon + paste button */}
          <div style={{ width: "100%", maxWidth: 500, position: "relative" }}>
            {/* Link icon */}
            <div
              style={{
                position: "absolute",
                left: 16,
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--green-dim)",
                fontSize: 13,
                pointerEvents: "none",
                lineHeight: 1,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
            </div>
            <input
              type="text"
              value={url}
              onChange={(e) => { setUrl(e.target.value); setError(""); }}
              onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
              placeholder="https://linkedin.com/in/your-name"
              style={{
                width: "100%",
                padding: "16px 100px 16px 44px",
                fontSize: 14,
                fontFamily: mono,
                background: "rgba(0,255,65,0.03)",
                border: "1px solid var(--green-border)",
                borderRadius: 8,
                color: "var(--green)",
                transition: "all 0.3s",
              }}
            />
            {/* Paste button */}
            <button
              onClick={handlePaste}
              style={{
                position: "absolute",
                right: 8,
                top: "50%",
                transform: "translateY(-50%)",
                padding: "6px 12px",
                fontSize: 11,
                fontFamily: mono,
                color: "var(--green-dim)",
                background: "rgba(0,255,65,0.06)",
                border: "1px solid var(--green-border)",
                borderRadius: 5,
                cursor: "pointer",
                letterSpacing: 1,
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color = "var(--green)";
                (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--green)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color = "var(--green-dim)";
                (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--green-border)";
              }}
            >
              paste
            </button>
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
            Am I Cooked? →
          </button>

          {/* Social proof counter */}
          <div style={{ marginTop: 16, fontSize: 12, color: "rgba(255,255,255,0.2)", letterSpacing: 0.5 }}>
            {count.toLocaleString()} professionals have checked their fate
          </div>

          {/* Footer */}
          <div style={{ marginTop: 60, fontSize: 11, color: "rgba(255,255,255,0.12)", lineHeight: 1.8, textAlign: "center" }}>
            powered by questionable AI judgement · for entertainment only · signed: md, hr division
          </div>
        </div>
      </div>
    </div>
  );
}
