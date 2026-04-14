import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { normalizeLinkedInUrl, slugToName } from "@/lib/normalize-url";
import { validateFullPayload, coercePayload } from "@/lib/validate";
import { buildSystemPrompt, buildUserPrompt } from "@/lib/prompt";
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

// ── LLM call ────────────────────────────────────────────────────────────────

async function callClaude(
  linkedinUrl: string,
  profile: ExtractedProfile | null,
  deep = false,
): Promise<string> {
  const anthropic = getAnthropic();
  const model = deep
    ? (process.env.CLAUDE_MODEL_DEEP ?? "claude-sonnet-4-6")
    : (process.env.CLAUDE_MODEL ?? "claude-haiku-4-5-20251001");

  const baseMessages: Anthropic.Messages.MessageParam[] = [
    { role: "user", content: buildUserPrompt(linkedinUrl, profile ?? undefined) },
  ];

  const systemPrompt = buildSystemPrompt();
  const userPrompt = buildUserPrompt(linkedinUrl, profile ?? undefined);

  log("━━━ SYSTEM PROMPT ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  log(systemPrompt);
  log("━━━ USER PROMPT ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  log(userPrompt);
  log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  const runWithTools = async (useWebSearch: boolean): Promise<string> => {
    const tools = useWebSearch
      ? ([{ type: "web_search_20250305", name: "web_search" }] as unknown as Anthropic.Messages.Tool[])
      : [];

    log(`[claude] model=${model} web_search=${useWebSearch} max_tokens=8192`);

    // Prefill assistant turn with "{" when NOT using web_search — forces haiku to
    // start JSON immediately instead of writing prose preamble first.
    const messages: Anthropic.Messages.MessageParam[] = useWebSearch
      ? [...baseMessages]
      : [...baseMessages, { role: "assistant", content: "{" }];

    const createParams: Anthropic.Messages.MessageCreateParamsNonStreaming = {
      model,
      max_tokens: 900,
      system: [{ type: "text", text: systemPrompt, cache_control: { type: "ephemeral" } }],
      messages,
      ...(tools.length > 0 ? { tools } : {}),
    };

    let response = await anthropic.messages.create(createParams);
    log(`[claude] stop_reason=${response.stop_reason} content_blocks=${response.content.length}`);

    // Handle tool_use rounds
    let rounds = 0;
    const turnMessages = createParams.messages as Anthropic.Messages.MessageParam[];

    while (response.stop_reason === "tool_use" && rounds < 1) {
      rounds++;
      const toolUseBlocks = response.content.filter(
        (b): b is Anthropic.Messages.ToolUseBlock => b.type === "tool_use",
      );
      log(`[claude] tool_use round ${rounds} — tools: ${toolUseBlocks.map(b => b.name).join(", ")}`);
      turnMessages.push({ role: "assistant", content: response.content });
      turnMessages.push({
        role: "user",
        content: toolUseBlocks.map((b) => ({
          type: "tool_result" as const,
          tool_use_id: b.id,
          content: "",
        })),
      });
      response = await anthropic.messages.create({ ...createParams, messages: turnMessages });
      log(`[claude] round ${rounds} response: stop_reason=${response.stop_reason} blocks=${response.content.length}`);
    }

    const rawText = response.content
      .filter((b): b is Anthropic.Messages.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("");

    // Re-attach the prefilled "{" since the model continues from after it
    const text = useWebSearch ? rawText : "{" + rawText;

    log("━━━ RAW CLAUDE OUTPUT ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    log(text);
    log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    return text;
  };

  // Only use web_search in deep mode — haiku doesn't support it and wastes a round-trip
  const supportsWebSearch = deep;

  if (!profile && supportsWebSearch) {
    try {
      return await runWithTools(true);
    } catch (err) {
      log("web_search failed, retrying without it:", String(err));
    }
  }

  return runWithTools(false);
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

  try {
    // Optional: fetch pre-extracted profile
    const profile = await fetchExtractedProfile(normalized.url);

    // Call Claude
    let rawText: string;
    try {
      rawText = await callClaude(normalized.url, profile, isDeep);
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

      return NextResponse.json(validation.payload);
    }

    log("validation failed — missing fields:", validation.errors);
    log("raw metrics:", raw.metrics);
    log("raw whatLeaked:", JSON.stringify(raw.whatLeaked)?.slice(0, 200));
    log("coercing with available data...");
    const coerced = coercePayload(raw, normalized.url, fallbackName);
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
