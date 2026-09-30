import { env } from "cloudflare:workers";

const RESET_TOKEN = "r7K-9mP2-vQ4-xN8-bT6-cD3-yH5-wF1";

export async function POST(request: Request) {
  if (request.headers.get("x-reset-token") !== RESET_TOKEN) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const before = await env.DB.prepare(`
    SELECT
      (SELECT COUNT(*) FROM reading_checkins) AS checkins,
      (SELECT COUNT(*) FROM reading_completions) AS completions
  `).first<{ checkins: number; completions: number }>();

  await env.DB.batch([
    env.DB.prepare("DELETE FROM reading_completions"),
    env.DB.prepare("DELETE FROM reading_checkins"),
  ]);

  return Response.json({
    ok: true,
    deletedCheckins: Number(before?.checkins ?? 0),
    deletedCompletions: Number(before?.completions ?? 0),
  });
}
