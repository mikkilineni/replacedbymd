import type { FullRoastPayload, RoastPayload, FrontendData } from "./types";

// ── Field-level helpers ────────────────────────────────────────────────────

function isString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

function isNumber(v: unknown, min = 0, max = 100): v is number {
  return typeof v === "number" && !isNaN(v) && v >= min && v <= max;
}

function isStringArray(v: unknown, minLen = 1): v is string[] {
  return Array.isArray(v) && v.length >= minLen && v.every((s) => typeof s === "string");
}

// ── Partial validators ────────────────────────────────────────────────────

function validateRoastPayload(d: Record<string, unknown>): string[] {
  const errors: string[] = [];

  if (!isString(d.name)) errors.push("name");
  if (!isString(d.title)) errors.push("title");
  if (!isString(d.company)) errors.push("company");
  if (!isNumber(d.death_score)) errors.push("death_score");
  if (!isString(d.cause_of_death)) errors.push("cause_of_death");
  if (!isString(d.eulogy)) errors.push("eulogy");

  const pp = d.personality_profile as Record<string, unknown> | undefined;
  if (!pp || typeof pp !== "object") {
    errors.push("personality_profile");
  } else {
    if (!isStringArray(pp.traits)) errors.push("personality_profile.traits");
    if (!isString(pp.writing_style)) errors.push("personality_profile.writing_style");
    if (!isStringArray(pp.notable_patterns)) errors.push("personality_profile.notable_patterns");
  }

  const rs = d.replacement_skill as Record<string, unknown> | undefined;
  if (!rs || typeof rs !== "object") {
    errors.push("replacement_skill");
  } else {
    if (!isString(rs.name)) errors.push("replacement_skill.name");
    if (!isString(rs.description)) errors.push("replacement_skill.description");
    if (!isStringArray(rs.capabilities)) errors.push("replacement_skill.capabilities");
  }

  const st = d.stock as Record<string, unknown> | undefined;
  if (!st || typeof st !== "object") {
    errors.push("stock");
  } else {
    if (!isString(st.ticker)) errors.push("stock.ticker");
    if (!isString(st.crash_percentage)) errors.push("stock.crash_percentage");
    if (!isString(st.headline)) errors.push("stock.headline");
  }

  return errors;
}

function validateFrontendData(d: Record<string, unknown>): string[] {
  const errors: string[] = [];

  const m = d.metrics as Record<string, unknown> | undefined;
  if (!m || typeof m !== "object") {
    errors.push("metrics");
  } else {
    for (const key of ["alreadyABot", "vibeMoat", "publicFootprint", "jobIsJustText", "billingAudacity"]) {
      if (!isNumber(m[key])) errors.push(`metrics.${key}`);
    }
  }

  const wl = d.whatLeaked as Record<string, unknown> | undefined;
  if (!wl || typeof wl !== "object") {
    errors.push("whatLeaked");
  } else {
    if (!isString(wl.prose)) errors.push("whatLeaked.prose");
    if (!isStringArray(wl.coreTruths)) errors.push("whatLeaked.coreTruths");
  }

  const ret = d.retirement as Record<string, unknown> | undefined;
  if (!ret || typeof ret !== "object") {
    errors.push("retirement");
  } else {
    if (!isString(ret.pension)) errors.push("retirement.pension");
    if (!isString(ret.farewell)) errors.push("retirement.farewell");
  }

  const id = d.identity as Record<string, unknown> | undefined;
  if (!id || typeof id !== "object") {
    errors.push("identity");
  } else {
    for (const key of ["creature", "vibe", "emoji", "aliases"]) {
      if (!isString(id[key])) errors.push(`identity.${key}`);
    }
  }

  const soul = d.soul as Record<string, unknown> | undefined;
  if (!soul || typeof soul !== "object") {
    errors.push("soul");
  } else {
    if (!isString(soul.whoYouAre)) errors.push("soul.whoYouAre");
    if (!isStringArray(soul.coreTruths)) errors.push("soul.coreTruths");
  }

  return errors;
}

// ── Public API ────────────────────────────────────────────────────────────

export type ValidationResult =
  | { valid: true; payload: FullRoastPayload }
  | { valid: false; errors: string[] };

/**
 * Validates the raw JSON object returned by the LLM.
 * Returns either a typed FullRoastPayload or a list of failing field paths.
 */
export function validateFullPayload(raw: unknown): ValidationResult {
  if (!raw || typeof raw !== "object") {
    return { valid: false, errors: ["root: not an object"] };
  }

  const d = raw as Record<string, unknown>;
  const errors = [
    ...validateRoastPayload(d),
    ...validateFrontendData(d),
  ];

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return { valid: true, payload: d as unknown as FullRoastPayload };
}

/**
 * Coerces a partially-valid payload into a FullRoastPayload by filling
 * missing/invalid fields with safe defaults derived from known data.
 * Use when the LLM response is mostly valid but a few fields are missing.
 */
export function coercePayload(
  raw: Record<string, unknown>,
  linkedinUrl: string,
  fallbackName: string,
): FullRoastPayload {
  const score = isNumber(raw.death_score) ? (raw.death_score as number) : 62;

  return {
    name: isString(raw.name) ? raw.name : fallbackName,
    title: isString(raw.title) ? raw.title : "Professional Human",
    company: isString(raw.company) ? raw.company : "The Industry",
    linkedinUrl,
    death_score: score,
    cause_of_death: isString(raw.cause_of_death)
      ? raw.cause_of_death
      : "Too much of your job collapses into pattern recognition and sternly worded operational advice.",
    eulogy: isString(raw.eulogy)
      ? raw.eulogy
      : "Your job could be a well-crafted system prompt — but the part where you sense the meeting is about something else still requires a soul.",
    personality_profile: {
      traits: isStringArray((raw.personality_profile as Record<string, unknown>)?.traits)
        ? ((raw.personality_profile as Record<string, unknown>).traits as string[])
        : ["operationally skeptical", "systems-minded"],
      writing_style: isString((raw.personality_profile as Record<string, unknown>)?.writing_style)
        ? ((raw.personality_profile as Record<string, unknown>).writing_style as string)
        : "direct, technical, dryly unimpressed",
      notable_patterns: isStringArray((raw.personality_profile as Record<string, unknown>)?.notable_patterns)
        ? ((raw.personality_profile as Record<string, unknown>).notable_patterns as string[])
        : ["asks who owns production risk"],
    },
    replacement_skill: {
      name: isString((raw.replacement_skill as Record<string, unknown>)?.name)
        ? ((raw.replacement_skill as Record<string, unknown>).name as string)
        : "professional-replacement-scanner",
      description: isString((raw.replacement_skill as Record<string, unknown>)?.description)
        ? ((raw.replacement_skill as Record<string, unknown>).description as string)
        : "Simulates the public-facing judgment layer of a senior professional.",
      capabilities: isStringArray((raw.replacement_skill as Record<string, unknown>)?.capabilities)
        ? ((raw.replacement_skill as Record<string, unknown>).capabilities as string[])
        : ["Summarize career arcs into satirical prose"],
    },
    stock: {
      ticker: isString((raw.stock as Record<string, unknown>)?.ticker)
        ? ((raw.stock as Record<string, unknown>).ticker as string)
        : fallbackName.slice(0, 4).toUpperCase(),
      crash_percentage: isString((raw.stock as Record<string, unknown>)?.crash_percentage)
        ? ((raw.stock as Record<string, unknown>).crash_percentage as string)
        : `-${score}%`,
      headline: isString((raw.stock as Record<string, unknown>)?.headline)
        ? ((raw.stock as Record<string, unknown>).headline as string)
        : "Legacy operational wisdom downgraded after autocomplete learns the same warnings.",
    },
    metrics: {
      alreadyABot: isNumber((raw.metrics as Record<string, unknown>)?.alreadyABot) ? ((raw.metrics as Record<string, unknown>).alreadyABot as number) : 58,
      vibeMoat: isNumber((raw.metrics as Record<string, unknown>)?.vibeMoat) ? ((raw.metrics as Record<string, unknown>).vibeMoat as number) : 46,
      publicFootprint: isNumber((raw.metrics as Record<string, unknown>)?.publicFootprint) ? ((raw.metrics as Record<string, unknown>).publicFootprint as number) : 33,
      jobIsJustText: isNumber((raw.metrics as Record<string, unknown>)?.jobIsJustText) ? ((raw.metrics as Record<string, unknown>).jobIsJustText as number) : 74,
      billingAudacity: isNumber((raw.metrics as Record<string, unknown>)?.billingAudacity) ? ((raw.metrics as Record<string, unknown>).billingAudacity as number) : 55,
    },
    whatLeaked: {
      prose: isString((raw.whatLeaked as Record<string, unknown>)?.prose)
        ? ((raw.whatLeaked as Record<string, unknown>).prose as string)
        : "I work in technology, which is a polite way of saying I translate between people who build things and people who pay for things.",
      coreTruths: isStringArray((raw.whatLeaked as Record<string, unknown>)?.coreTruths)
        ? ((raw.whatLeaked as Record<string, unknown>).coreTruths as string[])
        : ["I have probably rewritten the same advice at three different companies."],
    },
    retirement: {
      pension: isString((raw.retirement as Record<string, unknown>)?.pension)
        ? ((raw.retirement as Record<string, unknown>).pension as string)
        : "You may collect your IDENTITY.md, SOUL.md, and the quiet satisfaction of being right about automation.",
      farewell: isString((raw.retirement as Record<string, unknown>)?.farewell)
        ? ((raw.retirement as Record<string, unknown>).farewell as string)
        : "Please hand in your laptop at the desk.",
    },
    identity: {
      creature: isString((raw.identity as Record<string, unknown>)?.creature)
        ? ((raw.identity as Record<string, unknown>).creature as string)
        : "enterprise technology creature in business casual",
      vibe: isString((raw.identity as Record<string, unknown>)?.vibe)
        ? ((raw.identity as Record<string, unknown>).vibe as string)
        : "Someone who can explain why your system is slow and why the migration plan is fantasy.",
      emoji: isString((raw.identity as Record<string, unknown>)?.emoji)
        ? ((raw.identity as Record<string, unknown>).emoji as string)
        : "🔧",
      aliases: isString((raw.identity as Record<string, unknown>)?.aliases)
        ? ((raw.identity as Record<string, unknown>).aliases as string)
        : fallbackName,
    },
    soul: {
      whoYouAre: isString((raw.soul as Record<string, unknown>)?.whoYouAre)
        ? ((raw.soul as Record<string, unknown>).whoYouAre as string)
        : "I work in technology, which is a polite way of saying I keep expensive systems from behaving like art projects.",
      coreTruths: isStringArray((raw.soul as Record<string, unknown>)?.coreTruths)
        ? ((raw.soul as Record<string, unknown>).coreTruths as string[])
        : ["I have been the person asking about backup restores during a migration celebration."],
    },
  };
}
