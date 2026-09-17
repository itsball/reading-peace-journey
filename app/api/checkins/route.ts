import { env } from "cloudflare:workers";

const allowedMoods = new Set(["平靜", "驚訝", "感動", "思考"]);

export async function GET() {
  const now = Date.now();
  const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
  const stats = await env.DB.prepare(`
    SELECT
      COUNT(*) AS total,
      COUNT(DISTINCT CASE WHEN created_at >= ? THEN participant_key END) AS weekly_partners,
      COALESCE(ROUND(AVG(chapter)), 0) AS group_chapter
    FROM reading_checkins
  `).bind(weekAgo).first<{ total: number; weekly_partners: number; group_chapter: number }>();
  const completions = await env.DB.prepare(`
    SELECT COUNT(*) AS total_rounds, COUNT(DISTINCT participant_key) AS completed_readers
    FROM reading_completions
  `).first<{ total_rounds: number; completed_readers: number }>();

  return Response.json({
    total: Number(stats?.total ?? 0),
    weeklyPartners: Number(stats?.weekly_partners ?? 0),
    groupChapter: Math.max(1, Math.min(10, Number(stats?.group_chapter ?? 1))),
    totalRounds: Number(completions?.total_rounds ?? 0),
    completedReaders: Number(completions?.completed_readers ?? 0),
  });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { name?: unknown; chapter?: unknown; mood?: unknown } | null;
  const name = typeof body?.name === "string" ? body.name.trim().replace(/\s+/g, " ") : "";
  const chapter = Number(body?.chapter);
  const mood = typeof body?.mood === "string" && allowedMoods.has(body.mood) ? body.mood : null;

  if (!name || name.length > 40 || !Number.isInteger(chapter) || chapter < 1 || chapter > 10) {
    return Response.json({ error: "請輸入姓名並選擇正確章節。" }, { status: 400 });
  }

  await env.DB.prepare(`
    INSERT INTO reading_checkins (participant_name, participant_key, chapter, mood, created_at)
    VALUES (?, ?, ?, ?, ?)
  `).bind(name, name.toLocaleLowerCase("zh-TW"), chapter, mood, Date.now()).run();

  return Response.json({ ok: true });
}
