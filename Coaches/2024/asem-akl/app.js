(async function init(){
  const res = await fetch("site-data.json", { cache: "no-store" });
  const data = await res.json();

  // brand color override
  if (data.brand?.primary) {
    document.documentElement.style.setProperty("--brand", data.brand.primary);
  }
  if (data.brand?.gradient2) {
    document.documentElement.style.setProperty("--brand-2", data.brand.gradient2);
  }

  // WhatsApp in header & buttons
  const wa = data.contacts?.whatsapp ? `https://wa.me/${data.contacts.whatsapp}` : "#";
  const navWa = document.getElementById("nav-whatsapp");
  navWa.href = wa;
  const heroCta = document.getElementById("hero-cta1");
  heroCta.href = wa;
  const aboutCta = document.getElementById("about-cta");
  aboutCta.href = wa;

  // Hero copy & badges
  document.getElementById("hero-title").textContent = data.coach?.role || "Software & Competitive Programming Coach";
  document.getElementById("hero-sub").textContent = data.hero?.subline || "Practical, project-based mentoring with SWE & CP focus.";
  document.getElementById("hero-eyebrow").textContent = data.hero?.eyebrow || "Coach Academy";

  const badgesWrap = document.getElementById("hero-badges");
  (data.hero?.badges || []).forEach(b=>{
    const div = document.createElement("div");
    div.className = "badge";
    div.innerHTML = `<div class="badge-value">${b.value || ""}</div><div>${b.label || ""}</div>`;
    badgesWrap.appendChild(div);
  });

  // Metrics
  const metricsGrid = document.getElementById("metrics-grid");
  (data.metrics || []).forEach(m=>{
    const div = document.createElement("div");
    div.className = "metric";
    div.innerHTML = `<div class="metric-value">${m.value || ""}</div><div class="metric-label">${m.label || ""}</div>`;
    metricsGrid.appendChild(div);
  });

  // Coach card
  document.getElementById("coach-role").textContent = data.coach?.role || "";
  document.getElementById("coach-university").textContent = data.coach?.university || "";

  // photo
  const ph = data.coach?.photo || "assets/coach-photo-placeholder.jpg";
  document.getElementById("coach-photo").src = ph;
  document.getElementById("coach-photo-hero").src = ph;

  // snapshot default or from JSON
  const snapshotUl = document.getElementById("coach-snapshot");
  const snapshot = data.coach?.snapshot?.length ? data.coach.snapshot : [
    "Problem Solving, Algorithms & Data Structures",
    "Back-end with Node.js & Express",
    "MongoDB & SQL (design, performance)",
    "Git/GitHub, Code Review & CI basics"
  ];
  snapshot.forEach(s=>{
    const li = document.createElement("li");
    li.textContent = s;
    snapshotUl.appendChild(li);
  });

  // skills
  const skillsUl = document.getElementById("coach-skills");
  (data.coach?.skills || []).forEach(s=>{
    const li = document.createElement("li"); li.textContent = s; skillsUl.appendChild(li);
  });

  // allowed links (no personal links like Facebook/LinkedIn/emails/phones)
  const linksWrap = document.getElementById("coach-links");
  [["ICPC ID","icpcid"],["Codeforces","codeforces"],["Vjudge","vjudge"]].forEach(([label,key])=>{
    const url = data.coach?.links?.[key];
    if(!url) return;
    const a = document.createElement("a");
    a.href = url; a.target="_blank"; a.rel="noopener";
    a.textContent = label;
    linksWrap.appendChild(a);
  });

  // achievements
  const achUl = document.getElementById("achievements-list");
  (data.coach?.achievements || []).forEach(a=>{
    const li = document.createElement("li"); li.textContent = a; achUl.appendChild(li);
  });

  // projects
  const prUl = document.getElementById("projects-list");
  (data.coach?.projects || []).forEach(p=>{
    const li = document.createElement("li"); li.textContent = p; prUl.appendChild(li);
  });

  // FAQ
  document.getElementById("faq-title").textContent = data.faq?.title || "Frequently Asked Questions";
  const faqList = document.getElementById("faq-list");
  (data.faq?.items || []).forEach((f,i)=>{
    const det = document.createElement("details");
    det.className = "faq-item";
    if(i===0) det.open = true;
    det.innerHTML = `<summary>${f.q}</summary><div class="faq-body">${f.a}</div>`;
    faqList.appendChild(det);
  });

  // Footer
  document.getElementById("footer-blurb").textContent = data.footer?.blurb || "";
  const fcta = document.getElementById("footer-cta");
  fcta.textContent = data.footer?.ctaText || "Join Now";
  fcta.href = wa;

  const linksUl = document.getElementById("footer-links");
  (data.footer?.links || []).forEach(l=>{
    const li = document.createElement("li");
    li.innerHTML = `<a href="${l.href || '#'}">${l.label || ''}</a>`;
    linksUl.appendChild(li);
  });

  const contactUl = document.getElementById("footer-contact");
  if (data.footer?.address) {
    const li = document.createElement("li"); li.textContent = data.footer.address; contactUl.appendChild(li);
  }
  if (data.footer?.email_public) {
    const li = document.createElement("li"); li.textContent = data.footer.email_public; contactUl.appendChild(li);
  }
  document.getElementById("copyright").textContent = data.footer?.copyright || `© ${new Date().getFullYear()} Coach Academy — All rights reserved.`;
})();
