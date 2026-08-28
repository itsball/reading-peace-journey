"use client";

import { useMemo, useState } from "react";

export type MemberRecord = { participant_name: string; region: string; church: string; voice: string; nature: string; total_checkins: number; furthest_chapter: number; last_checkin: number | null };
const statusOf = (member: MemberRecord) => !member.last_checkin ? "尚未開始" : member.furthest_chapter >= 10 ? "已完成" : Date.now() - member.last_checkin <= 7 * 86400000 ? "穩定前進" : "需要鼓勵";

export default function AdminDashboard({ members, canExport, role }: { members: MemberRecord[]; canExport: boolean; role: string }) {
  const [region, setRegion] = useState("全團");
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => members.filter(member => (region === "全團" || member.region === region.replace("區", "")) && (!query || `${member.participant_name}${member.church}${member.voice}`.includes(query.trim()))), [members, region, query]);
  const active = filtered.filter(member => member.last_checkin && Date.now() - member.last_checkin <= 7 * 86400000).length;
  const completed = filtered.filter(member => member.furthest_chapter >= 10).length;
  const care = filtered.filter(member => ["需要鼓勵", "尚未開始"].includes(statusOf(member))).length;
  const totalCheckins = filtered.reduce((sum, member) => sum + Number(member.total_checkins), 0);
  const bands = [["尚未開始", (m: MemberRecord) => m.furthest_chapter === 0], ["第 1–2 站", (m: MemberRecord) => m.furthest_chapter >= 1 && m.furthest_chapter <= 2], ["第 3–4 站", (m: MemberRecord) => m.furthest_chapter >= 3 && m.furthest_chapter <= 4], ["第 5–6 站", (m: MemberRecord) => m.furthest_chapter >= 5 && m.furthest_chapter <= 6], ["第 7–8 站", (m: MemberRecord) => m.furthest_chapter >= 7 && m.furthest_chapter <= 8], ["第 9–10 站", (m: MemberRecord) => m.furthest_chapter >= 9]] as const;
  const exportCsv = () => {
    const quote = (value: string | number) => `"${String(value).replaceAll('"', '""')}"`;
    const rows = [["區團","教會","姓名","聲部","性質","累積登錄","最遠進度","最近登錄","狀態"], ...filtered.map(member => [member.region + "區", member.church, member.participant_name, member.voice, member.nature, member.total_checkins, member.furthest_chapter ? `第 ${member.furthest_chapter} 站` : "尚未開始", member.last_checkin ? new Date(member.last_checkin).toLocaleString("zh-TW") : "—", statusOf(member)])];
    const blob = new Blob(["\ufeff" + rows.map(row => row.map(quote).join(",")).join("\r\n")], { type: "text/csv;charset=utf-8" });
    const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = `CGM閱讀紀錄-${region}.csv`; link.click(); URL.revokeObjectURL(link.href);
  };
  return <main className="admin"><section>
    <div className="admin-head"><div><p className="eyebrow">READING DASHBOARD · {role}</p><h1>整團參與儀表板</h1><p>名冊共 {members.length} 人｜目前查看 {filtered.length} 人</p></div><div className="admin-actions"><a href="/">回活動首頁</a>{canExport && <button onClick={exportCsv}>匯出 CSV ↓</button>}</div></div>
    <div className="admin-filters"><div>{["全團","北區","中區","南區"].map(item => <button className={region === item ? "active" : ""} onClick={() => setRegion(item)} key={item}>{item}</button>)}</div><input value={query} onChange={event => setQuery(event.target.value)} placeholder="搜尋姓名、教會或聲部" /></div>
    <div className="admin-kpis"><article><strong>{filtered.length}</strong><span>名冊人數</span></article><article><strong>{active}</strong><span>本週有閱讀</span></article><article><strong>{totalCheckins}</strong><span>累積登錄</span></article><article><strong>{completed}</strong><span>已完成</span></article><article><strong>{care}</strong><span>需要關懷</span></article></div>
    <div className="admin-panels"><section><h2>閱讀進度分布</h2>{bands.map(([label, test]) => { const count = filtered.filter(test).length; return <div className="progress-row" key={label}><span>{label}</span><div><i style={{ width: `${filtered.length ? count / filtered.length * 100 : 0}%` }} /></div><b>{count} 人</b></div>; })}</section><section><h2>關懷摘要</h2><p>尚未開始 <strong>{filtered.filter(member => statusOf(member) === "尚未開始").length}</strong> 人</p><p>超過 7 天未登錄 <strong>{filtered.filter(member => statusOf(member) === "需要鼓勵").length}</strong> 人</p><p>本週穩定前進 <strong>{filtered.filter(member => statusOf(member) === "穩定前進").length}</strong> 人</p><p>完成旅程 <strong>{completed}</strong> 人</p></section></div>
    <div className="admin-table-wrap"><table><thead><tr><th>區團</th><th>姓名</th><th>教會／聲部</th><th>累積登錄</th><th>最遠進度</th><th>最近登錄</th><th>狀態</th></tr></thead><tbody>{filtered.map(member => <tr key={`${member.region}-${member.participant_name}`}><td>{member.region}區</td><td><strong>{member.participant_name}</strong><small>{member.nature}</small></td><td>{member.church}<small>{member.voice}</small></td><td>{member.total_checkins} 次</td><td>{member.furthest_chapter ? `第 ${member.furthest_chapter} 站` : "—"}</td><td>{member.last_checkin ? new Intl.DateTimeFormat("zh-TW", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Taipei" }).format(new Date(member.last_checkin)) : "—"}</td><td><span className={`status status-${statusOf(member)}`}>{statusOf(member)}</span></td></tr>)}</tbody></table>{filtered.length === 0 && <p className="admin-empty">沒有符合條件的團員。</p>}</div>
  </section></main>;
}
