# Virtual shelf

A local web app for a **physical video game collection**: games, wishlist, consoles, peripherals, covers, longplays, and wishlist checks on **local classifieds** (FINN, Blocket, Tori, DBA, and similar) plus **eBay**. Prices follow the market you pick. The virtual shelf is a Kallax-style grid (or a list) with faux 3D cases. Your library stays in the browser (`localStorage` plus IndexedDB for cover images) — this repo ships **empty**.

## Run it

You need [Python 3](https://www.python.org/downloads/).

**Windows:** double-click `start.bat`, then open [http://127.0.0.1:5173](http://127.0.0.1:5173) if the browser does not.

**macOS / Linux:**

```bash
chmod +x start.sh
./start.sh
```

Then open [http://127.0.0.1:5173](http://127.0.0.1:5173).

Do not use `http://localhost` if you already saved a shelf on `127.0.0.1` — the browser treats them as different sites.

## What you can do

- **Collections** — owned games, wishlist, consoles, and peripherals, with sold/traded and a **Market** tab underneath
- **Grid or list** — cubbies with cover hover (scale + theme-colored chromatic split), or a grouped list with a strong accent highlight
- **Covers** — stored locally after fetch; title search is a picture grid (click sets the cover, not the title). Wikipedia thumbs plus RAWG screenshots. A **Fetch covers** button fills gaps on demand
- **Duplicates** — filter to copies you own more than once
- **Themes** — a menu next to Export/Import. Palettes follow the hardware: SNES and SNES PAL, Master System, PlayStation 1–3 and 5, Genesis, Dreamcast and Dreamcast PAL, Xbox / 360 / One, GameCube, Wii, N64, Switch. Light consoles get light pages (PS1 gray, Wii and 360 white, and so on). Accents drive hover, list highlight, and the page glow
- **Settings** — RAWG key, eBay App ID, and which **market** to use (FINN, Blocket, Tori, DBA, and others). That also sets shelf currency. Wishlist checks use that classifieds site plus eBay

Wikipedia works without a key. For a proper games catalog, get a free key at [rawg.io/apidocs](https://rawg.io/apidocs) and paste it in Settings.

Markets include Norway (FINN, NOK), Sweden (Blocket, SEK), Finland (Tori, EUR), Denmark (DBA, DKK), Germany (Kleinanzeigen), Netherlands (Marktplaats), France (Leboncoin), UK (Gumtree), and local eBay sites where they exist.

Wishlist market checks always give search links. Listing prices on eBay work more reliably with a free Finding API App ID from [developer.ebay.com](https://developer.ebay.com/). Keys stay in `config.json` (not committed). Leave a Settings key field blank to keep a key you already saved.

## What is not in this repo

- Nobody else’s (or your) game list
- RAWG / eBay API keys (`config.json`)
- Local backups (`userdata/`)
- Cover blobs in IndexedDB (browser-only)
- Built Windows/macOS/Linux binaries (`dist/`)

Export/Import in the sidebar if you want to move a shelf between browsers, or share a list with others.

## Credits

Momentous prompted and steered the product. **Cursor Grok 4.6** (SpaceXAI / Cursor) wrote the app in [Cursor](https://cursor.com).
