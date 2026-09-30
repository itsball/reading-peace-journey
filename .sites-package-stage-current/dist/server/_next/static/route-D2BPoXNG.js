import{env as e}from"cloudflare:workers";async function t(){let t=Date.now()-10080*60*1e3,n=await e.DB.prepare(`
    SELECT
      COUNT(*) AS total,
      COUNT(DISTINCT CASE WHEN created_at >= ? THEN participant_key END) AS weekly_partners,
      COALESCE(ROUND(AVG(chapter)), 0) AS group_chapter
    FROM reading_checkins
  `).bind(t).first(),r=await e.DB.prepare(`
    SELECT COUNT(*) AS total_rounds, COUNT(DISTINCT participant_key) AS completed_readers
    FROM reading_completions
  `).first();return Response.json({total:Number(n?.total??0),weeklyPartners:Number(n?.weekly_partners??0),groupChapter:Math.max(1,Math.min(10,Number(n?.group_chapter??1))),totalRounds:Number(r?.total_rounds??0),completedReaders:Number(r?.completed_readers??0)})}async function n(t){let n=await t.json().catch(()=>null),r=typeof n?.name==`string`?n.name.trim().replace(/\s+/g,` `):``,i=Number(n?.chapter),a=(typeof n?.reflection==`string`?n.reflection:typeof n?.mood==`string`?n.mood:``).trim().replace(/\r\n/g,`
`)||null;return!r||r.length>40||!Number.isInteger(i)||i<1||i>10||(a?.length??0)>300?Response.json({error:`請輸入姓名並選擇正確章節。`},{status:400}):(await e.DB.prepare(`
    INSERT INTO reading_checkins (participant_name, participant_key, chapter, mood, created_at)
    VALUES (?, ?, ?, ?, ?)
  `).bind(r,r.toLocaleLowerCase(`zh-TW`),i,a,Date.now()).run(),Response.json({ok:!0}))}export{t as GET,n as POST};