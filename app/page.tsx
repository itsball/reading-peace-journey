"use client";

import { useMemo, useState } from "react";

const chapters = [
  "從入伍到派越", "打稻穀，愛居民的作戰", "去愛吧", "烏鵲橋作戰",
  "洪吉童大作戰", "一夕之間經歷三次死亡關卡", "愛的戰爭", "二度派越",
  "神鬼六號大作戰", "和平的戰爭",
];

const milestones = [
  { at: 25, title: "啟程之章", note: "願意走進故事", mark: "壹" },
  { at: 50, title: "生命之章", note: "看見生命的珍貴", mark: "貳" },
  { at: 75, title: "勇氣之章", note: "在困難中選擇愛", mark: "參" },
  { at: 100, title: "和平之章", note: "完成共同閱讀旅程", mark: "肆" },
];

export default function Home() {
  const [name, setName] = useState("");
  const [chapter, setChapter] = useState(1);
  const [checkedIn, setCheckedIn] = useState(false);
  const progress = useMemo(() => Math.round((chapter / chapters.length) * 100), [chapter]);

  const downloadImage = (kind: "badge" | "card", title = "和平之章", mark = "肆") => {
    const canvas = document.createElement("canvas");
    const isCard = kind === "card";
    canvas.width = isCard ? 1400 : 1080;
    canvas.height = isCard ? 1000 : 1080;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#d8cdb5";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#292d24";
    ctx.lineWidth = isCard ? 4 : 8;
    ctx.strokeRect(34, 34, canvas.width - 68, canvas.height - 68);
    ctx.strokeRect(54, 54, canvas.width - 108, canvas.height - 108);
    ctx.textAlign = "center";
    ctx.fillStyle = "#292d24";

    if (isCard) {
      ctx.font = "700 30px serif";
      ctx.fillText("CGM合唱團 · 2026十月共讀遠征", 700, 145);
      ctx.font = "900 72px serif";
      ctx.fillText("完讀紀念卡", 700, 260);
      ctx.font = "700 48px serif";
      ctx.fillText(name.trim() || "閱讀夥伴", 700, 390);
      ctx.font = "36px serif";
      ctx.fillText("完成《戰爭是殘忍的。愛與和平》閱讀旅程", 700, 485);
      ctx.strokeStyle = "#4e5b3b";
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(260, 545); ctx.lineTo(1140, 545); ctx.stroke();
      milestones.forEach((item, index) => {
        const x = 385 + index * 210;
        ctx.beginPath(); ctx.arc(x, 650, 68, 0, Math.PI * 2); ctx.stroke();
        ctx.font = "700 36px serif"; ctx.fillText(item.mark, x, 663);
        ctx.font = "700 22px serif"; ctx.fillText(item.title, x, 758);
      });
      ctx.font = "28px serif";
      ctx.fillText("每次翻開書，我們就一起向和平走近一點。", 700, 865);
    } else {
      ctx.beginPath(); ctx.arc(540, 465, 300, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(540, 465, 270, 0, Math.PI * 2); ctx.stroke();
      ctx.font = "900 190px serif"; ctx.fillText(mark, 540, 530);
      ctx.font = "900 66px serif"; ctx.fillText(title, 540, 865);
      ctx.font = "700 25px serif"; ctx.fillText("CGM合唱團 · 2026共讀遠征", 540, 930);
    }

    const link = document.createElement("a");
    link.download = isCard ? `CGM完讀紀念卡-${name.trim() || "閱讀夥伴"}.png` : `${title}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
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
          <div className="moods"><span>今天的閱讀心情（選填）</span><div><button aria-label="平靜">🙂</button><button aria-label="驚訝">😮</button><button aria-label="感動">😢</button><button aria-label="思考">🤔</button></div></div>
          <button className="submit" onClick={() => setCheckedIn(true)}>今天讀了一點</button>
          {checkedIn && <p className="success">✓ {name || "閱讀夥伴"}，你已為全團點亮第 {chapter} 站！</p>}
        </div>
        <aside className="my-progress"><span>目前旅程</span><strong>{progress}%</strong><div className="bar"><i style={{width:`${progress}%`}} /></div><p>已抵達：{chapters[chapter-1]}</p></aside>
      </section>

      <section id="journey" className="journey section">
        <div className="section-heading light"><p className="eyebrow">THE JOURNEY</p><h2>十站閱讀地圖</h2><p>每個人照自己的速度前進，隨時都能重新加入。</p></div>
        <div className="route">{chapters.map((c,i)=><article className={i < chapter ? "reached" : ""} key={c}><b>{String(i+1).padStart(2,"0")}</b><span>第 {i+1} 站</span><h3>{c}</h3><small>{i < chapter ? "已抵達 ✓" : "等待探索"}</small></article>)}</div>
      </section>

      <section id="souvenirs" className="souvenirs section">
        <div className="section-heading"><p className="eyebrow">READING KEEPSAKES</p><h2>把閱讀旅程，留下來</h2><p>四個進度里程碑各解鎖一枚徽章；完成全書後，四枚徽章會合成個人完讀紀念卡。</p></div>
        <div className="badge-grid">
          {milestones.map(item => {
            const unlocked = progress >= item.at;
            return <article className={unlocked ? "badge unlocked" : "badge locked"} key={item.at}>
              <div className="badge-seal"><b>{item.mark}</b><span>{item.at}%</span></div>
              <small>{unlocked ? "已解鎖" : `閱讀達 ${item.at}% 解鎖`}</small>
              <h3>{item.title}</h3><p>{item.note}</p>
              <button disabled={!unlocked} onClick={() => downloadImage("badge", item.title, item.mark)}>{unlocked ? "下載徽章 ↓" : "尚未解鎖"}</button>
            </article>;
          })}
        </div>
        <div className={`completion-card ${progress >= 100 ? "complete" : ""}`}>
          <div><p className="eyebrow">PERSONAL READING CARD</p><h3>{name.trim() || "閱讀夥伴"}的完讀紀念卡</h3><p>完成《戰爭是殘忍的。愛與和平》閱讀旅程</p><div className="mini-stamps">{milestones.map(item => <i key={item.at}>{item.mark}</i>)}</div></div>
          <button disabled={progress < 100} onClick={() => downloadImage("card")}>{progress >= 100 ? "下載我的紀念卡 ↓" : `完成全書後解鎖（目前 ${progress}%）`}</button>
        </div>
      </section>

      <section id="together" className="together section">
        <div className="section-heading"><p className="eyebrow">READ TOGETHER</p><h2>我們一起走了多遠</h2></div>
        <div className="stats"><article><strong>24</strong><span>本週閱讀夥伴</span></article><article><strong>86</strong><span>累積閱讀足跡</span></article><article><strong>第 4 站</strong><span>全團目前位置</span></article></div>
        <div className="unlock"><span>下一個共同解鎖</span><strong>再累積 14 次閱讀，點亮「和平之燈」</strong><div className="bar"><i style={{width:"86%"}} /></div></div>
      </section>

      <section className="book section"><div><p className="eyebrow">OUR BOOK</p><h2>《戰爭是殘忍的。<br/>愛與和平》</h2><p>鄭明析 著 · 特別精華版 · 448頁</p></div><blockquote>「比起殺人無數的英雄，救人無數的人才是更了不起的英雄。」</blockquote></section>
      <footer>CGM合唱團 · 2026十月榮耀神 <span>一起翻頁，一起走向音樂會。</span></footer>
    </main>
  );
}
