import { env } from "cloudflare:workers";

export async function GET(request: Request) {
  const chapter = Number(new URL(request.url).searchParams.get("chapter"));
  if (!Number.isInteger(chapter) || chapter < 1 || chapter > 10) return Response.json({ error: "章節錯誤。" }, { status: 400 });

  const result = await env.DB.prepare(`
    SELECT c.participant_name, COALESCE(r.region, '') AS region, COALESCE(r.voice, '') AS voice, COUNT(*) AS count
    FROM reading_checkins c
    LEFT JOIN roster_members r ON r.participant_key = c.participant_key
    WHERE c.chapter = ?
    GROUP BY c.participant_key, c.participant_name, r.region, r.voice
    ORDER BY r.region, r.voice, c.participant_name
  `).bind(chapter).all<{ participant_name: string; region: string; voice: string; count: number }>();

  return Response.json({ readers: result.results ?? [] });
}
