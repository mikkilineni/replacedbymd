# ReplaceByMd — Task Tracker

## Phase 1: Project Scaffolding
- [x] Initialize Next.js 14 App Router with TypeScript
- [x] Configure Tailwind CSS v4 with custom design tokens
- [x] Add JetBrains Mono font via next/font
- [x] Set up file structure (components/, lib/, app/)
- [x] Create .env.local template
- [x] Copy reference prototype to reference/prototype.jsx

## Phase 2: Shared Infrastructure
- [x] Create lib/types.ts with all TypeScript types (RoastPayload, ExtractedProfile, FrontendData, FullRoastPayload, SCORE_TIERS)
- [x] Create lib/normalize-url.ts (LinkedIn URL validation + normalization + slugToName)
- [x] Create lib/validate.ts (validateFullPayload + coercePayload with safe defaults)
- [x] Create lib/prompt.ts (buildSystemPrompt + buildUserPrompt with scoring guidance)
- [x] Create shared design tokens (CSS variables in globals.css)

## Phase 3: UI Components
- [x] MatrixBG.tsx — canvas matrix rain (throttle on mobile)
- [x] SemiGauge.tsx — animated SVG semicircle score gauge
- [x] MetricBar.tsx — animated horizontal bar with gradient
- [x] TerminalWindow.tsx — macOS-style terminal with traffic lights
- [x] Card.tsx — base card wrapper (+ SectionHeader, Field helpers)
- [x] SketchAvatar.tsx — SVG placeholder avatar
- [x] LoadingTerminal.tsx — line-by-line terminal animation
- [x] RetirementCert.tsx — retirement certificate card
- [x] ReplacementFiles.tsx — tabbed IDENTITY.MD / SOUL.MD viewer
- [x] StockCrash.tsx — red-tinted market impact card
- [x] SkillCard.tsx — replacement skill package display
- [x] PersonalityProfile.tsx — trait pills + patterns list

## Phase 4: Pages
- [x] app/layout.tsx — root layout, metadata, fonts, global styles
- [x] app/page.tsx — landing page (URL input + CTA)
- [x] app/results/page.tsx — full results page with all sections
- [x] Loading state between landing → results (LoadingTerminal shown while API call is in-flight)

## Phase 5: API Route
- [x] app/api/roast/route.ts — POST handler
- [x] app/api/roast/route.ts — GET handler (docs)
- [x] Profile extraction integration (PROFILE_EXTRACTOR_URL → web search fallback)
- [x] LLM call with structured JSON output (claude-sonnet-4-6 + web_search_20250305)
- [x] Payload validation before returning (validateFullPayload → coercePayload)
- [x] Error handling + graceful fallback (never returns error state to client)

## Phase 6: Polish & Ship
- [ ] Mobile responsive testing (375px, 390px, 428px)
- [ ] Shareable URLs with results params
- [ ] Dynamic Open Graph image generation
- [ ] Share button (Web Share API + clipboard fallback)
- [ ] Matrix rain performance on mobile
- [ ] Vercel deployment config
- [ ] README.md

## Review
_To be filled after each phase completion._
