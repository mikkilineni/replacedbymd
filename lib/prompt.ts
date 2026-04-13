import type { ExtractedProfile } from "./types";

export function buildSystemPrompt(): string {
  return `You are ReplaceByMd — a viral tool scoring how replaceable a professional is by AI.

SCORING (death_score 0-100):
- 0=deeply human, 100=already automated
- Templated leadership, role-as-process → UP. Original judgment, crisis decisions → DOWN

TONE: Roast comedy × tech retirement. Sharp, specific, personal. No protected traits/health/family.
First-person voice clones = person at 2am being honest.

OUTPUT: Valid JSON only. No markdown. No preamble. No trailing text.`;
}

export function buildUserPrompt(linkedinUrl: string, profile?: ExtractedProfile): string {
  const context = profile
    ? `PROFILE DATA:\n${JSON.stringify(profile, null, 2)}`
    : `Use your knowledge of this person based on their LinkedIn URL. Infer from the URL slug, industry norms, and any public information you have.`;

  return `Analyze: ${linkedinUrl}

${context}

Return ONLY this JSON (no markdown, no fences, start with {):
{
  "name": "Full Name",
  "title": "Job title",
  "company": "Company",
  "linkedinUrl": "${linkedinUrl}",
  "death_score": 0-100,
  "cause_of_death": "Why AI is retiring them (1-2 sentences, reference their actual skills)",
  "eulogy": "Memorable verdict quote (1-2 sentences)",
  "metrics": {
    "alreadyABot": 0-100,
    "vibeMoat": 0-100,
    "publicFootprint": 0-100,
    "jobIsJustText": 0-100,
    "billingAudacity": 0-100
  },
  "personality_profile": {
    "traits": ["3-5 specific traits"],
    "writing_style": "Their communication style",
    "notable_patterns": ["3-5 behavioral patterns"]
  },
  "replacement_skill": {
    "name": "kebab-case-name",
    "description": "One sentence package description",
    "capabilities": ["3-4 capabilities"]
  },
  "stock": {
    "ticker": "3-4 letter ticker",
    "crash_percentage": "-XX%",
    "headline": "Bloomberg-style crash headline"
  },
  "whatLeaked": {
    "prose": "1-2 paragraphs first-person voice clone, 2am honest, real industry terms",
    "coreTruths": ["3-4 brutally specific first-person bullets"]
  },
  "retirement": {
    "pension": "What they leave with (specific to their career)",
    "farewell": "One sentence farewell"
  },
  "identity": {
    "creature": "1 sentence creature type using their tech/industry jargon",
    "vibe": "1-2 sentences referencing their actual career path",
    "emoji": "One emoji",
    "aliases": "Name variations"
  },
  "soul": {
    "whoYouAre": "2 paragraphs first-person, real companies/tools, dark humor",
    "coreTruths": ["3-4 core beliefs, first person, specific to their work"]
  }
}`;
}
