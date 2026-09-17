import { env } from "cloudflare:workers";

function taipeiDay(timestamp: number) {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Taipei", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date(timestamp));
  const value = (type: string) => parts.find(part => part.type === type)?.value ?? "";
  return `${value("year")}-${value("month")}-${value("day")}`;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { name?: unknown } | null;
  const name = typeof body?.name === "string" ? body.name.trim().replace(/\s+/g, " ") : "";
  if (!name || name.length > 40) return Response.json({ error: "請先輸入姓名。" }, { status: 400 });

  const key = name.toLocaleLowerCase("zh-TW");
  const eligibility = await env.DB.prepare(`
    SELECT
      (SELECT MAX(created_at) FROM reading_checkins WHERE participant_key = ? AND chapter = 10) AS latest_chapter_ten,
      (SELECT MAX(completed_at) FROM reading_completions WHERE participant_key = ?) AS latest_completion
  `).bind(key, key).first<{ latest_chapter_ten: number | null; latest_completion: number | null }>();

  if (!eligibility?.latest_chapter_ten || eligibility.latest_chapter_ten <= (eligibility.latest_completion ?? 0)) {
    return Response.json({ error: "請先登錄第 10 章，再完成本輪閱讀。" }, { status: 400 });
  }

  const now = Date.now();
  try {
    await env.DB.prepare(`
      INSERT INTO reading_completions (participant_name, participant_key, round_number, completion_day, completed_at)
      SELECT ?, ?, COALESCE(MAX(round_number), 0) + 1, ?, ?
      FROM reading_completions WHERE participant_key = ?
    `).bind(name, key, taipeiDay(now), now, key).run();
  } catch {
    return Response.json({ error: "今天已經記錄過完讀，請勿重複登錄。" }, { status: 409 });
  }

  const result = await env.DB.prepare("SELECT COUNT(*) AS rounds FROM reading_completions WHERE participant_key = ?").bind(key).first<{ rounds: number }>();
  return Response.json({ ok: true, rounds: Number(result?.rounds ?? 1) });
}
