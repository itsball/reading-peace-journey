import { env } from "cloudflare:workers";
import { chatGPTSignOutPath, requireChatGPTUser } from "../chatgpt-auth";
import AdminDashboard, { type MemberRecord } from "./AdminDashboard";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await requireChatGPTUser("/admin");
  const email = user.email.toLocaleLowerCase();
  const isAdmin = Boolean(env.ADMIN_EMAIL && email === env.ADMIN_EMAIL.toLocaleLowerCase());
  const coreEmails = (env.CORE_TEAM_EMAILS || "").split(",").map(value => value.trim().toLocaleLowerCase()).filter(Boolean);
  const isCore = coreEmails.includes(email);
  if (!isAdmin && !isCore) return <main className="admin"><section><h1>無法查看名單</h1><p>這個頁面只開放給管理員與核心同工。</p><a href={chatGPTSignOutPath("/admin")}>切換帳號</a></section></main>;

  const result = await env.DB.prepare(`
    SELECT rm.participant_name, rm.region, rm.church, rm.voice, rm.nature,
      COUNT(rc.id) AS total_checkins, COALESCE(MAX(rc.chapter), 0) AS furthest_chapter,
      MAX(rc.created_at) AS last_checkin
    FROM roster_members rm
    LEFT JOIN reading_checkins rc ON rc.participant_key = rm.participant_key
    GROUP BY rm.id
    ORDER BY rm.region DESC, rm.voice, rm.participant_name
  `).all<MemberRecord>();
  return <AdminDashboard members={result.results} canExport={isAdmin} role={isAdmin ? "管理員" : "核心同工"} />;
}
