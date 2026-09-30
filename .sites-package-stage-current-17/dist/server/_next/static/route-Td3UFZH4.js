import{env as e}from"cloudflare:workers";async function t(){let t=await e.DB.prepare(`
    SELECT participant_name, region, voice
    FROM roster_members
    ORDER BY region, voice, participant_name
  `).all();return Response.json({members:t.results??[]})}export{t as GET};