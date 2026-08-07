(() => {
  "use strict";

  const STORAGE_KEY = "life-timeline-events.v1";
  const DAY_MS = 86400000;
  const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const BASE_START = new Date(2023, 0, 1);

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

  // ---------- zoom / speed tuning ----------
  const BASE_PX_PER_DAY = 72;   // idle / slow scroll — full day-level detail
  const MIN_PX_PER_DAY = 2;     // fast scroll — compressed, years fly by
  const DAY_TICK_MIN_PXPERDAY = 14;
  const DAY_NUMBER_MIN_PXPERDAY = 26;
  const SPEED_DECAY = 0.88;

  // ---------- DOM refs ----------
  const stageEl = document.getElementById("stage");
  const contentEl = document.getElementById("content");
  const dateBarDateEl = document.getElementById("dateBarDate");
  const addFabEl = document.getElementById("addFab");
  const addPanelEl = document.getElementById("addPanel");
  const addFormEl = document.getElementById("addForm");
  const progressFillEl = document.getElementById("progressFill");

  // ---------- state ----------
  let events = loadEvents();
  const openIds = new Set();
  let range = { minIdx: 0, maxIdx: 0, todayIdx: 0 };
  let dayNodes = [];
  const dayEls = new Map();
  const eventEls = new Map();
  let cursorIdx = 0;
  let smoothedSpeed = 0;
  let lastWheelTime = 0;
  let dayTicksVisible = null;
  let stageW = 0, stageH = 0, playheadY = 0, isMobile = false, lineOffsetX = 0;
  let decayLoopRunning = false;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------- persistence ----------
  function loadEvents() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length) return parsed;
      }
    } catch (e) { /* fall through */ }
    return DEFAULT_EVENTS.map(e => ({ ...e }));
  }
  function saveEvents() { localStorage.setItem(STORAGE_KEY, JSON.stringify(events)); }
  function genId() { return "evt-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 7); }

  // ---------- helpers ----------
  function esc(str) {
    return String(str).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
  function startOfDay(d) { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; }
  function dayIndexOf(date) { return Math.round((startOfDay(date) - BASE_START) / DAY_MS); }
  function dateFromDayIndex(idx) { return new Date(BASE_START.getTime() + idx * DAY_MS); }
  function isoDate(d) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }
  function formatFullDate(d) {
    return d.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  }

  // ---------- range + static day list ----------
  function getRange() {
    const today = startOfDay(new Date());
    let minIdx = 0;
    let maxIdx = dayIndexOf(today);
    events.forEach(ev => {
      const idx = dayIndexOf(new Date(ev.date + "T00:00:00"));
      if (idx < minIdx) minIdx = idx;
      if (idx > maxIdx) maxIdx = idx;
    });
    return { minIdx, maxIdx, todayIdx: dayIndexOf(today) };
  }

  function rebuildStatic() {
    // clear old day elements
    dayEls.forEach(el => el.remove());
    dayEls.clear();
    dayTicksVisible = null;

    range = getRange();
    dayNodes = [];
    for (let idx = range.minIdx; idx <= range.maxIdx; idx++) {
      const d = dateFromDayIndex(idx);
      dayNodes.push({
        dayIdx: idx,
        date: d,
        isToday: idx === range.todayIdx,
        isYearStart: d.getMonth() === 0 && d.getDate() === 1,
        isMonthStart: d.getDate() === 1,
      });
    }
    dayNodes.forEach(buildDayElement);
  }

  function eventsByDayIndex() {
    const map = {};
    events.forEach(ev => {
      const idx = dayIndexOf(new Date(ev.date + "T00:00:00"));
      (map[idx] = map[idx] || []).push(ev);
    });
    return map;
  }

  // ---------- element builders ----------
  function buildDayElement(node) {
    const el = document.createElement("div");
    el.className = "t-item";
    if (node.isToday) {
      el.classList.add("t-today");
      el.innerHTML = `<div class="node__marker"></div><div class="node__label">Today</div>`;
    } else if (node.isYearStart) {
      el.classList.add("t-year");
      el.innerHTML = `<div class="node__marker"></div><div class="node__label">${node.date.getFullYear()}</div>`;
    } else if (node.isMonthStart) {
      el.classList.add("t-month");
      el.innerHTML = `<div class="node__marker"></div><div class="node__label">${MONTH_NAMES[node.date.getMonth()]}</div>`;
    } else {
      el.classList.add("t-day");
      el.innerHTML = `<div class="node__marker"></div><div class="node__label">${node.date.getDate()}</div>`;
    }
    contentEl.appendChild(el);
    dayEls.set(node.dayIdx, el);
    return el;
  }

  function categoryOptions(selected) {
    return Object.entries(CATEGORIES).map(([key, cat]) =>
      `<option value="${key}" ${key === selected ? "selected" : ""}>${cat.label}</option>`
    ).join("");
  }

  function formFields(v) {
    return `
      <div class="event-form__row">
        <div class="field">
          <label>Date</label>
          <input type="date" name="date" required value="${esc(v.date)}" />
        </div>
        <div class="field field--emoji" style="max-width:76px">
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

  function eventViewBody(ev, cat) {
    return `
      <div class="event-card__panel-body">
        <span class="event-card__cat">${cat.label}</span>
        <p class="event-card__desc">${ev.desc ? esc(ev.desc) : "No notes yet."}</p>
        <div class="event-card__actions">
          <button type="button" class="btn" data-action="edit">Edit</button>
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
            <button type="button" class="btn btn--danger" data-action="delete">Delete</button>
          </div>
        </form>
      </div>`;
  }

  function buildEventElement(ev, side) {
    const cat = CATEGORIES[ev.category] || CATEGORIES.personal;
    const el = document.createElement("div");
    el.className = `t-item t-event side-${side}`;
    el.dataset.id = ev.id;
    el.innerHTML = `
      <div class="node__marker" style="--cat-color:${cat.color}"></div>
      <div class="event-card" style="--cat-color:${cat.color}">
        <button class="event-card__head" type="button" data-action="toggle">
          <span class="event-card__emoji">${esc(ev.emoji || "📌")}</span>
          <div class="event-card__headtext">
            <span class="event-card__date">${formatFullDate(new Date(ev.date + "T00:00:00")).replace(/^\w+,\s/, "")}</span>
            <span class="event-card__title">${esc(ev.title)}</span>
          </div>
          <span class="event-card__chevron">⌄</span>
        </button>
        <div class="event-card__panel">
          <div class="event-card__panel-inner" data-panel="${esc(ev.id)}">
            ${eventViewBody(ev, cat)}
          </div>
        </div>
      </div>`;
    contentEl.appendChild(el);
    eventEls.set(ev.id, el);
    return el;
  }

  function rebuildEvents() {
    eventEls.forEach(el => el.remove());
    eventEls.clear();
    events
      .slice()
      .sort((a, b) => a.date.localeCompare(b.date))
      .forEach((ev, i) => buildEventElement(ev, i % 2 === 0 ? "left" : "right"));
  }

  function renderLegend() {
    document.getElementById("legend").innerHTML = Object.entries(CATEGORIES).map(([key, cat]) => `
      <div class="legend__item"><span class="legend__dot" style="background:${cat.color}"></span><span>${cat.label}</span></div>
    `).join("");
  }

  // ---------- CRUD ----------
  function addEvent(data) {
    const id = genId();
    events.push({ id, ...data });
    saveEvents();
    const idx = dayIndexOf(new Date(data.date + "T00:00:00"));
    const rangeChanged = idx < range.minIdx || idx > range.maxIdx;
    if (rangeChanged) rebuildStatic();
    rebuildEvents();
    closeAddPanel();
    cursorIdx = clamp(idx, range.minIdx, range.maxIdx);
    openIds.add(id);
    const el = eventEls.get(id);
    if (el) el.querySelector(".event-card").classList.add("open");
    render();
  }
  function updateEvent(id, data) {
    const idx2 = events.findIndex(e => e.id === id);
    if (idx2 === -1) return;
    events[idx2] = { ...events[idx2], ...data };
    saveEvents();
    const dIdx = dayIndexOf(new Date(data.date + "T00:00:00"));
    const rangeChanged = dIdx < range.minIdx || dIdx > range.maxIdx;
    if (rangeChanged) rebuildStatic();
    rebuildEvents();
    const el = eventEls.get(id);
    if (el) el.querySelector(".event-card").classList.add("open");
    render();
  }
  function deleteEvent(id) {
    events = events.filter(e => e.id !== id);
    openIds.delete(id);
    saveEvents();
    rebuildEvents();
    render();
  }

  // ---------- interaction: view/edit/delete ----------
  function toggleOpen(id) {
    const el = eventEls.get(id);
    if (!el) return;
    const card = el.querySelector(".event-card");
    const isOpen = card.classList.toggle("open");
    if (isOpen) openIds.add(id); else openIds.delete(id);
  }
  function enterEdit(id) {
    const ev = events.find(e => e.id === id);
    if (!ev) return;
    const el = eventEls.get(id);
    if (!el) return;
    el.querySelector(".event-card__panel-inner").innerHTML = eventEditBody(ev);
    el.querySelector(".event-card").classList.add("open");
    openIds.add(id);
  }
  function exitEdit(id) {
    const ev = events.find(e => e.id === id);
    if (!ev) return;
    const cat = CATEGORIES[ev.category] || CATEGORIES.personal;
    const el = eventEls.get(id);
    if (!el) return;
    el.querySelector(".event-card__panel-inner").innerHTML = eventViewBody(ev, cat);
  }
  function handleDeleteClick(id, btn) {
    if (btn.dataset.armed === "1") { deleteEvent(id); return; }
    btn.dataset.armed = "1";
    btn.textContent = "Confirm delete?";
    btn.classList.add("is-armed");
    setTimeout(() => {
      if (btn.isConnected) { btn.dataset.armed = ""; btn.textContent = "Delete"; btn.classList.remove("is-armed"); }
    }, 3000);
  }

  contentEl.addEventListener("click", e => {
    const actionEl = e.target.closest("[data-action]");
    if (!actionEl) return;
    const wrap = actionEl.closest("[data-id]");
    const id = wrap ? wrap.dataset.id : null;
    const action = actionEl.dataset.action;
    if (action === "toggle") toggleOpen(id);
    else if (action === "edit") enterEdit(id);
    else if (action === "cancel-edit") exitEdit(id);
    else if (action === "delete") handleDeleteClick(id, actionEl);
  });

  contentEl.addEventListener("submit", e => {
    const form = e.target.closest(".event-form");
    if (!form || form.dataset.mode !== "edit") return;
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
    updateEvent(form.dataset.id, data);
  });

  // ---------- add panel ----------
  function openAddPanel() {
    const d = dateFromDayIndex(Math.round(cursorIdx));
    addFormEl.innerHTML = `
      ${formFields({ date: isoDate(d), emoji: "📌", category: "personal", title: "", desc: "" })}
      <div class="event-form__actions">
        <button type="submit" class="btn btn--primary">Add to timeline</button>
        <button type="button" class="btn" data-action="close-add">Cancel</button>
      </div>`;
    addPanelEl.hidden = false;
    requestAnimationFrame(() => addPanelEl.classList.add("open"));
    const titleInput = addFormEl.querySelector('input[name="title"]');
    if (titleInput) titleInput.focus();
  }
  function closeAddPanel() {
    addPanelEl.classList.remove("open");
    setTimeout(() => { addPanelEl.hidden = true; }, 250);
  }

  addFabEl.addEventListener("click", () => {
    if (addPanelEl.classList.contains("open")) closeAddPanel();
    else openAddPanel();
  });
  addPanelEl.addEventListener("click", e => {
    if (e.target.closest('[data-action="close-add"]')) closeAddPanel();
  });
  addFormEl.addEventListener("submit", e => {
    e.preventDefault();
    const fd = new FormData(addFormEl);
    const data = {
      date: fd.get("date"),
      emoji: (fd.get("emoji") || "").trim() || "📌",
      title: (fd.get("title") || "").trim(),
      category: fd.get("category"),
      desc: (fd.get("desc") || "").trim(),
    };
    if (!data.title || !data.date) return;
    addEvent(data);
  });

  // ---------- geometry ----------
  function measure() {
    const r = stageEl.getBoundingClientRect();
    stageW = r.width;
    stageH = r.height;
    playheadY = stageH * 0.44;
    isMobile = window.innerWidth <= 720;
    lineOffsetX = isMobile ? 26 : stageW / 2;
  }

  // ---------- zoom ----------
  function zoomFactor(speed) {
    const t = clamp(speed / 46, 0, 1);
    return Math.pow(t, 0.55);
  }
  function currentPxPerDay() {
    if (reducedMotion) return BASE_PX_PER_DAY;
    const z = zoomFactor(smoothedSpeed);
    return BASE_PX_PER_DAY + (MIN_PX_PER_DAY - BASE_PX_PER_DAY) * z;
  }

  // ---------- render (per frame) ----------
  function render() {
    const pxPerDay = currentPxPerDay();

    // years / months / today — always update (small count)
    dayNodes.forEach(node => {
      if (!node.isYearStart && !node.isMonthStart && !node.isToday) return;
      const el = dayEls.get(node.dayIdx);
      if (!el) return;
      const y = playheadY + (cursorIdx - node.dayIdx) * pxPerDay;
      el.style.transform = `translate(-50%, ${y.toFixed(1)}px)`;
    });

    // day ticks — gated by zoom level
    const showDays = pxPerDay >= DAY_TICK_MIN_PXPERDAY;
    if (showDays !== dayTicksVisible) {
      dayNodes.forEach(node => {
        if (node.isYearStart || node.isMonthStart || node.isToday) return;
        const el = dayEls.get(node.dayIdx);
        if (el) el.style.display = showDays ? "block" : "none";
      });
      dayTicksVisible = showDays;
    }
    if (showDays) {
      const showNumbers = pxPerDay >= DAY_NUMBER_MIN_PXPERDAY;
      dayNodes.forEach(node => {
        if (node.isYearStart || node.isMonthStart || node.isToday) return;
        const el = dayEls.get(node.dayIdx);
        if (!el) return;
        const y = playheadY + (cursorIdx - node.dayIdx) * pxPerDay;
        el.style.transform = `translate(-50%, ${y.toFixed(1)}px)`;
        el.classList.toggle("show-number", showNumbers);
      });
    }

    // events
    eventEls.forEach((el, id) => {
      const ev = events.find(e => e.id === id);
      if (!ev) return;
      const idx = dayIndexOf(new Date(ev.date + "T00:00:00"));
      const y = playheadY + (cursorIdx - idx) * pxPerDay;
      el.style.transform = `translate(-50%, ${y.toFixed(1)}px)`;
      const dist = Math.abs(y - playheadY);
      const fade = clamp(1 - dist / (stageH * 0.62), 0.12, 1);
      el.style.opacity = fade.toFixed(2);
    });

    // date bar + progress
    const cursorDate = dateFromDayIndex(Math.round(cursorIdx));
    dateBarDateEl.textContent = formatFullDate(cursorDate);
    const span = range.maxIdx - range.minIdx || 1;
    const pct = clamp(((range.maxIdx - cursorIdx) / span) * 100, 0, 100);
    progressFillEl.style.width = pct + "%";
  }

  // ---------- input: wheel / touch / keyboard ----------
  function normalizeDeltaY(e) {
    let d = e.deltaY;
    if (e.deltaMode === 1) d *= 18;
    else if (e.deltaMode === 2) d *= stageH || window.innerHeight;
    return d;
  }

  function applyDelta(deltaPx, dtMs) {
    const dt = Math.max(1, dtMs);
    const instSpeed = (Math.abs(deltaPx) / dt) * 16;
    smoothedSpeed = instSpeed;
    const pxPerDay = currentPxPerDay();
    const daysDelta = deltaPx / pxPerDay;
    // scrolling down (positive delta) moves toward the past (smaller day index)
    cursorIdx = clamp(cursorIdx - daysDelta, range.minIdx, range.maxIdx);
    render();
    startDecayLoop();
  }

  function startDecayLoop() {
    if (decayLoopRunning) return;
    decayLoopRunning = true;
    function tick() {
      smoothedSpeed *= SPEED_DECAY;
      if (smoothedSpeed < 0.4) {
        smoothedSpeed = 0;
        render();
        decayLoopRunning = false;
        return;
      }
      render();
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  stageEl.addEventListener("wheel", e => {
    e.preventDefault();
    const now = performance.now();
    const dt = now - (lastWheelTime || now - 16);
    lastWheelTime = now;
    applyDelta(normalizeDeltaY(e), dt);
  }, { passive: false });

  let touchLastY = null;
  let touchLastTime = 0;
  stageEl.addEventListener("touchstart", e => {
    touchLastY = e.touches[0].clientY;
    touchLastTime = performance.now();
  }, { passive: true });
  stageEl.addEventListener("touchmove", e => {
    e.preventDefault();
    const y = e.touches[0].clientY;
    const now = performance.now();
    if (touchLastY !== null) {
      const delta = touchLastY - y;
      applyDelta(delta, now - touchLastTime);
    }
    touchLastY = y;
    touchLastTime = now;
  }, { passive: false });
  stageEl.addEventListener("touchend", () => { touchLastY = null; });

  stageEl.addEventListener("keydown", e => {
    let days = 0;
    if (e.key === "ArrowDown") days = -1;
    else if (e.key === "ArrowUp") days = 1;
    else if (e.key === "PageDown") days = -30;
    else if (e.key === "PageUp") days = 30;
    else if (e.key === "Home") { cursorIdx = range.maxIdx; render(); e.preventDefault(); return; }
    else if (e.key === "End") { cursorIdx = range.minIdx; render(); e.preventDefault(); return; }
    if (days !== 0) {
      e.preventDefault();
      cursorIdx = clamp(cursorIdx + days, range.minIdx, range.maxIdx);
      smoothedSpeed = 0;
      render();
    }
  });

  window.addEventListener("resize", () => { measure(); render(); });

  // ---------- init ----------
  renderLegend();
  rebuildStatic();
  rebuildEvents();
  cursorIdx = range.maxIdx;
  measure();
  render();
})();
