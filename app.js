import { consoleLogo } from "./logos.js";

const STORAGE_KEY = "game-shelf-v1";
const COVER_DB = "game-shelf-covers";

const PRESET_CONSOLES = [
  { id: "nes", name: "NES", family: "Nintendo" },
  { id: "snes", name: "SNES", family: "Nintendo" },
  { id: "n64", name: "Nintendo 64", family: "Nintendo" },
  { id: "gamecube", name: "GameCube", family: "Nintendo" },
  { id: "wii", name: "Wii", family: "Nintendo" },
  { id: "wiiu", name: "Wii U", family: "Nintendo" },
  { id: "switch", name: "Switch", family: "Nintendo" },
  { id: "switch2", name: "Switch 2", family: "Nintendo" },
  { id: "gb", name: "Game Boy", family: "Nintendo" },
  { id: "gbc", name: "Game Boy Color", family: "Nintendo" },
  { id: "gba", name: "Game Boy Advance", family: "Nintendo" },
  { id: "ds", name: "Nintendo DS", family: "Nintendo" },
  { id: "3ds", name: "3DS", family: "Nintendo" },
  { id: "ps1", name: "PlayStation", family: "Sony" },
  { id: "ps2", name: "PlayStation 2", family: "Sony" },
  { id: "ps3", name: "PlayStation 3", family: "Sony" },
  { id: "ps4", name: "PlayStation 4", family: "Sony" },
  { id: "ps5", name: "PlayStation 5", family: "Sony" },
  { id: "psp", name: "PSP", family: "Sony" },
  { id: "vita", name: "PS Vita", family: "Sony" },
  { id: "xbox", name: "Xbox", family: "Microsoft" },
  { id: "360", name: "Xbox 360", family: "Microsoft" },
  { id: "xb1", name: "Xbox One", family: "Microsoft" },
  { id: "xss", name: "Xbox Series X|S", family: "Microsoft" },
  { id: "mastersystem", name: "Master System", family: "Sega" },
  { id: "genesis", name: "Mega Drive", family: "Sega" },
  { id: "saturn", name: "Saturn", family: "Sega" },
  { id: "dreamcast", name: "Dreamcast", family: "Sega" },
  { id: "pc", name: "PC", family: "Other" },
];

const FAMILY_COLOR = {
  Nintendo: "#e26d5a",
  Sony: "#6ea4d4",
  Microsoft: "#7daa98",
  Sega: "#d4b06e",
  Other: "#c2b8a8",
};

const COVER_RATIO = {
  nes: "125 / 180",
  snes: "125 / 180",
  n64: "125 / 180",
  gamecube: "135 / 148",
  wii: "135 / 190",
  wiiu: "135 / 190",
  switch: "104 / 169",
  switch2: "104 / 169",
  gb: "95 / 133",
  gbc: "95 / 133",
  gba: "105 / 140",
  ds: "105 / 135",
  "3ds": "100 / 140",
  ps1: "143 / 193",
  ps2: "135 / 190",
  ps3: "135 / 172",
  ps4: "135 / 172",
  ps5: "135 / 172",
  psp: "2 / 3",
  vita: "3 / 5",
  xbox: "135 / 190",
  360: "135 / 190",
  xb1: "135 / 172",
  xss: "135 / 172",
  mastersystem: "125 / 180",
  genesis: "125 / 180",
  saturn: "143 / 193",
  dreamcast: "135 / 190",
  pc: "135 / 190",
};

const CONSOLE_REVISIONS = {
  nes: ["Front-loader", "Top-loader"],
  snes: ["Original", "Mini"],
  n64: ["Original"],
  gamecube: ["DOL-001", "DOL-101"],
  wii: ["Original", "Family Edition", "Mini"],
  wiiu: ["White 8GB", "Black 32GB"],
  switch: ["V1", "V2", "Lite", "OLED"],
  switch2: ["Standard"],
  gb: ["DMG", "Play It Loud", "Pocket"],
  gbc: ["Original"],
  gba: ["AGB", "SP", "Micro"],
  ds: ["Original", "Lite", "DSi", "DSi XL"],
  "3ds": ["3DS", "3DS XL", "2DS", "New 3DS", "New 3DS XL", "New 2DS XL"],
  ps1: ["Original", "PS one"],
  ps2: ["Fat", "Slim"],
  ps3: ["Fat", "Slim", "Super Slim"],
  ps4: ["Original", "Slim", "Pro"],
  ps5: ["Disc", "Digital", "Slim", "Pro"],
  psp: ["1000", "2000", "3000", "Go", "Street"],
  vita: ["OLED", "Slim"],
  xbox: ["Original"],
  360: ["Fat", "Slim", "E"],
  xb1: ["Original", "S", "X"],
  xss: ["Series S", "Series X"],
  mastersystem: ["Mark I", "Mark II"],
  genesis: ["Model 1", "Model 2", "Model 3", "Nomad"],
  saturn: ["Model 1", "Model 2"],
  dreamcast: ["Original"],
  pc: ["Desktop", "Laptop", "Handheld"],
};

const copy = {
  collection: { title: "Collection", eyebrow: "Your copies" },
  wishlist: { title: "Wishlist", eyebrow: "Still hunting" },
  finn: { title: "FINN", eyebrow: "Wishlist on Torget" },
  consoles: { title: "Consoles", eyebrow: "What you own" },
};

const els = {
  views: {
    collection: document.getElementById("view-collection"),
    wishlist: document.getElementById("view-wishlist"),
    finn: document.getElementById("view-finn"),
    consoles: document.getElementById("view-consoles"),
  },
  nav: document.querySelectorAll(".nav button"),
  title: document.getElementById("page-title"),
  eyebrow: document.getElementById("eyebrow"),
  search: document.getElementById("search"),
  addBtn: document.getElementById("add-btn"),
  fillCoversBtn: document.getElementById("fill-covers-btn"),
  dialog: document.getElementById("game-dialog"),
  form: document.getElementById("game-form"),
  dialogTitle: document.getElementById("dialog-title"),
  cancel: document.getElementById("dialog-cancel"),
  exportBtn: document.getElementById("export-btn"),
  importInput: document.getElementById("import-input"),
  catalogBtn: document.getElementById("catalog-btn"),
  catalogDialog: document.getElementById("catalog-dialog"),
  catalogForm: document.getElementById("catalog-form"),
  catalogCancel: document.getElementById("catalog-cancel"),
  catalogStatus: document.getElementById("catalog-status"),
  searchResults: document.getElementById("search-results"),
  coverPreview: document.getElementById("cover-preview"),
  coverFile: document.getElementById("cover-file"),
  coverClear: document.getElementById("cover-clear"),
  consolePicker: document.getElementById("console-picker"),
  detail: document.getElementById("detail-dialog"),
  detailCover: document.getElementById("detail-cover"),
  detailTitle: document.getElementById("detail-title"),
  detailSub: document.getElementById("detail-sub"),
  detailAbout: document.getElementById("detail-about"),
  detailCopies: document.getElementById("detail-copies"),
  detailEdit: document.getElementById("detail-edit"),
  detailClose: document.getElementById("detail-close"),
  gotIt: document.getElementById("got-it-dialog"),
  gotItForm: document.getElementById("got-it-form"),
  gotItTitle: document.getElementById("got-it-title"),
  gotItCancel: document.getElementById("got-it-cancel"),
  gotItConditions: document.getElementById("got-it-conditions"),
  fireworks: document.getElementById("fireworks"),
};

let state = { games: [], consoles: [] };
let view = "collection";
let consoleFilter = "all";
let editingId = null;
let pendingCover = null;
let searchTimer = 0;
const objectUrls = new Map();
const infoCache = new Map();
let detail = { kind: null, id: null };
let pendingOwnId = null;

function uid() {
  return crypto.randomUUID();
}

function gameCopies(game) {
  return Array.isArray(game?.copies) ? game.copies : [];
}

function consoleCopies(con) {
  return Array.isArray(con?.copies) ? con.copies : [];
}

function migrateGame(game) {
  const copies = gameCopies(game);
  if (copies.length) {
    return {
      ...game,
      copies: copies.map((c) => ({
        id: c.id || uid(),
        condition: c.condition || "",
        notes: c.notes || "",
      })),
    };
  }
  if (game.status === "owned") {
    return {
      ...game,
      copies: [{ id: uid(), condition: game.condition || "", notes: "" }],
    };
  }
  return { ...game, copies: [] };
}

function migrateConsole(con) {
  let copies = consoleCopies(con).map((c) => ({
    id: c.id || uid(),
    revision: c.revision || "",
    notes: c.notes || "",
  }));
  if (!copies.length && con.owned) {
    copies = [{ id: uid(), revision: con.revision || "", notes: "" }];
  }
  return { ...con, copies, owned: copies.length > 0 };
}

function syncConsoleOwned(con) {
  const copies = consoleCopies(con);
  return { ...con, copies, owned: copies.length > 0 };
}

function load() {
  let saved = null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) saved = JSON.parse(raw);
  } catch {
    /* ignore */
  }
  if (!saved?.games?.length) {
    try {
      const backup = localStorage.getItem(`${STORAGE_KEY}-backup`);
      if (backup) saved = JSON.parse(backup);
    } catch {
      /* ignore */
    }
  }
  const base = saved || { consoles: [], games: [] };
  const byId = new Map((base.consoles || []).map((c) => [c.id, c]));
  const consoles = PRESET_CONSOLES.map((preset) => {
    const existing = byId.get(preset.id);
    return existing
      ? { ...preset, ...existing, name: preset.name, family: preset.family, custom: false }
      : { ...preset, owned: false, custom: false };
  });
  for (const c of base.consoles || []) {
    if (!PRESET_CONSOLES.some((p) => p.id === c.id)) consoles.push(c);
  }
  return {
    games: (base.games || []).map(migrateGame),
    consoles: consoles.map(migrateConsole),
  };
}

function save() {
  try {
    const previous = localStorage.getItem(STORAGE_KEY);
    if (previous) {
      const prev = JSON.parse(previous);
      if (prev?.games?.length) localStorage.setItem(`${STORAGE_KEY}-backup`, previous);
    }
  } catch {
    /* ignore */
  }
  if (!state.games.length) {
    try {
      const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (existing?.games?.length) return;
    } catch {
      /* ignore */
    }
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function ownedConsoles() {
  return state.consoles.filter((c) => consoleCopies(c).length);
}

function consoleById(id) {
  return state.consoles.find((c) => c.id === id);
}

function csvCell(value) {
  const text = value == null ? "" : String(value);
  return `"${text.replaceAll('"', '""')}"`;
}

function formatSheetDate(value) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("nb-NO");
}

function conditionLabel(value) {
  const labels = { sealed: "Sealed", cib: "CIB", loose: "Loose", digital: "Digital" };
  return labels[value] || value || "";
}

function gamesForSheet(status) {
  return state.games
    .filter((g) => g.status === status)
    .slice()
    .sort((a, b) => {
      const consoleCmp = (consoleById(a.consoleId)?.name || "").localeCompare(consoleById(b.consoleId)?.name || "");
      return consoleCmp || a.title.localeCompare(b.title);
    });
}

function exportSheet(status) {
  const games = gamesForSheet(status);
  if (!games.length) return;
  const wishlist = status === "wishlist";
  const headers = wishlist
    ? ["Title", "Console", "Target price", "Condition", "Notes", "Added"]
    : ["Title", "Console", "Copy", "Condition", "Copy notes", "Notes", "Added"];
  const lines = [headers.map(csvCell).join(";")];
  for (const game of games) {
    if (wishlist) {
      lines.push(
        [game.title, consoleById(game.consoleId)?.name || "", game.maxPrice ?? "", conditionLabel(game.condition), game.notes || "", formatSheetDate(game.addedAt)]
          .map(csvCell)
          .join(";")
      );
      continue;
    }
    const copies = gameCopies(game);
    const rows = copies.length ? copies : [{ condition: game.condition, notes: "" }];
    rows.forEach((item, index) => {
      lines.push(
        [
          game.title,
          consoleById(game.consoleId)?.name || "",
          index + 1,
          conditionLabel(item.condition),
          item.notes || "",
          game.notes || "",
          formatSheetDate(game.addedAt),
        ]
          .map(csvCell)
          .join(";")
      );
    });
  }
  const blob = new Blob(["\uFEFF" + lines.join("\r\n")], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = wishlist ? "game-wishlist.csv" : "game-collection.csv";
  a.click();
  URL.revokeObjectURL(a.href);
}

function gamesFor(status) {
  const q = els.search.value.trim().toLowerCase();
  return state.games
    .filter((g) => g.status === status)
    .filter((g) => consoleFilter === "all" || g.consoleId === consoleFilter)
    .filter((g) => !q || g.title.toLowerCase().includes(q));
}

function setView(next) {
  if (!copy[next]) return;
  view = next;
  els.nav.forEach((btn) => btn.classList.toggle("active", btn.dataset.view === next));
  Object.entries(els.views).forEach(([, node]) => {
    if (node) node.classList.toggle("hidden", node.id !== `view-${next}`);
  });
  if (els.title) els.title.textContent = copy[next].title;
  if (els.eyebrow) els.eyebrow.textContent = copy[next].eyebrow;
  const hideShelfTools = next === "consoles" || next === "finn";
  els.addBtn?.classList.toggle("hidden", hideShelfTools);
  els.fillCoversBtn?.classList.toggle("hidden", hideShelfTools);
  els.search?.classList.toggle("hidden", hideShelfTools);
  render();
  document.dispatchEvent(new CustomEvent("shelf:view", { detail: next }));
}

function spineColor(consoleId) {
  const family = consoleById(consoleId)?.family || "Other";
  return FAMILY_COLOR[family] || FAMILY_COLOR.Other;
}

function formatPrice(value) {
  if (value == null || Number.isNaN(value)) return "—";
  return `≤ ${Number(value).toFixed(2).replace(/\.00$/, "")}`;
}

function coverRatio(consoleId) {
  return COVER_RATIO[consoleId] || "3 / 4";
}

function applyCoverPreviewRatio(consoleId) {
  els.coverPreview.style.aspectRatio = coverRatio(consoleId);
}

function coverSrc(url) {
  if (!url) return "";
  return `/api/image?u=${encodeURIComponent(url)}`;
}

function renderChips(status) {
  const used = [...new Set(state.games.filter((g) => g.status === status).map((g) => g.consoleId))];
  const chips = [`<button class="chip ${consoleFilter === "all" ? "active" : ""}" data-filter="all" title="All">All</button>`]
    .concat(
      used.map((id) => {
        const con = consoleById(id);
        return `<button class="chip chip-logo ${consoleFilter === id ? "active" : ""}" data-filter="${id}">${consoleLogo(id, con?.name)}</button>`;
      })
    )
    .join("");
  const exportLabel = status === "wishlist" ? "Export wishlist" : "Export collection";
  const count = state.games.filter((g) => g.status === status).length;
  return `<div class="toolbar">${chips}<button type="button" class="ghost toolbar-export" data-export-sheet="${status}" ${count ? "" : "disabled"}>${exportLabel}</button></div>`;
}

function copiesSummary(game) {
  const copies = gameCopies(game);
  if (game.status !== "owned") {
    return [conditionLabel(game.condition), game.maxPrice ? formatPrice(game.maxPrice) : ""].filter(Boolean).join(" · ");
  }
  const labels = [...new Set(copies.map((item) => conditionLabel(item.condition)).filter(Boolean))];
  return labels.join(" · ");
}

function renderGameCard(game) {
  const extra = copiesSummary(game);
  const copies = gameCopies(game);
  const img = game.coverUrl
    ? `<img data-cover="${game.id}" src="${coverSrc(game.coverUrl)}" alt="">`
    : `<div class="cover-fallback" data-cover="${game.id}" style="background:${spineColor(game.consoleId)};aspect-ratio:${coverRatio(game.consoleId)}"></div>`;
  return `
    <article class="card cubby" data-open-game="${game.id}">
      <div class="cubby-banner">${consoleLogo(game.consoleId, consoleById(game.consoleId)?.name)}</div>
      <div class="cubby-well">
        <div class="case" style="--spine:${spineColor(game.consoleId)}">
          <span class="case-spine" aria-hidden="true"></span>
          <div class="cover-block">
            <div class="cover-wrap">
              ${img}
            </div>
            ${copies.length > 1 ? `<span class="copy-count">${copies.length}</span>` : ""}
          </div>
          <span class="case-top" aria-hidden="true"></span>
        </div>
      </div>
      <div class="cubby-meta">
        <h3>${escapeHtml(game.title)}</h3>
        ${extra ? `<p class="meta">${escapeHtml(extra)}</p>` : ""}
        ${game.notes ? `<p class="meta">${escapeHtml(game.notes)}</p>` : ""}
        <div class="card-actions">
          <button class="ghost" data-edit="${game.id}">Edit</button>
          ${game.status === "wishlist" ? `<button class="ghost" data-own="${game.id}">Got it</button>` : ""}
          <button class="ghost" data-delete="${game.id}">Remove</button>
        </div>
      </div>
    </article>`;
}

function renderCollection() {
  const games = gamesFor("owned");
  const titles = state.games.filter((g) => g.status === "owned").length;
  const copies = state.games.filter((g) => g.status === "owned").reduce((sum, g) => sum + Math.max(gameCopies(g).length, 1), 0);
  const wish = state.games.filter((g) => g.status === "wishlist").length;
  const consoles = state.consoles.reduce((sum, c) => sum + consoleCopies(c).length, 0);
  els.views.collection.innerHTML = `
    <div class="stats">
      <div class="stat"><span>Game copies</span><strong>${copies}</strong></div>
      <div class="stat"><span>Titles / wishlist</span><strong>${titles} / ${wish}</strong></div>
      <div class="stat"><span>Consoles</span><strong>${consoles}</strong></div>
    </div>
    ${renderChips("owned")}
    ${
      games.length
        ? `<div class="kallax"><div class="grid">${games.map(renderGameCard).join("")}</div></div>`
        : `<div class="empty">No games here yet. If your shelf vanished, open <a href="/recover.html">recover.html</a> in this same browser.</div>`
    }`;
  hydrateCovers(games);
}

function renderWishlist() {
  const games = gamesFor("wishlist");
  els.views.wishlist.innerHTML = `
    ${renderChips("wishlist")}
    ${
      games.length
        ? `<div class="kallax"><div class="grid">${games.map(renderGameCard).join("")}</div></div>`
        : `<div class="empty">Wishlist is empty. Add a title you’re hunting.</div>`
    }`;
  hydrateCovers(games);
}

function renderConsoles() {
  const tiles = state.consoles
    .map((c) => {
      const n = consoleCopies(c).length;
      return `
      <button type="button" class="console-tile ${n ? "on" : ""}" data-open-console="${c.id}" title="${escapeHtml(c.name)}">
        ${n ? `<span class="console-count">${n}</span>` : ""}
        ${consoleLogo(c.id, c.name)}
        <span class="console-name">${escapeHtml(c.name)}</span>
      </button>`;
    })
    .join("");
  const units = state.consoles.reduce((sum, c) => sum + consoleCopies(c).length, 0);
  els.views.consoles.innerHTML = `
    <p class="meta">Click a system to read about it and add units. Revisions such as PS3 Slim sit on each unit. You currently have ${units} console${units === 1 ? "" : "s"}.</p>
    <div class="console-grid">${tiles}</div>
    <form class="add-console" id="add-console-form">
      <input name="name" placeholder="Add another console" required maxlength="40" />
      <button class="primary" type="submit">Add</button>
    </form>`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function fillConsolePicker(preferredStatus, selectedId) {
  const list = state.consoles;
  const current = selectedId || list[0]?.id || "";
  els.form.elements.consoleId.value = current;
  applyCoverPreviewRatio(current);
  els.consolePicker.innerHTML = list
    .map(
      (c) =>
        `<button type="button" class="console-pick ${c.id === current ? "active" : ""}" data-pick="${c.id}" title="${escapeHtml(c.name)}">${consoleLogo(c.id, c.name)}<span class="console-name">${escapeHtml(c.name)}</span></button>`
    )
    .join("");
}

function setCoverPreview(url, blob) {
  pendingCover = blob || null;
  if (blob) {
    const obj = URL.createObjectURL(blob);
    els.coverPreview.src = obj;
    els.coverPreview.classList.remove("empty-cover");
    return;
  }
  if (url) {
    els.coverPreview.src = coverSrc(url);
    els.coverPreview.classList.remove("empty-cover");
    return;
  }
  els.coverPreview.removeAttribute("src");
  els.coverPreview.classList.add("empty-cover");
}

function openGameDialog(game) {
  editingId = game?.id || null;
  pendingCover = null;
  els.dialogTitle.textContent = game ? "Edit game" : "Add a game";
  els.form.reset();
  els.searchResults.innerHTML = "";
  els.searchResults.classList.add("hidden");
  const status = game?.status || (view === "wishlist" ? "wishlist" : "owned");
  fillConsolePicker(status, game?.consoleId);
  if (game) {
    els.form.elements.title.value = game.title;
    els.form.elements.status.value = game.status;
    els.form.elements.condition.value = game.condition || "";
    els.form.elements.maxPrice.value = game.maxPrice || "";
    els.form.elements.notes.value = game.notes || "";
    els.form.elements.coverUrl.value = game.coverUrl || "";
    els.form.elements.catalogSlug.value = game.catalogSlug || "";
    loadCoverBlob(game.id).then((blob) => setCoverPreview(game.coverUrl, blob));
  } else {
    els.form.elements.status.value = status;
    els.form.elements.coverUrl.value = "";
    els.form.elements.catalogSlug.value = "";
    setCoverPreview("", null);
  }
  els.dialog.showModal();
}

async function upsertGame(data) {
  if (editingId) {
    state.games = state.games.map((g) => {
      if (g.id !== editingId) return g;
      const next = { ...g, ...data, copies: gameCopies(g) };
      if (data.status === "owned" && !gameCopies(next).length) {
        next.copies = [{ id: uid(), condition: data.condition || "", notes: "" }];
      }
      return next;
    });
    if (pendingCover) await putCoverBlob(editingId, pendingCover);
    save();
    return;
  }
  const twin = state.games.find(
    (g) =>
      g.status === data.status &&
      g.consoleId === data.consoleId &&
      normalizeTitle(g.title) === normalizeTitle(data.title)
  );
  if (twin && data.status === "owned") {
    twin.copies = [...gameCopies(twin), { id: uid(), condition: data.condition || "", notes: "" }];
    if (data.coverUrl && !twin.coverUrl) twin.coverUrl = data.coverUrl;
    if (data.catalogSlug && !twin.catalogSlug) twin.catalogSlug = data.catalogSlug;
    if (pendingCover) await putCoverBlob(twin.id, pendingCover);
    save();
    return;
  }
  const id = uid();
  const copies = data.status === "owned" ? [{ id: uid(), condition: data.condition || "", notes: "" }] : [];
  state.games.push({ id, addedAt: Date.now(), ...data, copies });
  if (pendingCover) await putCoverBlob(id, pendingCover);
  save();
}

function conditionSelect(selectId, selected) {
  const opts = [
    ["", "Unspecified"],
    ["sealed", "Sealed"],
    ["cib", "CIB"],
    ["loose", "Loose"],
    ["digital", "Digital"],
  ];
  return `<select id="${selectId}">${opts
    .map(([value, label]) => `<option value="${value}" ${value === selected ? "selected" : ""}>${label}</option>`)
    .join("")}</select>`;
}

function wait(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function burstFireworksOn(host, spread = 40) {
  if (!host) return;
  const layer = document.createElement("div");
  layer.className = "fw-local";
  const colors = ["#e3b46a", "#6cbcab", "#f2efe8", "#e07a72", "#6ea4d4"];
  [
    ["36%", "40%"],
    ["64%", "36%"],
  ].forEach(([left, top], burstIndex) => {
    const burst = document.createElement("div");
    burst.className = "fw-burst";
    burst.style.left = left;
    burst.style.top = top;
    for (let i = 0; i < 14; i += 1) {
      const spark = document.createElement("span");
      spark.className = "fw-spark";
      const angle = (i / 14) * Math.PI * 2 + burstIndex * 0.25;
      spark.style.setProperty("--x", `${Math.cos(angle) * spread}px`);
      spark.style.setProperty("--y", `${Math.sin(angle) * spread}px`);
      spark.style.background = colors[i % colors.length];
      spark.style.animationDelay = `${burstIndex * 60}ms`;
      burst.appendChild(spark);
    }
    layer.appendChild(burst);
  });
  host.appendChild(layer);
  window.setTimeout(() => layer.remove(), 950);
}

async function confirmGotIt(condition) {
  if (!pendingOwnId) return;
  const id = pendingOwnId;
  pendingOwnId = null;
  const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  const card = document.querySelector(`#view-wishlist [data-open-game="${id}"]`);
  const start = card?.getBoundingClientRect();

  state.games = state.games.map((g) =>
    g.id === id
      ? {
          ...g,
          status: "owned",
          condition,
          copies: gameCopies(g).length
            ? gameCopies(g).map((copy, index) => (index === 0 ? { ...copy, condition: condition || copy.condition } : copy))
            : [{ id: uid(), condition, notes: "" }],
        }
      : g
  );
  save();

  if (reduce || !card || !start?.width) {
    setView("collection");
    return;
  }

  card.querySelector(".case")?.classList.add("closing");
  burstFireworksOn(card.querySelector(".cubby-well") || card, 42);
  await wait(480);

  const ghost = card.cloneNode(true);
  ghost.classList.add("fly-ghost");
  ghost.style.left = `${start.left}px`;
  ghost.style.top = `${start.top}px`;
  ghost.style.width = `${start.width}px`;
  ghost.style.height = `${start.height}px`;
  document.body.appendChild(ghost);
  card.classList.add("fly-source");

  setView("collection");
  const dest = document.querySelector(`#view-collection [data-open-game="${id}"]`);
  if (dest) dest.classList.add("fly-target");
  await wait(40);
  const end =
    dest?.getBoundingClientRect() || document.querySelector("[data-view='collection']")?.getBoundingClientRect();

  if (end) {
    const dx = end.left - start.left;
    const dy = end.top - start.top;
    const sx = dest ? end.width / start.width : 0.2;
    const sy = dest ? end.height / start.height : 0.2;
    ghost.style.transform = `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`;
    ghost.style.opacity = dest ? "1" : "0";
    await wait(720);
  }

  ghost.remove();
  dest?.classList.remove("fly-target");
  burstFireworksOn(dest?.querySelector(".cubby-well") || dest, 36);
}

function openGotItDialog(id) {
  const game = state.games.find((g) => g.id === id);
  if (!game || !els.gotIt) return;
  pendingOwnId = id;
  if (els.gotItTitle) {
    const con = consoleById(game.consoleId)?.name || "";
    els.gotItTitle.textContent = con ? `${game.title} · ${con}` : game.title;
  }
  const current = game.condition || "cib";
  if (els.gotItForm) els.gotItForm.elements.condition.value = current;
  els.gotItConditions?.querySelectorAll("[data-condition]").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.condition === current);
  });
  els.gotIt.showModal();
}

function revisionFields(consoleId) {
  const presets = CONSOLE_REVISIONS[consoleId] || [];
  const options = ["", ...presets].map(
    (value) => `<option value="${escapeHtml(value)}">${value ? escapeHtml(value) : "Unspecified"}</option>`
  );
  return `${presets.length ? `<select id="copy-revision">${options.join("")}</select>` : ""}
    <input id="copy-revision-custom" maxlength="40" placeholder="${presets.length ? "Or type another revision" : "Revision (optional)"}" />`;
}

async function loadInfo(query, platform, kind, slug = "") {
  const key = `${kind}|${platform}|${slug || query}`;
  if (infoCache.has(key)) return infoCache.get(key);
  try {
    const params = new URLSearchParams({ q: query, platform: platform || "", kind, slug });
    const res = await fetch(`/api/info?${params}`);
    const data = await res.json();
    infoCache.set(key, data);
    return data;
  } catch {
    return { extract: "", title: query, url: "", cover: null };
  }
}

function paintAbout(info) {
  if (!els.detailAbout) return;
  if (info?.error && !info.extract) {
    els.detailAbout.innerHTML = `<p>Could not reach the catalog. Copies still work offline.</p>`;
    return;
  }
  if (!info?.extract && !info?.url) {
    els.detailAbout.innerHTML = `<p>No summary found online. You can still track copies here.</p>`;
    return;
  }
  const credit =
    info.source === "rawg"
      ? `<p class="meta">Summary from <a href="${escapeHtml(info.url || "https://rawg.io")}" target="_blank" rel="noopener">RAWG</a></p>`
      : info.url
        ? `<p><a href="${escapeHtml(info.url)}" target="_blank" rel="noopener">Read more on Wikipedia</a></p>`
        : "";
  els.detailAbout.innerHTML = `
    ${info.extract ? `<p>${escapeHtml(info.extract)}</p>` : ""}
    ${credit}
  `;
}

function renderGameCopies(game) {
  if (game.status !== "owned") {
    els.detailCopies.innerHTML = `<p class="meta">Copies are tracked once you own it. Use Got it when a copy lands.</p>`;
    return;
  }
  const copies = gameCopies(game);
  els.detailCopies.innerHTML = `
    <p class="meta">Your copies</p>
    <div class="copy-list">
      ${
        copies
          .map(
            (item) => `
        <div class="copy-row">
          <strong>${escapeHtml(conditionLabel(item.condition) || "Unspecified")}</strong>
          <button type="button" class="ghost" data-remove-copy="${item.id}">Remove</button>
        </div>`
          )
          .join("") || `<p class="meta">No copies left. Add one below.</p>`
      }
    </div>
    <div class="copy-add">
      ${conditionSelect("copy-condition", "cib")}
      <button type="button" class="primary" id="add-copy-btn">Add copy</button>
    </div>
  `;
}

function renderConsoleUnits(con) {
  const copies = consoleCopies(con);
  els.detailCopies.innerHTML = `
    <p class="meta">Units you own — pick Fat, Slim, Super Slim, and so on.</p>
    <div class="copy-list">
      ${
        copies
          .map(
            (item) => `
        <div class="copy-row">
          <strong>${escapeHtml(item.revision || "Unspecified revision")}</strong>
          <button type="button" class="ghost" data-remove-unit="${item.id}">Remove</button>
        </div>`
          )
          .join("") || `<p class="meta">None yet. Add the first unit below.</p>`
      }
    </div>
    <div class="copy-add stack">
      ${revisionFields(con.custom ? "" : con.id)}
      <button type="button" class="primary" id="add-unit-btn">Add console</button>
    </div>
  `;
}

function refreshOpenDetail() {
  if (detail.kind === "game") {
    const game = state.games.find((g) => g.id === detail.id);
    if (!game) {
      els.detail.close();
      return;
    }
    const n = gameCopies(game).length;
    els.detailSub.textContent = [consoleById(game.consoleId)?.name, game.status === "owned" ? `${n} owned` : "Wishlist"]
      .filter(Boolean)
      .join(" · ");
    renderGameCopies(game);
  }
  if (detail.kind === "console") {
    const con = consoleById(detail.id);
    if (!con) {
      els.detail.close();
      return;
    }
    const n = consoleCopies(con).length;
    els.detailSub.textContent = n ? `${n} unit${n === 1 ? "" : "s"}` : "Not in the collection yet";
    renderConsoleUnits(con);
  }
}

async function openGameDetail(id) {
  const game = state.games.find((g) => g.id === id);
  if (!game || !els.detail) return;
  detail = { kind: "game", id };
  els.detailTitle.textContent = game.title;
  els.detailEdit?.classList.remove("hidden");
  els.detailCover.classList.remove("logo-cover");
  if (game.coverUrl) {
    els.detailCover.src = coverSrc(game.coverUrl);
  } else {
    els.detailCover.removeAttribute("src");
  }
  try {
    const blob = await loadCoverBlob(game.id);
    if (blob) els.detailCover.src = URL.createObjectURL(blob);
  } catch {
    /* ignore */
  }
  els.detailAbout.innerHTML = `<p>Loading a short summary…</p>`;
  refreshOpenDetail();
  els.detail.showModal();
  paintAbout(await loadInfo(game.title, game.consoleId, "game", game.catalogSlug || ""));
}

async function openConsoleDetail(id) {
  const con = consoleById(id);
  if (!con || !els.detail) return;
  detail = { kind: "console", id };
  els.detailTitle.textContent = con.name;
  els.detailEdit?.classList.add("hidden");
  els.detailCover.classList.add("logo-cover");
  if (!con.custom) {
    els.detailCover.src = `/logos/${con.id}.svg`;
  } else {
    els.detailCover.removeAttribute("src");
  }
  els.detailAbout.innerHTML = `<p>Loading a short summary…</p>`;
  refreshOpenDetail();
  els.detail.showModal();
  paintAbout(await loadInfo(con.name, con.id, "console"));
}

function render() {
  if (view === "collection") renderCollection();
  if (view === "wishlist") renderWishlist();
  if (view === "consoles") renderConsoles();
}

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(COVER_DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore("covers");
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function putCoverBlob(id, blob) {
  const db = await openDb();
  await new Promise((resolve, reject) => {
    const tx = db.transaction("covers", "readwrite");
    tx.objectStore("covers").put(blob, id);
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
  });
}

async function loadCoverBlob(id) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("covers", "readonly");
    const req = tx.objectStore("covers").get(id);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}

async function deleteCoverBlob(id) {
  const db = await openDb();
  await new Promise((resolve, reject) => {
    const tx = db.transaction("covers", "readwrite");
    tx.objectStore("covers").delete(id);
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
  });
}

async function hydrateCovers(games) {
  for (const url of objectUrls.values()) URL.revokeObjectURL(url);
  objectUrls.clear();
  await Promise.all(
    games.map(async (game) => {
      const blob = await loadCoverBlob(game.id);
      if (!blob) return;
      const node = document.querySelector(`[data-cover="${game.id}"]`);
      if (!node) return;
      const obj = URL.createObjectURL(blob);
      objectUrls.set(game.id, obj);
      if (node.tagName === "IMG") {
        node.src = obj;
      } else {
        const img = document.createElement("img");
        img.dataset.cover = game.id;
        img.src = obj;
        img.alt = "";
        node.replaceWith(img);
      }
    })
  );
}

async function searchCatalog(query, platform = els.form.elements.consoleId.value) {
  const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&platform=${encodeURIComponent(platform || "")}`);
  const text = await res.text();
  let body = {};
  try {
    body = JSON.parse(text);
  } catch {
    throw new Error("Start the app with start.bat so catalog search can run.");
  }
  if (!res.ok) throw new Error(body.error || "Search failed");
  return body;
}

function normalizeTitle(value) {
  return String(value)
    .toLowerCase()
    .replace(/\(.*?\)/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function pickCover(items, title) {
  const want = normalizeTitle(title);
  const ranked = items
    .filter((item) => item.cover && !/^list of /i.test(item.title || ""))
    .map((item) => {
      const got = normalizeTitle(item.title);
      let score = 0;
      if (got === want) score = 100;
      else if (got.startsWith(want) || want.startsWith(got)) score = 80;
      else if (got.includes(want) || want.includes(got)) score = 55;
      else if (/video game/i.test(item.subtitle || "")) score = 20;
      return { cover: item.cover, score };
    })
    .filter((row) => row.score >= 55)
    .sort((a, b) => b.score - a.score);
  return ranked[0]?.cover || null;
}

let coverFillBusy = false;

async function fillMissingCovers() {
  if (coverFillBusy) return;
  coverFillBusy = true;
  els.fillCoversBtn.disabled = true;
  const missing = [];
  for (const game of state.games) {
    if (game.coverUrl) continue;
    const local = await loadCoverBlob(game.id);
    if (local) continue;
    missing.push(game);
  }
  if (!missing.length) {
    els.fillCoversBtn.disabled = false;
    coverFillBusy = false;
    return;
  }
  for (let i = 0; i < missing.length; i += 1) {
    els.eyebrow.textContent = `Fetching covers ${i + 1} / ${missing.length}`;
    try {
      const res = await fetch(
        `/api/cover?q=${encodeURIComponent(missing[i].title)}&platform=${encodeURIComponent(missing[i].consoleId || "")}`
      );
      const data = await res.json();
      if (data.cover) {
        missing[i].coverUrl = data.cover;
        save();
      }
    } catch {
      /* skip this title and keep going */
    }
    if (i === missing.length - 1 || i % 4 === 3) render();
  }
  els.eyebrow.textContent = copy[view].eyebrow;
  els.fillCoversBtn.disabled = false;
  coverFillBusy = false;
}

function showSearchResults(items, source) {
  if (!items.length) {
    els.searchResults.innerHTML = `<button type="button" class="search-hit muted" disabled>No catalog matches — keep the name you typed.</button>`;
    els.searchResults.classList.remove("hidden");
    return;
  }
  const credit =
    source === "rawg"
      ? `<p class="search-credit">Results from <a href="https://rawg.io" target="_blank" rel="noopener">RAWG</a></p>`
      : `<p class="search-credit">Wikipedia results. Add a RAWG key under Catalog for a proper games database.</p>`;
  els.searchResults.innerHTML =
    items
      .map(
        (item, index) => `
      <button type="button" class="search-hit" data-pick-game="${index}">
        ${item.cover ? `<img src="${coverSrc(item.cover)}" alt="">` : `<span class="hit-fallback"></span>`}
        <span>
          <strong>${escapeHtml(item.title)}</strong>
          <em>${escapeHtml(item.subtitle || "")}</em>
        </span>
      </button>`
      )
      .join("") + credit;
  els.searchResults.items = items;
  els.searchResults.classList.remove("hidden");
}

els.nav.forEach((btn) =>
  btn.addEventListener("click", () => {
    if (!btn.dataset.view) return;
    setView(btn.dataset.view);
  })
);
els.search?.addEventListener("input", render);
els.addBtn?.addEventListener("click", () => openGameDialog());
els.fillCoversBtn?.addEventListener("click", () => fillMissingCovers());
els.cancel?.addEventListener("click", () => els.dialog.close());
els.catalogBtn?.addEventListener("click", async () => {
  try {
    const data = await (await fetch("/api/settings")).json();
    if (els.catalogStatus) {
      els.catalogStatus.textContent = data.rawg
        ? "RAWG is connected. Title search will use the games database."
        : "No RAWG key yet — search still uses Wikipedia until you save one.";
    }
  } catch {
    if (els.catalogStatus) els.catalogStatus.textContent = "Could not read catalog settings.";
  }
  els.catalogDialog?.showModal();
});
els.catalogCancel?.addEventListener("click", () => els.catalogDialog.close());
els.catalogForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const rawg_key = els.catalogForm.elements.rawgKey.value.trim();
  const res = await fetch("/api/settings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ rawg_key }),
  });
  const data = await res.json();
  if (!res.ok) {
    if (els.catalogStatus) els.catalogStatus.textContent = data.error || "Could not save.";
    return;
  }
  if (els.catalogStatus) {
    els.catalogStatus.textContent = data.rawg ? "Saved. Try adding a game — matches should be actual titles." : "Key cleared. Search falls back to Wikipedia.";
  }
  els.catalogForm.elements.rawgKey.value = "";
  infoCache.clear();
});
els.form.elements.status.addEventListener("change", () => {
  fillConsolePicker(els.form.elements.status.value, els.form.elements.consoleId.value);
});

els.form.elements.title.addEventListener("input", () => {
  const q = els.form.elements.title.value.trim();
  clearTimeout(searchTimer);
  if (q.length < 2) {
    els.searchResults.classList.add("hidden");
    return;
  }
  searchTimer = setTimeout(async () => {
    try {
      const body = await searchCatalog(q);
      showSearchResults(body.items || [], body.source);
    } catch (err) {
      els.searchResults.innerHTML = `<button type="button" class="search-hit muted" disabled>${escapeHtml(err.message || "Catalog unreachable")}</button>`;
      els.searchResults.classList.remove("hidden");
    }
  }, 280);
});

els.searchResults.addEventListener("click", (event) => {
  const hit = event.target.closest("[data-pick-game]");
  if (!hit) return;
  const item = els.searchResults.items?.[Number(hit.dataset.pickGame)];
  if (!item) return;
  els.form.elements.title.value = item.title;
  els.form.elements.coverUrl.value = item.cover || "";
  els.form.elements.catalogSlug.value = item.slug || "";
  pendingCover = null;
  setCoverPreview(item.cover, null);
  els.searchResults.classList.add("hidden");
});

els.consolePicker.addEventListener("click", (event) => {
  const btn = event.target.closest("[data-pick]");
  if (!btn) return;
  els.form.elements.consoleId.value = btn.dataset.pick;
  applyCoverPreviewRatio(btn.dataset.pick);
  els.consolePicker.querySelectorAll(".console-pick").forEach((node) => {
    node.classList.toggle("active", node.dataset.pick === btn.dataset.pick);
  });
});

els.coverFile.addEventListener("change", () => {
  const file = els.coverFile.files[0];
  if (!file) return;
  els.form.elements.coverUrl.value = "";
  setCoverPreview("", file);
  els.coverFile.value = "";
});

els.coverClear.addEventListener("click", async () => {
  pendingCover = null;
  els.form.elements.coverUrl.value = "";
  setCoverPreview("", null);
  if (editingId) await deleteCoverBlob(editingId);
});

els.form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const data = {
    title: els.form.elements.title.value.trim(),
    consoleId: els.form.elements.consoleId.value,
    status: els.form.elements.status.value,
    condition: els.form.elements.condition.value,
    maxPrice: els.form.elements.maxPrice.value ? Number(els.form.elements.maxPrice.value) : null,
    notes: els.form.elements.notes.value.trim(),
    coverUrl: els.form.elements.coverUrl.value.trim(),
    catalogSlug: els.form.elements.catalogSlug.value.trim(),
  };
  if (!data.title || !data.consoleId) return;
  await upsertGame(data);
  els.dialog.close();
  setView(data.status === "wishlist" ? "wishlist" : "collection");
});

document.body.addEventListener("click", (event) => {
  if (event.target.closest(".card-actions")) {
    event.stopPropagation();
  }
  const filter = event.target.closest("[data-filter]");
  if (filter) {
    consoleFilter = filter.dataset.filter;
    render();
    return;
  }
  const sheet = event.target.closest("[data-export-sheet]");
  if (sheet) {
    exportSheet(sheet.dataset.exportSheet);
    return;
  }
  const edit = event.target.closest("[data-edit]");
  if (edit) {
    openGameDialog(state.games.find((g) => g.id === edit.dataset.edit));
    return;
  }
  const own = event.target.closest("[data-own]");
  if (own) {
    openGotItDialog(own.dataset.own);
    return;
  }
  const del = event.target.closest("[data-delete]");
  if (del) {
    const id = del.dataset.delete;
    state.games = state.games.filter((g) => g.id !== id);
    deleteCoverBlob(id);
    save();
    render();
    return;
  }
  const openGame = event.target.closest("[data-open-game]");
  if (openGame && !event.target.closest(".card-actions")) {
    openGameDetail(openGame.dataset.openGame);
    return;
  }
  const openConsole = event.target.closest("[data-open-console]");
  if (openConsole) {
    openConsoleDetail(openConsole.dataset.openConsole);
  }
});

els.detailClose?.addEventListener("click", () => els.detail.close());
els.gotItCancel?.addEventListener("click", () => {
  pendingOwnId = null;
  els.gotIt?.close();
});
els.gotItConditions?.addEventListener("click", (event) => {
  const btn = event.target.closest("[data-condition]");
  if (!btn || !els.gotItForm) return;
  els.gotItForm.elements.condition.value = btn.dataset.condition;
  els.gotItConditions.querySelectorAll("[data-condition]").forEach((node) => {
    node.classList.toggle("active", node === btn);
  });
});
els.gotItForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const condition = els.gotItForm.elements.condition.value;
  els.gotIt.close();
  confirmGotIt(condition);
});
els.detailEdit?.addEventListener("click", () => {
  const game = state.games.find((g) => g.id === detail.id);
  els.detail.close();
  if (game) openGameDialog(game);
});
els.detail?.addEventListener("click", (event) => {
  if (event.target.id === "add-copy-btn") {
    const game = state.games.find((g) => g.id === detail.id);
    if (!game) return;
    const condition = document.getElementById("copy-condition")?.value || "";
    game.copies = [...gameCopies(game), { id: uid(), condition, notes: "" }];
    game.status = "owned";
    save();
    render();
    refreshOpenDetail();
    return;
  }
  if (event.target.id === "add-unit-btn") {
    const con = consoleById(detail.id);
    if (!con) return;
    const typed = document.getElementById("copy-revision-custom")?.value.trim();
    const picked = document.getElementById("copy-revision")?.value || "";
    con.copies = [...consoleCopies(con), { id: uid(), revision: typed || picked, notes: "" }];
    Object.assign(con, syncConsoleOwned(con));
    save();
    render();
    refreshOpenDetail();
    return;
  }
  const removeCopy = event.target.closest("[data-remove-copy]");
  if (removeCopy) {
    const game = state.games.find((g) => g.id === detail.id);
    if (!game) return;
    game.copies = gameCopies(game).filter((c) => c.id !== removeCopy.dataset.removeCopy);
    if (!game.copies.length) game.status = "wishlist";
    save();
    render();
    refreshOpenDetail();
    return;
  }
  const removeUnit = event.target.closest("[data-remove-unit]");
  if (removeUnit) {
    const con = consoleById(detail.id);
    if (!con) return;
    con.copies = consoleCopies(con).filter((c) => c.id !== removeUnit.dataset.removeUnit);
    Object.assign(con, syncConsoleOwned(con));
    save();
    render();
    refreshOpenDetail();
  }
});

document.body.addEventListener("submit", (event) => {
  if (event.target.id !== "add-console-form") return;
  event.preventDefault();
  const name = event.target.elements.name.value.trim();
  if (!name) return;
  state.consoles.push({
    id: uid(),
    name,
    family: "Other",
    owned: true,
    custom: true,
    copies: [{ id: uid(), revision: "", notes: "" }],
  });
  save();
  render();
});

els.exportBtn?.addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "game-shelf.json";
  a.click();
});

els.importInput?.addEventListener("change", async () => {
  const file = els.importInput.files[0];
  if (!file) return;
  const parsed = JSON.parse(await file.text());
  state = load();
  state.games = (parsed.games || []).map(migrateGame);
  const byId = new Map((parsed.consoles || []).map((c) => [c.id, c]));
  state.consoles = state.consoles.map((c) => {
    const incoming = byId.get(c.id);
    return incoming ? migrateConsole({ ...c, ...incoming, name: c.name, family: c.family, custom: c.custom }) : c;
  });
  for (const c of parsed.consoles || []) {
    if (!state.consoles.some((x) => x.id === c.id)) state.consoles.push(migrateConsole(c));
  }
  save();
  render();
  els.importInput.value = "";
  fillMissingCovers();
});

state = load();
if (state.games.length) save();
try {
  setView("collection");
  fillMissingCovers();
} catch (err) {
  console.error(err);
  if (els.views.collection) {
    els.views.collection.innerHTML = `<div class="empty">${escapeHtml(err.message || "The shelf failed to load. Refresh once.")}</div>`;
  }
}
