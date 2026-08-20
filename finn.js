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

function listingLinks(game, row) {
  if (!row) {
    return scanning
      ? `<p class="meta">Looking…</p>`
      : `<p class="meta">Not checked yet.</p>
         <a class="ghost finn-link" href="${escapeHtml(defaultSearchUrl(game))}" target="_blank" rel="noopener">Search on FINN</a>`;
  }
  const listings = (row.items || [])
    .filter((item) => item.url)
    .slice()
    .sort((a, b) => (a.price ?? 1e12) - (b.price ?? 1e12));
  const targetNote =
    row.maxPrice && listings.some((item) => item.price != null && item.price <= row.maxPrice)
      ? `<p class="meta">At or under your ${escapeHtml(formatNok(row.maxPrice))} target.</p>`
      : "";
  if (!listings.length) {
    return `
      <p class="meta">${escapeHtml(row.error || "No listings found.")}</p>
      ${targetNote}
      <a class="ghost finn-link" href="${escapeHtml(row.searchUrl || defaultSearchUrl(game))}" target="_blank" rel="noopener">Search on FINN</a>`;
  }
  return `
    ${targetNote}
    <div class="finn-deals">
      ${listings
        .map((item) => {
          const price = formatNok(item.price) || "See listing";
          const under = row.maxPrice && item.price != null && item.price <= row.maxPrice ? " under-target" : "";
          return `
            <a class="finn-deal${under}" href="${escapeHtml(item.url)}" target="_blank" rel="noopener">
              <strong>${escapeHtml(price)}</strong>
              <span>${escapeHtml(item.title || "FINN listing")}</span>
            </a>`;
        })
        .join("")}
    </div>
    <a class="ghost finn-link" href="${escapeHtml(row.searchUrl || defaultSearchUrl(game))}" target="_blank" rel="noopener">More on FINN</a>`;
}

function defaultSearchUrl(game) {
  const q = [game.title, game.consoleName].filter(Boolean).join(" ");
  return `https://www.finn.no/recommerce/forsale/search?${new URLSearchParams({
    q,
    sub_category: "1.93.3905",
  })}`;
}

function renderFinn() {
  if (!view) return;
  const wish = wishlistGames();
  view.innerHTML = `
    <div class="deals-head">
      <p class="meta">Checks FINN Torget (Spill og konsoll) for titles on your wishlist. Collection stays untouched.</p>
      <button class="primary" id="finn-scan-btn" ${scanning || !wish.length ? "disabled" : ""}>
        ${scanning ? "Checking FINN…" : "Check wishlist"}
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
                  <p class="meta">${escapeHtml(game.consoleName)}${game.maxPrice ? ` · target ${escapeHtml(formatNok(game.maxPrice))}` : ""}</p>
                  ${listingLinks(game, row)}
                </article>`;
            })
            .join("")}</div>`
    }`;
}

async function checkOne(game) {
  const params = new URLSearchParams({ q: game.title, platform: game.consoleId || "" });
  try {
    const res = await fetch(`/api/finn?${params}`);
    const data = await res.json();
    return {
      id: game.id,
      maxPrice: game.maxPrice,
      items: data.items || [],
      searchUrl: data.searchUrl,
      error: data.error,
    };
  } catch {
    return {
      id: game.id,
      maxPrice: game.maxPrice,
      items: [],
      searchUrl: `https://www.finn.no/recommerce/forsale/search?q=${encodeURIComponent(game.title)}&sub_category=1.93.3905`,
      error: "Could not reach FINN.",
    };
  }
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
