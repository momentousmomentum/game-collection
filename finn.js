const STORAGE_KEY = "game-shelf-v1";
const view = document.getElementById("view-finn");

let scanning = false;
let rows = [];

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

function formatNok(value) {
  if (value == null || Number.isNaN(value)) return "";
  return `${Math.round(value)} kr`;
}

function formatMoney(value, currency) {
  if (value == null || Number.isNaN(Number(value))) return "";
  const amount = Number(value);
  if (currency === "NOK") return formatNok(amount);
  try {
    return new Intl.NumberFormat("en", { style: "currency", currency: currency || "USD", maximumFractionDigits: 2 }).format(amount);
  } catch {
    return `${amount} ${currency || ""}`.trim();
  }
}

function defaultFinnUrl(game) {
  const q = [game.title, game.consoleName].filter(Boolean).join(" ");
  return `https://www.finn.no/recommerce/forsale/search?${new URLSearchParams({
    q,
    sub_category: "1.93.3905",
  })}`;
}

function defaultEbayUrl(game) {
  const q = [game.title, game.consoleName].filter(Boolean).join(" ");
  return `https://www.ebay.com/sch/i.html?${new URLSearchParams({
    _nkw: q,
    _sacat: "139973",
    _sop: "15",
    LH_BIN: "1",
  })}`;
}

function marketBlock(game, row, market) {
  const label = market === "ebay" ? "eBay" : "FINN";
  const fallback = market === "ebay" ? defaultEbayUrl(game) : defaultFinnUrl(game);
  const data = row?.[market];
  if (!data) {
    return scanning
      ? `<p class="meta">${escapeHtml(label)}: looking…</p>`
      : `<a class="ghost finn-link" href="${escapeHtml(fallback)}" target="_blank" rel="noopener">Search on ${escapeHtml(label)}</a>`;
  }
  const listings = (data.items || [])
    .filter((item) => item.url)
    .slice()
    .sort((a, b) => (a.price ?? 1e12) - (b.price ?? 1e12));
  const compareNok = market === "finn" && row.maxPrice;
  const underNote =
    compareNok && listings.some((item) => item.price != null && item.price <= row.maxPrice)
      ? `<p class="meta">At or under your ${escapeHtml(formatNok(row.maxPrice))} target on FINN.</p>`
      : "";
  if (!listings.length) {
    return `
      <p class="meta">${escapeHtml(label)}: ${escapeHtml(data.error || "No listings found.")}</p>
      <a class="ghost finn-link" href="${escapeHtml(data.searchUrl || fallback)}" target="_blank" rel="noopener">Search on ${escapeHtml(label)}</a>`;
  }
  return `
    ${underNote}
    <div class="finn-deals">
      ${listings
        .map((item) => {
          const price = formatMoney(item.price, item.currency || (market === "finn" ? "NOK" : "USD")) || "See listing";
          const under = compareNok && item.price != null && item.price <= row.maxPrice ? " under-target" : "";
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

function renderFinn() {
  if (!view) return;
  const wish = wishlistGames();
  view.innerHTML = `
    <div class="deals-head">
      <p class="meta">Checks FINN Torget and eBay for titles on your wishlist. Collection stays untouched. eBay listings need an App ID under Catalog if eBay blocks anonymous search.</p>
      <button class="primary" id="finn-scan-btn" ${scanning || !wish.length ? "disabled" : ""}>
        ${scanning ? "Checking markets…" : "Check wishlist"}
      </button>
    </div>
    ${
      !wish.length
        ? `<div class="empty">Add games to the wishlist first.</div>`
        : `<div class="finn-list">${wish
            .map((game) => {
              const row = rows.find((r) => r.id === game.id);
              return `
                <article class="finn-row">
                  <h3>${escapeHtml(game.title)}</h3>
                  <p class="meta">${escapeHtml(game.consoleName)}${game.maxPrice ? ` · FINN target ${escapeHtml(formatNok(game.maxPrice))}` : ""}</p>
                  <p class="market-label">FINN</p>
                  ${marketBlock(game, row, "finn")}
                  <p class="market-label">eBay</p>
                  ${marketBlock(game, row, "ebay")}
                </article>`;
            })
            .join("")}</div>`
    }`;
}

async function fetchMarket(path, game) {
  const params = new URLSearchParams({ q: game.title, platform: game.consoleId || "" });
  try {
    const res = await fetch(`${path}?${params}`);
    return await res.json();
  } catch {
    return { items: [], error: "Could not reach the market." };
  }
}

async function checkOne(game) {
  const [finn, ebay] = await Promise.all([fetchMarket("/api/finn", game), fetchMarket("/api/ebay", game)]);
  return { id: game.id, maxPrice: game.maxPrice, finn, ebay };
}

async function scanWishlist() {
  if (scanning) return;
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

document.addEventListener("shelf:view", (event) => {
  if (event.detail !== "finn") return;
  renderFinn();
});

document.body.addEventListener("click", (event) => {
  if (event.target.id === "finn-scan-btn") {
    event.preventDefault();
    scanWishlist();
  }
});
