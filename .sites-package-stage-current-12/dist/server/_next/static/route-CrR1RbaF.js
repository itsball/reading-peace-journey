import{env as e}from"cloudflare:workers";async function t(){let t=await e.DB.prepare(`
    SELECT participant_name, region, church, voice
    FROM roster_members
    ORDER BY region, church, voice, participant_name
  `).all();return Response.json({members:t.results??[]})}export{t as GET};