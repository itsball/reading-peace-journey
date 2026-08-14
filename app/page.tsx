"use client";

import { useMemo, useState } from "react";

const chapters = [
  "從入伍到派越", "打稻穀，愛居民的作戰", "去愛吧", "烏鵲橋作戰",
  "洪吉童大作戰", "一夕之間經歷三次死亡關卡", "愛的戰爭", "二度派越",
  "神鬼六號大作戰", "和平的戰爭",
];

export default function Home() {
  const [name, setName] = useState("");
  const [chapter, setChapter] = useState(1);
  const [checkedIn, setCheckedIn] = useState(false);
  const progress = useMemo(() => Math.round((chapter / chapters.length) * 100), [chapter]);

  return (
    <main>
      <section className="hero">
        <nav><span className="brand">共讀遠征</span><a href="#checkin">今日登錄</a><a href="#journey">閱讀地圖</a><a href="#together">全團進度</a></nav>
        <div className="hero-copy">
          <p className="eyebrow">OCTOBER · 共同閱讀計畫</p>
          <h1>翻開書，走向<br/><em>愛與和平</em></h1>
          <p className="lead">不必讀得最快。每次翻開書，我們就一起向音樂會走近一點。</p>
          <a className="primary" href="#checkin">記錄今天的閱讀 ↓</a>
        </div>
        <div className="date-card"><small>READING MONTH</small><strong>10.01—31</strong><span>一個月 · 十個閱讀驛站</span></div>
      </section>

      <section id="checkin" className="checkin section">
        <div className="section-heading"><p className="eyebrow">MY READING CARD</p><h2>今天，也讀了一點</h2><p>十秒完成登錄，每一次閱讀都算數。</p></div>
        <div className="check-card">
          <label>你的姓名<input value={name} onChange={e => setName(e.target.value)} placeholder="輸入姓名" /></label>
          <label>目前讀到<select value={chapter} onChange={e => setChapter(Number(e.target.value))}>{chapters.map((c,i)=><option key={c} value={i+1}>第 {i+1} 章｜{c}</option>)}</select></label>
          <div className="moods"><span>今天的閱讀心情（選填）</span><div><button>🙂</button><button>😮</button><button>😢</button><button>🤔</button></div></div>
          <button className="submit" onClick={() => setCheckedIn(true)}>今天讀了一點</button>
          {checkedIn && <p className="success">✓ {name || "閱讀夥伴"}，你已為全團點亮第 {chapter} 站！</p>}
        </div>
        <aside className="my-progress"><span>目前旅程</span><strong>{progress}%</strong><div className="bar"><i style={{width:`${progress}%`}} /></div><p>已抵達：{chapters[chapter-1]}</p></aside>
      </section>

      <section id="journey" className="journey section">
        <div className="section-heading light"><p className="eyebrow">THE JOURNEY</p><h2>十站閱讀地圖</h2><p>每個人照自己的速度前進，隨時都能重新加入。</p></div>
        <div className="route">{chapters.map((c,i)=><article className={i < chapter ? "reached" : ""} key={c}><b>{String(i+1).padStart(2,"0")}</b><span>第 {i+1} 站</span><h3>{c}</h3><small>{i < chapter ? "已抵達 ✓" : "等待探索"}</small></article>)}</div>
      </section>

      <section id="together" className="together section">
        <div className="section-heading"><p className="eyebrow">READ TOGETHER</p><h2>我們一起走了多遠</h2></div>
        <div className="stats"><article><strong>24</strong><span>本週閱讀夥伴</span></article><article><strong>86</strong><span>累積閱讀足跡</span></article><article><strong>第 4 站</strong><span>全團目前位置</span></article></div>
        <div className="unlock"><span>下一個共同解鎖</span><strong>再累積 14 次閱讀，點亮「和平之燈」</strong><div className="bar"><i style={{width:"86%"}} /></div></div>
      </section>

      <section className="book section"><div><p className="eyebrow">OUR BOOK</p><h2>《戰爭是殘忍的。<br/>愛與和平》</h2><p>鄭明析 著 · 特別精華版 · 448頁</p></div><blockquote>「比起殺人無數的英雄，救人無數的人才是更了不起的英雄。」</blockquote></section>
      <footer>共讀遠征 · 十月閱讀計畫 <span>一起翻頁，一起走向音樂會。</span></footer>
    </main>
  );
}
