
/* Coach Academy Topics Portal
   - Pure static hosting (GitHub Pages friendly)
   - Data-driven pages from /data/portal-data.json
   - Multi-page navigation via query string
*/

const DATA_URL = "data/portal-data.json";

const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

function qs(name){
  return new URLSearchParams(location.search).get(name);
}

function setTheme(theme){
  const t = theme === "dark" ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", t);
  localStorage.setItem("ca_theme", t);
}

function initThemeToggle(){
  const saved = localStorage.getItem("ca_theme");
  setTheme(saved || "light");

  const btn = $("#themeToggle");
  if(!btn) return;
  btn.addEventListener("click", () => {
    const cur = document.documentElement.getAttribute("data-theme") || "light";
    setTheme(cur === "dark" ? "light" : "dark");
  });
}

function setBrand(brand){
  const logo = $("#brandLogo");
  const name = $("#brandName");
  const tagline = $("#brandTagline");
  if(logo) logo.src = brand.logo;
  if(name) name.textContent = brand.name;
  if(tagline) tagline.textContent = brand.tagline || "";
}

function setPageTitle(title){
  const el = $("#pageTitle");
  if(el) el.textContent = title;
  document.title = `${title} — Coach Academy`;
}

function breadcrumbs(items){
  const wrap = $("#breadcrumbs");
  if(!wrap) return;
  wrap.innerHTML = items.map((it, i) => {
    if(i === items.length - 1) return `<span>${escapeHtml(it.title)}</span>`;
    return `<a href="${it.href}">${escapeHtml(it.title)}</a><span>›</span>`;
  }).join("");
}

function escapeHtml(s){
  return (s ?? "").toString()
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

function pill(text){ return `<span class="pill">${escapeHtml(text)}</span>`; }

function statusPill(label, ok){
  const cls = ok ? "status-dot status-yes" : "status-dot status-no";
  return `<span class="pill"><span class="${cls}"></span>${escapeHtml(label)}</span>`;
}

async function loadData(){
  const res = await fetch(DATA_URL, { cache: "no-store" });
  if(!res.ok) throw new Error("Failed to load portal-data.json");
  return await res.json();
}

function findTrack(data, trackId){
  return data.tracks.find(t => t.id === trackId);
}
function findSession(track, sessionId){
  return track.sessions.find(s => s.id === sessionId);
}
function findTopic(session, topicId){
  const all = [];
  (session.topics || []).forEach(t => {
    all.push(t);
    (t.children || []).forEach(c => all.push({...c, _parent: t}));
  });
  return all.find(t => t.id === topicId);
}

function renderHome(data){
  setPageTitle("Topics Portal");
  breadcrumbs([{title:"Home", href:"index.html"}]);

  const tracks = $("#tracksList");
  if(tracks){
    tracks.innerHTML = data.tracks.map(t => {
      const hrs = t.totalHours || {};
      return `
        <div class="card">
          <div class="kv" style="margin-bottom:10px">
            <span class="badge">Track</span>
            ${hrs.lecture!=null ? pill(`Lecture: ${hrs.lecture}h`) : ""}
            ${hrs.mentoring!=null ? pill(`Mentoring: ${hrs.mentoring}h`) : ""}
            ${hrs.practice!=null ? pill(`Practice: ${hrs.practice}h`) : ""}
          </div>
          <h3>${escapeHtml(t.title)}</h3>
          <div class="meta">${escapeHtml(t.subtitle || "")}</div>
          <div style="margin-top:14px">
            <a class="btn primary" href="tracks/track.html?id=${encodeURIComponent(t.id)}">Open track</a>
          </div>
        </div>
      `;
    }).join("");
  }

  const inst = $("#instructorsPreview");
  if(inst){
    inst.innerHTML = (data.instructors || []).slice(0,3).map(i => `
      <div class="list-item">
        <div>
          <a href="${i.page}">${escapeHtml(i.name)}</a>
          <div class="meta">${escapeHtml(i.role || "")}</div>
        </div>
        <div class="meta">Profile</div>
      </div>
    `).join("") || `<div class="meta">No instructors yet.</div>`;
  }
}

function renderTrack(data){
  const id = qs("id");
  const track = findTrack(data, id);
  if(!track){
    setPageTitle("Track not found");
    return;
  }
  setPageTitle(track.title);
  breadcrumbs([
    {title:"Home", href:"../index.html"},
    {title:"Tracks", href:"../index.html#tracks"},
    {title:track.title, href:`track.html?id=${encodeURIComponent(track.id)}`}
  ]);

  $("#trackSubtitle").textContent = track.subtitle || "";
  const list = $("#sessionsList");
  list.innerHTML = (track.sessions || []).map(s => `
    <div class="list-item">
      <div>
        <a href="../sessions/session.html?track=${encodeURIComponent(track.id)}&session=${encodeURIComponent(s.id)}">
          Session ${s.number}: ${escapeHtml(s.title)}
        </a>
        <div class="meta">
          ${s.hours ? `Lecture ${s.hours.lecture}h • Mentoring ${s.hours.mentoring}h • Practice ${s.hours.practice}h` : ""}
        </div>
      </div>
      <div class="kv">
        ${pill(`${(s.topics||[]).length} topics`)}
      </div>
    </div>
  `).join("");
}

function renderSession(data){
  const trackId = qs("track");
  const sessionId = qs("session");
  const track = findTrack(data, trackId);
  const session = track ? findSession(track, sessionId) : null;

  if(!track || !session){
    setPageTitle("Session not found");
    return;
  }

  setPageTitle(`Session ${session.number}: ${session.title}`);
  breadcrumbs([
    {title:"Home", href:"../index.html"},
    {title:track.title, href:`../tracks/track.html?id=${encodeURIComponent(track.id)}`},
    {title:`Session ${session.number}`, href:`session.html?track=${encodeURIComponent(track.id)}&session=${encodeURIComponent(session.id)}`}
  ]);

  $("#sessionTitle").textContent = `Session ${session.number}: ${session.title}`;
  $("#sessionMeta").textContent = session.hours
    ? `Lecture ${session.hours.lecture}h • Mentoring ${session.hours.mentoring}h • Practice ${session.hours.practice}h`
    : "";

  const list = $("#topicsList");
  list.innerHTML = (session.topics || []).map(t => {
    const st = t.status || {};
    const children = (t.children || []).map(c => `
      <div class="list-item" style="margin-top:10px">
        <div>
          <a href="../topics/topic.html?track=${encodeURIComponent(track.id)}&session=${encodeURIComponent(session.id)}&topic=${encodeURIComponent(c.id)}">
            ${escapeHtml(c.title)}
          </a>
          <div class="meta">${escapeHtml(c.script || "")}</div>
        </div>
        <div class="kv">
          ${c.minutes!=null ? pill(`${c.minutes} min`) : pill("Extra")}
        </div>
      </div>
    `).join("");

    return `
      <div class="card">
        <div class="kv" style="margin-bottom:10px">
          ${t.minutes!=null ? pill(`${t.minutes} min`) : pill("—")}
          ${t.script ? pill(t.script) : ""}
          ${st.recorded!=null ? statusPill("Recorded", !!st.recorded) : ""}
          ${st.assemDone!=null ? statusPill("Assem Done", !!st.assemDone) : ""}
          ${st.updated!=null ? statusPill("Updated", !!st.updated) : ""}
          ${st.approved!=null ? statusPill("Approved", !!st.approved) : ""}
        </div>

        <h3 style="margin-top:0">
          <a href="../topics/topic.html?track=${encodeURIComponent(track.id)}&session=${encodeURIComponent(session.id)}&topic=${encodeURIComponent(t.id)}"
             style="text-decoration:none;color:inherit">
            ${escapeHtml(t.title)}
          </a>
        </h3>
        ${t.notes ? `<div class="meta">${escapeHtml(t.notes)}</div>` : ""}
        ${children ? `<div style="margin-top:12px">${children}</div>` : ""}
      </div>
    `;
  }).join("");
}

function renderTopic(data){
  const trackId = qs("track");
  const sessionId = qs("session");
  const topicId = qs("topic");

  const track = findTrack(data, trackId);
  const session = track ? findSession(track, sessionId) : null;
  const topic = session ? findTopic(session, topicId) : null;

  if(!track || !session || !topic){
    setPageTitle("Topic not found");
    return;
  }

  setPageTitle(topic.title);
  breadcrumbs([
    {title:"Home", href:"../index.html"},
    {title:track.title, href:`../tracks/track.html?id=${encodeURIComponent(track.id)}`},
    {title:`Session ${session.number}`, href:`../sessions/session.html?track=${encodeURIComponent(track.id)}&session=${encodeURIComponent(session.id)}`},
    {title:topic.title, href:`topic.html?track=${encodeURIComponent(track.id)}&session=${encodeURIComponent(session.id)}&topic=${encodeURIComponent(topic.id)}`}
  ]);

  $("#topicTitle").textContent = topic.title;
  const meta = [];
  if(topic.minutes!=null) meta.push(`${topic.minutes} min`);
  if(topic.script) meta.push(topic.script);
  if(topic._parent) meta.push(`Extra under: ${topic._parent.title}`);
  $("#topicMeta").textContent = meta.join(" • ");

  $("#topicNotes").innerHTML = topic.notes ? `<div class="card">${escapeHtml(topic.notes)}</div>` : "";

  const vids = $("#videosList");
  const videos = topic.videos || [];
  vids.innerHTML = videos.length
    ? videos.map(v => `
        <div class="list-item">
          <div>
            <a href="${v.url}" target="_blank" rel="noopener">${escapeHtml(v.title || v.url)}</a>
            <div class="meta mono">${escapeHtml(v.url)}</div>
          </div>
          <div class="meta">Video</div>
        </div>
      `).join("")
    : `<div class="meta">No videos yet — you will add them here.</div>`;
}

function renderInstructors(data){
  setPageTitle("Instructors");
  breadcrumbs([{title:"Home", href:"../index.html"},{title:"Instructors", href:"index.html"}]);

  const list = $("#instructorsList");
  list.innerHTML = (data.instructors || []).map(i => `
    <div class="list-item">
      <div>
        <a href="../${i.page}">${escapeHtml(i.name)}</a>
        <div class="meta">${escapeHtml(i.role || "")}</div>
      </div>
      <div class="meta">Profile</div>
    </div>
  `).join("") || `<div class="meta">No instructors yet.</div>`;
}

async function boot(){
  initThemeToggle();

  const data = await loadData();
  setBrand(data.brand);

  const page = document.body.getAttribute("data-page");
  if(page === "home") renderHome(data);
  else if(page === "track") renderTrack(data);
  else if(page === "session") renderSession(data);
  else if(page === "topic") renderTopic(data);
  else if(page === "instructors") renderInstructors(data);
}

boot().catch(err => {
  console.error(err);
  const el = document.createElement("div");
  el.className = "container";
  el.innerHTML = `<div class="card"><h3>Failed to load portal</h3><div class="meta">${escapeHtml(err.message)}</div></div>`;
  document.body.prepend(el);
});
