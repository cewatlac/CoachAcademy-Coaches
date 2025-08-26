/**
 * Coach Academy — Anonymized Template Renderer
 * - Loads JSON data from site-data.json
 * - Sanitizes personal fields (ignored from render)
 * - Renders hero, metrics, partners, tracks, coaches, FAQ, footer
 */

// === CONFIG: keys to strip/ignore (won't render) ===
const PERSONAL_KEYS = new Set([
  // from your sheet — any direct identifiers
  "Email Address","Your Work Phone Number","Your WhatsApp Number","Your Work Gmail",
  "Date of Birth","ID Front / Back PDF Only","Signed CA NDA","Signed CA Coaches Policy",
  "Facebook URL","LinkedIn URL","CV","Your Address","Bank Account / Smart Wallet",
  "Bank Name","Bank Branch","Bank Account","Bank Account Holder's Name",
  "Instapay Account","Smart Wallet Number",
  // URLs that could identify the person directly (we keep Codeforces only as rating text if you prefer later)
  "ICPCID URl","Codeforces Handel URL","Vjudge URL"
]);

// optional: decide which public fields we DO allow from coach object
const ALLOWED_COACH_PUBLIC = new Set([
  "role","university","achievements","skills","projects","photo","segments",
  "experience_ca","experience_other","coach_level","max_hours_per_week","availability_start",
  "open_to_extra_tasks"
]);

// Helper: create element
const el = (tag, attrs = {}, ...children) => {
  const node = document.createElement(tag);
  Object.entries(attrs).forEach(([k,v]) => {
    if (k === "class") node.className = v;
    else if (k.startsWith("data-")) node.setAttribute(k, v);
    else if (k === "html") node.innerHTML = v;
    else node.setAttribute(k, v);
  });
  children.flat().forEach(c => {
    if (c == null) return;
    if (typeof c === "string") node.appendChild(document.createTextNode(c));
    else node.appendChild(c);
  });
  return node;
};

// Sanitize a raw "coach" object (possibly includes personal fields)
function sanitizeCoach(raw) {
  const sanitized = {};
  // Allow safe public fields if present
  for (const key of Object.keys(raw)) {
    if (PERSONAL_KEYS.has(key)) continue; // drop personal
    if (ALLOWED_COACH_PUBLIC.has(key)) sanitized[key] = raw[key];
  }
  // Defaults
  if (!sanitized.role) sanitized.role = "Software & Competitive Programming Coach";
  if (!sanitized.skills) sanitized.skills = [];
  if (!sanitized.achievements) sanitized.achievements = [];
  if (!sanitized.projects) sanitized.projects = [];
  if (!sanitized.university) sanitized.university = "";
  return sanitized;
}

function setAttrIf(elm, attr, val) {
  if (!val) return;
  elm.setAttribute(attr, val);
}

// Render Hero
function renderHero(hero, contacts) {
  document.getElementById("hero-title").textContent = hero.headline || "Build Real-World Tech Skills, Guided by Industry Experts.";
  document.getElementById("hero-sub").textContent = hero.subline || "Gain hands-on experience and elevate your coding proficiency with live, interactive classes designed to empower your tech career.";
  document.getElementById("hero-eyebrow").textContent = hero.eyebrow || "Specialized training for career success";
  document.getElementById("hero-card-title").textContent = hero.cardTitle || "Practical, Project-Based Learning";
  document.getElementById("hero-card-sub").textContent = hero.cardSub || "Led by top tech mentors";

  const cta1 = document.getElementById("hero-cta1");
  cta1.textContent = hero.ctaText || "Join Now";
  cta1.href = hero.ctaLink || (contacts?.whatsapp ? `https://wa.me/${contacts.whatsapp}` : "#");

  const navWa = document.getElementById("nav-whatsapp");
  navWa.textContent = "WhatsApp";
  navWa.href = contacts?.whatsapp ? `https://wa.me/${contacts.whatsapp}` : "#";

  const badgesWrap = document.getElementById("hero-badges");
  badgesWrap.innerHTML = "";
  (hero.badges || []).forEach(b => {
    const badge = el("div", { class:"badge" },
      el("div", { class:"badge-value" }, b.value || ""),
      el("div", { class:"badge-label" }, b.label || "")
    );
    badgesWrap.appendChild(badge);
  });
}

// Render Metrics
function renderMetrics(metrics) {
  const grid = document.getElementById("metrics-grid");
  grid.innerHTML = "";
  (metrics || []).forEach(m => {
    grid.appendChild(
      el("div", { class:"metric" },
        el("div", { class:"metric-value" }, m.value || ""),
        el("div", { class:"metric-label" }, m.label || "")
      )
    );
  });
}

// Render Partners
function renderPartners(partners) {
  const wrap = document.getElementById("partners-logos");
  wrap.innerHTML = "";
  (partners || []).forEach(p => {
    // p can be string (name) or object {name, logo}
    if (typeof p === "string") {
      wrap.appendChild(el("img", { src:"assets/partner-placeholder.png", alt: `${p} logo`, title:p }));
    } else {
      wrap.appendChild(el("img", { src: p.logo || "assets/partner-placeholder.png", alt: `${p.name || "Partner"} logo`, title: p.name || "Partner" }));
    }
  });
}

// Render Tracks
function renderTracks(tracks, config) {
  if (config?.title) document.getElementById("tracks-title").textContent = config.title;
  if (config?.sub) document.getElementById("tracks-sub").textContent = config.sub;

  const grid = document.getElementById("tracks-grid");
  grid.innerHTML = "";
  (tracks || []).forEach(t => {
    grid.appendChild(
      el("article", { class:"track-card" },
        el("img", { class:"track-img", src: t.image || "assets/track-placeholder.jpg", alt: t.title || "Track" }),
        el("div", { class:"track-content" },
          el("h4", { class:"track-title" }, t.title || ""),
          el("div", { class:"track-meta" },
            el("span", { class:"pill" }, t.audience || ""),
            el("span", { class:"pill" }, t.hours || "")
          ),
          el("p", { class:"track-desc" }, t.desc || ""),
          el("a", { class:"btn btn-outline", target:"_blank", rel:"noopener", href: t.link || "#" }, "Learn More")
        )
      )
    );
  });
}

// Render Coaches
function renderCoaches(rawCoaches, contacts) {
  const grid = document.getElementById("coaches-grid");
  grid.innerHTML = "";

  (rawCoaches || []).forEach(c => {
    const coach = sanitizeCoach(c); // strip personal
    const tags = (coach.skills || []).slice(0, 10).map(s => el("li", {}, s));

    const achievements = el("ul", { class:"bullets" },
      ...((coach.achievements||[]).map(x => el("li", {}, x)))
    );
    const projects = el("ul", { class:"bullets" },
      ...((coach.projects||[]).map(x => el("li", {}, x)))
    );

    const card = el("article", { class:"coach-card" },
      el("div", {},
        el("img", { class:"coach-photo", src: coach.photo || "assets/coach-photo-placeholder.jpg", alt:"Coach photo" })
      ),
      el("div", { class:"coach-body" },
        el("h4", { class:"coach-role" }, coach.role),
        el("ul", { class:"coach-tags" }, tags),
        el("div", { class:"coach-grid" },
          el("div", {},
            el("h5", { class:"coach-subtitle" }, "Snapshot"),
            el("ul", { class:"bullets" },
              ...(coach.snapshot || [
                "Problem Solving, Algorithms & Data Structures",
                "Back-end with Node.js & Express",
                "MongoDB & SQL (design, performance)",
                "Git/GitHub, Code Review & CI basics"
              ]).map(x => el("li", {}, x))
            ),
            el("h5", { class:"coach-subtitle" }, "Projects"),
            projects
          ),
          el("div", {},
            coach.university ? el("div", {},
              el("h5", { class:"coach-subtitle" }, "Education"),
              el("p", { class:"muted" , html: coach.university })
            ) : null,
            (coach.achievements?.length ? el("div", {},
              el("h5", { class:"coach-subtitle" }, "Competitive Programming"),
              achievements
            ) : null)
          )
        ),
        el("div", { class:"coach-cta" },
          el("div", { class:"note" }, "This profile intentionally hides personal identifiers (name, phone, emails, social links). Coach Academy will share details upon request during later hiring stages."),
          el("a", {
            class:"btn btn-primary",
            target:"_blank",
            rel:"noopener",
            href: contacts?.whatsapp ? `https://wa.me/${contacts.whatsapp}?text=Hello%20Coach%20Academy%2C%20I%27m%20interested%20in%20this%20coach.` : "#"
          }, "Contact on WhatsApp")
        )
      )
    );
    grid.appendChild(card);
  });
}

// Render FAQ
function renderFAQ(items, title) {
  if (title) document.getElementById("faq-title").textContent = title;
  const list = document.getElementById("faq-list");
  list.innerHTML = "";
  (items || []).forEach((f, i) => {
    const det = el("details", { class:"faq-item", ...(i===0 ? {open:""} : {}) },
      el("summary", {}, f.q || ""),
      el("div", { class:"faq-body", html: f.a || "" })
    );
    list.appendChild(det);
  });
}

// Render Footer
function renderFooter(footer, contacts) {
  document.getElementById("footer-blurb").textContent = footer.blurb || "Gain hands-on experience and elevate your coding proficiency with live, interactive classes designed to empower your tech career.";
  const cta = document.getElementById("footer-cta");
  cta.textContent = footer.ctaText || "Join Now";
  cta.href = footer.ctaLink || (contacts?.whatsapp ? `https://wa.me/${contacts.whatsapp}` : "#");

  // Links
  const linksUl = document.getElementById("footer-links"); linksUl.innerHTML = "";
  (footer.links || [
    {label:"Home", href:"#"},
    {label:"Programs", href:"#tracks"},
    {label:"Coaches", href:"#coaches"},
    {label:"FAQ", href:"#faq"},
    {label:"Contact", href:"#"}
  ]).forEach(l => linksUl.appendChild(el("li", {}, el("a", { href:l.href || "#"}, l.label || ""))));

  // Contact
  const contactUl = document.getElementById("footer-contact"); contactUl.innerHTML = "";
  if (footer.address) contactUl.appendChild(el("li", {}, footer.address));
  if (footer.email_public) contactUl.appendChild(el("li", {}, el("a", { href:`mailto:${footer.email_public}`}, footer.email_public)));
  if (contacts?.whatsapp) contactUl.appendChild(el("li", {}, el("a", { href:`tel:+${contacts.whatsapp}`}, `(+${contacts.whatsapp.slice(0,2)}) ${contacts.whatsapp.slice(2)}`)));

  // Social
  const socialWrap = document.getElementById("footer-social"); socialWrap.innerHTML = "";
  const social = footer.social || {};
  Object.entries(social).forEach(([k,v]) => {
    if (!v) return;
    socialWrap.appendChild(el("a", { href:v, target:"_blank", rel:"noopener" }, k.charAt(0).toUpperCase()+k.slice(1)));
  });

  // Hours
  document.getElementById("footer-hours").innerHTML = footer.hours ? `<strong>Work Hours</strong><br>${footer.hours}` : "";

  // Copy
  document.getElementById("copyright").textContent = footer.copyright || `© ${new Date().getFullYear()} Coach Academy — All rights reserved.`;
}

// Load JSON & render
(async function init(){
  try{
    const res = await fetch("site-data.json", { cache:"no-store" });
    const data = await res.json();

    // global styling overrides (optional)
    if (data.brand?.primary) {
      document.documentElement.style.setProperty("--brand", data.brand.primary);
    }
    if (data.brand?.gradient2) {
      document.documentElement.style.setProperty("--brand-2", data.brand.gradient2);
    }

    // Hero
    renderHero(data.hero || {}, data.contacts || { whatsapp: "201102919193" });

    // Metrics
    renderMetrics(data.metrics || []);

    // Partners
    renderPartners(data.partners || []);

    // Tracks
    renderTracks(data.tracks || [], data.tracks_config || {});

    // Coaches (sanitize inside)
    renderCoaches(data.coaches || [], data.contacts || { whatsapp: "201102919193" });

    // FAQ
    renderFAQ(data.faq?.items || [], data.faq?.title);

    // Subscribe (toggle)
    if (data.subscribe?.enabled === false) {
      document.getElementById("subscribe-section").style.display = "none";
    } else {
      document.getElementById("subscribe-title").textContent = data.subscribe?.title || "Subscribe Now!";
      document.getElementById("subscribe-sub").textContent = data.subscribe?.sub || "Know everything new about our waves, rounds and offers.";
    }

    // Footer
    renderFooter(data.footer || {}, data.contacts || { whatsapp: "201102919193" });

  }catch(err){
    console.error("Failed to load site-data.json", err);
  }
})();
