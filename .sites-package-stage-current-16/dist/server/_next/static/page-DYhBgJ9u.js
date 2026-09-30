import{n as e}from"./navigation-errors-C_eqQM43.js";import"./navigation.react-server-Ds_OuyGt.js";import{l as t}from"./headers-Dr21A5cA.js";import{t as n}from"./framework~index~page~page~layout~app-page-cache-render~app-page-cache~app-route-handler-dispatch-BhGb9NFq.js";import{t as r}from"./AdminDashboard-BoaQtCnx.js";import{env as i}from"cloudflare:workers";var a=`oai-authenticated-user-id`,o=`oai-authenticated-user-email`,s=`oai-authenticated-user-full-name`,c=`oai-authenticated-user-full-name-encoding`,l=`percent-encoded-utf-8`,u=`/signin-with-chatgpt`,d=`/signout-with-chatgpt`,f=`/callback`;async function p(){let e=await t(),n=e.get(a),r=e.get(o);if(!n||!r)return null;let i=e.get(s),u=i&&e.get(c)===l?y(i):null;return{userId:n,displayName:u??r,email:r,fullName:u}}async function m(t){let n=await p();if(n)return n;e(h(t))}function h(e){let t=_(e);return`${u}?return_to=${encodeURIComponent(t)}`}function g(e=`/`){let t=_(e);return`${d}?return_to=${encodeURIComponent(t)}`}function _(e){if(!e.startsWith(`/`)||e.startsWith(`//`))return`/`;let t;try{t=new URL(e,`https://app.local`)}catch{return`/`}return t.origin!==`https://app.local`||v(t.pathname)?`/`:`${t.pathname}${t.search}${t.hash}`}function v(e){return e===u||e===d||e===f}function y(e){try{return decodeURIComponent(e)}catch{return null}}var b=n(),x=`force-dynamic`;async function S(){let e=(await m(`/admin`)).email.toLocaleLowerCase(),t=!!(i.ADMIN_EMAIL&&e===i.ADMIN_EMAIL.toLocaleLowerCase()),n=(i.CORE_TEAM_EMAILS||``).split(`,`).map(e=>e.trim().toLocaleLowerCase()).filter(Boolean).includes(e);return!t&&!n?(0,b.jsx)(`main`,{className:`admin`,children:(0,b.jsxs)(`section`,{children:[(0,b.jsx)(`h1`,{children:`無法查看名單`}),(0,b.jsx)(`p`,{children:`這個頁面只開放給管理員與核心同工。`}),(0,b.jsx)(`a`,{href:g(`/admin`),children:`切換帳號`})]})}):(0,b.jsx)(r,{members:(await i.DB.prepare(`
    WITH checkin_totals AS (
      SELECT participant_key, COUNT(*) AS total_checkins, MAX(chapter) AS furthest_chapter, MAX(created_at) AS last_checkin
      FROM reading_checkins GROUP BY participant_key
    ), completion_totals AS (
      SELECT participant_key, COUNT(*) AS completion_rounds FROM reading_completions GROUP BY participant_key
    )
    SELECT rm.participant_name, rm.region, rm.church, rm.voice, rm.nature,
      COALESCE(ct.total_checkins, 0) AS total_checkins, COALESCE(ct.furthest_chapter, 0) AS furthest_chapter,
      ct.last_checkin, COALESCE(cp.completion_rounds, 0) AS completion_rounds
    FROM roster_members rm
    LEFT JOIN checkin_totals ct ON ct.participant_key = rm.participant_key
    LEFT JOIN completion_totals cp ON cp.participant_key = rm.participant_key
    ORDER BY rm.region DESC, rm.voice, rm.participant_name
  `).all()).results,canExport:t,role:t?`管理員`:`核心同工`})}export{S as default,x as dynamic};