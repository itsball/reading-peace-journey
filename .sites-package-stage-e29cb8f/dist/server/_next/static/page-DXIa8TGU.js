import{t as e}from"./framework~index~page~page~layout~app-page-cache-render~app-page-cache~app-route-handler-dispatch-BhGb9NFq.js";import{t}from"./AdminDashboard-BoaQtCnx.js";import{env as n}from"cloudflare:workers";var r=e(),i=`force-dynamic`;async function a(){return(0,r.jsx)(t,{members:(await n.DB.prepare(`
    SELECT rm.participant_name, rm.region, rm.church, rm.voice, rm.nature,
      COUNT(rc.id) AS total_checkins, COALESCE(MAX(rc.chapter), 0) AS furthest_chapter,
      MAX(rc.created_at) AS last_checkin
    FROM roster_members rm
    LEFT JOIN reading_checkins rc ON rc.participant_key = rm.participant_key
    GROUP BY rm.id
    ORDER BY rm.region DESC, rm.voice, rm.participant_name
  `).all()).results,canExport:!1,role:`同工檢視版`})}export{a as default,i as dynamic};