import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { normalizeLinkedInUrl, slugToName } from "@/lib/normalize-url";
import { validateFullPayload, coercePayload } from "@/lib/validate";
import { buildSystemPrompt, buildUserPrompt } from "@/lib/prompt";
import { getCached, saveCache, ensureTable } from "@/lib/db";
import type { ExtractedProfile } from "@/lib/types";

// Lazily constructed so the missing-key error only fires on actual requests
function getAnthropic() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}


// Verbose logger — always on in dev, silent in prod unless VERBOSE_ROAST=1
const VERBOSE = process.env.NODE_ENV === "development" || process.env.VERBOSE_ROAST === "1";
function log(...args: unknown[]) {
  if (VERBOSE) console.log("[roast]", ...args);
}

// ── Profile extractor (optional) ────────────────────────────────────────────

async function fetchExtractedProfile(
  linkedinUrl: string,
): Promise<ExtractedProfile | null> {
  const extractorUrl = process.env.PROFILE_EXTRACTOR_URL;
  if (!extractorUrl) return null;

  try {
    const res = await fetch(extractorUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.PROFILE_EXTRACTOR_API_KEY
          ? { Authorization: `Bearer ${process.env.PROFILE_EXTRACTOR_API_KEY}` }
          : {}),
      },
      body: JSON.stringify({ linkedin_url: linkedinUrl }),
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) return null;
    return (await res.json()) as ExtractedProfile;
  } catch {
    return null;
  }
}

// ── Stage 1: Sonnet + web search → profile summary ──────────────────────────

async function gatherWebProfile(linkedinUrl: string): Promise<string | null> {
  const anthropic = getAnthropic();
  const model = process.env.CLAUDE_MODEL_DEEP ?? "claude-sonnet-4-6";

  log(`[gather] model=${model} searching for ${linkedinUrl}`);

  const messages: Anthropic.Messages.MessageParam[] = [{
    role: "user",
    content: `Search for public information about this LinkedIn profile: ${linkedinUrl}

Find their name, current role, company, career history, skills, notable achievements, writing style from public posts, and any other public signals. Return a concise factual summary of everything you found.`,
  }];

  const tools = [{ type: "web_search_20250305", name: "web_search" }] as unknown as Anthropic.Messages.Tool[];

  let response = await anthropic.messages.create({
    model,
    max_tokens: 1000,
    tools,
    messages,
  });

  // Handle one tool_use round
  if (response.stop_reason === "tool_use") {
    const toolUseBlocks = response.content.filter(
      (b): b is Anthropic.Messages.ToolUseBlock => b.type === "tool_use",
    );
    messages.push({ role: "assistant", content: response.content });
    messages.push({
      role: "user",
      content: toolUseBlocks.map((b) => ({
        type: "tool_result" as const,
        tool_use_id: b.id,
        content: "",
      })),
    });
    response = await anthropic.messages.create({ model, max_tokens: 1000, tools, messages });
  }

  const summary = response.content
    .filter((b): b is Anthropic.Messages.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");

  log(`[gather] summary length=${summary.length}`);
  return summary || null;
}

// ── Stage 2: Haiku + context → roast JSON ───────────────────────────────────

async function callClaude(
  linkedinUrl: string,
  profile: ExtractedProfile | null,
  webContext: string | null,
): Promise<string> {
  const anthropic = getAnthropic();
  const model = process.env.CLAUDE_MODEL ?? "claude-haiku-4-5-20251001";
  const systemPrompt = buildSystemPrompt();
  const userPrompt = buildUserPrompt(linkedinUrl, profile ?? undefined, webContext ?? undefined);

  log("━━━ SYSTEM PROMPT ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  log(systemPrompt);
  log("━━━ USER PROMPT ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  log(userPrompt);
  log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  log(`[claude] model=${model} max_tokens=900`);

  const response = await anthropic.messages.create({
    model,
    max_tokens: 900,
    system: [{ type: "text", text: systemPrompt, cache_control: { type: "ephemeral" } }],
    messages: [
      { role: "user", content: userPrompt },
      { role: "assistant", content: "{" }, // force JSON start
    ],
  });

  const rawText = response.content
    .filter((b): b is Anthropic.Messages.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");

  const text = "{" + rawText;

  log("━━━ RAW CLAUDE OUTPUT ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  log(text);
  log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  return text;
}

// ── POST /api/roast ──────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // Parse body
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { linkedinUrl } = body as { linkedinUrl?: string };

  // Validate & normalise URL
  const normalized = normalizeLinkedInUrl(linkedinUrl ?? "");
  if (!normalized.ok) {
    return NextResponse.json({ error: normalized.error }, { status: 400 });
  }

  const fallbackName = slugToName(normalized.slug);
  const isDev = process.env.NODE_ENV === "development";

  log(`━━━ NEW REQUEST ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  const isDeep = process.env.ROAST_MODE === "deep";
  log(`url=${normalized.url} mode=${process.env.ROAST_MODE ?? "fast"} deep=${isDeep}`);

  // ── Cache check ────────────────────────────────────────────────────────────
  await ensureTable();
  const cached = await getCached(normalized.slug);
  if (cached) {
    log(`cache hit for slug=${normalized.slug} — skipping Claude`);
    return NextResponse.json(cached);
  }
  log(`cache miss for slug=${normalized.slug} — calling Claude`);

  try {
    // Optional: fetch pre-extracted profile
    const profile = await fetchExtractedProfile(normalized.url);

    // Stage 1 (deep mode): Sonnet + web search → profile summary
    let webContext: string | null = null;
    if (isDeep && !profile) {
      try {
        webContext = await gatherWebProfile(normalized.url);
      } catch (err) {
        log("web profile gather failed, continuing without it:", String(err));
      }
    }

    // Stage 2: Haiku → roast JSON
    let rawText: string;
    try {
      rawText = await callClaude(normalized.url, profile, webContext);
    } catch (apiErr) {
      console.error("[roast] Claude API error:", apiErr);
      if (isDev) {
        return NextResponse.json(
          { error: "Claude API failed", detail: String(apiErr) },
          { status: 502 },
        );
      }
      throw apiErr;
    }

    log(`raw response: ${rawText.length} chars`);

    // Strip markdown fences, then extract the JSON object — handles prose preamble/postamble
    const stripped = rawText.replace(/```json|```/g, "");
    const jsonMatch = stripped.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      log("no JSON object found in response. First 500 chars:", stripped.slice(0, 500));
      if (isDev) {
        return NextResponse.json(
          { error: "No JSON in response", raw: stripped.slice(0, 500) },
          { status: 502 },
        );
      }
      throw new Error("No JSON object found in Claude response");
    }

    // Parse JSON
    let raw: Record<string, unknown>;
    try {
      raw = JSON.parse(jsonMatch[0]) as Record<string, unknown>;
    } catch (parseErr) {
      log("JSON parse error:", parseErr);
      log("matched text:", jsonMatch[0].slice(0, 500));
      if (isDev) {
        return NextResponse.json(
          { error: "JSON parse failed", detail: String(parseErr), raw: jsonMatch[0].slice(0, 500) },
          { status: 502 },
        );
      }
      throw parseErr;
    }

    // Ensure linkedinUrl is always set
    raw.linkedinUrl = normalized.url;

    log("parsed JSON top-level keys:", Object.keys(raw));
    log("name:", raw.name, "| death_score:", raw.death_score, "| title:", raw.title);

    // Validate — use strict path if possible, coerce otherwise
    const validation = validateFullPayload(raw);
    if (validation.valid) {
      log("validation passed ✓ — returning clean payload");
      log("returning name:", validation.payload.name, "score:", validation.payload.death_score);
      void saveCache(normalized.slug, normalized.url, validation.payload);
      return NextResponse.json(validation.payload);
    }

    log("validation failed — missing fields:", validation.errors);
    log("raw metrics:", raw.metrics);
    log("raw whatLeaked:", JSON.stringify(raw.whatLeaked)?.slice(0, 200));
    log("coercing with available data...");
    const coerced = coercePayload(raw, normalized.url, fallbackName);
    void saveCache(normalized.slug, normalized.url, coerced);
    return NextResponse.json(coerced);
  } catch (err) {
    log("unhandled error — returning fallback:", err);
    const fallback = coercePayload({}, normalized.url, fallbackName);
    return NextResponse.json(fallback);
  }
}

// ── GET /api/roast (docs) ────────────────────────────────────────────────────

export async function GET() {
  return NextResponse.json({
    description: "POST /api/roast — generate an AI replacement report for a LinkedIn profile.",
    request: {
      method: "POST",
      contentType: "application/json",
      body: { linkedinUrl: "https://www.linkedin.com/in/your-profile/" },
    },
    response: {
      name: "string",
      title: "string",
      company: "string",
      linkedinUrl: "string",
      death_score: "number (0–100)",
      cause_of_death: "string",
      eulogy: "string",
      metrics: {
        alreadyABot: "number",
        vibeMoat: "number",
        publicFootprint: "number",
        jobIsJustText: "number",
        billingAudacity: "number",
      },
      personality_profile: {
        traits: "string[]",
        writing_style: "string",
        notable_patterns: "string[]",
      },
      replacement_skill: {
        name: "string (kebab-case)",
        description: "string",
        capabilities: "string[]",
      },
      stock: {
        ticker: "string",
        crash_percentage: "string",
        headline: "string",
      },
      whatLeaked: { prose: "string", coreTruths: "string[]" },
      retirement: { pension: "string", farewell: "string" },
      identity: { creature: "string", vibe: "string", emoji: "string", aliases: "string" },
      soul: { whoYouAre: "string", coreTruths: "string[]" },
    },
  });
}
