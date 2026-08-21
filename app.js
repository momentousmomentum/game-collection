import { consoleLogo } from "./logos.js";
import { officialFor } from "./peripherals.js";

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
  collection: { title: "Games collection", eyebrow: "Your copies" },
  wishlist: { title: "Games wishlist", eyebrow: "Still hunting" },
  sold: { title: "Sold / traded", eyebrow: "No longer on the shelf" },
  finn: { title: "Market", eyebrow: "Wishlist listings" },
  consoles: { title: "Console Collection", eyebrow: "What you own" },
  peripherals: { title: "Peripherals collection", eyebrow: "Pads, cameras, multitaps" },
};

let marketPrefs = { locale: "", currency: "", display: undefined, classifiedsName: "" };

function applyMarketSettings(data) {
  const resolved = data?.resolved || {};
  marketPrefs = {
    locale: data?.locale || "",
    currency: resolved.currency || marketPrefs.currency || "",
    display: resolved.display,
    classifiedsName: resolved.classifieds?.name || "",
  };
  copy.finn = { title: "Market", eyebrow: "Wishlist listings" };
  document.querySelectorAll('.nav [data-view="finn"]').forEach((btn) => {
    btn.textContent = "Market";
  });
  if (els.title && view === "finn") els.title.textContent = copy.finn.title;
  if (els.eyebrow && view === "finn") els.eyebrow.textContent = copy.finn.eyebrow;
  document.dispatchEvent(new CustomEvent("shelf:market", { detail: { ...data, resolved } }));
  if (typeof state !== "undefined" && state) render();
}

const els = {
  views: {
    collection: document.getElementById("view-collection"),
    wishlist: document.getElementById("view-wishlist"),
    sold: document.getElementById("view-sold"),
    finn: document.getElementById("view-finn"),
    consoles: document.getElementById("view-consoles"),
    peripherals: document.getElementById("view-peripherals"),
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
  detailLongplay: document.getElementById("detail-longplay"),
  detailCopies: document.getElementById("detail-copies"),
  detailEdit: document.getElementById("detail-edit"),
  detailClose: document.getElementById("detail-close"),
  gotIt: document.getElementById("got-it-dialog"),
  gotItForm: document.getElementById("got-it-form"),
  gotItTitle: document.getElementById("got-it-title"),
  gotItCancel: document.getElementById("got-it-cancel"),
  gotItConditions: document.getElementById("got-it-conditions"),
  fireworks: document.getElementById("fireworks"),
  peripheralDialog: document.getElementById("peripheral-dialog"),
  peripheralTitle: document.getElementById("peripheral-dialog-title"),
  peripheralSub: document.getElementById("peripheral-dialog-sub"),
  peripheralGrid: document.getElementById("peripheral-console-grid"),
  peripheralList: document.getElementById("peripheral-official-list"),
  peripheralCustom: document.getElementById("peripheral-custom-form"),
  peripheralBack: document.getElementById("peripheral-back"),
  peripheralCancel: document.getElementById("peripheral-cancel"),
  globalSearch: document.getElementById("global-search"),
  undoToast: document.getElementById("undo-toast"),
  undoText: document.getElementById("undo-text"),
  undoBtn: document.getElementById("undo-btn"),
};

let state = { games: [], consoles: [], peripherals: [] };
let view = "collection";
let consoleFilter = "all";
let gameSort = { collection: "added", wishlist: "added", sold: "added" };
let sortReverse = { collection: false, wishlist: false, sold: false };
let extraFilter = { condition: "all", genre: "all", cover: "all" };
let peripheralStatus = "owned";
let editingId = null;
let itemKind = "game";
let peripheralConsoleId = "";
let pendingCover = null;
let pendingMeta = { released: "", genres: [] };
let searchTimer = 0;
const objectUrls = new Map();
const infoCache = new Map();
const longplayCache = new Map();
let detail = { kind: null, id: null };
let pendingOwnId = null;
let pendingOwnKind = "game";
let undoAction = null;
let undoTimer = 0;
let backupTimer = 0;

function uid() {
  return crypto.randomUUID();
}

function gameCopies(game) {
  return Array.isArray(game?.copies) ? game.copies : [];
}

function consoleCopies(con) {
  return Array.isArray(con?.copies) ? con.copies : [];
}

function inferredKit(condition) {
  const full = condition === "sealed" || condition === "cib";
  return { box: full, manual: full, inserts: full };
}

function migrateCopyItem(c = {}, fallback = {}) {
  const condition = c.condition || fallback.condition || "";
  const kit = inferredKit(condition);
  const paid = c.paidPrice ?? fallback.paidPrice;
  return {
    id: c.id || uid(),
    condition,
    notes: c.notes || "",
    region: c.region || fallback.region || "",
    box: typeof c.box === "boolean" ? c.box : kit.box,
    manual: typeof c.manual === "boolean" ? c.manual : kit.manual,
    inserts: typeof c.inserts === "boolean" ? c.inserts : kit.inserts,
    paidPrice: paid === "" || paid == null || Number.isNaN(Number(paid)) ? null : Number(paid),
    location: c.location || fallback.location || "",
  };
}

function migrateGame(game) {
  const meta = {
    released: game.released || "",
    genres: Array.isArray(game.genres) ? game.genres.filter(Boolean) : [],
    region: game.region || "",
    location: game.location || "",
    paidPrice: game.paidPrice == null || game.paidPrice === "" ? null : Number(game.paidPrice),
    box: typeof game.box === "boolean" ? game.box : inferredKit(game.condition).box,
    manual: typeof game.manual === "boolean" ? game.manual : inferredKit(game.condition).manual,
    inserts: typeof game.inserts === "boolean" ? game.inserts : inferredKit(game.condition).inserts,
  };
  const copies = gameCopies(game);
  if (copies.length) {
    return { ...game, ...meta, copies: copies.map((c) => migrateCopyItem(c, meta)) };
  }
  if (game.status === "owned" || game.status === "sold") {
    return { ...game, ...meta, copies: [migrateCopyItem({ condition: game.condition || "" }, meta)] };
  }
  return { ...game, ...meta, copies: [] };
}

function migratePeripheral(item) {
  const next = migrateGame({ ...item, status: item.status || "owned" });
  return next;
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
  return { ...con, copies, owned: copies.length > 0, wanted: copies.length ? false : Boolean(con.wanted) };
}

function syncConsoleOwned(con) {
  const copies = consoleCopies(con);
  return { ...con, copies, owned: copies.length > 0, wanted: copies.length ? false : Boolean(con.wanted) };
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
    peripherals: (base.peripherals || []).map(migratePeripheral),
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
      if (existing?.games?.length) {
        existing.peripherals = state.peripherals;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
        scheduleBackup();
        return;
      }
    } catch {
      /* ignore */
    }
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  scheduleBackup();
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

function regionLabel(value) {
  const labels = { pal: "PAL", "ntsc-u": "NTSC-U", "ntsc-j": "NTSC-J" };
  return labels[value] || "";
}

function kitLabel(item) {
  const bits = [item?.box && "Box", item?.manual && "Manual", item?.inserts && "Inserts"].filter(Boolean);
  return bits.join(" · ");
}

function money(value, currency) {
  if (value == null || value === "" || Number.isNaN(Number(value))) return "";
  const code = currency || marketPrefs.currency;
  if (!code) return Number(value).toFixed(Number(value) % 1 ? 2 : 0);
  try {
    return new Intl.NumberFormat(marketPrefs.display || undefined, {
      style: "currency",
      currency: code,
      maximumFractionDigits: Number(value) % 1 ? 2 : 0,
    }).format(Number(value));
  } catch {
    return `${Number(value).toFixed(Number(value) % 1 ? 2 : 0)} ${code}`;
  }
}

function sumSpent() {
  let total = 0;
  for (const game of state.games) {
    if (game.status !== "owned") continue;
    const copies = gameCopies(game);
    const copySum = copies.reduce((sum, item) => sum + (Number(item.paidPrice) || 0), 0);
    total += copySum || Number(game.paidPrice) || 0;
  }
  return total;
}

function sumHunting() {
  return state.games
    .filter((g) => g.status === "wishlist")
    .reduce((sum, g) => sum + (Number(g.maxPrice) || 0), 0);
}

function regionSelect(selectId, selected) {
  const opts = [
    ["", "Region"],
    ["pal", "PAL"],
    ["ntsc-u", "NTSC-U"],
    ["ntsc-j", "NTSC-J"],
  ];
  return `<select id="${selectId}">${opts
    .map(([value, label]) => `<option value="${value}" ${value === selected ? "selected" : ""}>${label}</option>`)
    .join("")}</select>`;
}

function kitFields(prefix, item = {}) {
  const kit = {
    box: Boolean(item.box),
    manual: Boolean(item.manual),
    inserts: Boolean(item.inserts),
  };
  return `<fieldset class="kit compact">
    <label class="check"><input type="checkbox" id="${prefix}-box" ${kit.box ? "checked" : ""} /> Box</label>
    <label class="check"><input type="checkbox" id="${prefix}-manual" ${kit.manual ? "checked" : ""} /> Manual</label>
    <label class="check"><input type="checkbox" id="${prefix}-inserts" ${kit.inserts ? "checked" : ""} /> Inserts</label>
  </fieldset>`;
}

function applyKitFromCondition(form, condition) {
  const kit = inferredKit(condition);
  if (form.elements.hasBox) form.elements.hasBox.checked = kit.box;
  if (form.elements.hasManual) form.elements.hasManual.checked = kit.manual;
  if (form.elements.hasInserts) form.elements.hasInserts.checked = kit.inserts;
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

function peripheralsFor() {
  const q = els.search.value.trim().toLowerCase();
  return state.peripherals
    .filter((p) => (p.status || "owned") === peripheralStatus)
    .filter((p) => consoleFilter === "all" || p.consoleId === consoleFilter)
    .filter((p) => !q || p.title.toLowerCase().includes(q));
}

function renderPeripheralChips() {
  const used = [...new Set(state.peripherals.filter((p) => (p.status || "owned") === peripheralStatus).map((p) => p.consoleId))];
  const statusChips = ["owned", "wishlist"]
    .map(
      (status) =>
        `<button class="chip ${peripheralStatus === status ? "active" : ""}" data-peri-status="${status}">${status === "owned" ? "Owned" : "Wishlist"}</button>`
    )
    .join("");
  const chips = [`<button class="chip ${consoleFilter === "all" ? "active" : ""}" data-filter="all" title="All">All</button>`]
    .concat(
      used.map((id) => {
        const con = consoleById(id);
        return `<button class="chip chip-logo ${consoleFilter === id ? "active" : ""}" data-filter="${id}">${consoleLogo(id, con?.name)}</button>`;
      })
    )
    .join("");
  return `<div class="toolbar">${statusChips}${chips}</div>`;
}

function sortKeyFor(status) {
  if (status === "wishlist") return "wishlist";
  if (status === "sold") return "sold";
  return "collection";
}

function currentSort(status) {
  return gameSort[sortKeyFor(status)] || "added";
}

function readSavedSort() {
  try {
    const raw = JSON.parse(localStorage.getItem("game-shelf-sort") || "null");
    if (!raw || typeof raw !== "object") return;
    if (raw.collection) gameSort.collection = raw.collection;
    if (raw.wishlist) gameSort.wishlist = raw.wishlist;
    if (raw.sold) gameSort.sold = raw.sold;
    if (raw.reverse) sortReverse = { ...sortReverse, ...raw.reverse };
  } catch {
    /* ignore */
  }
}

function writeSavedSort() {
  localStorage.setItem("game-shelf-sort", JSON.stringify({ ...gameSort, reverse: sortReverse }));
}

function primaryGenre(game) {
  return (game.genres || []).find(Boolean) || "";
}

function compareGames(sort) {
  return (a, b) => {
    if (sort === "title") return a.title.localeCompare(b.title, undefined, { sensitivity: "base" });
    if (sort === "console") {
      const ac = consoleById(a.consoleId)?.name || "";
      const bc = consoleById(b.consoleId)?.name || "";
      return ac.localeCompare(bc) || a.title.localeCompare(b.title, undefined, { sensitivity: "base" });
    }
    if (sort === "released") {
      const ar = a.released || "9999-99-99";
      const br = b.released || "9999-99-99";
      return ar.localeCompare(br) || a.title.localeCompare(b.title, undefined, { sensitivity: "base" });
    }
    if (sort === "genre") {
      const ag = primaryGenre(a) || "zzz";
      const bg = primaryGenre(b) || "zzz";
      return ag.localeCompare(bg) || a.title.localeCompare(b.title, undefined, { sensitivity: "base" });
    }
    return (a.addedAt || 0) - (b.addedAt || 0);
  };
}

function extraFilters(status) {
  const genres = [...new Set(state.games.filter((g) => g.status === status).map(primaryGenre).filter(Boolean))].sort();
  const conds = [
    ["all", "All conditions"],
    ["sealed", "Sealed"],
    ["cib", "CIB"],
    ["loose", "Loose"],
    ["digital", "Digital"],
  ];
  return `
    <label class="sort-field tight">
      <select data-extra-filter="condition">
        ${conds.map(([value, label]) => `<option value="${value}" ${extraFilter.condition === value ? "selected" : ""}>${label}</option>`).join("")}
      </select>
    </label>
    <label class="sort-field tight">
      <select data-extra-filter="genre">
        <option value="all" ${extraFilter.genre === "all" ? "selected" : ""}>All genres</option>
        ${genres.map((name) => `<option value="${escapeHtml(name)}" ${extraFilter.genre === name ? "selected" : ""}>${escapeHtml(name)}</option>`).join("")}
      </select>
    </label>
    <label class="sort-field tight">
      <select data-extra-filter="cover">
        <option value="all" ${extraFilter.cover === "all" ? "selected" : ""}>All covers</option>
        <option value="missing" ${extraFilter.cover === "missing" ? "selected" : ""}>No cover yet</option>
      </select>
    </label>
    <button type="button" class="ghost" data-sort-reverse="${sortKeyFor(status)}">${sortReverse[sortKeyFor(status)] ? "Z→A" : "A→Z"}</button>
  `;
}

function sortSelect(status) {
  const current = currentSort(status);
  const opts = [
    ["added", "Date added"],
    ["title", "Alphabetical"],
    ["console", "Console"],
    ["released", "Date released"],
    ["genre", "Genre"],
  ];
  return `<label class="sort-field">Sort
    <select data-game-sort="${sortKeyFor(status)}">
      ${opts.map(([value, label]) => `<option value="${value}" ${value === current ? "selected" : ""}>${label}</option>`).join("")}
    </select>
  </label>${extraFilters(status)}`;
}

function matchesExtra(game) {
  if (extraFilter.condition !== "all") {
    const conditions = [game.condition, ...gameCopies(game).map((c) => c.condition)].filter(Boolean);
    if (!conditions.includes(extraFilter.condition)) return false;
  }
  if (extraFilter.genre !== "all" && primaryGenre(game) !== extraFilter.genre) return false;
  if (extraFilter.cover === "missing" && game.coverUrl) return false;
  return true;
}

function gamesFor(status) {
  const q = els.search.value.trim().toLowerCase();
  const rows = state.games
    .filter((g) => g.status === status)
    .filter((g) => consoleFilter === "all" || g.consoleId === consoleFilter)
    .filter((g) => !q || g.title.toLowerCase().includes(q) || (g.location || "").toLowerCase().includes(q) || (g.notes || "").toLowerCase().includes(q))
    .filter(matchesExtra)
    .slice()
    .sort(compareGames(currentSort(status)));
  if (sortReverse[sortKeyFor(status)]) rows.reverse();
  return rows;
}

function setView(next) {
  if (!copy[next]) return;
  if (view !== next) {
    consoleFilter = "all";
    extraFilter = { condition: "all", genre: "all", cover: "all" };
  }
  view = next;
  els.nav.forEach((btn) => btn.classList.toggle("active", btn.dataset.view === next));
  Object.entries(els.views).forEach(([, node]) => {
    if (node) node.classList.toggle("hidden", node.id !== `view-${next}`);
  });
  if (els.title) els.title.textContent = copy[next].title;
  if (els.eyebrow) els.eyebrow.textContent = copy[next].eyebrow;
  const hideAdd = next === "consoles" || next === "finn" || next === "sold";
  const hideSearch = next === "finn";
  els.addBtn?.classList.toggle("hidden", hideAdd);
  els.fillCoversBtn?.classList.toggle("hidden", hideSearch || next === "consoles");
  els.search?.classList.toggle("hidden", hideSearch);
  if (els.addBtn) els.addBtn.textContent = next === "peripherals" ? "Add peripheral" : "Add game";
  if (els.search) els.search.placeholder = "Search games, consoles, peripherals…";
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
  return `<div class="toolbar">${chips}${sortSelect(status)}<button type="button" class="ghost toolbar-export" data-export-sheet="${status}" ${count ? "" : "disabled"}>${exportLabel}</button></div>`;
}

function copiesSummary(game) {
  const copies = gameCopies(game);
  const sample = copies[0] || game;
  if (game.status === "wishlist") {
    return [regionLabel(game.region), kitLabel(game), game.maxPrice ? `≤ ${money(game.maxPrice)}` : ""].filter(Boolean).join(" · ");
  }
  const labels = [...new Set(copies.map((item) => conditionLabel(item.condition)).filter(Boolean))];
  const paid = copies.reduce((sum, item) => sum + (Number(item.paidPrice) || 0), 0) || game.paidPrice;
  return [labels.join(" · "), regionLabel(sample.region), kitLabel(sample), paid ? money(paid) : "", sample.location].filter(Boolean).join(" · ");
}

function cubbyFacts(game) {
  const year = (game.released || "").slice(0, 4);
  return [year, primaryGenre(game)].filter(Boolean).join(" · ");
}

function renderGameCard(game, kind = "game") {
  const copies = gameCopies(game);
  const openAttr = kind === "peripheral" ? `data-open-peripheral="${game.id}"` : `data-open-game="${game.id}"`;
  const editAttr = kind === "peripheral" ? `data-edit-peripheral="${game.id}"` : `data-edit="${game.id}"`;
  const delAttr = kind === "peripheral" ? `data-delete-peripheral="${game.id}"` : `data-delete="${game.id}"`;
  const img = game.coverUrl
    ? `<img data-cover="${game.id}" src="${coverSrc(game.coverUrl)}" alt="">`
    : `<div class="cover-fallback" data-cover="${game.id}" style="background:${spineColor(game.consoleId)};aspect-ratio:${coverRatio(game.consoleId)}"></div>`;
  return `
    <article class="card cubby" ${openAttr}>
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
        ${(() => {
          const facts = cubbyFacts(game);
          const extra = copiesSummary(game);
          return `${facts ? `<p class="meta">${escapeHtml(facts)}</p>` : ""}${extra ? `<p class="meta">${escapeHtml(extra)}</p>` : ""}`;
        })()}
        ${game.notes ? `<p class="meta">${escapeHtml(game.notes)}</p>` : ""}
        <div class="card-actions">
          <button class="ghost" ${editAttr}>Edit</button>
          ${game.status === "wishlist" ? `<button class="ghost" data-own="${kind === "peripheral" ? "p:" : ""}${game.id}">Got it</button>` : ""}
          ${game.status === "owned" ? `<button class="ghost" data-sold="${kind === "peripheral" ? "p:" : ""}${game.id}">Sold</button>` : ""}
          ${game.status === "sold" ? `<button class="ghost" data-unsold="${kind === "peripheral" ? "p:" : ""}${game.id}">Back on shelf</button>` : ""}
          <button class="ghost" ${delAttr}>Remove</button>
        </div>
      </div>
    </article>`;
}

function renderCollection() {
  const games = gamesFor("owned");
  const titles = state.games.filter((g) => g.status === "owned").length;
  const copies = state.games.filter((g) => g.status === "owned").reduce((sum, g) => sum + Math.max(gameCopies(g).length, 1), 0);
  const wish = state.games.filter((g) => g.status === "wishlist").length;
  els.views.collection.innerHTML = `
    <div class="stats">
      <div class="stat"><span>Game copies</span><strong>${copies}</strong></div>
      <div class="stat"><span>Titles / wishlist</span><strong>${titles} / ${wish}</strong></div>
      <div class="stat"><span>Spent / hunting</span><strong>${money(sumSpent()) || "0"} / ${money(sumHunting()) || "0"}</strong></div>
    </div>
    ${renderChips("owned")}
    ${
      games.length
        ? `<div class="kallax"><div class="grid">${games.map(renderGameCard).join("")}</div></div>`
        : `<div class="empty">No games here yet. If your shelf vanished, open <a href="/recover.html">recover.html</a> in this same browser.</div>`
    }`;
  hydrateCovers(games);
  fillMissingMeta("owned");
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
  fillMissingMeta("wishlist");
}

function renderSold() {
  const games = gamesFor("sold");
  const periphs = state.peripherals.filter((p) => p.status === "sold");
  els.views.sold.innerHTML = `
    ${renderChips("sold")}
    ${
      games.length || periphs.length
        ? `<div class="kallax"><div class="grid">${games.map(renderGameCard).join("")}${periphs.map((item) => renderGameCard(item, "peripheral")).join("")}</div></div>`
        : `<div class="empty">Nothing sold or traded yet. Mark a copy as sold to keep the history.</div>`
    }`;
  hydrateCovers([...games, ...periphs]);
  fillMissingMeta("sold");
}

function renderConsoles() {
  const hunting = state.consoles.filter((c) => c.wanted && !consoleCopies(c).length);
  const tiles = (c, extraClass = "") => {
    const n = consoleCopies(c).length;
    return `
      <button type="button" class="console-tile ${n ? "on" : ""} ${c.wanted && !n ? "want" : ""} ${extraClass}" data-open-console="${c.id}" title="${escapeHtml(c.name)}">
        ${n ? `<span class="console-count">${n}</span>` : ""}
        ${c.wanted && !n ? `<span class="console-count hunt">Want</span>` : ""}
        ${consoleLogo(c.id, c.name)}
        <span class="console-name">${escapeHtml(c.name)}</span>
      </button>`;
  };
  const units = state.consoles.reduce((sum, c) => sum + consoleCopies(c).length, 0);
  els.views.consoles.innerHTML = `
    <p class="meta">Click a system to read about it and add units. Mark systems you are hunting before you own them. You currently have ${units} console${units === 1 ? "" : "s"}.</p>
    ${
      hunting.length
        ? `<p class="meta">Hunting</p><div class="console-grid">${hunting.map((c) => tiles(c)).join("")}</div>`
        : ""
    }
    <div class="console-grid">${state.consoles.filter((c) => !hunting.includes(c)).map((c) => tiles(c)).join("")}</div>
    <form class="add-console" id="add-console-form">
      <input name="name" placeholder="Add another console" required maxlength="40" />
      <button class="primary" type="submit">Add</button>
    </form>`;
}

function renderPeripherals() {
  const items = peripheralsFor();
  const count = state.peripherals.filter((p) => (p.status || "owned") === peripheralStatus).length;
  const copies = items.reduce((sum, p) => sum + Math.max(gameCopies(p).length, 1), 0);
  const tiles = PRESET_CONSOLES.map(
    (c) => `
      <button type="button" class="console-tile" data-add-peripherals="${c.id}" title="${escapeHtml(c.name)}">
        ${consoleLogo(c.id, c.name)}
        <span class="console-name">${escapeHtml(c.name)}</span>
      </button>`
  ).join("");
  els.views.peripherals.innerHTML = `
    <div class="stats">
      <div class="stat"><span>Accessories</span><strong>${count}</strong></div>
      <div class="stat"><span>Units</span><strong>${copies}</strong></div>
    </div>
    <p class="meta">Click a console for its official pads, cameras, multitaps, and so on. Pictures come from Wikipedia — use Fetch covers if a cubby is empty.</p>
    <div class="console-grid">${tiles}</div>
    ${renderPeripheralChips()}
    ${
      items.length
        ? `<div class="kallax"><div class="grid">${items.map((item) => renderGameCard(item, "peripheral")).join("")}</div></div>`
        : `<div class="empty">${peripheralStatus === "wishlist" ? "Wishlist is empty. Add official hardware while the Wishlist chip is selected." : "No peripherals yet. Pick a console above to add official hardware."}</div>`
    }`;
  hydrateCovers(items);
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

function syncFormMode() {
  const status = els.form.elements.status?.value || "owned";
  els.form.querySelectorAll(".wishlist-only").forEach((node) => node.classList.toggle("hidden", status !== "wishlist"));
  els.form.querySelectorAll(".owned-only").forEach((node) => node.classList.toggle("hidden", status !== "owned" && status !== "sold"));
}

function fillExtraFields(item = {}) {
  const sample = gameCopies(item)[0] || item;
  if (els.form.elements.region) els.form.elements.region.value = item.region || sample.region || "";
  if (els.form.elements.location) els.form.elements.location.value = item.location || sample.location || "";
  if (els.form.elements.paidPrice) els.form.elements.paidPrice.value = item.paidPrice ?? sample.paidPrice ?? "";
  const kit = {
    box: item.box ?? sample.box,
    manual: item.manual ?? sample.manual,
    inserts: item.inserts ?? sample.inserts,
  };
  if (els.form.elements.hasBox) els.form.elements.hasBox.checked = Boolean(kit.box);
  if (els.form.elements.hasManual) els.form.elements.hasManual.checked = Boolean(kit.manual);
  if (els.form.elements.hasInserts) els.form.elements.hasInserts.checked = Boolean(kit.inserts);
  syncFormMode();
}

function extraFieldsFromForm() {
  return {
    region: els.form.elements.region?.value || "",
    location: els.form.elements.location?.value.trim() || "",
    paidPrice: els.form.elements.paidPrice?.value ? Number(els.form.elements.paidPrice.value) : null,
    box: Boolean(els.form.elements.hasBox?.checked),
    manual: Boolean(els.form.elements.hasManual?.checked),
    inserts: Boolean(els.form.elements.hasInserts?.checked),
  };
}

function openGameDialog(game) {
  itemKind = "game";
  els.form.classList.remove("peripheral-form");
  editingId = game?.id || null;
  pendingCover = null;
  pendingMeta = { released: game?.released || "", genres: Array.isArray(game?.genres) ? game.genres : [] };
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
    fillExtraFields(game);
    loadCoverBlob(game.id).then((blob) => setCoverPreview(game.coverUrl, blob));
  } else {
    els.form.elements.status.value = status;
    els.form.elements.coverUrl.value = "";
    els.form.elements.catalogSlug.value = "";
    fillExtraFields({ ...inferredKit(status === "owned" ? "cib" : "") });
    if (status === "owned") {
      els.form.elements.condition.value = "cib";
      applyKitFromCondition(els.form, "cib");
    }
    setCoverPreview("", null);
    syncFormMode();
  }
  els.dialog.showModal();
}

function openPeripheralEdit(item) {
  itemKind = "peripheral";
  els.form.classList.add("peripheral-form");
  editingId = item?.id || null;
  pendingCover = null;
  els.dialogTitle.textContent = "Edit peripheral";
  els.form.reset();
  els.searchResults.innerHTML = "";
  els.searchResults.classList.add("hidden");
  fillConsolePicker("owned", item.consoleId);
  els.form.elements.title.value = item.title;
  els.form.elements.status.value = item.status || "owned";
  els.form.elements.condition.value = item.condition || "";
  els.form.elements.notes.value = item.notes || "";
  els.form.elements.coverUrl.value = item.coverUrl || "";
  els.form.elements.catalogSlug.value = item.searchQuery || "";
  fillExtraFields(item);
  loadCoverBlob(item.id).then((blob) => setCoverPreview(item.coverUrl, blob));
  els.dialog.showModal();
}

async function upsertGame(data) {
  if (itemKind === "peripheral") {
    await upsertPeripheral(data);
    return;
  }
  if (editingId) {
    state.games = state.games.map((g) => {
      if (g.id !== editingId) return g;
      const next = { ...g, ...data, copies: gameCopies(g) };
      if (pendingMeta.released) next.released = pendingMeta.released;
      if (pendingMeta.genres?.length) next.genres = pendingMeta.genres;
      if ((data.status === "owned" || data.status === "sold") && !gameCopies(next).length) {
        next.copies = [migrateCopyItem({ condition: data.condition || "" }, data)];
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
    if (pendingMeta.released && !twin.released) twin.released = pendingMeta.released;
    if (pendingMeta.genres?.length && !twin.genres?.length) twin.genres = pendingMeta.genres;
    if (pendingCover) await putCoverBlob(twin.id, pendingCover);
    save();
    return;
  }
  const id = uid();
  const copies =
    data.status === "owned" || data.status === "sold" ? [migrateCopyItem({ condition: data.condition || "" }, data)] : [];
  state.games.push({
    id,
    addedAt: Date.now(),
    soldAt: data.status === "sold" ? Date.now() : null,
    ...data,
    released: pendingMeta.released || "",
    genres: pendingMeta.genres || [],
    copies,
  });
  if (pendingCover) await putCoverBlob(id, pendingCover);
  save();
}

async function upsertPeripheral(data) {
  if (editingId) {
    state.peripherals = state.peripherals.map((p) => {
      if (p.id !== editingId) return p;
      return {
        ...p,
        ...data,
        searchQuery: data.catalogSlug || p.searchQuery,
        copies: gameCopies(p).length ? gameCopies(p) : data.status === "owned" || data.status === "sold" ? [migrateCopyItem(data, data)] : [],
      };
    });
    if (pendingCover) await putCoverBlob(editingId, pendingCover);
    save();
    return;
  }
  await addPeripheral({
    consoleId: data.consoleId,
    title: data.title,
    officialId: "",
    search: data.catalogSlug || data.title,
    condition: data.condition,
    notes: data.notes,
    coverUrl: data.coverUrl,
  });
}

function ownedCount(consoleId, officialId, title) {
  return state.peripherals.filter((p) => {
    if (p.consoleId !== consoleId) return false;
    if (officialId) return p.officialId === officialId;
    return normalizeTitle(p.title) === normalizeTitle(title);
  }).length;
}

async function addPeripheral({ consoleId, title, officialId, search, condition = "cib", notes = "", coverUrl = "" }) {
  const status = peripheralStatus === "wishlist" ? "wishlist" : "owned";
  const extras = inferredKit(condition);
  const twin = state.peripherals.find((p) => {
    if (p.consoleId !== consoleId) return false;
    if (officialId) return p.officialId === officialId;
    return normalizeTitle(p.title) === normalizeTitle(title);
  });
  if (twin) {
    if (status === "owned") {
      twin.status = "owned";
      twin.copies = [...gameCopies(twin), migrateCopyItem({ condition }, extras)];
    }
    if (coverUrl && !twin.coverUrl) twin.coverUrl = coverUrl;
    if (pendingCover) await putCoverBlob(twin.id, pendingCover);
    save();
    render();
    paintOfficialList();
    return twin;
  }
  const id = uid();
  const item = {
    id,
    addedAt: Date.now(),
    title,
    consoleId,
    officialId: officialId || "",
    searchQuery: search || title,
    status,
    condition,
    notes,
    coverUrl,
    ...inferredKit(condition),
    copies: status === "owned" ? [migrateCopyItem({ condition }, extras)] : [],
  };
  state.peripherals.push(item);
  if (pendingCover) await putCoverBlob(id, pendingCover);
  save();
  render();
  paintOfficialList();
  fetchItemCover(item, "peripheral").then(() => render());
  return item;
}

function showPeripheralConsoleStep() {
  peripheralConsoleId = "";
  if (els.peripheralTitle) els.peripheralTitle.textContent = "Add a peripheral";
  if (els.peripheralSub) els.peripheralSub.textContent = "Pick a console, then add official hardware from the list.";
  els.peripheralList?.classList.add("hidden");
  els.peripheralCustom?.classList.add("hidden");
  els.peripheralBack?.classList.add("hidden");
  if (!els.peripheralGrid) return;
  els.peripheralGrid.classList.remove("hidden");
  els.peripheralGrid.innerHTML = PRESET_CONSOLES.map(
    (c) => `
      <button type="button" class="console-tile" data-pick-peripheral-console="${c.id}" title="${escapeHtml(c.name)}">
        ${consoleLogo(c.id, c.name)}
        <span class="console-name">${escapeHtml(c.name)}</span>
      </button>`
  ).join("");
}

function paintOfficialList() {
  if (!peripheralConsoleId || !els.peripheralList) return;
  const list = officialFor(peripheralConsoleId);
  els.peripheralList.innerHTML = list
    .map((item) => {
      const n = ownedCount(peripheralConsoleId, item.id, item.name);
      return `
        <div class="official-row">
          <span>
            <strong>${escapeHtml(item.name)}</strong>
            ${n ? `<em>${n} in collection</em>` : ""}
          </span>
          <button type="button" class="primary" data-add-official="${item.id}">${
            peripheralStatus === "wishlist" ? (n ? "Want another" : "Want") : n ? "Add another" : "Add"
          }</button>
        </div>`;
    })
    .join("");
}

function openPeripheralCatalog(consoleId = "") {
  if (consoleId) {
    showOfficialStep(consoleId);
  } else {
    showPeripheralConsoleStep();
  }
  els.peripheralDialog?.showModal();
}

function showOfficialStep(consoleId) {
  peripheralConsoleId = consoleId;
  const con = consoleById(consoleId);
  if (els.peripheralTitle) els.peripheralTitle.textContent = `${con?.name || "Console"} peripherals`;
  if (els.peripheralSub) els.peripheralSub.textContent = "Official first-party hardware for this system. Add as many as you own.";
  els.peripheralGrid?.classList.add("hidden");
  els.peripheralList?.classList.remove("hidden");
  els.peripheralCustom?.classList.remove("hidden");
  els.peripheralBack?.classList.remove("hidden");
  paintOfficialList();
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
  const kind = pendingOwnKind;
  pendingOwnId = null;
  const extras = {
    condition,
    region: els.gotItForm?.elements.region?.value || "",
    location: els.gotItForm?.elements.location?.value.trim() || "",
    paidPrice: els.gotItForm?.elements.paidPrice?.value ? Number(els.gotItForm.elements.paidPrice.value) : null,
    box: Boolean(els.gotItForm?.elements.hasBox?.checked),
    manual: Boolean(els.gotItForm?.elements.hasManual?.checked),
    inserts: Boolean(els.gotItForm?.elements.hasInserts?.checked),
  };
  const copyItem = migrateCopyItem(extras, extras);
  if (kind === "peripheral") {
    state.peripherals = state.peripherals.map((p) =>
      p.id === id ? { ...p, status: "owned", condition, ...extras, copies: [...gameCopies(p), copyItem] } : p
    );
    save();
    peripheralStatus = "owned";
    setView("peripherals");
    return;
  }
  const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  const card = document.querySelector(`#view-wishlist [data-open-game="${id}"]`);
  const start = card?.getBoundingClientRect();

  state.games = state.games.map((g) =>
    g.id === id
      ? {
          ...g,
          status: "owned",
          condition,
          ...extras,
          copies: gameCopies(g).length
            ? gameCopies(g).map((row, index) => (index === 0 ? { ...row, ...copyItem, id: row.id } : row))
            : [copyItem],
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

function openGotItDialog(id, kind = "game") {
  const item = kind === "peripheral" ? state.peripherals.find((p) => p.id === id) : state.games.find((g) => g.id === id);
  if (!item || !els.gotIt) return;
  pendingOwnId = id;
  pendingOwnKind = kind;
  if (els.gotItTitle) {
    const con = consoleById(item.consoleId)?.name || "";
    els.gotItTitle.textContent = con ? `${item.title} · ${con}` : item.title;
  }
  const current = item.condition || "cib";
  if (els.gotItForm) {
    els.gotItForm.elements.condition.value = current;
    if (els.gotItForm.elements.region) els.gotItForm.elements.region.value = item.region || "";
    if (els.gotItForm.elements.location) els.gotItForm.elements.location.value = item.location || "";
    if (els.gotItForm.elements.paidPrice) els.gotItForm.elements.paidPrice.value = "";
    applyKitFromCondition(els.gotItForm, current);
  }
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

function hideLongplay() {
  if (!els.detailLongplay) return;
  els.detailLongplay.innerHTML = "";
  els.detailLongplay.classList.add("hidden");
}

function paintLongplay(hit) {
  if (!els.detailLongplay) return;
  if (!hit?.videoId) {
    hideLongplay();
    return;
  }
  const id = encodeURIComponent(hit.videoId);
  const watch = `https://www.youtube.com/watch?v=${id}`;
  els.detailLongplay.classList.remove("hidden");
  els.detailLongplay.innerHTML = `
    <p class="meta">Longplay</p>
    <div class="longplay-frame">
      <iframe
        src="https://www.youtube-nocookie.com/embed/${id}"
        title="${escapeHtml(hit.title || "Longplay")}"
        allow="accelerometer; clipboard-write; encrypted-media; picture-in-picture"
        allowfullscreen
        loading="lazy"
      ></iframe>
    </div>
    <p class="meta">
      <a href="${escapeHtml(watch)}" target="_blank" rel="noopener">${escapeHtml(hit.title || "Watch on YouTube")}</a>
      ${hit.author ? ` · ${escapeHtml(hit.author)}` : ""}
    </p>
  `;
}

async function loadLongplay(query, platform) {
  const key = `${platform}|${query}`;
  if (longplayCache.has(key)) return longplayCache.get(key);
  try {
    const params = new URLSearchParams({ q: query, platform: platform || "" });
    const res = await fetch(`/api/longplay?${params}`);
    const data = await res.json();
    longplayCache.set(key, data);
    return data;
  } catch {
    const empty = { videoId: null };
    longplayCache.set(key, empty);
    return empty;
  }
}

function renderGameCopies(game) {
  if (game.status === "wishlist") {
    els.detailCopies.innerHTML = `<p class="meta">Copies are tracked once you own it. Use Got it when a copy lands.</p>`;
    return;
  }
  const copies = gameCopies(game);
  els.detailCopies.innerHTML = `
    <p class="meta">${game.status === "sold" ? "Copies that left the shelf" : "Your copies"}</p>
    <div class="copy-list">
      ${
        copies
          .map((item) => {
            const bits = [conditionLabel(item.condition) || "Unspecified", regionLabel(item.region), kitLabel(item), item.paidPrice ? money(item.paidPrice) : "", item.location]
              .filter(Boolean)
              .join(" · ");
            return `
        <div class="copy-row">
          <strong>${escapeHtml(bits)}</strong>
          <button type="button" class="ghost" data-remove-copy="${item.id}">Remove</button>
        </div>`;
          })
          .join("") || `<p class="meta">No copies left. Add one below.</p>`
      }
    </div>
    ${
      game.status === "owned"
        ? `<div class="copy-add stack">
      ${conditionSelect("copy-condition", "cib")}
      ${regionSelect("copy-region", game.region || "")}
      ${kitFields("copy", inferredKit("cib"))}
      <input id="copy-paid" type="number" min="0" step="0.01" placeholder="Price paid" />
      <input id="copy-location" maxlength="80" placeholder="Location" />
      <button type="button" class="primary" id="add-copy-btn">Add copy</button>
    </div>`
        : ""
    }
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
      ${
        con.owned
          ? ""
          : `<button type="button" class="ghost" id="want-console-btn">${con.wanted ? "Stop hunting" : "Want this console"}</button>`
      }
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
    els.detailSub.textContent = [consoleById(game.consoleId)?.name, game.status === "owned" ? `${n} owned` : game.status === "sold" ? "Sold / traded" : "Wishlist"]
      .filter(Boolean)
      .join(" · ");
    renderGameCopies(game);
  }
  if (detail.kind === "peripheral") {
    const item = state.peripherals.find((p) => p.id === detail.id);
    if (!item) {
      els.detail.close();
      return;
    }
    const n = gameCopies(item).length;
    els.detailSub.textContent = [consoleById(item.consoleId)?.name, `${n} owned`].filter(Boolean).join(" · ");
    renderGameCopies(item);
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
  hideLongplay();
  refreshOpenDetail();
  els.detail.showModal();
  const opened = id;
  paintAbout(await loadInfo(game.title, game.consoleId, "game", game.catalogSlug || ""));
  if (detail.kind === "game" && detail.id === opened) {
    paintLongplay(await loadLongplay(game.title, game.consoleId));
  }
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
  hideLongplay();
  refreshOpenDetail();
  els.detail.showModal();
  paintAbout(await loadInfo(con.name, con.id, "console"));
}

async function openPeripheralDetail(id) {
  const item = state.peripherals.find((p) => p.id === id);
  if (!item || !els.detail) return;
  detail = { kind: "peripheral", id };
  els.detailTitle.textContent = item.title;
  els.detailEdit?.classList.remove("hidden");
  els.detailCover.classList.remove("logo-cover");
  if (item.coverUrl) {
    els.detailCover.src = coverSrc(item.coverUrl);
  } else {
    els.detailCover.removeAttribute("src");
  }
  try {
    const blob = await loadCoverBlob(item.id);
    if (blob) els.detailCover.src = URL.createObjectURL(blob);
  } catch {
    /* ignore */
  }
  els.detailAbout.innerHTML = `<p>Loading a short summary…</p>`;
  hideLongplay();
  refreshOpenDetail();
  els.detail.showModal();
  paintAbout(await loadInfo(item.searchQuery || item.title, item.consoleId, "peripheral"));
}

function render() {
  renderGlobalSearch();
  if (view === "collection") renderCollection();
  if (view === "wishlist") renderWishlist();
  if (view === "sold") renderSold();
  if (view === "consoles") renderConsoles();
  if (view === "peripherals") renderPeripherals();
}

function renderGlobalSearch() {
  if (!els.globalSearch) return;
  const q = els.search?.value.trim().toLowerCase() || "";
  if (q.length < 2 || view === "finn") {
    els.globalSearch.classList.add("hidden");
    els.globalSearch.innerHTML = "";
    return;
  }
  const games = state.games.filter((g) => g.title.toLowerCase().includes(q) || (g.notes || "").toLowerCase().includes(q) || (g.location || "").toLowerCase().includes(q));
  const consoles = state.consoles.filter((c) => c.name.toLowerCase().includes(q));
  const periphs = state.peripherals.filter((p) => p.title.toLowerCase().includes(q));
  if (!games.length && !consoles.length && !periphs.length) {
    els.globalSearch.classList.add("hidden");
    els.globalSearch.innerHTML = "";
    return;
  }
  const pile = (status) => ({ owned: "collection", wishlist: "wishlist", sold: "sold" }[status] || status);
  els.globalSearch.classList.remove("hidden");
  els.globalSearch.innerHTML = `
    <p class="meta">Across the shelf</p>
    <div class="global-hits">
      ${games
        .slice(0, 8)
        .map(
          (g) =>
            `<button type="button" class="ghost" data-jump-game="${g.id}">${escapeHtml(g.title)} · ${escapeHtml(consoleById(g.consoleId)?.name || "")} · ${escapeHtml(g.status)}</button>`
        )
        .join("")}
      ${consoles
        .slice(0, 6)
        .map((c) => `<button type="button" class="ghost" data-open-console="${c.id}">${escapeHtml(c.name)} · console</button>`)
        .join("")}
      ${periphs
        .slice(0, 6)
        .map((p) => `<button type="button" class="ghost" data-jump-peripheral="${p.id}">${escapeHtml(p.title)} · peripheral</button>`)
        .join("")}
    </div>
  `;
}

function scheduleBackup() {
  clearTimeout(backupTimer);
  backupTimer = window.setTimeout(() => {
    fetch("/api/backup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(state),
    }).catch(() => {});
  }, 900);
}

function showUndo(message, restore, commit) {
  if (undoAction?.commit) undoAction.commit();
  undoAction = { restore, commit };
  if (els.undoText) els.undoText.textContent = message;
  els.undoToast?.classList.remove("hidden");
  clearTimeout(undoTimer);
  undoTimer = window.setTimeout(() => {
    undoAction?.commit?.();
    undoAction = null;
    els.undoToast?.classList.add("hidden");
  }, 10000);
}

function splitOwnRef(raw) {
  if (String(raw).startsWith("p:")) return { kind: "peripheral", id: String(raw).slice(2) };
  return { kind: "game", id: raw };
}

function findDuplicate(title, consoleId, exceptId) {
  const want = normalizeTitle(title);
  return state.games.find(
    (g) => g.id !== exceptId && g.consoleId === consoleId && normalizeTitle(g.title) === want && g.status !== "sold"
  );
}

function markSold(kind, id) {
  if (kind === "peripheral") {
    state.peripherals = state.peripherals.map((p) => (p.id === id ? { ...p, status: "sold", soldAt: Date.now() } : p));
  } else {
    state.games = state.games.map((g) => (g.id === id ? { ...g, status: "sold", soldAt: Date.now() } : g));
  }
  save();
  setView("sold");
}

function restoreSold(kind, id) {
  if (kind === "peripheral") {
    state.peripherals = state.peripherals.map((p) => (p.id === id ? { ...p, status: "owned", soldAt: null } : p));
    peripheralStatus = "owned";
    save();
    setView("peripherals");
    return;
  }
  state.games = state.games.map((g) => (g.id === id ? { ...g, status: "owned", soldAt: null } : g));
  save();
  setView("collection");
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

const metaTried = new Set();
let metaFillBusy = false;

async function fillMissingMeta(status) {
  const sort = currentSort(status);
  if (sort !== "released" && sort !== "genre") return;
  if (metaFillBusy) return;
  const missing = state.games.filter(
    (g) => g.status === status && !metaTried.has(g.id) && (!g.released || !g.genres?.length)
  );
  if (!missing.length) return;
  metaFillBusy = true;
  let changed = false;
  for (const game of missing) {
    metaTried.add(game.id);
    try {
      const info = await loadInfo(game.title, game.consoleId, "game", game.catalogSlug || "");
      if (info.released && !game.released) {
        game.released = info.released;
        changed = true;
      }
      if (Array.isArray(info.genres) && info.genres.length && !game.genres?.length) {
        game.genres = info.genres;
        changed = true;
      }
    } catch {
      /* skip */
    }
  }
  metaFillBusy = false;
  if (changed) {
    save();
    render();
  }
}

async function fetchItemCover(item, kind) {
  const q = item.searchQuery || item.title;
  try {
    const res = await fetch(
      `/api/cover?q=${encodeURIComponent(q)}&platform=${encodeURIComponent(item.consoleId || "")}&kind=${encodeURIComponent(kind)}`
    );
    const data = await res.json();
    if (data.cover) {
      item.coverUrl = data.cover;
      save();
    }
  } catch {
    /* skip */
  }
}

let coverFillBusy = false;

async function fillMissingCovers() {
  if (coverFillBusy) return;
  coverFillBusy = true;
  els.fillCoversBtn.disabled = true;
  const pool = view === "peripherals" ? state.peripherals : state.games;
  const kind = view === "peripherals" ? "peripheral" : "game";
  const missing = [];
  for (const item of pool) {
    if (item.coverUrl) continue;
    const local = await loadCoverBlob(item.id);
    if (local) continue;
    missing.push(item);
  }
  if (!missing.length) {
    els.fillCoversBtn.disabled = false;
    coverFillBusy = false;
    return;
  }
  for (let i = 0; i < missing.length; i += 1) {
    els.eyebrow.textContent = `Fetching covers ${i + 1} / ${missing.length}`;
    await fetchItemCover(missing[i], kind);
    if (i === missing.length - 1 || i % 4 === 3) render();
  }
  els.eyebrow.textContent = copy[view].eyebrow;
  els.fillCoversBtn.disabled = false;
  coverFillBusy = false;
}

function rankSearchHits(items, query) {
  const want = normalizeTitle(query);
  if (!want) return [];
  return items
    .map((item) => {
      const got = normalizeTitle(item.title);
      const subtitle = String(item.subtitle || "").toLowerCase();
      let score = 0;
      if (got === want) score = 100;
      else if (got.startsWith(want) || want.startsWith(got)) score = 80;
      else if (got.includes(want) || want.includes(got)) score = 55;
      else if (/video game/.test(subtitle)) score = 20;
      if (/\b(film|movie|tv series|album|song|band|company|magazine)\b/.test(subtitle)) score -= 40;
      return { item, score };
    })
    .filter((row) => row.score >= 55)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map((row) => row.item);
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
document.body.addEventListener("change", (event) => {
  const sort = event.target.closest("[data-game-sort]");
  if (sort) {
    const which = sort.dataset.gameSort || sortKeyFor(view);
    gameSort[which] = sort.value;
    writeSavedSort();
    render();
    return;
  }
  const extra = event.target.closest("[data-extra-filter]");
  if (extra) {
    extraFilter[extra.dataset.extraFilter] = extra.value;
    render();
  }
});
els.addBtn?.addEventListener("click", () => {
  if (view === "peripherals") openPeripheralCatalog();
  else openGameDialog();
});
els.fillCoversBtn?.addEventListener("click", () => fillMissingCovers());
els.cancel?.addEventListener("click", () => els.dialog.close());
els.catalogBtn?.addEventListener("click", async () => {
  try {
    const data = await (await fetch("/api/settings")).json();
    applyMarketSettings(data);
    const select = els.catalogForm?.elements.locale;
    if (select) {
      const current = data.locale || "";
      select.innerHTML = `<option value="">Choose a market</option>${(data.markets || [])
        .map((item) => `<option value="${escapeHtml(item.id)}">${escapeHtml(item.label)}</option>`)
        .join("")}`;
      select.value = [...select.options].some((opt) => opt.value === current) ? current : "";
    }
    if (els.catalogStatus) {
      const place = data.resolved
        ? ` Prices and the market tab use ${data.resolved.currency}${data.resolved.classifieds ? ` and ${data.resolved.classifieds.name}` : ""}.`
        : "";
      const rawg = data.rawg
        ? "RAWG is connected. Title search will use the games database."
        : "No RAWG key yet — search still uses Wikipedia until you save one.";
      const ebay = data.ebay
        ? " eBay App ID is saved for wishlist listings."
        : " eBay listings work best with an App ID; search links still work without one.";
      els.catalogStatus.textContent = rawg + ebay + place;
    }
  } catch {
    if (els.catalogStatus) els.catalogStatus.textContent = "Could not read catalog settings.";
  }
  els.catalogDialog?.showModal();
});
els.catalogCancel?.addEventListener("click", () => els.catalogDialog.close());
els.catalogForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const payload = { locale: els.catalogForm.elements.locale?.value || "auto" };
  const rawg_key = els.catalogForm.elements.rawgKey.value.trim();
  const ebay_app_id = els.catalogForm.elements.ebayAppId?.value.trim() || "";
  if (rawg_key) payload.rawg_key = rawg_key;
  if (ebay_app_id) payload.ebay_app_id = ebay_app_id;
  const res = await fetch("/api/settings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) {
    if (els.catalogStatus) els.catalogStatus.textContent = data.error || "Could not save.";
    return;
  }
  applyMarketSettings(data);
  if (els.catalogStatus) {
    const bits = [`Using ${data.resolved?.currency || "local currency"}.`];
    if (payload.rawg_key) bits.push(data.rawg ? "RAWG saved." : "RAWG not saved.");
    if (payload.ebay_app_id) bits.push(data.ebay ? "eBay App ID saved." : "eBay App ID not saved.");
    els.catalogStatus.textContent = bits.join(" ");
  }
  els.catalogForm.elements.rawgKey.value = "";
  if (els.catalogForm.elements.ebayAppId) els.catalogForm.elements.ebayAppId.value = "";
  infoCache.clear();
});
els.form.elements.status.addEventListener("change", () => {
  fillConsolePicker(els.form.elements.status.value, els.form.elements.consoleId.value);
  syncFormMode();
});
els.form.elements.condition?.addEventListener("change", () => applyKitFromCondition(els.form, els.form.elements.condition.value));

els.form.elements.title.addEventListener("input", () => {
  const q = els.form.elements.title.value.trim();
  clearTimeout(searchTimer);
  if (q.length < 2) {
    els.searchResults.classList.add("hidden");
    return;
  }
  searchTimer = setTimeout(async () => {
    try {
      const body = await searchCatalog(q, "");
      showSearchResults(rankSearchHits(body.items || [], q), body.source);
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
  pendingMeta = {
    released: item.released || "",
    genres: Array.isArray(item.genres) ? item.genres : [],
  };
  pendingCover = null;
  setCoverPreview(item.cover, null);
  els.searchResults.classList.add("hidden");
});

els.consolePicker.addEventListener("click", (event) => {
  els.searchResults.classList.add("hidden");
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
    ...extraFieldsFromForm(),
  };
  if (!data.title || !data.consoleId) return;
  if (itemKind === "game") {
    const dup = findDuplicate(data.title, data.consoleId, editingId);
    if (dup) {
      const where = dup.status === "wishlist" ? "the wishlist" : "the collection";
      if (!window.confirm(`“${dup.title}” is already on ${where} for this console. Add anyway?`)) return;
    }
  }
  await upsertGame(data);
  els.dialog.close();
  if (itemKind === "peripheral") setView("peripherals");
  else if (data.status === "wishlist") setView("wishlist");
  else if (data.status === "sold") setView("sold");
  else setView("collection");
});

document.body.addEventListener("click", (event) => {
  if (event.target.closest(".card-actions")) {
    event.stopPropagation();
  }
  const periStatus = event.target.closest("[data-peri-status]");
  if (periStatus) {
    peripheralStatus = periStatus.dataset.periStatus;
    consoleFilter = "all";
    render();
    return;
  }
  const reverse = event.target.closest("[data-sort-reverse]");
  if (reverse) {
    const which = reverse.dataset.sortReverse;
    sortReverse[which] = !sortReverse[which];
    writeSavedSort();
    render();
    return;
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
  const editPeriph = event.target.closest("[data-edit-peripheral]");
  if (editPeriph) {
    const item = state.peripherals.find((p) => p.id === editPeriph.dataset.editPeripheral);
    if (item) openPeripheralEdit(item);
    return;
  }
  const addPeriphs = event.target.closest("[data-add-peripherals]");
  if (addPeriphs) {
    openPeripheralCatalog(addPeriphs.dataset.addPeripherals);
    return;
  }
  const pickPeriphConsole = event.target.closest("[data-pick-peripheral-console]");
  if (pickPeriphConsole) {
    showOfficialStep(pickPeriphConsole.dataset.pickPeripheralConsole);
    return;
  }
  const addOfficial = event.target.closest("[data-add-official]");
  if (addOfficial) {
    const spec = officialFor(peripheralConsoleId).find((item) => item.id === addOfficial.dataset.addOfficial);
    if (spec) addPeripheral({ consoleId: peripheralConsoleId, title: spec.name, officialId: spec.id, search: spec.search });
    return;
  }
  const own = event.target.closest("[data-own]");
  if (own) {
    const ref = splitOwnRef(own.dataset.own);
    openGotItDialog(ref.id, ref.kind);
    return;
  }
  const sold = event.target.closest("[data-sold]");
  if (sold) {
    const ref = splitOwnRef(sold.dataset.sold);
    markSold(ref.kind, ref.id);
    return;
  }
  const unsold = event.target.closest("[data-unsold]");
  if (unsold) {
    const ref = splitOwnRef(unsold.dataset.unsold);
    restoreSold(ref.kind, ref.id);
    return;
  }
  const jumpGame = event.target.closest("[data-jump-game]");
  if (jumpGame) {
    const game = state.games.find((g) => g.id === jumpGame.dataset.jumpGame);
    if (game) {
      setView(game.status === "wishlist" ? "wishlist" : game.status === "sold" ? "sold" : "collection");
      openGameDetail(game.id);
    }
    return;
  }
  const jumpPeri = event.target.closest("[data-jump-peripheral]");
  if (jumpPeri) {
    const item = state.peripherals.find((p) => p.id === jumpPeri.dataset.jumpPeripheral);
    if (item) {
      peripheralStatus = item.status === "wishlist" ? "wishlist" : "owned";
      setView(item.status === "sold" ? "sold" : "peripherals");
      openPeripheralDetail(item.id);
    }
    return;
  }
  const del = event.target.closest("[data-delete]");
  if (del) {
    const id = del.dataset.delete;
    const snapshot = state.games.find((g) => g.id === id);
    if (!snapshot) return;
    state.games = state.games.filter((g) => g.id !== id);
    save();
    render();
    showUndo(`Removed ${snapshot.title}`, () => {
      state.games.push(snapshot);
    }, () => deleteCoverBlob(id));
    return;
  }
  const delPeriph = event.target.closest("[data-delete-peripheral]");
  if (delPeriph) {
    const id = delPeriph.dataset.deletePeripheral;
    const snapshot = state.peripherals.find((p) => p.id === id);
    if (!snapshot) return;
    state.peripherals = state.peripherals.filter((p) => p.id !== id);
    save();
    render();
    showUndo(`Removed ${snapshot.title}`, () => {
      state.peripherals.push(snapshot);
    }, () => deleteCoverBlob(id));
    return;
  }
  const openGame = event.target.closest("[data-open-game]");
  if (openGame && !event.target.closest(".card-actions")) {
    openGameDetail(openGame.dataset.openGame);
    return;
  }
  const openPeripheral = event.target.closest("[data-open-peripheral]");
  if (openPeripheral && !event.target.closest(".card-actions")) {
    openPeripheralDetail(openPeripheral.dataset.openPeripheral);
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
  applyKitFromCondition(els.gotItForm, btn.dataset.condition);
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
  if (detail.kind === "peripheral") {
    const item = state.peripherals.find((p) => p.id === detail.id);
    els.detail.close();
    if (item) openPeripheralEdit(item);
    return;
  }
  const game = state.games.find((g) => g.id === detail.id);
  els.detail.close();
  if (game) openGameDialog(game);
});
els.detail?.addEventListener("click", (event) => {
  if (event.target.id === "add-copy-btn") {
    const pool = detail.kind === "peripheral" ? state.peripherals : state.games;
    const game = pool.find((g) => g.id === detail.id);
    if (!game) return;
    const condition = document.getElementById("copy-condition")?.value || "";
    game.copies = [
      ...gameCopies(game),
      migrateCopyItem({
        condition,
        region: document.getElementById("copy-region")?.value || "",
        box: document.getElementById("copy-box")?.checked,
        manual: document.getElementById("copy-manual")?.checked,
        inserts: document.getElementById("copy-inserts")?.checked,
        paidPrice: document.getElementById("copy-paid")?.value,
        location: document.getElementById("copy-location")?.value.trim() || "",
      }),
    ];
    game.status = "owned";
    save();
    render();
    refreshOpenDetail();
    return;
  }
  if (event.target.id === "want-console-btn") {
    const con = consoleById(detail.id);
    if (!con) return;
    con.wanted = !con.wanted;
    Object.assign(con, syncConsoleOwned(con));
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
    const pool = detail.kind === "peripheral" ? state.peripherals : state.games;
    const game = pool.find((g) => g.id === detail.id);
    if (!game) return;
    game.copies = gameCopies(game).filter((c) => c.id !== removeCopy.dataset.removeCopy);
    if (detail.kind !== "peripheral" && !game.copies.length) game.status = "wishlist";
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

els.undoBtn?.addEventListener("click", () => {
  clearTimeout(undoTimer);
  undoAction?.restore?.();
  undoAction = null;
  els.undoToast?.classList.add("hidden");
  save();
  render();
});
els.peripheralCancel?.addEventListener("click", () => els.peripheralDialog?.close());
els.peripheralBack?.addEventListener("click", () => showPeripheralConsoleStep());
els.peripheralCustom?.addEventListener("submit", (event) => {
  event.preventDefault();
  const title = els.peripheralCustom.elements.title.value.trim();
  if (!title || !peripheralConsoleId) return;
  addPeripheral({ consoleId: peripheralConsoleId, title, officialId: "", search: title });
  els.peripheralCustom.reset();
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
  state.peripherals = (parsed.peripherals || []).map(migratePeripheral);
  save();
  render();
  els.importInput.value = "";
  fillMissingCovers();
});

state = load();
readSavedSort();
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
fetch("/api/settings")
  .then((res) => res.json())
  .then(applyMarketSettings)
  .catch(() => {});

document.addEventListener("shelf:market-saved", (event) => {
  if (event.detail) applyMarketSettings(event.detail);
});
