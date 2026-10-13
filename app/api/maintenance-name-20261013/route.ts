import { env } from "cloudflare:workers";

export async function POST(request: Request) {
  const token = request.headers.get("authorization") ?? "";
  const hash = Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token)))).map(b => b.toString(16).padStart(2, "0")).join("");
  if (hash !== "2dc55902adbc81067a6b53dfd71792a41190a12180ad0042d2c0944630c013b7") return Response.json({ error: "Not found" }, { status: 404 });
  const oldName = "陳琳琍", newName = "陳琳俐";
  const member = await env.DB.prepare("SELECT * FROM roster_members WHERE participant_key = ?").bind(oldName).first();
  const target = await env.DB.prepare("SELECT * FROM roster_members WHERE participant_key = ?").bind(newName).first();
  if (!member || target) return Response.json({ error: "Unexpected roster state" }, { status: 409 });
  const before = await env.DB.batch([
    env.DB.prepare("SELECT id, chapter, mood, created_at FROM reading_checkins WHERE participant_key = ? ORDER BY id").bind(oldName),
    env.DB.prepare("SELECT id, round_number, completion_day, completed_at FROM reading_completions WHERE participant_key = ? ORDER BY id").bind(oldName),
  ]);
  await env.DB.batch([
    env.DB.prepare("UPDATE roster_members SET participant_name = ?, participant_key = ? WHERE participant_key = ?").bind(newName, newName, oldName),
    env.DB.prepare("UPDATE reading_checkins SET participant_name = ?, participant_key = ? WHERE participant_key = ?").bind(newName, newName, oldName),
    env.DB.prepare("UPDATE reading_completions SET participant_name = ?, participant_key = ? WHERE participant_key = ?").bind(newName, newName, oldName),
  ]);
  const after = await env.DB.batch([
    env.DB.prepare("SELECT id, chapter, mood, created_at FROM reading_checkins WHERE participant_key = ? ORDER BY id").bind(newName),
    env.DB.prepare("SELECT id, round_number, completion_day, completed_at FROM reading_completions WHERE participant_key = ? ORDER BY id").bind(newName),
  ]);
  const preserved = before.every((r, i) => JSON.stringify(r.results) === JSON.stringify(after[i].results));
  return Response.json({ ok: preserved, checkins: after[0].results.length, reflections: after[0].results.filter((r: any) => r.mood?.trim()).length, completions: after[1].results.length });
}
