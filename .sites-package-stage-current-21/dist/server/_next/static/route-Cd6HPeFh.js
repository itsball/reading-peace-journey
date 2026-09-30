import{env as e}from"cloudflare:workers";async function t(t){let n=new URL(t.url).searchParams.get(`name`)?.trim().replace(/\s+/g,` `)??``;if(!n||n.length>40)return Response.json({error:`請選擇姓名。`},{status:400});let r=n.toLocaleLowerCase(`zh-TW`);if(!await e.DB.prepare(`SELECT 1 FROM roster_members WHERE participant_key = ? LIMIT 1`).bind(r).first())return Response.json({error:`找不到這位團員。`},{status:404});let i=await e.DB.prepare(`
    SELECT chapter, COUNT(*) AS checkins
    FROM reading_checkins
    WHERE participant_key = ?
    GROUP BY chapter
    ORDER BY chapter
  `).bind(r).all(),a=await e.DB.prepare(`
    SELECT COUNT(*) AS rounds FROM reading_completions WHERE participant_key = ?
  `).bind(r).first(),o=await e.DB.prepare(`
    SELECT chapter, mood AS text, created_at
    FROM reading_checkins
    WHERE participant_key = ? AND mood IS NOT NULL AND TRIM(mood) <> ''
    ORDER BY chapter, created_at
  `).bind(r).all(),s=(i.results??[]).map(e=>Number(e.chapter)).filter(e=>e>=1&&e<=10),c=(i.results??[]).reduce((e,t)=>e+Number(t.checkins),0);return Response.json({progress:s.length*10,readChapters:s,totalCheckins:c,completionRounds:Number(a?.rounds??0),reflections:(o.results??[]).map(e=>({chapter:Number(e.chapter),text:e.text,createdAt:Number(e.created_at)}))})}export{t as GET};