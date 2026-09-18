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

type RosterMember = { participant_name: string; region: string; voice: string };
type ReflectionEntry = { chapter: number; text: string; createdAt: number };
type PersonalProgress = { progress: number; readChapters: number[]; totalCheckins: number; completionRounds: number; reflections: ReflectionEntry[] };
type DetailPerson = { participant_name: string; region: string; voice: string; count: number };
const rewardByChapter: Record<number, string> = { 3: "25% 箴言卡", 5: "50% 箴言卡", 8: "75% 箴言卡", 10: "100% 箴言卡" };
const boardPosition = (index: number) => index < 5 ? { gridColumn: index + 1, gridRow: 1 } : { gridColumn: 10 - index, gridRow: 2 };
const makeDemoPeople = (count: number): DetailPerson[] => Array.from({ length: count }, (_, index) => ({ participant_name: `測試團員 ${String(index + 1).padStart(2, "0")}`, region: "", voice: "", count: 1 }));

const prepareImageDelivery = (filename: string) => {
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  const shareNavigator = navigator as Navigator & { canShare?: (data: ShareData) => boolean; share?: (data: ShareData) => Promise<void> };
  const shareProbe = new File([new Uint8Array(1)], filename, { type: "image/png" });
  const canShareFile = Boolean(isMobile && shareNavigator.share && shareNavigator.canShare?.({ files: [shareProbe] }));
  const fallbackWindow = isMobile && !canShareFile ? window.open("", "_blank") : null;
  if (fallbackWindow) fallbackWindow.document.body.innerHTML = "<p style='font:16px sans-serif;padding:24px'>圖卡產生中，請稍候…</p>";
  return { shareNavigator, canShareFile, fallbackWindow };
};

const deliverCanvas = async (canvas: HTMLCanvasElement, filename: string, title: string, delivery: ReturnType<typeof prepareImageDelivery>) => {
  const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(result => result ? resolve(result) : reject(new Error("圖卡產生失敗")), "image/png"));
  const file = new File([blob], filename, { type: "image/png" });
  if (delivery.canShareFile && delivery.shareNavigator.share) {
    try { await delivery.shareNavigator.share({ files: [file], title }); return; }
    catch (error) { if (error instanceof DOMException && error.name === "AbortError") return; }
  }
  const objectUrl = URL.createObjectURL(blob);
  if (delivery.fallbackWindow) { delivery.fallbackWindow.location.href = objectUrl; window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000); return; }
  const link = document.createElement("a"); link.download = filename; link.href = objectUrl; document.body.appendChild(link); link.click(); link.remove();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 10_000);
};

export default function Home() {
  const [name, setName] = useState("");
  const [roster, setRoster] = useState<RosterMember[]>([]);
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedVoice, setSelectedVoice] = useState("");
  const [identityConfirmed, setIdentityConfirmed] = useState(false);
  const [personalProgress, setPersonalProgress] = useState<PersonalProgress | null>(null);
  const [progressLoading, setProgressLoading] = useState(false);
  const [chapter, setChapter] = useState(1);
  const [reflection, setReflection] = useState("");
  const [checkedIn, setCheckedIn] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [completedRound, setCompletedRound] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [stats, setStats] = useState({ weeklyPartners: 0, total: 0, groupChapter: 1, totalRounds: 0, completedReaders: 0, chapterCounts: Array.from({ length: 10 }, () => 0) });
  const [detailTitle, setDetailTitle] = useState("");
  const [detailPeople, setDetailPeople] = useState<DetailPerson[]>([]);
  const [detailVisibleCount, setDetailVisibleCount] = useState(15);
  const [detailLoading, setDetailLoading] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const regions = useMemo(() => [...new Set(roster.map(member => member.region))], [roster]);
  const voices = useMemo(() => [...new Set(roster.filter(member => member.region === selectedRegion).map(member => member.voice))], [roster, selectedRegion]);
  const names = useMemo(() => roster.filter(member => member.region === selectedRegion && member.voice === selectedVoice), [roster, selectedRegion, selectedVoice]);
  const selectedMember = useMemo(() => roster.find(member => member.participant_name === name && member.region === selectedRegion && member.voice === selectedVoice), [roster, name, selectedRegion, selectedVoice]);
  const unlockedProgress = personalProgress?.progress ?? 0;

  const loadPersonalProgress = async (participantName: string) => {
    if (!participantName) { setPersonalProgress(null); return; }
    setProgressLoading(true);
    try {
      const response = await fetch(`/api/progress?name=${encodeURIComponent(participantName)}`);
      const data = await response.json();
      setPersonalProgress(response.ok ? data : null);
    } catch { setPersonalProgress(null); }
    finally { setProgressLoading(false); }
  };

  const openGroupDetail = async (type: "weekly" | "footprints" | "completed" | "rounds", title: string) => {
    setDetailTitle(title); setDetailVisibleCount(15); setDetailPeople([]); setDetailLoading(true);
    if (demoMode) {
      const demoCounts = { weekly: 32, footprints: 38, completed: 20, rounds: 20 };
      setDetailPeople(makeDemoPeople(demoCounts[type])); setDetailLoading(false); return;
    }
    try {
      const data = await fetch(`/api/group-details?type=${type}`).then(response => response.json());
      setDetailPeople(Array.isArray(data.people) ? data.people : []);
    } finally { setDetailLoading(false); }
  };

  const openChapterReaders = async (chapterNumber: number) => {
    setDetailTitle(`第 ${chapterNumber} 章｜${chapters[chapterNumber - 1]}`); setDetailVisibleCount(15); setDetailPeople([]); setDetailLoading(true);
    if (demoMode) {
      const demoChapterCounts = [38, 36, 34, 32, 30, 28, 26, 24, 22, 20];
      setDetailPeople(makeDemoPeople(demoChapterCounts[chapterNumber - 1])); setDetailLoading(false); return;
    }
    try {
      const data = await fetch(`/api/chapter-readers?chapter=${chapterNumber}`).then(response => response.json());
      setDetailPeople(Array.isArray(data.readers) ? data.readers : []);
    } finally { setDetailLoading(false); }
  };

  useEffect(() => {
    const isDemo = new URLSearchParams(window.location.search).get("demo") === "1";
    setDemoMode(isDemo);
    void document.fonts.ready;
    milestones.forEach(item => {
      const image = new Image();
      image.src = `/keepsake-${item.at}-illustration.png`;
    });
    if (isDemo) {
      setStats({ weeklyPartners: 32, total: 231, groupChapter: 10, totalRounds: 20, completedReaders: 20, chapterCounts: [38, 36, 34, 32, 30, 28, 26, 24, 22, 20] });
      setName("測試團員 01");
      setPersonalProgress({
        progress: 100,
        readChapters: [1,2,3,4,5,6,7,8,9,10],
        totalCheckins: 12,
        completionRounds: 1,
        reflections: [
          { chapter: 1, text: "從故事的起點看見，在陌生與不安中仍然可以選擇承擔。閱讀後更能理解老師當時踏上旅程所需要的勇氣。", createdAt: Date.now() - 9 * 86400000 },
          { chapter: 4, text: "真正的和平不是逃避困難，而是在混亂中仍願意保護生命、理解別人。這一章讓我重新思考勇敢的意義。", createdAt: Date.now() - 6 * 86400000 },
          { chapter: 7, text: "愛不是抽象的口號，而是在最艱難的時候仍做出對生命有益的選擇。希望自己也能把這份精神帶進日常。", createdAt: Date.now() - 3 * 86400000 },
          { chapter: 10, text: "讀完整本書後，更明白我們明年要演唱的不只是旋律，而是一段關於生命、信仰、愛與和平的見證。", createdAt: Date.now() },
        ],
      });
    }
    else fetch("/api/checkins").then(response => response.json()).then(setStats).catch(() => undefined);
    fetch("/api/roster").then(response => response.json()).then(data => setRoster(Array.isArray(data.members) ? data.members : [])).catch(() => setMessage("名冊載入失敗，請重新整理頁面。"));
  }, []);

  const submitCheckin = async () => {
    if (!name.trim() || !identityConfirmed) { setMessage("請完成身分選擇並確認資料正確。"); return; }
    setSubmitting(true); setMessage(""); setCheckedIn(false); setCompletedRound(null);
    try {
      const response = await fetch("/api/checkins", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name, chapter, reflection }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "登錄失敗，請稍後再試。");
      setCheckedIn(true);
      await loadPersonalProgress(name);
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

  const downloadCertificate = async () => {
    const filename = `CGM完讀獎狀-${name.trim() || "閱讀夥伴"}.png`;
    const delivery = prepareImageDelivery(filename);
    await document.fonts.ready;
    const canvas = document.createElement("canvas"); canvas.width = 1536; canvas.height = 1024;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    const sans = "'Source Han Sans TC','Noto Sans TC','Microsoft JhengHei',sans-serif";
    const background = new Image(); background.src = "/completion-certificate-ornate.png";
    await new Promise<void>((resolve, reject) => { background.onload = () => resolve(); background.onerror = () => reject(new Error("獎狀底圖載入失敗")); });
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
    ctx.textAlign = "center";
    ctx.fillStyle = "#4e5b3b"; ctx.font = `800 24px ${sans}`; ctx.fillText("CGM合唱團 · 2026十月榮耀神", 768, 168);
    ctx.fillStyle = "#292d24"; ctx.font = `900 76px ${sans}`; ctx.fillText("完 讀 獎 狀", 768, 285);
    ctx.fillStyle = "#9f7b3d"; ctx.fillRect(563, 318, 410, 5);
    ctx.fillStyle = "#6c674f"; ctx.font = `700 25px ${sans}`; ctx.fillText("謹頒此狀予", 768, 385);
    ctx.fillStyle = "#292d24"; ctx.font = `900 72px ${sans}`; ctx.fillText(name.trim() || "閱讀夥伴", 768, 480);
    ctx.font = `650 31px ${sans}`; ctx.fillText("完成《戰爭是殘忍的。愛與和平》全書閱讀旅程", 768, 565);
    ctx.font = `500 26px ${sans}`; ctx.fillStyle = "#5e6251"; ctx.fillText("以閱讀更瞭解體會老師，為預備音樂會來獻上榮耀", 768, 625);
    ctx.fillStyle = "#292d24"; ctx.font = `700 21px ${sans}`; ctx.fillText("OCTOBER 2026  ·  READING COMPLETION", 768, 710);
    ctx.fillStyle = "#6f4837"; ctx.font = `900 36px ${sans}`; ctx.fillText("完讀", 768, 872); ctx.font = `800 20px ${sans}`; ctx.fillText("100%", 768, 906);
    await deliverCanvas(canvas, filename, "CGM完讀獎狀", delivery);
  };

  const downloadReflectionCard = async () => {
    const reflections = personalProgress?.reflections ?? [];
    if (!reflections.length) return;
    const filename = `CGM閱讀心得彙總-${name.trim() || "閱讀夥伴"}.png`;
    const delivery = prepareImageDelivery(filename);
    await document.fonts.ready;
    const measureCanvas = document.createElement("canvas"); const measure = measureCanvas.getContext("2d"); if (!measure) return;
    const sans = "'Source Han Sans TC','Noto Sans TC','Microsoft JhengHei',sans-serif";
    measure.font = `600 31px ${sans}`;
    const wrap = (text: string, maxWidth: number) => { const lines: string[] = []; for (const paragraph of text.split("\n")) { if (!paragraph) { lines.push(""); continue; } let line = ""; for (const char of paragraph) { const next = line + char; if (measure.measureText(next).width > maxWidth && line) { lines.push(line); line = char; } else line = next; } if (line) lines.push(line); } return lines; };
    const entries = reflections.map(item => ({ ...item, lines: wrap(item.text, 1000) }));
    const contentHeight = entries.reduce((sum, item) => sum + 92 + Math.max(1, item.lines.length) * 48 + 34, 0);
    const canvas = document.createElement("canvas"); canvas.width = 1200; canvas.height = Math.max(1800, 430 + contentHeight + 150);
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    ctx.fillStyle = "#f3e8ce"; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "rgba(43,43,37,.55)"; ctx.lineWidth = 2; ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60);
    ctx.fillStyle = "#4e5b3b"; ctx.font = `800 25px ${sans}`; ctx.fillText("CGM合唱團 · 2026十月榮耀神", 72, 110);
    ctx.fillStyle = "#292d24"; ctx.font = `900 64px ${sans}`; ctx.fillText("我的閱讀心得旅程", 72, 205);
    ctx.font = `700 30px ${sans}`; ctx.fillText(`${name.trim() || "閱讀夥伴"} · 《戰爭是殘忍的。愛與和平》`, 72, 265);
    ctx.fillStyle = "#9f7b3d"; ctx.fillRect(72, 302, 240, 7);
    let y = 390;
    for (const item of entries) {
      ctx.fillStyle = "#4e5b3b"; ctx.font = `900 25px ${sans}`; ctx.fillText(`第 ${item.chapter} 章｜${chapters[item.chapter - 1]}`, 88, y);
      y += 54; ctx.fillStyle = "rgba(78,91,59,.13)"; ctx.fillRect(72, y - 30, 6, Math.max(58, item.lines.length * 48 + 22));
      ctx.fillStyle = "#292d24"; ctx.font = `600 31px ${sans}`;
      for (const line of item.lines) { ctx.fillText(line, 100, y); y += 48; }
      y += 58;
    }
    ctx.fillStyle = "#292d24"; ctx.font = `700 20px ${sans}`; ctx.fillText("OCTOBER 2026  ·  READING REFLECTIONS", 72, canvas.height - 72);
    await deliverCanvas(canvas, filename, "閱讀心得彙總紀念卡", delivery);
  };

  return (
    <main>
      {demoMode && <div className="front-demo-notice"><strong>前台展示模式</strong><span>目前章節人數與名單皆為測試資料，不會寫入正式紀錄。</span><a href="/">返回正式首頁</a></div>}
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
          <div className="identity-fields">
            <label>區團<select value={selectedRegion} onChange={event => { setSelectedRegion(event.target.value); setSelectedVoice(""); setName(""); setIdentityConfirmed(false); setPersonalProgress(null); }}><option value="">請選擇區團</option>{regions.map(region => <option key={region} value={region}>{region}區</option>)}</select></label>
            <label>聲部<select value={selectedVoice} disabled={!selectedRegion} onChange={event => { setSelectedVoice(event.target.value); setName(""); setIdentityConfirmed(false); setPersonalProgress(null); }}><option value="">請選擇聲部</option>{voices.map(voice => <option key={voice} value={voice}>{voice}</option>)}</select></label>
          </div>
          <label>姓名<select value={name} disabled={!selectedVoice} onChange={event => { const nextName = event.target.value; setName(nextName); setIdentityConfirmed(false); void loadPersonalProgress(nextName); }}><option value="">請選擇姓名</option>{names.map(member => <option key={member.participant_name} value={member.participant_name}>{member.participant_name}</option>)}</select></label>
          {selectedMember && <label className="identity-confirm"><input type="checkbox" checked={identityConfirmed} onChange={event => setIdentityConfirmed(event.target.checked)} /><span>我是 <strong>{selectedMember.region}區／{selectedMember.voice}／{selectedMember.participant_name}</strong>，以上資料正確。</span></label>}
          {name && <section className="saved-progress" aria-live="polite"><div><span>已登記進度</span><strong>{progressLoading ? "讀取中…" : `${personalProgress?.progress ?? 0}%`}</strong></div>{!progressLoading && personalProgress && <><p>已讀章節：{personalProgress.readChapters.length ? personalProgress.readChapters.map(item => `第 ${item} 章`).join("、") : "尚無紀錄"}</p><p>累積登錄 {personalProgress.totalCheckins} 次・完讀 {personalProgress.completionRounds} 輪</p></>}</section>}
          <label>目前讀到<select value={chapter} onChange={e => setChapter(Number(e.target.value))}>{chapters.map((c,i)=><option key={c} value={i+1}>第 {i+1} 章｜{c}</option>)}</select></label>
          <label>閱讀心得（選填）<textarea value={reflection} onChange={event => setReflection(event.target.value.slice(0, 300))} rows={4} maxLength={300} placeholder="簡單寫下今天讀到的內容、感受或想記住的一句話…" /><small className="field-hint">最多 300 字｜{reflection.length}/300</small></label>
          <button className="submit" disabled={submitting || !identityConfirmed} onClick={submitCheckin}>{submitting ? "登錄中…" : "今天讀了一點"}</button>
          {checkedIn && <p className="success">✓ {name || "閱讀夥伴"}，你已為全團點亮第 {chapter} 站！</p>}
          {checkedIn && chapter === 10 && !completedRound && <button className="complete-round" disabled={completing} onClick={completeRound}>{completing ? "記錄中…" : "我已讀完整本，完成本輪"}</button>}
          {completedRound && <div className="completion-success"><strong>完成第 {completedRound} 輪閱讀！</strong><span>這一輪已永久保存。</span><button onClick={startNextRound}>開始下一輪閱讀</button></div>}
          {message && <p className="error">{message}</p>}
        </div>
      </section>

      <section id="together" className="together section">
        <div className="section-heading"><p className="eyebrow">READ TOGETHER</p><h2>我們一起走了多遠</h2><p>點選數字，可以查看一起前進的夥伴。</p></div>
        <div className="stats">
          <button onClick={() => void openGroupDetail("weekly", "本週閱讀夥伴")}><strong>{stats.weeklyPartners}</strong><span>本週閱讀夥伴</span><small>查看名單 →</small></button>
          <button onClick={() => void openGroupDetail("footprints", "累積閱讀足跡")}><strong>{stats.total}</strong><span>累積閱讀足跡</span><small>查看名單 →</small></button>
          <button onClick={() => void openGroupDetail("completed", "完讀夥伴")}><strong>{stats.completedReaders}</strong><span>完讀人數</span><small>查看名單 →</small></button>
          <button onClick={() => void openGroupDetail("rounds", "完讀總輪次")}><strong>{stats.totalRounds}</strong><span>完讀總輪次</span><small>查看名單 →</small></button>
        </div>
      </section>

      <section id="journey" className="journey section">
        <div className="section-heading light"><p className="eyebrow">THE JOURNEY</p><h2>十站閱讀大富翁</h2><p>亮起的站點代表已有夥伴登錄；點一下就能查看實際讀過這一章的人。</p></div>
        <div className="board-route">
          <svg className="board-line" viewBox="0 0 1000 300" aria-hidden="true"><path d="M100 78 H900 V222 H100" /></svg>
          {chapters.map((title, index) => {
            const chapterNumber = index + 1;
            const readers = stats.chapterCounts[index] ?? 0;
            const isMine = personalProgress?.readChapters.includes(chapterNumber) ?? false;
            return <button type="button" style={boardPosition(index)} disabled={readers === 0} className={`board-station ${readers ? "lit" : ""} ${isMine ? "mine" : ""}`} onClick={() => void openChapterReaders(chapterNumber)} key={title}>
              <b>{String(chapterNumber).padStart(2,"0")}</b><span>{title}</span><small>{readers ? `${readers} 人已讀・查看名單` : "等待第一位夥伴"}</small>{isMine && <em>我的足跡 ✓</em>}{rewardByChapter[chapterNumber] && <i>{rewardByChapter[chapterNumber]}</i>}
            </button>;
          })}
        </div>
      </section>

      <section id="souvenirs" className="souvenirs section">
        <div className="section-heading"><p className="eyebrow">READING KEEPSAKES</p><h2>把閱讀旅程，留下來</h2><p>首頁徽章記錄閱讀進度；每抵達一個里程碑，就能下載一張專屬箴言紀念圖卡。</p></div>
        <div className="badge-grid">
          {milestones.map(item => {
            const unlocked = unlockedProgress >= item.at;
            return <article className={unlocked ? "badge unlocked" : "badge locked"} key={item.at}>
              <div className="badge-seal"><b>{item.mark}</b><span>{item.at}%</span></div>
              <small>{unlocked ? "已解鎖" : `閱讀達 ${item.at}% 解鎖`}</small>
              <h3>{item.title}</h3><p>{item.note}</p>
              <button disabled={!unlocked} onClick={() => downloadKeepsake(item)}>{unlocked ? "下載紀念圖卡 ↓" : "尚未解鎖"}</button>
            </article>;
          })}
        </div>
        <div className={`completion-card ${unlockedProgress >= 100 ? "complete" : ""}`}>
          <div className="completion-heading"><p className="eyebrow">COMPLETION KEEPSAKES</p><h3>{name.trim() || "閱讀夥伴"}的完讀紀念</h3><p>完成全書後解鎖兩種專屬紀念；心得卡只在曾填寫閱讀心得時提供。</p><div className="mini-stamps">{milestones.map(item => <i key={item.at}>{item.mark}</i>)}</div></div>
          <div className="completion-downloads">
            <article><span>01</span><div><strong>完讀獎狀</strong><small>記錄完成《戰爭是殘忍的。愛與和平》全書閱讀</small></div><button disabled={unlockedProgress < 100} onClick={downloadCertificate}>{unlockedProgress >= 100 ? "下載完讀獎狀 ↓" : `完成全書後解鎖（目前 ${unlockedProgress}%）`}</button></article>
            <article><span>02</span><div><strong>心得彙總紀念卡</strong><small>{personalProgress?.reflections?.length ? `彙整 ${personalProgress.reflections.length} 則心得，並標示填寫章節` : "尚未填寫閱讀心得，因此不產生這張卡片"}</small></div><button disabled={unlockedProgress < 100 || !(personalProgress?.reflections?.length)} onClick={downloadReflectionCard}>{unlockedProgress < 100 ? "完成全書後解鎖" : personalProgress?.reflections?.length ? "下載心得彙總卡 ↓" : "沒有可彙整的心得"}</button></article>
          </div>
        </div>
      </section>

      <section className="book section"><div><p className="eyebrow">OUR BOOK</p><h2>《戰爭是殘忍的。<br/>愛與和平》</h2><p>鄭明析 著 · 特別精華版 · 448頁</p></div><blockquote>「比起殺人無數的英雄，救人無數的人才是更了不起的英雄。」</blockquote></section>
      <footer>CGM合唱團 · 2026十月榮耀神 <span>一起翻頁，一起走向音樂會。</span></footer>
      {detailTitle && <div className="detail-overlay" role="dialog" aria-modal="true" aria-labelledby="detail-title" onClick={() => setDetailTitle("")}><section className="detail-sheet" onClick={event => event.stopPropagation()}><button className="detail-close" aria-label="關閉名單" onClick={() => setDetailTitle("")}>×</button><p className="eyebrow">READING PARTNERS</p><h2 id="detail-title">{detailTitle}</h2>{detailLoading ? <p className="detail-empty">名單讀取中…</p> : detailPeople.length ? <><p className="detail-total">共 {detailPeople.length} 人</p><div className="detail-list">{detailPeople.slice(0, detailVisibleCount).map(person => <article key={`${person.region}-${person.voice}-${person.participant_name}`}><strong>{person.participant_name}</strong></article>)}</div>{detailVisibleCount < detailPeople.length && <button className="detail-more" type="button" onClick={() => setDetailVisibleCount(count => count + 15)}>顯示更多</button>}</> : <p className="detail-empty">目前還沒有名單。</p>}</section></div>}
    </main>
  );
}
