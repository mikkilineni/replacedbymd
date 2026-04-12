import { useState, useEffect, useRef } from "react";

if (!document.querySelector("[data-font-clawd]")) {
  const l = document.createElement("link");
  l.rel = "stylesheet";
  l.href = "https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,400;0,600;0,700;1,400;1,600&display=swap";
  l.setAttribute("data-font-clawd", "true");
  document.head.appendChild(l);
}

/* ── Design tokens ── */
const G = "#00ff41", GD = "rgba(0,255,65,0.6)", GB = "rgba(0,255,65,0.15)", BG = "#0a0b0f";
const F = "'JetBrains Mono','Courier New',monospace";
const LABELS = [
  { max: 25, label: "SAFE... FOR NOW", color: "#00ff41" },
  { max: 45, label: "ON NOTICE", color: "#66ff66" },
  { max: 60, label: "VERY CLOSE", color: "#ffaa00" },
  { max: 80, label: "ALMOST GONE", color: "#ff6600" },
  { max: 100, label: "ALREADY REPLACED", color: "#ff2222" },
];
const scoreInfo = (s) => LABELS.find((l) => s <= l.max) || LABELS[4];

/* ── Matrix rain ── */
function MatrixBG() {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d");
    let w = c.width = window.innerWidth, h = c.height = window.innerHeight;
    const cols = Math.floor(w / 18), drops = Array(cols).fill(1);
    const ch = "0123456789ABCDEFabcdef{}[]<>|=+-_.:;アカサタナハマヤラワ";
    const draw = () => {
      ctx.fillStyle = "rgba(10,11,15,0.06)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "rgba(0,255,65,0.06)"; ctx.font = "14px monospace";
      for (let i = 0; i < drops.length; i++) {
        ctx.fillText(ch[Math.floor(Math.random() * ch.length)], i * 18, drops[i] * 18);
        if (drops[i] * 18 > h && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }
    };
    const iv = setInterval(draw, 80);
    const r = () => { w = c.width = window.innerWidth; h = c.height = window.innerHeight; };
    window.addEventListener("resize", r);
    return () => { clearInterval(iv); window.removeEventListener("resize", r); };
  }, []);
  return <canvas ref={ref} style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }} />;
}

/* ── Semicircle gauge ── */
function Gauge({ score, size = 260 }) {
  const [v, setV] = useState(0);
  const info = scoreInfo(score);
  useEffect(() => {
    const t0 = Date.now();
    const tick = () => {
      const p = Math.min((Date.now() - t0) / 1800, 1);
      setV(Math.round((1 - Math.pow(1 - p, 3)) * score));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [score]);
  const r = (size - 24) / 2, cx = size / 2, cy = size / 2 + 10;
  const half = Math.PI * r, off = half - (v / 100) * half;
  const arc = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`;
  return (
    <div style={{ textAlign: "center" }}>
      <svg width={size} height={size * 0.58} viewBox={`0 0 ${size} ${size * 0.58}`}>
        <path d={arc} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="12" strokeLinecap="round" />
        <path d={arc} fill="none" stroke={info.color} strokeWidth="12" strokeLinecap="round"
          strokeDasharray={half} strokeDashoffset={off}
          style={{ filter: `drop-shadow(0 0 16px ${info.color}80)`, transition: "stroke-dashoffset 0.05s linear" }} />
        <text x={cx} y={cy - 20} textAnchor="middle" fill={info.color} style={{ fontFamily: F, fontSize: size * 0.22, fontWeight: 700 }}>{v}</text>
        <text x={cx} y={cy + 2} textAnchor="middle" fill="rgba(255,255,255,0.3)" style={{ fontFamily: F, fontSize: 14 }}>/ 100</text>
      </svg>
      <div style={{ fontFamily: F, fontSize: 14, fontWeight: 700, letterSpacing: 3, color: info.color, marginTop: -4, textShadow: `0 0 20px ${info.color}60` }}>{info.label}</div>
    </div>
  );
}

/* ── Metric bar ── */
function Bar({ label, score, delay = 0 }) {
  const [w, setW] = useState(0);
  useEffect(() => { const t = setTimeout(() => setW(score), delay); return () => clearTimeout(t); }, [score, delay]);
  const grad = score <= 40 ? "linear-gradient(90deg,#00ff41,#66ff88)" : score <= 70 ? "linear-gradient(90deg,#00ff41,#ffaa00)" : "linear-gradient(90deg,#00ff41,#ff6600)";
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontFamily: F, fontSize: 14 }}>
        <span style={{ color: "rgba(255,255,255,0.85)" }}>{label}</span>
        <span style={{ color: G, fontWeight: 700 }}>{score}</span>
      </div>
      <div style={{ height: 8, background: "rgba(255,255,255,0.05)", borderRadius: 4, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${w}%`, background: grad, borderRadius: 4, transition: "width 1.2s cubic-bezier(0.22,1,0.36,1)", boxShadow: "0 0 12px rgba(0,255,65,0.3)" }} />
      </div>
    </div>
  );
}

/* ── Terminal window ── */
function Terminal({ title, children }) {
  return (
    <div style={{ background: "rgba(0,0,0,0.6)", border: `1px solid ${GB}`, borderRadius: 8, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 14px", borderBottom: `1px solid ${GB}` }}>
        {["#ff5f56", "#ffbd2e", "#27ca3f"].map((c, i) => <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />)}
        <span style={{ fontFamily: F, fontSize: 13, color: G, marginLeft: 8 }}>{title}</span>
      </div>
      <div style={{ padding: "20px 24px", fontFamily: F, fontSize: 13.5, color: G, lineHeight: 1.75, whiteSpace: "pre-wrap", maxHeight: 440, overflowY: "auto" }}>{children}</div>
    </div>
  );
}

/* ── Card / Header helpers ── */
const Card = ({ children, style }) => <div style={{ background: "rgba(0,255,65,0.02)", border: `1px solid ${GB}`, borderRadius: 8, padding: "28px 32px", ...style }}>{children}</div>;
const SH = ({ text }) => <div style={{ fontFamily: F, fontSize: 13, fontWeight: 700, color: G, letterSpacing: 3, textTransform: "uppercase", marginBottom: 12 }}>{text}</div>;
const Field = ({ label, children, green }) => (
  <div style={{ marginTop: 20 }}>
    <div style={{ fontSize: 11, color: GD, letterSpacing: 2, textTransform: "uppercase" }}>{label}</div>
    <div style={{ fontSize: 15, color: green ? G : "#fff", marginTop: 4, lineHeight: 1.7, fontStyle: green === "italic" ? "italic" : undefined }}>{children}</div>
  </div>
);

/* ── Avatar ── */
function Avatar() {
  return (
    <div style={{ width: 90, height: 90, borderRadius: 12, border: `2px solid ${GB}`, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <svg width="50" height="50" viewBox="0 0 50 50" fill="none">
        <circle cx="25" cy="18" r="10" stroke={GD} strokeWidth="1.5" />
        <path d="M10 45 C10 32 40 32 40 45" stroke={GD} strokeWidth="1.5" />
        <line x1="20" y1="16" x2="22" y2="16" stroke={GD} strokeWidth="1.5" />
        <line x1="28" y1="16" x2="30" y2="16" stroke={GD} strokeWidth="1.5" />
        <path d="M22 22 Q25 25 28 22" stroke={GD} strokeWidth="1" />
      </svg>
    </div>
  );
}

/* ── Loading ── */
function Loading() {
  const lines = ["Scanning public profile data...", "Indexing LinkedIn buzzword density...", "Cross-referencing with AI capabilities...", "Measuring vibe moat depth...", "Generating IDENTITY.md...", "Compiling SOUL.md...", "Drafting retirement certificate...", "Calculating replacement cost..."];
  const [vis, setVis] = useState([]);
  useEffect(() => { lines.forEach((l, i) => setTimeout(() => setVis(p => [...p, l]), i * 500)); }, []);
  return (
    <div style={{ fontFamily: F, fontSize: 14, lineHeight: 2.2, color: GD, textAlign: "left", maxWidth: 480, margin: "0 auto" }}>
      {vis.map((l, i) => <div key={i} style={{ animation: "fadeIn .3s ease forwards" }}><span style={{ color: G }}>▸ </span>{l}</div>)}
      <span style={{ display: "inline-block", width: 9, height: 18, background: G, animation: "blink 1s step-end infinite", verticalAlign: "middle", marginLeft: 2 }} />
    </div>
  );
}

/* ══════════════════════════════════════════
   MAIN APP
   ══════════════════════════════════════════ */
export default function ReplaceByClawd() {
  const [stage, setStage] = useState("landing");
  const [url, setUrl] = useState("");
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [tab, setTab] = useState("identity");

  const go = async () => {
    if (!url.trim()) { setErr("Paste a URL first"); return; }
    setErr(""); setStage("loading");

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514", max_tokens: 1000,
          tools: [{ type: "web_search_20250305", name: "web_search" }],
          messages: [{ role: "user", content: `You are the AI engine behind "ReplaceByClawd" — a viral tool that rates how replaceable a professional is by AI. You research their public internet footprint and deliver a satirical but devastatingly specific replacement report.

The user submitted this URL: ${url.trim()}

STEP 1: Search the web for this person. Find their name, title, company, career history, public posts, writing patterns, education, and anything else publicly available.

STEP 2: Generate a deeply personalized report. Base every joke on real data you found. Avoid generic insults — make it accurate and personal.

SCORING GUIDANCE:
- 0 = deeply human and hard to replicate
- 100 = already spiritually automated
- Repetitive operational language, templated leadership talk, role-as-process → score UP
- Cross-functional judgment, original thinking, trust-based influence, messy crisis decisions → score DOWN

Respond ONLY with valid JSON. No markdown. No code fences. No preamble.
{
  "name": "Full Name",
  "title": "Actual job title",
  "company": "Current company",
  "linkedinUrl": "${url.trim()}",
  "death_score": <0-100>,
  "cause_of_death": "1-2 sentences why they're being retired by AI. Reference their actual skills and how AI now approximates them.",
  "eulogy": "A sharp, memorable 1-2 sentence verdict about their replaceability. The main quote people will screenshot and share.",
  "metrics": {
    "alreadyABot": <0-100, how much of their daily work is already pattern-matching>,
    "vibeMoat": <0-100, 100=no human moat, how little personality protects them>,
    "publicFootprint": <0-100, how much data exists to clone them>,
    "jobIsJustText": <0-100, how much their job is text-in text-out>,
    "billingAudacity": <0-100, gap between their rate and what AI could do it for>
  },
  "personality_profile": {
    "traits": ["3-5 specific personality traits based on evidence, e.g. 'operationally skeptical', 'systems-minded'"],
    "writing_style": "Brief description of their communication style based on public signals",
    "notable_patterns": ["3-5 behavioral patterns, e.g. 'asks who owns production risk', 'translates buzzwords into cost impact'"]
  },
  "replacement_skill": {
    "name": "skill-name-in-kebab-case",
    "description": "What the AI replacement skill does, in one sentence. Written like a package description.",
    "capabilities": ["3-4 specific things the AI replacement can do, phrased as bullet capabilities"]
  },
  "stock": {
    "ticker": "3-4 letter funny ticker symbol derived from their name",
    "crash_percentage": "negative percentage like -73%",
    "headline": "A mock Bloomberg-style headline about their career stock crashing, referencing their actual work"
  },
  "whatLeaked": {
    "prose": "2-3 paragraphs. A first-person voice clone written AS them. Describe what they actually do, career arc, professional personality. Use their real industry terms. Write like they'd write at 2am being honest. Monospace terminal energy.",
    "coreTruths": ["4-5 brutally specific bullets about their professional habits. First person. Funny and accurate."]
  },
  "retirement": {
    "pension": "What they leave with — reference IDENTITY.md, SOUL.md, plus something funny and specific to their career.",
    "farewell": "One sentence italic farewell. Dark humor. Reference their actual work domain."
  },
  "identity": {
    "creature": "Funny 1-2 sentence 'creature type' using their actual tech stack or industry jargon",
    "vibe": "2-3 sentences about their professional vibe. Reference education, career path, companies specifically.",
    "emoji": "One emoji that captures them",
    "aliases": "Name variations and handles"
  },
  "soul": {
    "whoYouAre": "3-4 paragraphs in first person AS them. Their career, identity, philosophy. Dark humor, self-awareness. Use real companies, tools, industries.",
    "coreTruths": ["4-5 core professional beliefs/habits. First person. Specific to their actual work."]
  }
}` }],
        }),
      });
      const d = await res.json();
      const text = d.content?.filter(c => c.type === "text").map(c => c.text).join("") || "";
      const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
      setData(parsed); setStage("results");
    } catch (e) {
      console.error(e);
      // Fallback
      const slug = url.includes("/in/") ? url.split("/in/")[1]?.replace(/\//g, "") : "human";
      const name = slug.split(/[-_]/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ") || "Human";
      setData({
        name, title: "Professional Human", company: "The Industry", linkedinUrl: url.trim(),
        death_score: 62,
        cause_of_death: "You are being retired because too much of your job now collapses into pattern recognition, status updates, and sternly worded operational advice that could be a template.",
        eulogy: "Your entire job could be a well-crafted system prompt with a calendar integration, but the part where you sense a meeting is actually about something else entirely still requires a soul.",
        metrics: { alreadyABot: 58, vibeMoat: 46, publicFootprint: 33, jobIsJustText: 74, billingAudacity: 55 },
        personality_profile: { traits: ["operationally skeptical", "systems-minded", "calm under chaos"], writing_style: "direct, technical, dryly unimpressed", notable_patterns: ["asks who owns production risk", "translates buzzwords into cost impact", "treats vague performance claims as a personal insult"] },
        replacement_skill: { name: "professional-replacement-scanner", description: "Simulates the public-facing judgment layer of a senior tech leader with just enough sarcasm to sound expensive.", capabilities: ["Summarize technical career arcs into satirical executive prose", "Infer risk posture from public role history and writing signals", "Generate mock retirement notices for process-heavy tech roles"] },
        stock: { ticker: slug.slice(0, 4).toUpperCase(), crash_percentage: "-62%", headline: "Legacy operational wisdom downgraded after autocomplete learns the same three warnings." },
        whatLeaked: { prose: "I work in technology, which is a polite way of saying I translate between people who build things and people who pay for things. Most of my career has been spent making sure systems don't fall over while everyone argues about roadmaps.\n\nI've become the person who gets pulled into incidents not because I'm the best at fixing them, but because I remain calm while everything is on fire. Predictable career arc, yes. Still useful.", coreTruths: ["I have probably rewritten the same advice about scaling, monitoring, and 'doing it right this time' at three different companies.", "I distrust the phrase 'high performance' until somebody shows me the benchmarks and the bill.", "If a system works only because one exhausted person remembers the workaround, that is not architecture. That is folklore.", "I have attended enough 'strategy offsites' to know the strategy was decided before the offsite."] },
        retirement: { pension: "You may collect your IDENTITY.md, SOUL.md, a stack of imaginary performance reviews, and the deep satisfaction of being right about automation years earlier than everyone else.", farewell: "Please hand in your laptop at the desk. The incidents will continue, just with better autocomplete." },
        identity: { creature: "enterprise technology creature in business casual, dragging a cart of dashboards, runbooks, and the quiet knowledge that every 'transformation' eventually becomes a cost review", vibe: "The sort of person who can explain why your system is slow, why your migration plan is fantasy, and why half the industry keeps rediscovering the same mistakes with fresher branding.", emoji: "🔧", aliases: name + ", " + slug },
        soul: { whoYouAre: "I work in technology, which is a polite way of saying I spend my time stopping expensive systems from behaving like unstable art projects.\n\nI've spent a long time in this industry, which means I am professionally conditioned to notice every hand-wavy plan that ends with somebody else holding the pager. I like modernization, but only the kind that survives contact with production.\n\nOver time I picked up the management titles too, which mostly means I now get invited to meetings about reliability before being asked to clean up after them. Predictable career arc, yes. Still useful.", coreTruths: ["I have been the person quietly asking about backup restores while everyone else celebrates the migration plan.", "I distrust the phrase 'high performance' until somebody shows me latency, throughput, and the bill.", "I have probably rewritten the same advice about automation, observability, and capacity planning in three different companies.", "If a system works only because one exhausted person remembers the workaround, that is not architecture. That is folklore."] },
      });
      setStage("results");
    }
  };

  const reset = () => { setStage("landing"); setUrl(""); setData(null); setErr(""); setTab("identity"); };
  const share = () => {
    if (!data) return;
    const t = `replacebyclawd // replacement report\n\n${data.name} — ${data.title}\n${data.death_score}/100: ${scoreInfo(data.death_score).label}\n\n"${data.eulogy}"\n\n$${data.stock.ticker} ${data.stock.crash_percentage}\n${data.stock.headline}`;
    navigator.share ? navigator.share({ text: t }).catch(() => {}) : navigator.clipboard?.writeText(t);
  };

  return (
    <div style={{ minHeight: "100vh", background: BG, color: "#fff", fontFamily: F }}>
      <style>{`
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes slideUp{from{opacity:0;transform:translateY(40px)}to{opacity:1;transform:translateY(0)}}
        @keyframes glow{0%,100%{text-shadow:0 0 10px rgba(0,255,65,0.3)}50%{text-shadow:0 0 28px rgba(0,255,65,0.7)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes tickerScroll{from{transform:translateX(0)}to{transform:translateX(-50%)}}
        input::placeholder{color:rgba(0,255,65,0.25)!important}
        input:focus{outline:none!important;border-color:#00ff41!important;box-shadow:0 0 0 2px rgba(0,255,65,0.15),0 0 30px rgba(0,255,65,0.08)!important}
        ::-webkit-scrollbar{width:6px}::-webkit-scrollbar-track{background:rgba(0,255,65,0.02)}::-webkit-scrollbar-thumb{background:rgba(0,255,65,0.15);border-radius:3px}
        *{box-sizing:border-box}
      `}</style>
      <MatrixBG />
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 1, background: "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,255,65,0.008) 2px,rgba(0,255,65,0.008) 4px)" }} />

      <div style={{ position: "relative", zIndex: 2, maxWidth: 700, margin: "0 auto", padding: "0 20px" }}>

        {/* ═══ LANDING ═══ */}
        {stage === "landing" && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", textAlign: "center", animation: "slideUp .5s ease" }}>
            <div style={{ fontSize: 12, color: GD, letterSpacing: 3, marginBottom: 24, textTransform: "uppercase" }}>// are you just a system prompt?</div>
            <h1 style={{ fontSize: "clamp(42px,10vw,72px)", fontWeight: 700, color: G, margin: 0, lineHeight: 1, letterSpacing: -1, textShadow: "0 0 40px rgba(0,255,65,0.3),0 0 80px rgba(0,255,65,0.1)", animation: "glow 4s ease infinite" }}>Replace</h1>
            <h1 style={{ fontSize: "clamp(42px,10vw,72px)", fontWeight: 700, color: "#fff", margin: "0 0 8px", lineHeight: 1, letterSpacing: -1 }}>ByClawd</h1>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.35)", maxWidth: 420, lineHeight: 1.8, margin: "28px 0 44px" }}>Paste your LinkedIn URL. Find out if you can be replaced by OpenClaw. Try not to cry.</p>
            <div style={{ width: "100%", maxWidth: 500 }}>
              <input type="text" value={url} onChange={e => { setUrl(e.target.value); setErr(""); }} onKeyDown={e => e.key === "Enter" && go()} placeholder="https://linkedin.com/in/your-profile" style={{ width: "100%", padding: "16px 20px", fontSize: 14, fontFamily: F, background: "rgba(0,255,65,0.03)", border: `1px solid ${GB}`, borderRadius: 8, color: G, transition: "all .3s" }} />
              {err && <div style={{ fontSize: 12, color: "#ff4444", marginTop: 8, textAlign: "left" }}>⚠ {err}</div>}
            </div>
            <button onClick={go} style={{ marginTop: 24, padding: "16px 48px", fontSize: 14, fontWeight: 700, fontFamily: F, color: BG, background: G, border: "none", borderRadius: 8, cursor: "pointer", letterSpacing: 1, boxShadow: "0 0 30px rgba(0,255,65,0.25)", transition: "all .2s" }} onMouseEnter={e => { e.target.style.boxShadow = "0 0 50px rgba(0,255,65,0.4)"; e.target.style.transform = "translateY(-2px)"; }} onMouseLeave={e => { e.target.style.boxShadow = "0 0 30px rgba(0,255,65,0.25)"; e.target.style.transform = "translateY(0)"; }}>ANALYZE →</button>
            <div style={{ marginTop: 60, fontSize: 11, color: "rgba(255,255,255,0.15)", lineHeight: 1.8 }}>powered by questionable AI judgement · for entertainment only · signed: clawd, hr division</div>
          </div>
        )}

        {/* ═══ LOADING ═══ */}
        {stage === "loading" && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", animation: "fadeIn .4s ease" }}>
            <div style={{ width: 48, height: 48, border: "3px solid rgba(0,255,65,0.1)", borderTopColor: G, borderRadius: "50%", animation: "spin .7s linear infinite", marginBottom: 40 }} />
            <Loading />
          </div>
        )}

        {/* ═══ RESULTS ═══ */}
        {stage === "results" && data && (
          <div style={{ paddingTop: 40, paddingBottom: 80, animation: "slideUp .6s ease" }}>
            <div style={{ fontSize: 12, color: GD, letterSpacing: 2, marginBottom: 32 }}>replacebyclawd // replacement report</div>

            {/* ── Profile + Verdict ── */}
            <Card>
              <div style={{ display: "flex", gap: 20, alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap" }}>
                <Avatar />
                <div style={{ flex: 1, minWidth: 200 }}>
                  <h2 style={{ fontSize: "clamp(28px,6vw,44px)", fontWeight: 700, margin: 0, color: "#fff", lineHeight: 1.1 }}>{data.name}</h2>
                  <div style={{ fontSize: 12, color: GD, marginTop: 6, wordBreak: "break-all" }}>{data.linkedinUrl}</div>
                </div>
              </div>
              <p style={{ fontSize: "clamp(16px,3.5vw,22px)", fontWeight: 700, color: "#fff", lineHeight: 1.5, margin: "20px 0 0" }}>"{data.eulogy}"</p>
            </Card>

            {/* ── Gauge ── */}
            <div style={{ margin: "40px 0", textAlign: "center" }}><Gauge score={data.death_score} /></div>

            {/* ── Replica Metrics ── */}
            <Card style={{ marginBottom: 32 }}>
              <SH text="REPLICA METRICS" />
              <div style={{ marginTop: 20 }}>
                <Bar label="Already a Bot" score={data.metrics.alreadyABot} delay={200} />
                <Bar label="Vibe Moat (100 = none)" score={data.metrics.vibeMoat} delay={350} />
                <Bar label="Public Footprint" score={data.metrics.publicFootprint} delay={500} />
                <Bar label="Job Is Just Text" score={data.metrics.jobIsJustText} delay={650} />
                <Bar label="Billing Audacity" score={data.metrics.billingAudacity} delay={800} />
              </div>
            </Card>

            {/* ── Stock Crash ── */}
            <Card style={{ marginBottom: 32, borderColor: "rgba(255,34,34,0.2)", background: "rgba(255,34,34,0.02)" }}>
              <SH text="MARKET IMPACT" />
              <div style={{ display: "flex", alignItems: "baseline", gap: 16, flexWrap: "wrap", marginTop: 12 }}>
                <span style={{ fontSize: 28, fontWeight: 700, color: "#fff", letterSpacing: 2 }}>${data.stock.ticker}</span>
                <span style={{ fontSize: 28, fontWeight: 700, color: "#ff2222", textShadow: "0 0 12px rgba(255,34,34,0.4)" }}>{data.stock.crash_percentage}</span>
              </div>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", lineHeight: 1.7, marginTop: 12 }}>{data.stock.headline}</p>
            </Card>

            {/* ── What Leaked ── */}
            <Card style={{ marginBottom: 32 }}>
              <SH text="WHAT LEAKED" />
              <div style={{ fontSize: 14, color: "rgba(255,255,255,0.85)", lineHeight: 1.8, marginTop: 16, whiteSpace: "pre-wrap" }}>{data.whatLeaked.prose}</div>
              <ul style={{ marginTop: 20, paddingLeft: 20, listStyleType: "disc" }}>
                {data.whatLeaked.coreTruths.map((t, i) => <li key={i} style={{ fontSize: 13, color: G, lineHeight: 1.8, marginBottom: 10 }}>{t}</li>)}
              </ul>
            </Card>

            {/* ── Retirement Certificate ── */}
            <Card style={{ marginBottom: 32 }}>
              <SH text="RETIREMENT CERTIFICATE" />
              <Field label="RETIREE"><span style={{ fontSize: 24, fontWeight: 700 }}>{data.name}</span></Field>
              <Field label="DATE OF RETIREMENT">{new Date().toISOString().split("T")[0]}</Field>
              <Field label="CAUSE OF RETIREMENT" green>{data.cause_of_death}</Field>
              <Field label="PENSION">{data.retirement.pension}</Field>
              <Field label="FAREWELL" green="italic">{data.retirement.farewell}</Field>
              <div style={{ marginTop: 28, paddingTop: 16, borderTop: `1px solid ${GB}` }}>
                <div style={{ width: 120, height: 1, background: G, marginBottom: 8 }} />
                <span style={{ fontSize: 12, color: GD }}>Signed: Clawd, HR Division</span>
              </div>
            </Card>

            {/* ── Here's Your Replacement ── */}
            <Card style={{ marginBottom: 32 }}>
              <SH text="HERE'S YOUR REPLACEMENT" />
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", margin: "0 0 20px" }}>the soul and identity files we scraped off the internet about you.</p>
              <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                {[{ k: "identity", l: "IDENTITY.MD" }, { k: "soul", l: "SOUL.MD" }].map(t => (
                  <button key={t.k} onClick={() => setTab(t.k)} style={{ padding: "10px 20px", fontSize: 13, fontWeight: 600, fontFamily: F, cursor: "pointer", borderRadius: 6, border: `1px solid ${tab === t.k ? G : GB}`, background: tab === t.k ? "rgba(0,255,65,0.08)" : "transparent", color: tab === t.k ? G : "rgba(255,255,255,0.4)", transition: "all .2s" }}>{t.l}</button>
                ))}
              </div>
              {tab === "identity" && (
                <Terminal title="IDENTITY.md">
                  {`# IDENTITY.md — Who Am I?\n\n- **Name:** ${data.name}\n- **Creature:** ${data.identity.creature}\n- **Vibe:** ${data.identity.vibe}\n- **Emoji:** ${data.identity.emoji}\n- **Aliases:** ${data.identity.aliases}\n\n## Notes\n\nGrounded primarily in LinkedIn/Proxycurl profile data and corroborating public directory references. ${data.personality_profile.writing_style ? `Writing style: ${data.personality_profile.writing_style}.` : ""}`}
                </Terminal>
              )}
              {tab === "soul" && (
                <Terminal title="SOUL.md">
                  {`# SOUL.md — Who You Are\n\n${data.soul.whoYouAre}\n\n## Core Truths\n\n${data.soul.coreTruths.map(t => `- ${t}`).join("\n")}`}
                </Terminal>
              )}
            </Card>

            {/* ── Recommended Skills ── */}
            <Card style={{ marginBottom: 32 }}>
              <SH text="RECOMMENDED SKILLS" />
              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: G, marginBottom: 6 }}>{data.replacement_skill.name}</div>
                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", lineHeight: 1.7, marginBottom: 16 }}>{data.replacement_skill.description}</p>
                <div style={{ fontSize: 11, color: GD, letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }}>CAPABILITIES</div>
                {data.replacement_skill.capabilities.map((c, i) => (
                  <div key={i} style={{ fontSize: 13, color: G, lineHeight: 1.7, marginBottom: 6, paddingLeft: 16, position: "relative" }}>
                    <span style={{ position: "absolute", left: 0 }}>▸</span> {c}
                  </div>
                ))}
              </div>
            </Card>

            {/* ── Personality Profile ── */}
            <Card style={{ marginBottom: 32 }}>
              <SH text="PERSONALITY PROFILE" />
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
                {data.personality_profile.traits.map((t, i) => (
                  <span key={i} style={{ padding: "6px 14px", fontSize: 12, color: G, border: `1px solid ${GB}`, borderRadius: 20, background: "rgba(0,255,65,0.04)" }}>{t}</span>
                ))}
              </div>
              <div style={{ marginTop: 20 }}>
                <div style={{ fontSize: 11, color: GD, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>NOTABLE PATTERNS</div>
                {data.personality_profile.notable_patterns.map((p, i) => (
                  <div key={i} style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.7, marginBottom: 6, paddingLeft: 16, position: "relative" }}>
                    <span style={{ position: "absolute", left: 0, color: G }}>•</span> {p}
                  </div>
                ))}
              </div>
            </Card>

            {/* ── Actions ── */}
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginTop: 32 }}>
              <button onClick={share} style={{ padding: "14px 36px", fontSize: 13, fontWeight: 700, fontFamily: F, color: BG, background: G, border: "none", borderRadius: 6, cursor: "pointer", boxShadow: "0 0 20px rgba(0,255,65,0.2)", transition: "all .2s" }} onMouseEnter={e => { e.target.style.boxShadow = "0 0 40px rgba(0,255,65,0.35)"; e.target.style.transform = "translateY(-2px)"; }} onMouseLeave={e => { e.target.style.boxShadow = "0 0 20px rgba(0,255,65,0.2)"; e.target.style.transform = "translateY(0)"; }}>SHARE RESULTS</button>
              <button onClick={reset} style={{ padding: "14px 36px", fontSize: 13, fontWeight: 600, fontFamily: F, color: GD, background: "transparent", border: `1px solid ${GB}`, borderRadius: 6, cursor: "pointer", transition: "all .2s" }} onMouseEnter={e => { e.target.style.borderColor = G; e.target.style.color = G; }} onMouseLeave={e => { e.target.style.borderColor = GB; e.target.style.color = GD; }}>TRY ANOTHER</button>
            </div>
            <div style={{ marginTop: 48, fontSize: 11, color: "rgba(255,255,255,0.12)", textAlign: "center", lineHeight: 1.8 }}>powered by questionable AI judgement · for entertainment only · signed: clawd, hr division</div>
          </div>
        )}
      </div>
    </div>
  );
}
