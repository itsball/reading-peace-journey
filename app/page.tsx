"use client";

import { useEffect, useMemo, useState } from "react";

const chapters = [
  "從入伍到派越", "打稻穀，愛居民的作戰", "去愛吧", "烏鵲橋作戰",
  "洪吉童大作戰", "一夕之間經歷三次死亡關卡", "愛的戰爭", "二度派越",
  "神鬼六號大作戰", "和平的戰爭",
];

const milestones = [
  { at: 25, title: "啟程之章", note: "願意走進故事", mark: "壹", source: "2019年02月28日週四清晨箴言", quote: "要像讀聖經那樣讀《越戰》才行。這樣才能瞭解在人豁出性命的狀況中　神深奧的動工。" },
  { at: 50, title: "生命之章", note: "看見生命的珍貴", mark: "貳", source: "2019年03月05日週二清晨箴言", quote: "要絕對地做。沒有全心全意地做的人不會被認定。只付出一點點的愛的人無法達成　神的愛。\n\n越戰時，老師確實付出愛來拯救了生命。若想付出這種程度的愛，就要豁出性命來愛對方才行。要付出實存的愛。" },
  { at: 75, title: "勇氣之章", note: "在困難中選擇愛", mark: "參", source: "2019年01月31日週四清晨箴言", quote: "　神已經透過主的口宣布了，不能不按照主所宣布的去做。\n\n主有時為了拯救一個生命而艱難地扔下槍，豁出性命跑向他，有時反而在一個地方一口氣就消滅了六百人。當　神說該受審判時，就有六百人在同一個地方因戰鬥機轟炸而消失。　神的審判就是這麼可怕。\n\n主有時為了拯救他們而交出生命，有時反會勸　神動工、施行審判。" },
  { at: 100, title: "和平之章", note: "完成共同閱讀旅程", mark: "肆", source: "2019年6月2日主日：信仰的武裝　箴言", quote: "36. 　神甚至讓老師參加越戰，藉此教導老師＜信仰的爭戰＞來培養「大膽的心」。雖然　神說老師必須成為「　神的身軀」，去戰場阻止交戰，但實際上是為了讓老師能如此在「信仰的戰爭」中好好統率，才讓老師上戰場的。\n\n37. 人要有＜氣魄＞。不論是否曾經從軍，都要憑著「從父母身上得到的氣魄」以及「度過生活時所造就的氣魄」來生活。\n\n38. 　神在聖經中提到：「眾新婦啊，你們要如＜日頭＞般皎潔清晰！要擁有如＜月亮＞般的美麗！要擁有如＜展開旌旗的軍隊＞般的精神和行為！」如此勸勉我們在屬靈上擁有各種特質，成為「具備美的人」。" },
];

export default function Home() {
  const [name, setName] = useState("");
  const [chapter, setChapter] = useState(1);
  const [mood, setMood] = useState<string | null>(null);
  const [checkedIn, setCheckedIn] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [completedRound, setCompletedRound] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [stats, setStats] = useState({ weeklyPartners: 0, total: 0, groupChapter: 1, totalRounds: 0, completedReaders: 0 });
  const progress = useMemo(() => Math.round((chapter / chapters.length) * 100), [chapter]);

  useEffect(() => {
    void document.fonts.ready;
    milestones.forEach(item => {
      const image = new Image();
      image.src = `/keepsake-${item.at}-illustration.png`;
    });
    fetch("/api/checkins").then(response => response.json()).then(setStats).catch(() => undefined);
  }, []);

  const submitCheckin = async () => {
    if (!name.trim()) { setMessage("請先輸入姓名。"); return; }
    setSubmitting(true); setMessage(""); setCheckedIn(false); setCompletedRound(null);
    try {
      const response = await fetch("/api/checkins", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name, chapter, mood }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "登錄失敗，請稍後再試。");
      setCheckedIn(true);
      const refreshed = await fetch("/api/checkins").then(result => result.json());
      setStats(refreshed);
    } catch (error) { setMessage(error instanceof Error ? error.message : "登錄失敗，請稍後再試。"); }
    finally { setSubmitting(false); }
  };

  const completeRound = async () => {
    setCompleting(true); setMessage("");
    try {
      const response = await fetch("/api/completions", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "完讀紀錄失敗，請稍後再試。");
      setCompletedRound(data.rounds);
      const refreshed = await fetch("/api/checkins").then(result => result.json());
      setStats(refreshed);
    } catch (error) { setMessage(error instanceof Error ? error.message : "完讀紀錄失敗，請稍後再試。"); }
    finally { setCompleting(false); }
  };

  const startNextRound = () => { setChapter(1); setCheckedIn(false); setCompletedRound(null); setMessage(""); document.querySelector("#checkin")?.scrollIntoView({ behavior: "smooth" }); };

  const downloadKeepsake = async (item: typeof milestones[number]) => {
    const filename = `CGM閱讀紀念圖卡-${item.at}-${name.trim() || "閱讀夥伴"}.png`;
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const shareNavigator = navigator as Navigator & {
      canShare?: (data: ShareData) => boolean;
      share?: (data: ShareData) => Promise<void>;
    };
    const shareProbe = new File([new Uint8Array(1)], filename, { type: "image/png" });
    const canShareFile = Boolean(isMobile && shareNavigator.share && shareNavigator.canShare?.({ files: [shareProbe] }));
    const fallbackWindow = isMobile && !canShareFile ? window.open("", "_blank") : null;
    if (fallbackWindow) {
      fallbackWindow.document.title = "圖卡產生中";
      fallbackWindow.document.body.innerHTML = "<p style='font:16px sans-serif;padding:24px'>圖卡產生中，請稍候…</p>";
    }

    await document.fonts.ready;
    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 1800;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const accents: Record<number, string> = { 25: "#707b51", 50: "#8a6549", 75: "#4e5b3b", 100: "#292d24" };
    const accent = accents[item.at];
    const art = new Image();
    art.src = `/keepsake-${item.at}-illustration.png`;
    await new Promise<void>((resolve, reject) => {
      art.onload = () => resolve();
      art.onerror = () => reject(new Error("圖卡插畫載入失敗"));
    });
    const artHeight = 720;
    const destinationRatio = canvas.width / artHeight;
    const sourceWidth = art.naturalWidth;
    const sourceHeight = sourceWidth / destinationRatio;
    const availableOffset = Math.max(0, art.naturalHeight - sourceHeight);
    const sourceY = item.at === 50 || item.at === 75 ? Math.min(110, availableOffset) : 0;
    ctx.drawImage(art, 0, sourceY, sourceWidth, sourceHeight, 0, 0, canvas.width, artHeight);
    ctx.fillStyle = "#f0e4c8";
    ctx.fillRect(0, artHeight, canvas.width, canvas.height - artHeight);
    const artFade = ctx.createLinearGradient(0, 560, 0, artHeight);
    artFade.addColorStop(0, "rgba(240,228,200,0)");
    artFade.addColorStop(1, "rgba(240,228,200,1)");
    ctx.fillStyle = artFade;
    ctx.fillRect(0, 560, canvas.width, artHeight - 560);

    const sans = "'Source Han Sans TC','Noto Sans TC','Microsoft JhengHei',sans-serif";
    ctx.textAlign = "left";
    ctx.fillStyle = "#292d24";
    ctx.font = `700 29px ${sans}`;
    ctx.fillText("CGM合唱團 · 2026十月榮耀神", 72, 766);
    ctx.font = `900 74px ${sans}`;
    ctx.fillText(item.title, 72, 852);
    ctx.font = `700 26px ${sans}`;
    ctx.fillText(`${item.at}%  ·  ${item.mark}  ·  ${item.note}`, 74, 902);
    ctx.fillStyle = accent;
    ctx.fillRect(74, 924, 180, 8);

    const drawWrapped = (text: string, x: number, startY: number, maxWidth: number, lineHeight: number) => {
      let y = startY;
      const paragraphs = text.split("\n");
      paragraphs.forEach(paragraph => {
        if (!paragraph) { y += lineHeight * .65; return; }
        let line = "";
        for (const char of paragraph) {
          const test = line + char;
          if (ctx.measureText(test).width > maxWidth && line) { ctx.fillText(line, x, y); line = char; y += lineHeight; }
          else line = test;
        }
        if (line) { ctx.fillText(line, x, y); y += lineHeight; }
      });
      return y;
    };
    const quoteSize = Math.round((item.at === 100 ? 28 : item.at === 75 ? 31 : item.at === 50 ? 35 : 42) * 1.2);
    const lineHeight = Math.round((item.at === 100 ? 42 : item.at === 75 ? 47 : item.at === 50 ? 53 : 62) * 1.2);
    const quoteStart = item.at === 25 ? 1050 : item.at === 50 ? 1005 : item.at === 75 ? 985 : 970;
    ctx.save();
    ctx.fillStyle = item.at >= 75 ? "rgba(78,91,59,.045)" : "rgba(78,91,59,.07)";
    ctx.font = `900 ${item.at >= 75 ? 220 : 250}px ${sans}`;
    ctx.textAlign = "right";
    ctx.fillText(`${item.at}%`, 1128, 1535);
    ctx.restore();
    ctx.fillStyle = "#292d24";
    ctx.font = `600 ${quoteSize}px ${sans}`;
    drawWrapped(item.quote, 72, quoteStart, 1056, lineHeight);

    ctx.strokeStyle = "rgba(43,43,37,.35)";
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(72, 1620); ctx.lineTo(1128, 1620); ctx.stroke();
    ctx.fillStyle = "#292d24";
    ctx.font = `700 28px ${sans}`;
    ctx.fillText(`＜${item.source}＞`, 72, 1664);
    ctx.font = `600 25px ${sans}`;
    ctx.fillText(`${name.trim() || "閱讀夥伴"} · 《戰爭是殘忍的。愛與和平》共讀紀念`, 72, 1712);
    ctx.font = `700 20px ${sans}`;
    ctx.fillText("OCTOBER 2026  ·  READING KEEPSAKE", 72, 1756);

    ctx.strokeStyle = "rgba(43,43,37,.55)";
    ctx.lineWidth = 2;
    ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60);

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(result => result ? resolve(result) : reject(new Error("圖卡產生失敗")), "image/png");
    });
    const file = new File([blob], filename, { type: "image/png" });

    if (canShareFile && shareNavigator.share) {
      try {
        await shareNavigator.share({ files: [file], title: item.title });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }

    const objectUrl = URL.createObjectURL(blob);
    if (fallbackWindow) {
      fallbackWindow.location.href = objectUrl;
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
      return;
    }

    const link = document.createElement("a");
    link.download = filename;
    link.href = objectUrl;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 10_000);
  };

  return (
    <main>
      <section className="hero">
        <nav><span className="brand">CGM合唱團 · 2026十月榮耀神</span><a href="#checkin">今日登錄</a><a href="#journey">閱讀地圖</a><a href="#souvenirs">閱讀徽章</a><a href="#together">全團進度</a></nav>
        <div className="hero-copy">
          <p className="eyebrow">CGM CHOIR · OCTOBER 2026</p>
          <h1>翻開書，走向<br/><em>愛與和平</em></h1>
          <p className="lead">不必讀得最快。每次翻開書，我們就一起向音樂會走近一點。</p>
          <a className="primary" href="#checkin">記錄今天的閱讀 ↓</a>
        </div>
        <div className="date-card"><small>2026 READING MONTH</small><strong>10.01—31</strong><span>CGM合唱團 · 十個閱讀驛站</span></div>
      </section>

      <section id="checkin" className="checkin section">
        <div className="section-heading"><p className="eyebrow">MY READING CARD</p><h2>今天，也讀了一點</h2><p>十秒完成登錄，每一次閱讀都算數。</p></div>
        <div className="check-card">
          <label>你的姓名<input value={name} onChange={e => setName(e.target.value)} placeholder="輸入姓名" /></label>
          <label>目前讀到<select value={chapter} onChange={e => setChapter(Number(e.target.value))}>{chapters.map((c,i)=><option key={c} value={i+1}>第 {i+1} 章｜{c}</option>)}</select></label>
          <div className="moods"><span>今天的閱讀心情（選填）</span><div>{[["平靜","🙂"],["驚訝","😮"],["感動","😢"],["思考","🤔"]].map(([label, icon]) => <button type="button" className={mood === label ? "selected" : ""} aria-pressed={mood === label} aria-label={label} key={label} onClick={() => setMood(mood === label ? null : label)}>{icon}</button>)}</div></div>
          <button className="submit" disabled={submitting} onClick={submitCheckin}>{submitting ? "登錄中…" : "今天讀了一點"}</button>
          {checkedIn && <p className="success">✓ {name || "閱讀夥伴"}，你已為全團點亮第 {chapter} 站！</p>}
          {checkedIn && chapter === 10 && !completedRound && <button className="complete-round" disabled={completing} onClick={completeRound}>{completing ? "記錄中…" : "我已讀完整本，完成本輪"}</button>}
          {completedRound && <div className="completion-success"><strong>完成第 {completedRound} 輪閱讀！</strong><span>這一輪已永久保存。</span><button onClick={startNextRound}>開始下一輪閱讀</button></div>}
          {message && <p className="error">{message}</p>}
        </div>
        <aside className="my-progress"><span>目前旅程</span><strong>{progress}%</strong><div className="bar"><i style={{width:`${progress}%`}} /></div><p>已抵達：{chapters[chapter-1]}</p></aside>
      </section>

      <section id="journey" className="journey section">
        <div className="section-heading light"><p className="eyebrow">THE JOURNEY</p><h2>十站閱讀地圖</h2><p>每個人照自己的速度前進，隨時都能重新加入。</p></div>
        <div className="route">{chapters.map((c,i)=><article className={i < chapter ? "reached" : ""} key={c}><b>{String(i+1).padStart(2,"0")}</b><span>第 {i+1} 站</span><h3>{c}</h3><small>{i < chapter ? "已抵達 ✓" : "等待探索"}</small></article>)}</div>
      </section>

      <section id="souvenirs" className="souvenirs section">
        <div className="section-heading"><p className="eyebrow">READING KEEPSAKES</p><h2>把閱讀旅程，留下來</h2><p>首頁徽章記錄閱讀進度；每抵達一個里程碑，就能下載一張專屬箴言紀念圖卡。</p></div>
        <div className="badge-grid">
          {milestones.map(item => {
            const unlocked = progress >= item.at;
            return <article className={unlocked ? "badge unlocked" : "badge locked"} key={item.at}>
              <div className="badge-seal"><b>{item.mark}</b><span>{item.at}%</span></div>
              <small>{unlocked ? "已解鎖" : `閱讀達 ${item.at}% 解鎖`}</small>
              <h3>{item.title}</h3><p>{item.note}</p>
              <button disabled={!unlocked} onClick={() => downloadKeepsake(item)}>{unlocked ? "下載紀念圖卡 ↓" : "尚未解鎖"}</button>
            </article>;
          })}
        </div>
        <div className={`completion-card ${progress >= 100 ? "complete" : ""}`}>
          <div><p className="eyebrow">PERSONAL READING CARD</p><h3>{name.trim() || "閱讀夥伴"}的完讀紀念卡</h3><p>完成《戰爭是殘忍的。愛與和平》閱讀旅程</p><div className="mini-stamps">{milestones.map(item => <i key={item.at}>{item.mark}</i>)}</div></div>
          <button disabled={progress < 100} onClick={() => downloadKeepsake(milestones[3])}>{progress >= 100 ? "下載我的完讀圖卡 ↓" : `完成全書後解鎖（目前 ${progress}%）`}</button>
        </div>
      </section>

      <section id="together" className="together section">
        <div className="section-heading"><p className="eyebrow">READ TOGETHER</p><h2>我們一起走了多遠</h2></div>
        <div className="stats"><article><strong>{stats.weeklyPartners}</strong><span>本週閱讀夥伴</span></article><article><strong>{stats.total}</strong><span>累積閱讀足跡</span></article><article><strong>{stats.completedReaders}</strong><span>完讀人數</span></article><article><strong>{stats.totalRounds}</strong><span>完讀總輪次</span></article></div>
        <div className="unlock"><span>下一個共同解鎖</span><strong>{stats.total >= 100 ? "「和平之燈」已點亮" : `再累積 ${100 - stats.total} 次閱讀，點亮「和平之燈」`}</strong><div className="bar"><i style={{width:`${Math.min(100, stats.total)}%`}} /></div></div>
      </section>

      <section className="book section"><div><p className="eyebrow">OUR BOOK</p><h2>《戰爭是殘忍的。<br/>愛與和平》</h2><p>鄭明析 著 · 特別精華版 · 448頁</p></div><blockquote>「比起殺人無數的英雄，救人無數的人才是更了不起的英雄。」</blockquote></section>
      <footer>CGM合唱團 · 2026十月榮耀神 <span>一起翻頁，一起走向音樂會。</span></footer>
    </main>
  );
}
