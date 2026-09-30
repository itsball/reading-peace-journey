import { env } from "cloudflare:workers";

const UPDATE_TOKEN = "m4V-z8Q-p2L-x7N-c5R-w9K-t3H";

export async function POST(request: Request) {
  if (request.headers.get("x-update-token") !== UPDATE_TOKEN) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const result = await env.DB.prepare(`
    UPDATE roster_members
    SET voice = ?
    WHERE id = ? AND participant_name = ? AND participant_key = ? AND region = ?
  `).bind("B2", 89, "李定芳", "李定芳", "中").run();

  if (Number(result.meta.changes ?? 0) !== 1) {
    return Response.json({ error: "Target did not match exactly." }, { status: 409 });
  }

  return Response.json({ ok: true, participantName: "李定芳", region: "中", voice: "B2" });
}
