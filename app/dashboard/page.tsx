import { env } from "cloudflare:workers";
import AdminDashboard, { type MemberRecord } from "../admin/AdminDashboard";

export const dynamic = "force-dynamic";

export default async function SharedDashboardPage() {
  const result = await env.DB.prepare(`
    SELECT rm.participant_name, rm.region, rm.church, rm.voice, rm.nature,
      COUNT(rc.id) AS total_checkins, COALESCE(MAX(rc.chapter), 0) AS furthest_chapter,
      MAX(rc.created_at) AS last_checkin
    FROM roster_members rm
    LEFT JOIN reading_checkins rc ON rc.participant_key = rm.participant_key
    GROUP BY rm.id
    ORDER BY rm.region DESC, rm.voice, rm.participant_name
  `).all<MemberRecord>();

  return <AdminDashboard members={result.results} canExport={false} role="同工檢視版" />;
}
