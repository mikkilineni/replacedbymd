# ReplaceByMd — Lessons Learned

## Patterns & Rules

### Design
- NEVER use Inter, Roboto, Arial, or any sans-serif font. This project is 100% JetBrains Mono.
- ALL backgrounds are near-black (#0a0b0f), never white, never gray.
- Green (#00ff41) is the primary accent. Purple/violet does NOT exist in this project.
- Card borders are always `rgba(0, 255, 65, 0.15)`, never white or gray borders.
- CRT scanlines and matrix rain are required background elements on every page.

### API
- LinkedIn cannot be scraped directly. Always go through Proxycurl or web search fallback.
- LLM output MUST be validated against the schema before returning. Never trust raw JSON.
- Always strip markdown code fences from LLM output before JSON.parse().
- Client must have fallback data generation from URL slug — never show error states to users.

### Architecture
- The backend API route uses the `RoastPayload` type. The frontend extends it with metrics, whatLeaked, retirement, identity, soul.
- Score field is `death_score` (not `overallScore` or `score`).
- Verdict field is `eulogy` (not `verdict`).
- Stock crash is its own section, not part of metrics.

## Mistakes Log
_Add entries here when corrections are made._
