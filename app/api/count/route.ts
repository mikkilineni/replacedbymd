import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export const revalidate = 60; // cache for 60s

export async function GET() {
  try {
    if (!process.env.DATABASE_URL) throw new Error("no db");
    const sql = neon(process.env.DATABASE_URL);
    const rows = await sql`SELECT COUNT(*)::int AS total FROM roast_cache`;
    return NextResponse.json({ count: rows[0].total ?? 0 });
  } catch {
    return NextResponse.json({ count: 0 });
  }
}
