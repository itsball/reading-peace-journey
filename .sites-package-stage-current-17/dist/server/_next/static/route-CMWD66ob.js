import{env as e}from"cloudflare:workers";async function t(t){let n=Number(new URL(t.url).searchParams.get(`chapter`));if(!Number.isInteger(n)||n<1||n>10)return Response.json({error:`章節錯誤。`},{status:400});let r=await e.DB.prepare(`
    SELECT c.participant_name, COALESCE(r.region, '') AS region, COALESCE(r.voice, '') AS voice, COUNT(*) AS count
    FROM reading_checkins c
    LEFT JOIN roster_members r ON r.participant_key = c.participant_key
    WHERE c.chapter = ?
    GROUP BY c.participant_key, c.participant_name, r.region, r.voice
    ORDER BY r.region, r.voice, c.participant_name
  `).bind(n).all();return Response.json({readers:r.results??[]})}export{t as GET};