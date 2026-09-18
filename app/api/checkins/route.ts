import { env } from "cloudflare:workers";

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
  const body = await request.json().catch(() => null) as { name?: unknown; chapter?: unknown; reflection?: unknown; mood?: unknown } | null;
  const name = typeof body?.name === "string" ? body.name.trim().replace(/\s+/g, " ") : "";
  const chapter = Number(body?.chapter);
  const reflectionSource = typeof body?.reflection === "string" ? body.reflection : typeof body?.mood === "string" ? body.mood : "";
  const reflection = reflectionSource.trim().replace(/\r\n/g, "\n") || null;

  if (!name || name.length > 40 || !Number.isInteger(chapter) || chapter < 1 || chapter > 10 || (reflection?.length ?? 0) > 300) {
    return Response.json({ error: "請輸入姓名並選擇正確章節。" }, { status: 400 });
  }

  const rosterMember = await env.DB.prepare(`
    SELECT participant_name FROM roster_members WHERE participant_key = ? LIMIT 1
  `).bind(name.toLocaleLowerCase("zh-TW")).first<{ participant_name: string }>();
  if (!rosterMember) {
    return Response.json({ error: "找不到這位團員，請重新選擇區團、教會／聲部與姓名。" }, { status: 400 });
  }

  await env.DB.prepare(`
    INSERT INTO reading_checkins (participant_name, participant_key, chapter, mood, created_at)
    VALUES (?, ?, ?, ?, ?)
  `).bind(rosterMember.participant_name, name.toLocaleLowerCase("zh-TW"), chapter, reflection, Date.now()).run();

  return Response.json({ ok: true });
}
