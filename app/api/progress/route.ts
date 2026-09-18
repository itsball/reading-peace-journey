import { env } from "cloudflare:workers";

export async function GET(request: Request) {
  const name = new URL(request.url).searchParams.get("name")?.trim().replace(/\s+/g, " ") ?? "";
  if (!name || name.length > 40) return Response.json({ error: "請選擇姓名。" }, { status: 400 });

  const participantKey = name.toLocaleLowerCase("zh-TW");
  const member = await env.DB.prepare(`SELECT 1 FROM roster_members WHERE participant_key = ? LIMIT 1`).bind(participantKey).first();
  if (!member) return Response.json({ error: "找不到這位團員。" }, { status: 404 });

  const chapterRows = await env.DB.prepare(`
    SELECT chapter, COUNT(*) AS checkins
    FROM reading_checkins
    WHERE participant_key = ?
    GROUP BY chapter
    ORDER BY chapter
  `).bind(participantKey).all<{ chapter: number; checkins: number }>();
  const completion = await env.DB.prepare(`
    SELECT COUNT(*) AS rounds FROM reading_completions WHERE participant_key = ?
  `).bind(participantKey).first<{ rounds: number }>();

  const readChapters = (chapterRows.results ?? []).map(row => Number(row.chapter)).filter(chapter => chapter >= 1 && chapter <= 10);
  const totalCheckins = (chapterRows.results ?? []).reduce((sum, row) => sum + Number(row.checkins), 0);
  return Response.json({
    progress: readChapters.length * 10,
    readChapters,
    totalCheckins,
    completionRounds: Number(completion?.rounds ?? 0),
  });
}
