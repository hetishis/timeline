(() => {
  "use strict";

  const STORAGE_KEY = "life-timeline-events.v1";
  const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const BASE_START = { year: 2023, month: 0 };

  const CATEGORIES = {
    personal:  { label: "Personal",  color: "var(--c-personal)" },
    career:    { label: "Career",    color: "var(--c-career)" },
    travel:    { label: "Travel",    color: "var(--c-travel)" },
    milestone: { label: "Milestone", color: "var(--c-milestone)" },
    health:    { label: "Health",    color: "var(--c-health)" },
  };

  const DEFAULT_EVENTS = [
    { id: "seed-1",  date: "2023-01-14", title: "New Year, new habits", category: "personal", emoji: "🌱", desc: "Started a morning routine that actually stuck (for a few months, anyway)." },
    { id: "seed-2",  date: "2023-02-27", title: "Started a new role", category: "career", emoji: "💼", desc: "Joined a new team and spent the first weeks just trying to remember everyone's names." },
    { id: "seed-3",  date: "2023-03-19", title: "Weekend in Lisbon", category: "travel", emoji: "✈️", desc: "Three days of pastel de nata, steep streets, and getting pleasantly lost." },
    { id: "seed-4",  date: "2023-05-06", title: "Ran a 10k", category: "health", emoji: "🏃", desc: "First race in years. Finished slower than planned, felt better than expected." },
    { id: "seed-5",  date: "2023-06-22", title: "Moved apartments", category: "milestone", emoji: "📦", desc: "Discovered how many boxes of cables one person can accumulate." },
    { id: "seed-6",  date: "2023-08-11", title: "Summer road trip", category: "travel", emoji: "🚗", desc: "A loosely planned week along the coast with too many playlists and not enough sunscreen." },
    { id: "seed-7",  date: "2023-09-02", title: "Picked up the guitar again", category: "personal", emoji: "🎸", desc: "Dusted off an old habit. The calluses came back faster than expected." },
    { id: "seed-8",  date: "2023-11-17", title: "Led first big project", category: "career", emoji: "🚀", desc: "Shipped something that actually mattered — and didn't break on launch day." },
    { id: "seed-9",  date: "2023-12-24", title: "Quiet holidays", category: "personal", emoji: "🎄", desc: "A slower, simpler end to the year than usual — in a good way." },
    { id: "seed-10", date: "2024-01-09", title: "Set three real goals", category: "milestone", emoji: "🎯", desc: "Wrote down three things instead of a vague list of resolutions. Kept two." },
    { id: "seed-11", date: "2024-02-14", title: "Weekend getaway", category: "travel", emoji: "💌", desc: "Nothing fancy — just good food and no phones for two days." },
    { id: "seed-12", date: "2024-04-03", title: "Started therapy", category: "health", emoji: "🧠", desc: "Took a while to book the first appointment. Glad I finally did." },
    { id: "seed-13", date: "2024-05-25", title: "Learned to say no", category: "personal", emoji: "🙅", desc: "Turned down a project that wasn't the right fit — and didn't feel guilty about it." },
    { id: "seed-14", date: "2024-07-08", title: "Two weeks in Japan", category: "travel", emoji: "🗾", desc: "Trains, ramen, and far too many photos of vending machines." },
    { id: "seed-15", date: "2024-09-14", title: "Promoted", category: "career", emoji: "📈", desc: "The extra responsibility arrived a week before the extra confidence did." },
    { id: "seed-16", date: "2024-10-30", title: "Adopted a cat", category: "milestone", emoji: "🐱", desc: "The apartment now has an opinionated third resident." },
    { id: "seed-17", date: "2024-12-31", title: "Reflected on the year", category: "personal", emoji: "🥂", desc: "Wrote it all down instead of just letting it blur into the next year." },
    { id: "seed-18", date: "2025-02-20", title: "Trained for a half marathon", category: "health", emoji: "🏅", desc: "Turns out the hardest part is getting out the door in February." },
    { id: "seed-19", date: "2025-03-11", title: "Side project launched", category: "career", emoji: "🛠️", desc: "Small, scrappy, and actually used by a few hundred people." },
    { id: "seed-20", date: "2025-05-17", title: "Family reunion", category: "personal", emoji: "👨‍👩‍👧‍👦", desc: "First time everyone was in the same place in three years." },
    { id: "seed-21", date: "2025-07-04", title: "Backpacking through the Alps", category: "travel", emoji: "🏔️", desc: "Ten days, four countries, and legs that complained the whole way." },
    { id: "seed-22", date: "2025-09-22", title: "Changed cities", category: "milestone", emoji: "🏙️", desc: "A bigger move than expected — new city, new routines, new coffee shop." },
    { id: "seed-23", date: "2025-11-05", title: "Spoke at a conference", category: "career", emoji: "🎤", desc: "Nervous for weeks, fine within the first thirty seconds on stage." },
    { id: "seed-24", date: "2026-01-15", title: "New year, quieter goals", category: "personal", emoji: "📝", desc: "Fewer goals this time, chosen more carefully." },
    { id: "seed-25", date: "2026-03-08", title: "Ran a half marathon", category: "health", emoji: "🏃‍♀️", desc: "The training from last year finally paid off." },
    { id: "seed-26", date: "2026-05-30", title: "Weekend in the mountains", category: "travel", emoji: "⛰️", desc: "No plan beyond a cabin, a trail, and bad instant coffee." },
    { id: "seed-27", date: "2026-07-19", title: "Started a new chapter", category: "milestone", emoji: "🌅", desc: "Nothing dramatic — just a quiet sense that things are shifting for the better." },
  ];

  const nodesEl = document.getElementById("nodes");
  const timelineEl = document.getElementById("timeline");
  const lineFillEl = document.getElementById("lineFill");
  const progressFillEl = document.getElementById("progressFill");

  let events = loadEvents();
  const openIds = new Set();
  let firstRender = true;
  let revealObserver = null;

  // ---------- persistence ----------
  function loadEvents() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length) return parsed;
      }
    } catch (e) { /* fall through to defaults */ }
    return DEFAULT_EVENTS.map(e => ({ ...e }));
  }
  function saveEvents() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  }
  function genId() {
    return "evt-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 7);
  }

  // ---------- helpers ----------
  function esc(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }
  function formatDate(dateStr) {
    const d = new Date(dateStr + "T00:00:00");
    return `${MONTH_NAMES[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  }
  function getRange() {
    const today = new Date();
    let minY = BASE_START.year, minM = BASE_START.month;
    let maxY = today.getFullYear(), maxM = today.getMonth();
    events.forEach(ev => {
      const d = new Date(ev.date + "T00:00:00");
      const y = d.getFullYear(), m = d.getMonth();
      if (y < minY || (y === minY && m < minM)) { minY = y; minM = m; }
      if (y > maxY || (y === maxY && m > maxM)) { maxY = y; maxM = m; }
    });
    return { minY, minM, maxY, maxM, todayY: today.getFullYear(), todayM: today.getMonth() };
  }

  // ---------- build node sequence (newest first) ----------
  function buildNodes() {
    const { minY, minM, maxY, maxM } = getRange();
    const eventsByKey = {};
    events.forEach(ev => {
      const d = new Date(ev.date + "T00:00:00");
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      (eventsByKey[key] = eventsByKey[key] || []).push({ ...ev, day: d.getDate() });
    });
    Object.values(eventsByKey).forEach(list => list.sort((a, b) => b.day - a.day));

    const nodes = [{ type: "add" }, { type: "today" }];
    let sideToggle = 0;

    for (let year = maxY; year >= minY; year--) {
      nodes.push({ type: "year", year });
      const first = year === maxY ? maxM : 11;
      const last = year === minY ? minM : 0;
      for (let month = first; month >= last; month--) {
        nodes.push({ type: "month", year, month });
        const key = `${year}-${month}`;
        (eventsByKey[key] || []).forEach(ev => {
          nodes.push({ type: "event", event: ev, side: sideToggle % 2 === 0 ? "left" : "right" });
          sideToggle++;
        });
      }
    }
    return nodes;
  }

  // ---------- markup ----------
  function categoryOptions(selected) {
    return Object.entries(CATEGORIES).map(([key, cat]) =>
      `<option value="${key}" ${key === selected ? "selected" : ""}>${cat.label}</option>`
    ).join("");
  }

  function formFields(ev) {
    const v = ev || { date: new Date().toISOString().slice(0, 10), emoji: "📌", category: "personal", title: "", desc: "" };
    return `
      <div class="event-form__row">
        <div class="field">
          <label>Date</label>
          <input type="date" name="date" required value="${esc(v.date)}" />
        </div>
        <div class="field field--emoji" style="max-width:80px">
          <label>Icon</label>
          <input type="text" name="emoji" maxlength="4" value="${esc(v.emoji)}" />
        </div>
      </div>
      <div class="field">
        <label>Title</label>
        <input type="text" name="title" required maxlength="80" value="${esc(v.title)}" placeholder="What happened?" />
      </div>
      <div class="field">
        <label>Category</label>
        <select name="category">${categoryOptions(v.category)}</select>
      </div>
      <div class="field">
        <label>Notes</label>
        <textarea name="desc" maxlength="400" placeholder="A little more detail (optional)">${esc(v.desc || "")}</textarea>
      </div>`;
  }

  function eventPanelBody(ev, cat) {
    return `
      <div class="event-card__panel-body">
        <span class="event-card__cat">${cat.label}</span>
        <p class="event-card__desc">${ev.desc ? esc(ev.desc) : "No notes yet."}</p>
        <div class="event-card__actions">
          <button type="button" class="btn" data-action="edit">Edit</button>
          <button type="button" class="btn btn--danger" data-action="delete">Delete</button>
        </div>
      </div>`;
  }

  function eventEditBody(ev) {
    return `
      <div class="event-card__panel-body">
        <form class="event-form" data-mode="edit" data-id="${esc(ev.id)}">
          ${formFields(ev)}
          <div class="event-form__actions">
            <button type="submit" class="btn btn--primary">Save changes</button>
            <button type="button" class="btn" data-action="cancel-edit">Cancel</button>
          </div>
        </form>
      </div>`;
  }

  function renderNode(node) {
    if (node.type === "add") {
      const open = openIds.has("__add__") ? "open" : "";
      return `
        <div class="node node--add" data-id="__add__">
          <div class="node__marker">+</div>
          <div class="event-card add-card ${open}">
            <button class="event-card__head" type="button" data-action="toggle">
              <span class="event-card__emoji">＋</span>
              <div class="event-card__headtext"><span class="event-card__title">Add an event</span></div>
              <span class="event-card__chevron">⌄</span>
            </button>
            <div class="event-card__panel">
              <div class="event-card__panel-inner">
                <div class="event-card__panel-body">
                  <form class="event-form" data-mode="add">
                    ${formFields(null)}
                    <div class="event-form__actions">
                      <button type="submit" class="btn btn--primary">Add to timeline</button>
                      <button type="button" class="btn" data-action="cancel-add">Cancel</button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>`;
    }
    if (node.type === "year") {
      return `
        <div class="node node--year">
          <div class="node__marker"></div>
          <div class="node__label">${node.year}</div>
        </div>`;
    }
    if (node.type === "month") {
      return `
        <div class="node node--month">
          <div class="node__marker"></div>
          <div class="node__label">${MONTH_NAMES[node.month]}</div>
        </div>`;
    }
    if (node.type === "today") {
      return `
        <div class="node node--today">
          <div class="node__marker"></div>
          <div class="node__label">Today</div>
        </div>`;
    }
    if (node.type === "event") {
      const ev = node.event;
      const cat = CATEGORIES[ev.category] || CATEGORIES.personal;
      const open = openIds.has(ev.id);
      return `
        <div class="node node--event side-${node.side}" data-id="${esc(ev.id)}">
          <div class="node__marker" style="--cat-color:${cat.color}"></div>
          <div class="event-card side-${node.side} ${open ? "open" : ""}" style="--cat-color:${cat.color}">
            <button class="event-card__head" type="button" data-action="toggle">
              <span class="event-card__emoji">${esc(ev.emoji || "📌")}</span>
              <div class="event-card__headtext">
                <span class="event-card__date">${formatDate(ev.date)}</span>
                <span class="event-card__title">${esc(ev.title)}</span>
              </div>
              <span class="event-card__chevron">⌄</span>
            </button>
            <div class="event-card__panel">
              <div class="event-card__panel-inner" data-panel="${esc(ev.id)}">
                ${eventPanelBody(ev, cat)}
              </div>
            </div>
          </div>
        </div>`;
    }
    return "";
  }

  function renderLegend() {
    document.getElementById("legend").innerHTML = Object.entries(CATEGORIES).map(([key, cat]) => `
      <div class="legend__item">
        <span class="legend__dot" style="background:${cat.color}"></span>
        <span>${cat.label}</span>
      </div>
    `).join("");
  }

  // ---------- render ----------
  function render(focusId) {
    nodesEl.innerHTML = buildNodes().map(renderNode).join("");

    if (firstRender) {
      setupScrollReveal();
      firstRender = false;
    } else {
      nodesEl.querySelectorAll(".event-card, .node--year .node__label, .node--month .node__label")
        .forEach(el => el.classList.add("in-view"));
      if (revealObserver) {
        nodesEl.querySelectorAll(".event-card, .node--year .node__label, .node--month .node__label")
          .forEach(el => revealObserver.unobserve(el));
      }
    }

    refreshParallaxTargets();
    updateScrollEffects();

    if (focusId) {
      const target = nodesEl.querySelector(`[data-id="${CSS.escape(focusId)}"]`);
      if (target) target.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  // ---------- CRUD ----------
  function addEvent(data) {
    const id = genId();
    events.push({ id, ...data });
    saveEvents();
    openIds.delete("__add__");
    openIds.add(id);
    render(id);
  }
  function updateEvent(id, data) {
    const idx = events.findIndex(e => e.id === id);
    if (idx === -1) return;
    events[idx] = { ...events[idx], ...data };
    saveEvents();
    render(id);
  }
  function deleteEvent(id) {
    events = events.filter(e => e.id !== id);
    openIds.delete(id);
    saveEvents();
    render();
  }

  // ---------- interaction ----------
  function toggleOpen(id) {
    const card = nodesEl.querySelector(`[data-id="${CSS.escape(id)}"] .event-card`);
    if (!card) return;
    const isOpen = card.classList.toggle("open");
    if (isOpen) openIds.add(id); else openIds.delete(id);
  }

  function enterEdit(id) {
    const ev = events.find(e => e.id === id);
    if (!ev) return;
    const panel = nodesEl.querySelector(`.event-card__panel-inner[data-panel="${CSS.escape(id)}"]`);
    if (!panel) return;
    panel.innerHTML = eventEditBody(ev);
    openIds.add(id);
    const card = panel.closest(".event-card");
    if (card) card.classList.add("open");
  }

  function exitEdit(id) {
    const ev = events.find(e => e.id === id);
    if (!ev) return;
    const cat = CATEGORIES[ev.category] || CATEGORIES.personal;
    const panel = nodesEl.querySelector(`.event-card__panel-inner[data-panel="${CSS.escape(id)}"]`);
    if (panel) panel.innerHTML = eventPanelBody(ev, cat);
  }

  function handleDeleteClick(id, btn) {
    if (btn.dataset.armed === "1") {
      deleteEvent(id);
      return;
    }
    btn.dataset.armed = "1";
    btn.textContent = "Confirm delete?";
    btn.classList.add("is-armed");
    setTimeout(() => {
      if (btn.isConnected) {
        btn.dataset.armed = "";
        btn.textContent = "Delete";
        btn.classList.remove("is-armed");
      }
    }, 3000);
  }

  nodesEl.addEventListener("click", e => {
    const actionEl = e.target.closest("[data-action]");
    if (!actionEl) return;
    const action = actionEl.dataset.action;
    const nodeEl = actionEl.closest("[data-id]");
    const id = nodeEl ? nodeEl.dataset.id : null;

    if (action === "toggle") toggleOpen(id);
    else if (action === "edit") enterEdit(id);
    else if (action === "cancel-edit") exitEdit(id);
    else if (action === "cancel-add") { openIds.delete("__add__"); render(); }
    else if (action === "delete") handleDeleteClick(id, actionEl);
  });

  nodesEl.addEventListener("submit", e => {
    const form = e.target.closest(".event-form");
    if (!form) return;
    e.preventDefault();
    const fd = new FormData(form);
    const data = {
      date: fd.get("date"),
      emoji: (fd.get("emoji") || "").trim() || "📌",
      title: (fd.get("title") || "").trim(),
      category: fd.get("category"),
      desc: (fd.get("desc") || "").trim(),
    };
    if (!data.title || !data.date) return;

    if (form.dataset.mode === "add") addEvent(data);
    else updateEvent(form.dataset.id, data);
  });

  // ---------- scroll reveal (first render only) ----------
  function setupScrollReveal() {
    const targets = nodesEl.querySelectorAll(".event-card, .node--month .node__label, .node--year .node__label");
    revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });
    targets.forEach(t => revealObserver.observe(t));
  }

  // ---------- scroll progress + parallax ----------
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let parallaxTargets = [];
  let ticking = false;

  function refreshParallaxTargets() {
    parallaxTargets = Array.from(nodesEl.querySelectorAll(".node--event"));
  }

  function updateScrollEffects() {
    ticking = false;
    const rect = timelineEl.getBoundingClientRect();
    const viewportH = window.innerHeight;
    const viewportMid = viewportH * 0.5;
    const total = rect.height;
    const filled = Math.min(Math.max(viewportMid - rect.top, 0), total);
    const pct = total > 0 ? (filled / total) * 100 : 0;
    lineFillEl.style.height = pct + "%";
    progressFillEl.style.width = pct + "%";

    if (!reducedMotion) {
      parallaxTargets.forEach(el => {
        const r = el.getBoundingClientRect();
        const cardMid = r.top + r.height / 2;
        const dist = viewportMid - cardMid;
        const offset = Math.max(-16, Math.min(16, dist * 0.06));
        el.style.transform = `translateY(${offset.toFixed(1)}px)`;
      });
    }
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(updateScrollEffects);
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);

  // ---------- init ----------
  renderLegend();
  render();
  updateScrollEffects();
})();
