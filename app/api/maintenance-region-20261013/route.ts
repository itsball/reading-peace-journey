import { env } from "cloudflare:workers";

export async function POST(request: Request) {
  const token = request.headers.get("authorization") ?? "";
  const hash = Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token)))).map(b => b.toString(16).padStart(2, "0")).join("");
  if (hash !== "8ed2a138ca5a29b99252265cbce22f4517b5706ca78dfad1805158484d9749b3") return Response.json({ error: "Not found" }, { status: 404 });
  const member = await env.DB.prepare("SELECT * FROM roster_members WHERE participant_key = ?").bind("陳彥嘉").first();
  if (!member) return Response.json({ error: "Member not found" }, { status: 404 });
  await env.DB.prepare("UPDATE roster_members SET region = ? WHERE participant_key = ?").bind("北", "陳彥嘉").run();
  const after = await env.DB.prepare("SELECT * FROM roster_members WHERE participant_key = ?").bind("陳彥嘉").first();
  return Response.json({ ok: JSON.stringify({ ...member, region: "北" }) === JSON.stringify(after), oldRegion: member.region, region: after?.region });
}
