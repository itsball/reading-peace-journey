import { env } from "cloudflare:workers";
import { chatGPTSignOutPath, requireChatGPTUser } from "../chatgpt-auth";
import AdminDashboard, { type MemberRecord } from "./AdminDashboard";

export const dynamic = "force-dynamic";

const demoMembers: MemberRecord[] = Array.from({ length: 38 }, (_, index) => {
  const number = index + 1;
  const completed = number > 34;
  const steady = number > 26 && number <= 34;
  const encourage = number > 18 && number <= 26;
  return {
    participant_name: `測試團員 ${String(number).padStart(2, "0")}`,
    region: number % 3 === 1 ? "北" : number % 3 === 2 ? "中" : "南",
    church: "展示教會",
    voice: ["女高音", "女低音", "男高音", "男低音"][index % 4],
    nature: "測試資料",
    total_checkins: completed ? 12 : steady ? 5 : encourage ? 2 : 0,
    furthest_chapter: completed ? 10 : steady ? 6 : encourage ? 2 : 0,
    last_checkin: completed || steady ? Date.now() - 2 * 86400000 : encourage ? Date.now() - 12 * 86400000 : null,
    completion_rounds: completed ? 1 : 0,
  };
});

export default async function AdminPage({ searchParams }: { searchParams?: Promise<{ demo?: string }> }) {
  const params = await searchParams;
  const demoMode = params?.demo === "1";
  const user = await requireChatGPTUser(demoMode ? "/admin?demo=1" : "/admin");
  const email = user.email.toLocaleLowerCase();
  const isAdmin = Boolean(env.ADMIN_EMAIL && email === env.ADMIN_EMAIL.toLocaleLowerCase());
  const coreEmails = (env.CORE_TEAM_EMAILS || "").split(",").map(value => value.trim().toLocaleLowerCase()).filter(Boolean);
  const isCore = coreEmails.includes(email);
  if (!isAdmin && !isCore) return <main className="admin"><section><h1>無法查看名單</h1><p>這個頁面只開放給管理員與核心同工。</p><a href={chatGPTSignOutPath("/admin")}>切換帳號</a></section></main>;

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
  return <AdminDashboard members={demoMode ? demoMembers : result.results} canExport={isAdmin} role={isAdmin ? "管理員" : "核心同工"} demoMode={demoMode} />;
}
