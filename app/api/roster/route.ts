import { env } from "cloudflare:workers";

type RosterOption = {
  participant_name: string;
  region: string;
  voice: string;
};

export async function GET() {
  const result = await env.DB.prepare(`
    SELECT participant_name, region, voice
    FROM roster_members
    ORDER BY region, voice, participant_name
  `).all<RosterOption>();

  return Response.json({ members: result.results ?? [] });
}
