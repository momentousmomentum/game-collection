# Virtual shelf

A local web app for a **physical video game collection**: games, wishlist, consoles, peripherals, covers, and more. The virtual shelf is a dark grid with faux 3D cases. Your library stays in the browser (localStorage) — this repo ships **empty**.

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

Wikipedia works without a key. For a proper games catalog, get a free key at [rawg.io/apidocs](https://rawg.io/apidocs), open **Catalog** in the app, and paste it. The key is stored locally in `config.json` (not committed).

## What is not in this repo

- Nobody else’s (or your) game list
- RAWG API keys (`config.json`)
- Local backups (`userdata/`)
- Built Windows/macOS/Linux binaries (`dist/`)

Export/Import in the sidebar if you want to move a shelf between browsers, or sharing with others.
