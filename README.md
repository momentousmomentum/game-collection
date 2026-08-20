# Virtual shelf

A local web app for a **physical video game collection**: games, wishlist, consoles, peripherals, covers, longplays, and wishlist checks on **local classifieds** (FINN, Blocket, Tori, DBA, and similar) plus **eBay**. Prices use your local currency. The virtual shelf is a dark grid with faux 3D cases. Your library stays in the browser (localStorage) — this repo ships **empty**.

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

## Optional: better title search

Wikipedia works without a key. For a proper games catalog, get a free key at [rawg.io/apidocs](https://rawg.io/apidocs), open **Catalog** in the app, and paste it.

Under Catalog, set **Country / currency** (or leave it on detect-from-browser). That switches shelf prices, the local classifieds site, and the eBay site:

- Norway — FINN, NOK
- Sweden — Blocket, SEK
- Finland — Tori, EUR
- Denmark — DBA, DKK
- Also Germany (Kleinanzeigen), Netherlands (Marktplaats), France (Leboncoin), UK (Gumtree), and local eBay sites where they exist

Wishlist market checks always give search links. Listing prices on eBay work more reliably with a free Finding API App ID from [developer.ebay.com](https://developer.ebay.com/). Keys stay in `config.json` (not committed). Leave a Catalog key field blank to keep a key you already saved.

## What is not in this repo

- Nobody else’s (or your) game list
- RAWG / eBay API keys (`config.json`)
- Local backups (`userdata/`)
- Built Windows/macOS/Linux binaries (`dist/`)

Export/Import in the sidebar if you want to move a shelf between browsers, or sharing with others.
