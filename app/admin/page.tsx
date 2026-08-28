import { env } from "cloudflare:workers";
import { chatGPTSignOutPath, requireChatGPTUser } from "../chatgpt-auth";

type Participant = {
  participant_name: string;
  total_checkins: number;
  furthest_chapter: number;
  last_checkin: number;
};

export default async function AdminPage() {
  const user = await requireChatGPTUser("/admin");
  if (!env.ADMIN_EMAIL || user.email.toLocaleLowerCase() !== env.ADMIN_EMAIL.toLocaleLowerCase()) {
    return <main className="admin"><section><h1>無法查看名單</h1><p>這個頁面只開放給活動管理員。</p><a href={chatGPTSignOutPath("/admin")}>切換帳號</a></section></main>;
  }

  const result = await env.DB.prepare(`
    SELECT participant_name, COUNT(*) AS total_checkins,
      MAX(chapter) AS furthest_chapter, MAX(created_at) AS last_checkin
    FROM reading_checkins
    GROUP BY participant_key, participant_name
    ORDER BY furthest_chapter DESC, total_checkins DESC, last_checkin DESC
  `).all<Participant>();

  return <main className="admin">
    <section>
      <div className="admin-head"><div><p className="eyebrow">READING ADMIN</p><h1>參與名單與累積紀錄</h1><p>共 {result.results.length} 位閱讀夥伴</p></div><a href="/">回活動首頁</a></div>
      <div className="admin-table-wrap"><table><thead><tr><th>姓名</th><th>累積登錄</th><th>最遠進度</th><th>最近登錄</th></tr></thead>
        <tbody>{result.results.map(person => <tr key={`${person.participant_name}-${person.last_checkin}`}><td>{person.participant_name}</td><td>{person.total_checkins} 次</td><td>第 {person.furthest_chapter} 站</td><td>{new Intl.DateTimeFormat("zh-TW", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Taipei" }).format(new Date(person.last_checkin))}</td></tr>)}</tbody>
      </table>{result.results.length === 0 && <p className="admin-empty">目前還沒有登錄紀錄。</p>}</div>
    </section>
  </main>;
}
