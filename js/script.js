(() => {
  "use strict";

  const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  const CATEGORIES = {
    personal:  { label: "Personal",  color: "var(--c-personal)" },
    career:    { label: "Career",    color: "var(--c-career)" },
    travel:    { label: "Travel",    color: "var(--c-travel)" },
    milestone: { label: "Milestone", color: "var(--c-milestone)" },
    health:    { label: "Health",    color: "var(--c-health)" },
  };

  // Placeholder events — swap these out for your own life events.
  const EVENTS = [
    { date: "2023-01-14", title: "New Year, new habits", category: "personal", emoji: "🌱", desc: "Started a morning routine that actually stuck (for a few months, anyway)." },
    { date: "2023-02-27", title: "Started a new role", category: "career", emoji: "💼", desc: "Joined a new team and spent the first weeks just trying to remember everyone's names." },
    { date: "2023-03-19", title: "Weekend in Lisbon", category: "travel", emoji: "✈️", desc: "Three days of pastel de nata, steep streets, and getting pleasantly lost." },
    { date: "2023-05-06", title: "Ran a 10k", category: "health", emoji: "🏃", desc: "First race in years. Finished slower than planned, felt better than expected." },
    { date: "2023-06-22", title: "Moved apartments", category: "milestone", emoji: "📦", desc: "Discovered how many boxes of cables one person can accumulate." },
    { date: "2023-08-11", title: "Summer road trip", category: "travel", emoji: "🚗", desc: "A loosely planned week along the coast with too many playlists and not enough sunscreen." },
    { date: "2023-09-02", title: "Picked up the guitar again", category: "personal", emoji: "🎸", desc: "Dusted off an old habit. The calluses came back faster than expected." },
    { date: "2023-11-17", title: "Led first big project", category: "career", emoji: "🚀", desc: "Shipped something that actually mattered — and didn't break on launch day." },
    { date: "2023-12-24", title: "Quiet holidays", category: "personal", emoji: "🎄", desc: "A slower, simpler end to the year than usual — in a good way." },
    { date: "2024-01-09", title: "Set three real goals", category: "milestone", emoji: "🎯", desc: "Wrote down three things instead of a vague list of resolutions. Kept two." },
    { date: "2024-02-14", title: "Weekend getaway", category: "travel", emoji: "💌", desc: "Nothing fancy — just good food and no phones for two days." },
    { date: "2024-04-03", title: "Started therapy", category: "health", emoji: "🧠", desc: "Took a while to book the first appointment. Glad I finally did." },
    { date: "2024-05-25", title: "Learned to say no", category: "personal", emoji: "🙅", desc: "Turned down a project that wasn't the right fit — and didn't feel guilty about it." },
    { date: "2024-07-08", title: "Two weeks in Japan", category: "travel", emoji: "🗾", desc: "Trains, ramen, and far too many photos of vending machines." },
    { date: "2024-09-14", title: "Promoted", category: "career", emoji: "📈", desc: "The extra responsibility arrived a week before the extra confidence did." },
    { date: "2024-10-30", title: "Adopted a cat", category: "milestone", emoji: "🐱", desc: "The apartment now has an opinionated third resident." },
    { date: "2024-12-31", title: "Reflected on the year", category: "personal", emoji: "🥂", desc: "Wrote it all down instead of just letting it blur into the next year." },
    { date: "2025-02-20", title: "Trained for a half marathon", category: "health", emoji: "🏅", desc: "Turns out the hardest part is getting out the door in February." },
    { date: "2025-03-11", title: "Side project launched", category: "career", emoji: "🛠️", desc: "Small, scrappy, and actually used by a few hundred people." },
    { date: "2025-05-17", title: "Family reunion", category: "personal", emoji: "👨‍👩‍👧‍👦", desc: "First time everyone was in the same place in three years." },
    { date: "2025-07-04", title: "Backpacking through the Alps", category: "travel", emoji: "🏔️", desc: "Ten days, four countries, and legs that complained the whole way." },
    { date: "2025-09-22", title: "Changed cities", category: "milestone", emoji: "🏙️", desc: "A bigger move than expected — new city, new routines, new coffee shop." },
    { date: "2025-11-05", title: "Spoke at a conference", category: "career", emoji: "🎤", desc: "Nervous for weeks, fine within the first thirty seconds on stage." },
    { date: "2026-01-15", title: "New year, quieter goals", category: "personal", emoji: "📝", desc: "Fewer goals this time, chosen more carefully." },
    { date: "2026-03-08", title: "Ran a half marathon", category: "health", emoji: "🏃‍♀️", desc: "The training from last year finally paid off." },
    { date: "2026-05-30", title: "Weekend in the mountains", category: "travel", emoji: "⛰️", desc: "No plan beyond a cabin, a trail, and bad instant coffee." },
    { date: "2026-07-19", title: "Started a new chapter", category: "milestone", emoji: "🌅", desc: "Nothing dramatic — just a quiet sense that things are shifting for the better." },
  ];

  const START_YEAR = 2023;
  const START_MONTH = 0; // January
  const today = new Date();
  const END_YEAR = today.getFullYear();
  const END_MONTH = today.getMonth();

  function buildNodes() {
    const nodes = [];
    const eventsByKey = {};
    EVENTS.forEach(ev => {
      const d = new Date(ev.date + "T00:00:00");
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      (eventsByKey[key] = eventsByKey[key] || []).push({ ...ev, day: d.getDate() });
    });
    Object.values(eventsByKey).forEach(list => list.sort((a, b) => a.day - b.day));

    let sideToggle = 0;

    outer:
    for (let year = START_YEAR; year <= END_YEAR; year++) {
      const firstMonth = year === START_YEAR ? START_MONTH : 0;
      const lastMonth = year === END_YEAR ? END_MONTH : 11;

      nodes.push({ type: "year", year });

      for (let month = firstMonth; month <= lastMonth; month++) {
        nodes.push({ type: "month", year, month });

        const key = `${year}-${month}`;
        const monthEvents = eventsByKey[key] || [];
        monthEvents.forEach(ev => {
          nodes.push({ type: "event", event: ev, side: sideToggle % 2 === 0 ? "left" : "right" });
          sideToggle++;
        });

        if (year === END_YEAR && month === END_MONTH) {
          nodes.push({ type: "today" });
          break outer;
        }
      }
    }
    return nodes;
  }

  function formatDate(dateStr) {
    const d = new Date(dateStr + "T00:00:00");
    return `${MONTH_NAMES[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  }

  function renderLegend() {
    const legend = document.getElementById("legend");
    legend.innerHTML = Object.entries(CATEGORIES).map(([key, cat]) => `
      <div class="legend__item">
        <span class="legend__dot" style="background:${cat.color}"></span>
        <span>${cat.label}</span>
      </div>
    `).join("");
  }

  function renderNodes(nodes) {
    const container = document.getElementById("nodes");
    const html = nodes.map(node => {
      if (node.type === "year") {
        return `
          <div class="node node--year in-view">
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
          <div class="node node--today in-view">
            <div class="node__marker"></div>
            <div class="node__label">Today</div>
          </div>`;
      }
      if (node.type === "event") {
        const ev = node.event;
        const cat = CATEGORIES[ev.category];
        return `
          <div class="node node--event side-${node.side}">
            <div class="node__marker" style="--cat-color:${cat.color}"></div>
            <button class="event-card" style="--cat-color:${cat.color}"
              data-title="${escapeAttr(ev.title)}"
              data-date="${formatDate(ev.date)}"
              data-desc="${escapeAttr(ev.desc)}"
              data-cat="${cat.label}"
              data-color="${cat.color}"
              data-emoji="${ev.emoji}">
              <div class="event-card__top">
                <span class="event-card__emoji">${ev.emoji}</span>
                <span class="event-card__date">${formatDate(ev.date)}</span>
              </div>
              <div class="event-card__title">${ev.title}</div>
              <span class="event-card__cat">${cat.label}</span>
            </button>
          </div>`;
      }
      return "";
    }).join("");
    container.innerHTML = html;
  }

  function escapeAttr(str) {
    return String(str).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
  }

  function setupModal() {
    const overlay = document.getElementById("modalOverlay");
    const closeBtn = document.getElementById("modalClose");
    const modal = overlay.querySelector(".modal");

    function open(data) {
      document.getElementById("modalCategory").textContent = data.cat;
      document.getElementById("modalCategory").style.setProperty("--cat-color", data.color);
      document.getElementById("modalTitle").textContent = `${data.emoji} ${data.title}`;
      document.getElementById("modalDate").textContent = data.date;
      document.getElementById("modalDesc").textContent = data.desc;
      overlay.classList.add("open");
      document.body.style.overflow = "hidden";
    }
    function close() {
      overlay.classList.remove("open");
      document.body.style.overflow = "";
    }

    document.getElementById("nodes").addEventListener("click", e => {
      const card = e.target.closest(".event-card");
      if (!card) return;
      open({
        title: card.dataset.title,
        date: card.dataset.date,
        desc: card.dataset.desc,
        cat: card.dataset.cat,
        color: card.dataset.color,
        emoji: card.dataset.emoji,
      });
    });

    closeBtn.addEventListener("click", close);
    overlay.addEventListener("click", e => { if (e.target === overlay) close(); });
    document.addEventListener("keydown", e => { if (e.key === "Escape") close(); });
    modal.addEventListener("click", e => e.stopPropagation());
  }

  function setupScrollReveal() {
    const targets = document.querySelectorAll(".node--event, .node--month .node__label, .node--year .node__label");
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });
    targets.forEach(t => io.observe(t));
  }

  function setupScrollProgress() {
    const timeline = document.getElementById("timeline");
    const lineFill = document.getElementById("lineFill");
    const progressFill = document.getElementById("progressFill");
    let ticking = false;

    function update() {
      ticking = false;
      const rect = timeline.getBoundingClientRect();
      const viewportMid = window.innerHeight * 0.5;
      const total = rect.height;
      const filled = Math.min(Math.max(viewportMid - rect.top, 0), total);
      const pct = total > 0 ? (filled / total) * 100 : 0;
      lineFill.style.height = pct + "%";
      progressFill.style.width = pct + "%";
    }

    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();
  }

  function init() {
    renderLegend();
    renderNodes(buildNodes());
    setupModal();
    setupScrollReveal();
    setupScrollProgress();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
