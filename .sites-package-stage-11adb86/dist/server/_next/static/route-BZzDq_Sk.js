import{env as e}from"cloudflare:workers";var t=new Set([`平靜`,`驚訝`,`感動`,`思考`]);async function n(){let t=Date.now()-10080*60*1e3,n=await e.DB.prepare(`
    SELECT
      COUNT(*) AS total,
      COUNT(DISTINCT CASE WHEN created_at >= ? THEN participant_key END) AS weekly_partners,
      COALESCE(ROUND(AVG(chapter)), 0) AS group_chapter
    FROM reading_checkins
  `).bind(t).first(),r=await e.DB.prepare(`
    SELECT COUNT(*) AS total_rounds, COUNT(DISTINCT participant_key) AS completed_readers
    FROM reading_completions
  `).first();return Response.json({total:Number(n?.total??0),weeklyPartners:Number(n?.weekly_partners??0),groupChapter:Math.max(1,Math.min(10,Number(n?.group_chapter??1))),totalRounds:Number(r?.total_rounds??0),completedReaders:Number(r?.completed_readers??0)})}async function r(n){let r=await n.json().catch(()=>null),i=typeof r?.name==`string`?r.name.trim().replace(/\s+/g,` `):``,a=Number(r?.chapter),o=typeof r?.mood==`string`&&t.has(r.mood)?r.mood:null;return!i||i.length>40||!Number.isInteger(a)||a<1||a>10?Response.json({error:`請輸入姓名並選擇正確章節。`},{status:400}):(await e.DB.prepare(`
    INSERT INTO reading_checkins (participant_name, participant_key, chapter, mood, created_at)
    VALUES (?, ?, ?, ?, ?)
  `).bind(i,i.toLocaleLowerCase(`zh-TW`),a,o,Date.now()).run(),Response.json({ok:!0}))}export{n as GET,r as POST};