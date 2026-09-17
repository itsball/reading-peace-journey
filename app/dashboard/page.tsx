import { env } from "cloudflare:workers";
import AdminDashboard, { type MemberRecord } from "../admin/AdminDashboard";

export const dynamic = "force-dynamic";

export default async function SharedDashboardPage() {
  const result = await env.DB.prepare(`
    WITH checkin_totals AS (
      SELECT participant_key, COUNT(*) AS total_checkins, MAX(chapter) AS furthest_chapter, MAX(created_at) AS last_checkin
      FROM reading_checkins GROUP BY participant_key
    ), completion_totals AS (
      SELECT participant_key, COUNT(*) AS completion_rounds FROM reading_completions GROUP BY participant_key
    )
    SELECT rm.participant_name, rm.region, rm.church, rm.voice, rm.nature,
      COALESCE(ct.total_checkins, 0) AS total_checkins, COALESCE(ct.furthest_chapter, 0) AS furthest_chapter,
      ct.last_checkin, COALESCE(cp.completion_rounds, 0) AS completion_rounds
    FROM roster_members rm
    LEFT JOIN checkin_totals ct ON ct.participant_key = rm.participant_key
    LEFT JOIN completion_totals cp ON cp.participant_key = rm.participant_key
    ORDER BY rm.region DESC, rm.voice, rm.participant_name
  `).all<MemberRecord>();

  return <AdminDashboard members={result.results} canExport={false} role="同工檢視版" />;
}
