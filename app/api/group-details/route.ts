import { env } from "cloudflare:workers";

const validTypes = new Set(["weekly", "footprints", "completed", "rounds"]);

export async function GET(request: Request) {
  const type = new URL(request.url).searchParams.get("type") ?? "";
  if (!validTypes.has(type)) return Response.json({ error: "項目錯誤。" }, { status: 400 });

  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const queries: Record<string, { sql: string; bind?: number }> = {
    weekly: { sql: `SELECT c.participant_name, COALESCE(r.region,'') region, COALESCE(r.voice,'') voice, COUNT(*) count FROM reading_checkins c LEFT JOIN roster_members r ON r.participant_key=c.participant_key WHERE c.created_at >= ? GROUP BY c.participant_key, c.participant_name, r.region, r.voice ORDER BY r.region, r.voice, c.participant_name`, bind: weekAgo },
    footprints: { sql: `SELECT c.participant_name, COALESCE(r.region,'') region, COALESCE(r.voice,'') voice, COUNT(*) count FROM reading_checkins c LEFT JOIN roster_members r ON r.participant_key=c.participant_key GROUP BY c.participant_key, c.participant_name, r.region, r.voice ORDER BY count DESC, c.participant_name` },
    completed: { sql: `SELECT c.participant_name, COALESCE(r.region,'') region, COALESCE(r.voice,'') voice, COUNT(*) count FROM reading_completions c LEFT JOIN roster_members r ON r.participant_key=c.participant_key GROUP BY c.participant_key, c.participant_name, r.region, r.voice ORDER BY c.participant_name` },
    rounds: { sql: `SELECT c.participant_name, COALESCE(r.region,'') region, COALESCE(r.voice,'') voice, COUNT(*) count FROM reading_completions c LEFT JOIN roster_members r ON r.participant_key=c.participant_key GROUP BY c.participant_key, c.participant_name, r.region, r.voice ORDER BY count DESC, c.participant_name` },
  };
  const query = queries[type];
  const statement = query.bind ? env.DB.prepare(query.sql).bind(query.bind) : env.DB.prepare(query.sql);
  const result = await statement.all<{ participant_name: string; region: string; voice: string; count: number }>();
  return Response.json({ people: result.results ?? [] });
}
