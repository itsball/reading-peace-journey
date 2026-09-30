import{env as e}from"cloudflare:workers";function t(e){let t=new Intl.DateTimeFormat(`en-CA`,{timeZone:`Asia/Taipei`,year:`numeric`,month:`2-digit`,day:`2-digit`}).formatToParts(new Date(e)),n=e=>t.find(t=>t.type===e)?.value??``;return`${n(`year`)}-${n(`month`)}-${n(`day`)}`}async function n(n){let r=await n.json().catch(()=>null),i=typeof r?.name==`string`?r.name.trim().replace(/\s+/g,` `):``;if(!i||i.length>40)return Response.json({error:`請先輸入姓名。`},{status:400});let a=i.toLocaleLowerCase(`zh-TW`),o=await e.DB.prepare(`
    SELECT
      (SELECT MAX(created_at) FROM reading_checkins WHERE participant_key = ? AND chapter = 10) AS latest_chapter_ten,
      (SELECT MAX(completed_at) FROM reading_completions WHERE participant_key = ?) AS latest_completion
  `).bind(a,a).first();if(!o?.latest_chapter_ten||o.latest_chapter_ten<=(o.latest_completion??0))return Response.json({error:`請先登錄第 10 章，再完成本輪閱讀。`},{status:400});let s=Date.now();try{await e.DB.prepare(`
      INSERT INTO reading_completions (participant_name, participant_key, round_number, completion_day, completed_at)
      SELECT ?, ?, COALESCE(MAX(round_number), 0) + 1, ?, ?
      FROM reading_completions WHERE participant_key = ?
    `).bind(i,a,t(s),s,a).run()}catch{return Response.json({error:`今天已經記錄過完讀，請勿重複登錄。`},{status:409})}let c=await e.DB.prepare(`SELECT COUNT(*) AS rounds FROM reading_completions WHERE participant_key = ?`).bind(a).first();return Response.json({ok:!0,rounds:Number(c?.rounds??1)})}export{n as POST};