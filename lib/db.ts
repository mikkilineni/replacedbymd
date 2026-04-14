import { neon } from "@neondatabase/serverless";
import type { FullRoastPayload } from "./types";

function getSql() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set");
  return neon(process.env.DATABASE_URL);
}

export async function ensureTable(): Promise<void> {
  const sql = getSql();
  await sql`
    CREATE TABLE IF NOT EXISTS roast_cache (
      id           BIGSERIAL PRIMARY KEY,
      slug         TEXT NOT NULL,
      linkedin_url TEXT NOT NULL,
      payload      JSONB NOT NULL,
      created_at   TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS roast_cache_slug_idx ON roast_cache (slug, created_at DESC)
  `;
}

export async function getCached(slug: string): Promise<FullRoastPayload | null> {
  try {
    const sql = getSql();
    const rows = await sql`
      SELECT payload FROM roast_cache
      WHERE slug = ${slug}
        AND created_at > NOW() - INTERVAL '1 day'
      ORDER BY created_at DESC
      LIMIT 1
    `;
    if (rows.length === 0) return null;
    return rows[0].payload as FullRoastPayload;
  } catch {
    return null;
  }
}

export async function saveCache(slug: string, linkedinUrl: string, payload: FullRoastPayload): Promise<void> {
  try {
    const sql = getSql();
    await sql`
      INSERT INTO roast_cache (slug, linkedin_url, payload)
      VALUES (${slug}, ${linkedinUrl}, ${JSON.stringify(payload)})
    `;
  } catch (err) {
    console.error("[db] saveCache failed:", err);
  }
}
