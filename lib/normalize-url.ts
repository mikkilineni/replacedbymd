/**
 * Normalizes and validates LinkedIn profile URLs.
 *
 * Accepts:
 *   https://www.linkedin.com/in/username/
 *   linkedin.com/in/username
 *   /in/username
 */

const LINKEDIN_PATTERN = /^(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([\w%-]+)\/?(?:\?.*)?$/i;

export type NormalizeResult =
  | { ok: true; url: string; slug: string }
  | { ok: false; error: string };

export function normalizeLinkedInUrl(raw: string): NormalizeResult {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { ok: false, error: "Please paste a LinkedIn URL." };
  }

  const match = trimmed.match(LINKEDIN_PATTERN);
  if (!match) {
    return {
      ok: false,
      error: "That doesn't look like a LinkedIn profile URL. Try: https://linkedin.com/in/yourname",
    };
  }

  const slug = match[1].toLowerCase();
  const url = `https://www.linkedin.com/in/${slug}/`;
  return { ok: true, url, slug };
}

/** Derives a display name from a LinkedIn slug as a best-effort fallback. */
export function slugToName(slug: string): string {
  return slug
    .split(/[-_]/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
