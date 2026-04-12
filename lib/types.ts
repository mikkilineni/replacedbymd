// ── API types ──────────────────────────────────────────────────────────────

export type RoastPayload = {
  name: string;
  title: string;
  company: string;
  death_score: number; // 0–100
  cause_of_death: string;
  eulogy: string;
  personality_profile: {
    traits: string[];
    writing_style: string;
    notable_patterns: string[];
  };
  replacement_skill: {
    name: string; // kebab-case
    description: string;
    capabilities: string[];
  };
  stock: {
    ticker: string;
    crash_percentage: string; // e.g. "-73%"
    headline: string;
  };
};

export type FrontendData = {
  linkedinUrl: string;
  metrics: {
    alreadyABot: number;
    vibeMoat: number;
    publicFootprint: number;
    jobIsJustText: number;
    billingAudacity: number;
  };
  whatLeaked: {
    prose: string;
    coreTruths: string[];
  };
  retirement: {
    pension: string;
    farewell: string;
  };
  identity: {
    creature: string;
    vibe: string;
    emoji: string;
    aliases: string;
  };
  soul: {
    whoYouAre: string;
    coreTruths: string[];
  };
};

/** Full payload returned by POST /api/roast */
export type FullRoastPayload = RoastPayload & FrontendData;

// ── Profile extraction types ───────────────────────────────────────────────

export type ExtractedProfile = {
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

// ── UI / display types ────────────────────────────────────────────────────

export type ScoreTier = {
  max: number;
  label: string;
  color: string;
};

export const SCORE_TIERS: ScoreTier[] = [
  { max: 25, label: "SAFE... FOR NOW", color: "#00ff41" },
  { max: 45, label: "ON NOTICE", color: "#66ff66" },
  { max: 60, label: "VERY CLOSE", color: "#ffaa00" },
  { max: 80, label: "ALMOST GONE", color: "#ff6600" },
  { max: 100, label: "ALREADY REPLACED", color: "#ff2222" },
];

export function getScoreTier(score: number): ScoreTier {
  return SCORE_TIERS.find((t) => score <= t.max) ?? SCORE_TIERS[SCORE_TIERS.length - 1];
}
