const STORAGE_KEY = "game-shelf-v1";
const LOCALE_KEY = "game-shelf-market";
const view = document.getElementById("view-finn");

let scanning = false;
let rows = [];
let locale = "";
let choices = [];
let market = {
  id: "",
  currency: "",
  display: undefined,
  classifieds: null,
  ebay: { name: "eBay", host: "www.ebay.com", currency: "USD" },
};

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function loadShelf() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "null") || { games: [], consoles: [] };
  } catch {
    return { games: [], consoles: [] };
  }
}

function wishlistGames() {
  const shelf = loadShelf();
  const names = new Map((shelf.consoles || []).map((c) => [c.id, c.name]));
  return (shelf.games || [])
    .filter((g) => g.status === "wishlist")
    .map((g) => ({
      id: g.id,
      title: g.title,
      consoleId: g.consoleId,
      consoleName: names.get(g.consoleId) || g.consoleId,
      maxPrice: g.maxPrice,
    }));
}

function formatMoney(value, currency) {
  if (value == null || Number.isNaN(Number(value))) return "";
  const code = currency || market.currency;
  if (!code) return `${Number(value)}`;
  try {
    return new Intl.NumberFormat(market.display || undefined, {
      style: "currency",
      currency: code,
      maximumFractionDigits: 2,
    }).format(Number(value));
  } catch {
    return `${Number(value)} ${code}`.trim();
  }
}

function classifiedsName(row) {
  return row?.classifieds?.market?.classifieds?.name || market.classifieds?.name || "Classifieds";
}

function defaultClassifiedsUrl(game) {
  const q = [game.title, game.consoleName].filter(Boolean).join(" ");
  const site = market.classifieds;
  if (!site) return "";
  const id = site.id;
  if (id === "finn" || id === "blocket" || id === "tori" || id === "dba") {
    const host = { finn: "www.finn.no", blocket: "www.blocket.se", tori: "www.tori.fi", dba: "www.dba.dk" }[id];
    return `https://${host}/recommerce/forsale/search?${new URLSearchParams({ q, sub_category: "1.93.3905" })}`;
  }
  return "";
}

function defaultEbayUrl(game) {
  const q = [game.title, game.consoleName].filter(Boolean).join(" ");
  const host = market.ebay?.host || "www.ebay.com";
  return `https://${host}/sch/i.html?${new URLSearchParams({
    _nkw: q,
    _sacat: "139973",
    _sop: "15",
    LH_BIN: "1",
  })}`;
}

function marketBlock(game, row, kind) {
  const isEbay = kind === "ebay";
  const label = isEbay ? "eBay" : classifiedsName(row);
  const fallback = isEbay ? defaultEbayUrl(game) : defaultClassifiedsUrl(game);
  const data = isEbay ? row?.ebay : row?.classifieds;
  if (!isEbay && !market.classifieds && !data) {
    return `<p class="meta">No local classifieds site for this country.</p>`;
  }
  if (!data) {
    return scanning
      ? `<p class="meta">${escapeHtml(label)}: looking…</p>`
      : fallback
        ? `<a class="ghost finn-link" href="${escapeHtml(fallback)}" target="_blank" rel="noopener">Search on ${escapeHtml(label)}</a>`
        : `<p class="meta">${escapeHtml(label)}: no search link.</p>`;
  }
  const listings = (data.items || [])
    .filter((item) => item.url)
    .slice()
    .sort((a, b) => (a.price ?? 1e12) - (b.price ?? 1e12));
  const localCurrency = market.currency;
  const compare =
    !isEbay &&
    row.maxPrice &&
    listings.some((item) => item.currency === localCurrency || !item.currency);
  const underNote =
    compare && listings.some((item) => item.price != null && item.price <= row.maxPrice && (item.currency === localCurrency || !item.currency))
      ? `<p class="meta">At or under your ${escapeHtml(formatMoney(row.maxPrice, localCurrency))} target on ${escapeHtml(label)}.</p>`
      : "";
  if (!listings.length) {
    if (!fallback && !data.searchUrl) {
      return `<p class="meta">${escapeHtml(label)}: ${escapeHtml(data.error || "No listings found.")}</p>`;
    }
    return `
      <p class="meta">${escapeHtml(label)}: ${escapeHtml(data.error || "No listings found.")}</p>
      <a class="ghost finn-link" href="${escapeHtml(data.searchUrl || fallback)}" target="_blank" rel="noopener">Search on ${escapeHtml(label)}</a>`;
  }
  return `
    ${underNote}
    <div class="finn-deals">
      ${listings
        .map((item) => {
          const price = formatMoney(item.price, item.currency || (isEbay ? market.ebay?.currency : localCurrency)) || "See listing";
          const under =
            !isEbay &&
            row.maxPrice &&
            item.price != null &&
            item.price <= row.maxPrice &&
            (item.currency === localCurrency || !item.currency)
              ? " under-target"
              : "";
          return `
            <a class="finn-deal${under}" href="${escapeHtml(item.url)}" target="_blank" rel="noopener">
              <strong>${escapeHtml(price)}</strong>
              <span>${escapeHtml(item.title || `${label} listing`)}</span>
            </a>`;
        })
        .join("")}
    </div>
    <a class="ghost finn-link" href="${escapeHtml(data.searchUrl || fallback)}" target="_blank" rel="noopener">More on ${escapeHtml(label)}</a>`;
}

function pickerHtml() {
  const selected = market.id || locale || "";
  return `
    <label class="market-picker">
      Market
      <select id="market-locale">
        <option value="">Choose a market</option>
        ${choices
          .map(
            (item) =>
              `<option value="${escapeHtml(item.id)}" ${item.id === selected ? "selected" : ""}>${escapeHtml(item.label)}</option>`
          )
          .join("")}
      </select>
    </label>`;
}

function applySettings(data) {
  if (!data) return;
  choices = data.markets || choices;
  locale = data.locale || "";
  if (data.resolved?.id) {
    market = data.resolved;
    locale = data.resolved.id;
  } else if (!locale) {
    market = { ...market, id: "", classifieds: null, currency: "" };
  }
}

function renderFinn() {
  if (!view) return;
  const wish = wishlistGames();
  const picked = Boolean(market.id);
  const localName = market.classifieds?.name;
  const intro = !picked
    ? "Pick FINN, Blocket, Tori, DBA, or another market. Shelf prices follow that currency."
    : localName
      ? `Checks ${localName} and eBay for wishlist titles, in ${market.currency}. Collection stays untouched.`
      : `Checks eBay for wishlist titles, in ${market.currency}. Collection stays untouched.`;
  view.innerHTML = `
    <div class="deals-head">
      ${pickerHtml()}
      <p class="meta">${escapeHtml(intro)}</p>
      <button class="primary" id="finn-scan-btn" ${scanning || !wish.length || !picked ? "disabled" : ""}>
        ${scanning ? "Checking market…" : "Check wishlist"}
      </button>
    </div>
    ${
      !picked
        ? `<div class="empty">Choose a market above — FINN for Norway, Blocket for Sweden, and so on.</div>`
        : !wish.length
          ? `<div class="empty">Add games to the wishlist first.</div>`
          : `<div class="finn-list">${wish
              .map((game) => {
                const row = rows.find((r) => r.id === game.id);
                const name = classifiedsName(row);
                return `
                <article class="finn-row">
                  <h3>${escapeHtml(game.title)}</h3>
                  <p class="meta">${escapeHtml(game.consoleName)}${game.maxPrice ? ` · target ${escapeHtml(formatMoney(game.maxPrice, market.currency))}` : ""}</p>
                  ${
                    market.classifieds
                      ? `<p class="market-label">${escapeHtml(name)}</p>${marketBlock(game, row, "classifieds")}`
                      : ""
                  }
                  <p class="market-label">eBay</p>
                  ${marketBlock(game, row, "ebay")}
                </article>`;
              })
              .join("")}</div>`
    }`;
}

async function fetchMarket(path, game) {
  const params = new URLSearchParams({ q: game.title, platform: game.consoleId || "", locale: market.id || locale });
  try {
    const res = await fetch(`${path}?${params}`);
    return await res.json();
  } catch {
    return { items: [], error: "Could not reach the market." };
  }
}

async function checkOne(game) {
  const [classifieds, ebay] = await Promise.all([fetchMarket("/api/finn", game), fetchMarket("/api/ebay", game)]);
  return { id: game.id, maxPrice: game.maxPrice, classifieds, ebay };
}

async function scanWishlist() {
  if (scanning || !market.id) return;
  const wish = wishlistGames();
  if (!wish.length) return;
  scanning = true;
  rows = [];
  renderFinn();
  for (const game of wish) {
    rows.push(await checkOne(game));
    renderFinn();
  }
  scanning = false;
  renderFinn();
}

async function saveLocale(next) {
  locale = next;
  try {
    localStorage.setItem(LOCALE_KEY, next);
  } catch {
    /* ignore */
  }
  rows = [];
  try {
    const res = await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale: next || "auto" }),
    });
    const data = await res.json();
    applySettings(data);
    document.dispatchEvent(new CustomEvent("shelf:market-saved", { detail: data }));
  } catch {
    market = { ...market, id: next };
  }
  renderFinn();
}

async function loadMarket() {
  try {
    const data = await (await fetch("/api/settings")).json();
    applySettings(data);
    if (!data.locale) {
      let stored = "";
      try {
        stored = localStorage.getItem(LOCALE_KEY) || "";
      } catch {
        stored = "";
      }
      if (stored) {
        await saveLocale(stored);
        return;
      }
    }
  } catch {
    /* keep last known market */
  }
  renderFinn();
}

document.addEventListener("shelf:view", (event) => {
  if (event.detail !== "finn") return;
  loadMarket();
});

document.addEventListener("shelf:market", (event) => {
  const data = event.detail;
  if (!data) return;
  if (data.markets || data.resolved || "locale" in data) applySettings(data);
  else if (data.id) market = data;
  renderFinn();
});

document.body.addEventListener("click", (event) => {
  if (event.target.id === "finn-scan-btn") {
    event.preventDefault();
    scanWishlist();
  }
});

document.body.addEventListener("change", (event) => {
  if (event.target.id !== "market-locale") return;
  saveLocale(event.target.value);
});
