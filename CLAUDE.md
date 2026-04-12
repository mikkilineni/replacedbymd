# ReplaceByMd

A viral web app that analyzes how replaceable a professional is by AI. Users paste a LinkedIn URL, the app scrapes their public footprint, and delivers a satirical "replacement report" with a death score, retirement certificate, personality clone files (IDENTITY.md / SOUL.md), and a mock stock crash.

Inspired by [replacebyclawd.com](https://replacebyclawd.com).

---

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4 + custom CSS for terminal effects
- **Font**: JetBrains Mono (monospace throughout)
- **AI**: Anthropic Claude API (claude-sonnet-4-20250514) with web search tool
- **Profile Data**: Proxycurl or custom scraper service behind `PROFILE_EXTRACTOR_URL`
- **Deployment**: Vercel

---

## Design System

### Aesthetic: Hacker Terminal

This is NOT a typical SaaS landing page. The entire UI is a green-on-black terminal aesthetic with matrix rain, CRT scanlines, and monospace everything.

### Colors (CSS variables)

```
--green:         #00ff41
--green-dim:     rgba(0, 255, 65, 0.6)
--green-faint:   rgba(0, 255, 65, 0.12)
--green-border:  rgba(0, 255, 65, 0.15)
--green-bg:      rgba(0, 255, 65, 0.02)
--bg:            #0a0b0f
--text:          #ffffff
--text-dim:      rgba(255, 255, 255, 0.4)
--red:           #ff2222
--orange:        #ff6600
--yellow:        #ffaa00
```

### Typography

- **Font**: JetBrains Mono everywhere. No sans-serif. No Inter. No system fonts.
- **Headings**: JetBrains Mono bold, white or green
- **Body**: JetBrains Mono regular, green or dim white
- **Section headers**: 13px, uppercase, letter-spacing 3px, green, bold
- **Field labels**: 11px, uppercase, letter-spacing 2px, green-dim

### Components

- **Card**: `background: var(--green-bg)`, `border: 1px solid var(--green-border)`, `border-radius: 8px`, `padding: 28px 32px`
- **Terminal window**: macOS-style traffic light dots (red/yellow/green), title bar with green text, content area with green monospace text on black
- **Buttons (primary)**: Green background, dark text, glow shadow, hover lifts 2px
- **Buttons (secondary)**: Transparent, green-border, green-dim text, hover turns full green
- **Metric bars**: 8px height, dark track, green-to-orange gradient fill based on score
- **Tab buttons**: Border pill style, active = green border + green bg tint

### Effects

- **Matrix rain**: Canvas-based falling characters (hex digits + Japanese katakana), very faint green
- **CRT scanlines**: Repeating horizontal lines via CSS gradient, extremely subtle
- **Glow pulse**: Text-shadow animation on the title
- **Score gauge**: SVG semicircle arc, animated stroke-dashoffset

### Score Tier Labels

| Range  | Label             | Color   |
|--------|-------------------|---------|
| 0-25   | SAFE... FOR NOW   | #00ff41 |
| 26-45  | ON NOTICE         | #66ff66 |
| 46-60  | VERY CLOSE        | #ffaa00 |
| 61-80  | ALMOST GONE       | #ff6600 |
| 81-100 | ALREADY REPLACED  | #ff2222 |

---

## Page Flow

### 1. Landing Page (`/`)

- Tagline: `// are you just a system prompt?`
- Title: "Replace" (green, glowing) + "ByMd" (white)
- Subtitle: "Paste your LinkedIn URL. Find out if you can be replaced by OpenClaw. Try not to cry."
- Input: URL field with green text on dark background
- CTA: "ANALYZE →" green button
- Footer: "powered by questionable AI judgement · for entertainment only · signed: md, hr division"

### 2. Loading State

- Green spinner
- Terminal-style line-by-line text animation:
  - "Scanning public profile data..."
  - "Indexing LinkedIn buzzword density..."
  - "Cross-referencing with AI capabilities..."
  - "Measuring vibe moat depth..."
  - "Generating IDENTITY.md..."
  - "Compiling SOUL.md..."
  - "Drafting retirement certificate..."
  - "Calculating replacement cost..."
- Blinking green cursor at the end

### 3. Results Page (`/results?url=...&job=...`)

Sections in order:

1. **Header**: `replacebymd // replacement report`
2. **Profile card**: Sketch avatar + name + URL + verdict quote
3. **Score gauge**: Semicircle arc, score number, tier label
4. **Replica Metrics**: 5 animated bars
5. **Market Impact**: Stock ticker crash card (red-tinted)
6. **What Leaked**: First-person voice clone prose + core truths bullets
7. **Retirement Certificate**: Retiree, date, cause, pension, farewell, signed
8. **Here's Your Replacement**: Tabbed IDENTITY.MD / SOUL.MD terminal windows
9. **Recommended Skills**: AI replacement skill package with capabilities
10. **Personality Profile**: Trait pills + notable patterns
11. **Actions**: Share Results + Try Another buttons

---

## API Schema

### POST `/api/roast`

**Request:**
```json
{ "linkedinUrl": "https://www.linkedin.com/in/smikkilineni/" }
```

**Response (`RoastPayload`):**
```typescript
type RoastPayload = {
  name: string;
  title: string;
  company: string;
  death_score: number;         // 0-100
  cause_of_death: string;      // Why AI is retiring them
  eulogy: string;              // The main shareable verdict quote
  personality_profile: {
    traits: string[];           // e.g. ["operationally skeptical", "systems-minded"]
    writing_style: string;      // e.g. "direct, technical, dryly unimpressed"
    notable_patterns: string[]; // e.g. ["asks who owns production risk"]
  };
  replacement_skill: {
    name: string;               // kebab-case skill name
    description: string;        // One-liner package description
    capabilities: string[];     // What the AI replacement can do
  };
  stock: {
    ticker: string;             // e.g. "SUNE"
    crash_percentage: string;   // e.g. "-73%"
    headline: string;           // Bloomberg-style crash headline
  };
};
```

**Extended frontend data (generated alongside or derived):**
```typescript
type FrontendData = {
  linkedinUrl: string;
  metrics: {
    alreadyABot: number;      // 0-100
    vibeMoat: number;         // 0-100, 100 = no moat
    publicFootprint: number;  // 0-100
    jobIsJustText: number;    // 0-100
    billingAudacity: number;  // 0-100
  };
  whatLeaked: {
    prose: string;            // 2-3 paragraphs, first-person voice clone
    coreTruths: string[];     // 4-5 brutally specific bullets
  };
  retirement: {
    pension: string;          // What they leave with
    farewell: string;         // One-sentence italic farewell
  };
  identity: {
    creature: string;
    vibe: string;
    emoji: string;
    aliases: string;
  };
  soul: {
    whoYouAre: string;        // 3-4 paragraphs first-person
    coreTruths: string[];     // 4-5 core beliefs
  };
};
```

### GET `/api/roast`

Returns documentation with example request/response shapes.

---

## Profile Extraction

The API does NOT scrape LinkedIn directly. It calls an external service:

```
PROFILE_EXTRACTOR_URL=https://your-scraper.com/extract
PROFILE_EXTRACTOR_API_KEY=your-key
```

The extractor returns:
```typescript
type ExtractedProfile = {
  linkedin_url: string;
  name?: string;
  title?: string;
  company?: string;
  education?: string[];
  career_progression?: string[];
  public_posts?: Array<{
    platform: string;
    text: string;
    url?: string;
  }>;
  public_signals?: {
    writing_style?: string[];
    recurring_themes?: string[];
    rhetorical_tics?: string[];
  };
  sources?: Array<{ label: string; url: string }>;
};
```

Options for the extractor service:
- **Proxycurl** (proxycurl.com) — paid LinkedIn API, ~$0.01/request
- **Custom scraper** — Puppeteer/Playwright behind a service
- **Web search fallback** — Use Claude's web_search tool to find public info (current prototype approach)

---

## LLM Prompt Engineering

### Scoring Guidance (include in system prompt)

- 0 = deeply human and hard to replicate
- 100 = already spiritually automated
- Seniority alone does NOT guarantee a low or high score
- Repetitive operational language, templated leadership talk, role-as-process → push score UP
- Cross-functional judgment, original thinking, trust-based influence, messy crisis decisions → push score DOWN

### Tone

- Roast comedy × tech retirement
- Sharp, specific, slightly brutal but clever
- Avoid generic insults — make it accurate and personal
- Do not mention protected traits, health, family, or private facts
- First-person voice clones should sound like the person at 2am being honest

### Output Format

The LLM must return valid JSON only. No markdown fences. No preamble. Validated against the schema before returning to the client.

---

## Environment Variables

```env
# Required
ANTHROPIC_API_KEY=sk-ant-...          # For Claude API calls

# Profile extraction (pick one approach)
PROFILE_EXTRACTOR_URL=                 # Your scraper/enricher service URL
PROFILE_EXTRACTOR_API_KEY=             # Optional auth for the extractor

# Optional
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

---

## File Structure

```
replacebymd/
├── CLAUDE.md                          # This file — project context
├── tasks/
│   ├── todo.md                        # Current task tracking
│   └── lessons.md                     # Patterns learned from mistakes
├── app/
│   ├── layout.tsx                     # Root layout, fonts, metadata
│   ├── page.tsx                       # Landing page
│   ├── results/
│   │   └── page.tsx                   # Results page (reads from URL params or state)
│   └── api/
│       └── roast/
│           └── route.ts               # POST/GET API endpoint
├── components/
│   ├── MatrixBG.tsx                   # Canvas matrix rain background
│   ├── SemiGauge.tsx                  # Animated semicircle score gauge
│   ├── MetricBar.tsx                  # Animated horizontal metric bar
│   ├── TerminalWindow.tsx             # macOS-style terminal content display
│   ├── RetirementCert.tsx             # Retirement certificate card
│   ├── ReplacementFiles.tsx           # Tabbed IDENTITY.MD / SOUL.MD viewer
│   ├── StockCrash.tsx                 # Market impact ticker card
│   ├── SkillCard.tsx                  # Recommended replacement skill
│   ├── PersonalityProfile.tsx         # Traits + patterns
│   ├── SketchAvatar.tsx               # SVG placeholder avatar
│   ├── LoadingTerminal.tsx            # Terminal-style loading animation
│   └── Card.tsx                       # Base card wrapper
├── lib/
│   ├── types.ts                       # All TypeScript types
│   ├── prompt.ts                      # LLM prompt builder
│   ├── validate.ts                    # Payload validation functions
│   └── normalize-url.ts              # LinkedIn URL normalizer
├── public/
│   └── og-image.png                   # Open Graph share image
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── .env.local
```

---

## Coding Conventions

- Use TypeScript strict mode everywhere
- Prefer named exports over default exports (except page.tsx)
- All components are functional with hooks
- Use `async/await`, never raw `.then()` chains
- Extract components when they exceed ~100 lines
- Keep design tokens in a shared constants file or CSS variables
- All animations should be CSS-only where possible (canvas for matrix rain is the exception)
- No `localStorage` or `sessionStorage` — all state is URL params or React state
- Run `pnpm lint` before considering any task complete

---

## Development Workflow

```bash
pnpm install
pnpm dev                    # Start dev server at localhost:3000
pnpm build                  # Production build
pnpm lint                   # ESLint check
```

---

## Key Decisions & Constraints

1. **No direct LinkedIn scraping** — LinkedIn blocks scrapers aggressively. Use Proxycurl or a web search fallback.
2. **Client-side fallback** — If the API call fails, generate plausible mock data from the URL slug so the app never shows an error state.
3. **Shareable results** — Results should be reconstructable from URL params (e.g., `/results?url=...&job=...`) for social sharing.
4. **Mobile-first** — Clamp font sizes, flex-wrap everything, test on 375px width.
5. **Performance** — Matrix rain canvas should throttle on mobile. Gauge animation should use requestAnimationFrame.
6. **SEO/OG** — Dynamic Open Graph images for shared results showing the person's name, score, and verdict.

---

## Reference Implementation

A working single-file React prototype exists at `reference/prototype.jsx`. This contains:
- All visual components (MatrixBG, Gauge, MetricBar, Terminal, etc.)
- The Anthropic API integration with web search
- Fallback data generation
- The full results layout

Use this as the visual reference when building the Next.js version. Break it into the component structure defined above.
