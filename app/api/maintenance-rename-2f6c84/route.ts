import { env } from "cloudflare:workers";

const UPDATE_TOKEN = "n8Q-v3L-k7T-p4M-x9R-c2H-w6F";
const OLD_NAME = "卓倚凡";
const NEW_NAME = "卓倚帆";

export async function POST(request: Request) {
  if (request.headers.get("x-update-token") !== UPDATE_TOKEN) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const target = await env.DB.prepare(`
    SELECT id, participant_name, participant_key, region
    FROM roster_members
    WHERE id = ? AND participant_name = ? AND participant_key = ? AND region = ?
  `).bind(76, OLD_NAME, OLD_NAME, "中").first();
  if (!target) return Response.json({ error: "Target did not match exactly." }, { status: 409 });

  const conflict = await env.DB.prepare(`
    SELECT id FROM roster_members WHERE participant_key = ? LIMIT 1
  `).bind(NEW_NAME).first();
  if (conflict) return Response.json({ error: "The new name already exists." }, { status: 409 });

  const results = await env.DB.batch([
    env.DB.prepare("UPDATE reading_checkins SET participant_name = ?, participant_key = ? WHERE participant_key = ?").bind(NEW_NAME, NEW_NAME, OLD_NAME),
    env.DB.prepare("UPDATE reading_completions SET participant_name = ?, participant_key = ? WHERE participant_key = ?").bind(NEW_NAME, NEW_NAME, OLD_NAME),
    env.DB.prepare("UPDATE roster_members SET participant_name = ?, participant_key = ? WHERE id = ? AND participant_name = ? AND participant_key = ? AND region = ?").bind(NEW_NAME, NEW_NAME, 76, OLD_NAME, OLD_NAME, "中"),
  ]);

  if (Number(results[2].meta.changes ?? 0) !== 1) {
    return Response.json({ error: "Roster update failed." }, { status: 409 });
  }

  return Response.json({
    ok: true,
    oldName: OLD_NAME,
    newName: NEW_NAME,
    region: "中",
    updatedCheckins: Number(results[0].meta.changes ?? 0),
    updatedCompletions: Number(results[1].meta.changes ?? 0),
  });
}
