import json
import re
import ssl
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.error import HTTPError, URLError
from urllib.parse import parse_qs, quote, urlencode, urlparse
from urllib.request import Request, urlopen

from paths import resource_dir, portable_dir

ROOT = resource_dir()
PORT = 5173
UA = "GameShelf/1.0 (local collection app; https://127.0.0.1:5173; game-shelf@localhost)"
BROWSER_UA = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36"
)
SSL_CTX = ssl.create_default_context()
ALLOWED_IMAGE_HOSTS = {
    "upload.wikimedia.org",
    "commons.wikimedia.org",
    "en.wikipedia.org",
    "media.rawg.io",
    "images.igdb.com",
    "cdn.akamai.steamstatic.com",
    "cdn.cloudflare.steamstatic.com",
    "shared.akamai.steamstatic.com",
    "shared.fastly.steamstatic.com",
    "steamcdn-a.akamaihd.net",
    "steamuserimages-a.akamaihd.net",
}


def image_host_ok(hostname: str | None) -> bool:
    if not hostname:
        return False
    host = hostname.lower()
    if host in ALLOWED_IMAGE_HOSTS:
        return True
    return host.endswith((".rawg.io", ".wikimedia.org", ".steamstatic.com", ".akamaihd.net"))

PLATFORM_HINT = {
    "nes": "NES",
    "snes": "Super Nintendo",
    "n64": "Nintendo 64",
    "gamecube": "GameCube",
    "wii": "Wii",
    "wiiu": "Wii U",
    "switch": "Nintendo Switch",
    "switch2": "Nintendo Switch",
    "gb": "Game Boy",
    "gbc": "Game Boy Color",
    "gba": "Game Boy Advance",
    "ds": "Nintendo DS",
    "3ds": "Nintendo 3DS",
    "ps1": "PlayStation",
    "ps2": "PlayStation 2",
    "ps3": "PlayStation 3",
    "ps4": "PlayStation 4",
    "ps5": "PlayStation 5",
    "psp": "PSP",
    "vita": "PlayStation Vita",
    "xbox": "Xbox",
    "360": "Xbox 360",
    "xb1": "Xbox One",
    "xss": "Xbox Series",
    "mastersystem": "Master System",
    "genesis": "Mega Drive",
    "saturn": "Sega Saturn",
    "dreamcast": "Dreamcast",
    "pc": "PC",
}


def fetch_json(url: str) -> dict:
    req = Request(url, headers={"User-Agent": BROWSER_UA, "Accept": "application/json"})
    with urlopen(req, timeout=12, context=SSL_CTX) as resp:
        return json.loads(resp.read().decode("utf-8"))


def wiki_search(terms: str) -> list[dict]:
    search_url = "https://en.wikipedia.org/w/api.php?" + urlencode(
        {
            "action": "query",
            "format": "json",
            "list": "search",
            "srlimit": 8,
            "srsearch": terms,
            "srprop": "snippet",
        }
    )
    payload = fetch_json(search_url)
    hits = payload.get("query", {}).get("search", [])
    titles = [hit["title"] for hit in hits]
    if not titles:
        return []
    info_url = "https://en.wikipedia.org/w/api.php?" + urlencode(
        {
            "action": "query",
            "format": "json",
            "prop": "pageimages|description",
            "piprop": "thumbnail",
            "pithumbsize": 640,
            "redirects": 1,
            "titles": "|".join(titles),
        }
    )
    pages = fetch_json(info_url).get("query", {}).get("pages", {})
    by_title = {page.get("title"): page for page in pages.values()}
    results = []
    for hit in hits:
        page = by_title.get(hit["title"]) or {}
        thumb = (page.get("thumbnail") or {}).get("source")
        results.append(
            {
                "title": hit["title"].replace(" (video game)", ""),
                "subtitle": page.get("description") or "",
                "cover": thumb,
                "images": [thumb] if thumb else [],
            }
        )
    return results


def search_wikipedia(query: str, platform: str) -> list[dict]:
    hint = PLATFORM_HINT.get(platform, "")
    terms = f"{query} {hint}".strip() if hint else f"{query} video game"
    results = wiki_search(terms)
    if not results:
        results = wiki_search(f"{query} video game")
    return results


def normalize_title(value: str) -> str:
    value = re.sub(r"\(.*?\)", " ", str(value).lower())
    value = re.sub(r"[^a-z0-9]+", " ", value)
    return value.strip()


def pick_cover(items: list[dict], title: str) -> str | None:
    want = normalize_title(title)
    want_tokens = set(want.split())
    best = None
    best_score = 0
    for item in items:
        cover = item.get("cover")
        name = item.get("title") or ""
        if not cover or re.match(r"list of ", name, re.I):
            continue
        got = normalize_title(name)
        got_tokens = set(got.split())
        score = 0
        if got == want:
            score = 100
        elif got.startswith(want) or want.startswith(got):
            score = 80
        elif want in got or got in want:
            score = 70
        elif want_tokens and want_tokens <= got_tokens:
            score = 65
        elif len(want_tokens & got_tokens) >= 2:
            score = 55
        if score > best_score:
            best = cover
            best_score = score
    return best if best_score >= 50 else None


def find_peripheral_cover(query: str, platform: str) -> dict:
    hint = PLATFORM_HINT.get(platform, "")
    attempts = []
    if hint:
        attempts.append(f"{hint} {query}")
    attempts.append(query)
    attempts.append(f"{query} controller")
    seen: set[str] = set()
    all_items: list[dict] = []
    for term in attempts:
        key = term.strip().lower()
        if not term.strip() or key in seen:
            continue
        seen.add(key)
        try:
            items = wiki_search(term)
        except (HTTPError, URLError, TimeoutError, json.JSONDecodeError, OSError):
            continue
        all_items.extend(items)
        cover = pick_cover(items, query)
        if cover:
            return {"cover": cover, "source": "wikipedia"}
    fallback = next((item.get("cover") for item in all_items if item.get("cover")), None)
    return {"cover": fallback, "source": "fallback" if fallback else ""}


def find_cover(query: str, platform: str) -> dict:
    from catalog import search_rawg

    rawg_items = []
    try:
        rawg_items = search_rawg(query, platform)
    except Exception as exc:
        print(f"rawg cover error: {exc}", flush=True)
    cover = pick_cover(rawg_items, query)
    if cover:
        return {"cover": cover, "source": "rawg"}
    wiki_items = []
    try:
        wiki_items = search_wikipedia(query, platform)
    except Exception as exc:
        print(f"wiki cover error: {exc}", flush=True)
    cover = pick_cover(wiki_items, query)
    if cover:
        return {"cover": cover, "source": "wikipedia"}
    fallback = next((item.get("cover") for item in rawg_items + wiki_items if item.get("cover")), None)
    return {"cover": fallback, "source": "fallback" if fallback else ""}


def wikipedia_info(query: str, platform: str, kind: str) -> dict:
    blank = {"title": query, "extract": "", "url": "", "cover": None}

    def from_summary(summary: dict, fallback_cover=None) -> dict:
        urls = summary.get("content_urls") or {}
        page = (urls.get("desktop") or {}).get("page") or ""
        thumb = (summary.get("thumbnail") or {}).get("source")
        return {
            "title": summary.get("title") or query,
            "extract": summary.get("extract") or "",
            "url": page,
            "cover": thumb or fallback_cover,
        }

    if kind == "console":
        titles = [PLATFORM_HINT.get(platform, "") or query, query]
    elif kind == "peripheral":
        hint = PLATFORM_HINT.get(platform, "")
        titles = [query, f"{hint} {query}".strip() if hint else query]
    else:
        titles = [query]
    seen: set[str] = set()
    for title in titles:
        if not title or title in seen:
            continue
        seen.add(title)
        try:
            summary = fetch_json("https://en.wikipedia.org/api/rest_v1/page/summary/" + quote(title))
        except (HTTPError, URLError, TimeoutError, json.JSONDecodeError):
            continue
        if summary.get("type") == "disambiguation" or not summary.get("extract"):
            continue
        return from_summary(summary)

    try:
        if kind == "console":
            hint = PLATFORM_HINT.get(platform, "") or query
            items = wiki_search(f"{hint} video game console") or wiki_search(hint)
        elif kind == "peripheral":
            hint = PLATFORM_HINT.get(platform, "")
            items = wiki_search(f"{query} {hint}".strip()) or wiki_search(query)
        else:
            items = search_wikipedia(query, platform)
    except (HTTPError, URLError, TimeoutError, json.JSONDecodeError):
        return blank
    if not items:
        return blank
    title = items[0]["title"]
    try:
        summary = fetch_json("https://en.wikipedia.org/api/rest_v1/page/summary/" + quote(title))
        if summary.get("extract"):
            return from_summary(summary, items[0].get("cover"))
    except (HTTPError, URLError, TimeoutError, json.JSONDecodeError):
        pass
    return {
        "title": title,
        "extract": items[0].get("subtitle") or "",
        "url": "https://en.wikipedia.org/wiki/" + quote(title.replace(" ", "_")),
        "cover": items[0].get("cover"),
    }


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def end_headers(self) -> None:
        if not self.path.startswith("/api/image"):
            self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def do_GET(self) -> None:
        parsed = urlparse(self.path)
        if parsed.path == "/api/search":
            self.handle_search(parse_qs(parsed.query))
            return
        if parsed.path == "/api/cover":
            self.handle_cover(parse_qs(parsed.query))
            return
        if parsed.path == "/api/info":
            self.handle_info(parse_qs(parsed.query))
            return
        if parsed.path == "/api/longplay":
            self.handle_longplay(parse_qs(parsed.query))
            return
        if parsed.path == "/api/settings":
            self.handle_settings_get()
            return
        if parsed.path == "/api/finn":
            self.handle_finn(parse_qs(parsed.query))
            return
        if parsed.path == "/api/ebay":
            self.handle_ebay(parse_qs(parsed.query))
            return
        if parsed.path == "/api/image":
            self.handle_image(parse_qs(parsed.query))
            return
        self.path = parsed.path or "/"
        super().do_GET()

    def handle_search(self, query: dict[str, list[str]]) -> None:
        q = (query.get("q") or [""])[0].strip()
        platform = (query.get("platform") or [""])[0].strip()
        if len(q) < 2:
            self.json_response(400, {"error": "Type a little more."})
            return
        try:
            items, source = self.lookup_games(q, platform)
            self.json_response(200, {"items": items, "source": source})
        except HTTPError as exc:
            print(f"catalog HTTP {exc.code} for {q!r}", flush=True)
            self.json_response(502, {"error": f"Catalog returned HTTP {exc.code}."})
        except URLError as exc:
            print(f"catalog URL error: {exc}", flush=True)
            self.json_response(502, {"error": "Could not reach the game catalog."})
        except TimeoutError:
            self.json_response(504, {"error": "Catalog timed out."})
        except Exception as exc:
            print(f"catalog error: {exc}", flush=True)
            self.json_response(502, {"error": "Catalog search failed."})

    def handle_cover(self, query: dict[str, list[str]]) -> None:
        q = (query.get("q") or [""])[0].strip()
        platform = (query.get("platform") or [""])[0].strip()
        kind = (query.get("kind") or ["game"])[0].strip() or "game"
        if len(q) < 2:
            self.json_response(400, {"cover": None, "error": "Need a title."})
            return
        try:
            if kind == "peripheral":
                self.json_response(200, find_peripheral_cover(q, platform))
                return
            self.json_response(200, find_cover(q, platform))
        except Exception as exc:
            print(f"cover error: {exc}", flush=True)
            self.json_response(200, {"cover": None, "error": "Cover lookup failed."})

    def lookup_games(self, q: str, platform: str) -> tuple[list, str]:
        items = []
        source = "wikipedia"
        try:
            from catalog import rawg_configured, search_rawg

            if rawg_configured():
                items = search_rawg(q, platform)
                if items:
                    source = "rawg"
        except Exception as exc:
            print(f"rawg search error: {exc}", flush=True)
        wiki = search_wikipedia(q, platform)
        seen = {str(url) for item in items for url in (item.get("images") or [item.get("cover")]) if url}
        extra = []
        for hit in wiki:
            cover = hit.get("cover")
            if not cover or cover in seen:
                continue
            seen.add(cover)
            extra.append(hit)
        combined = extra + items
        if extra and items:
            source = "mixed"
        elif extra and not items:
            source = "wikipedia"
        return combined, source

    def handle_longplay(self, query: dict[str, list[str]]) -> None:
        q = (query.get("q") or [""])[0].strip()
        platform = (query.get("platform") or [""])[0].strip()
        if len(q) < 2:
            self.json_response(200, {"videoId": None})
            return
        try:
            from longplay import find_longplay

            hit = find_longplay(q, PLATFORM_HINT.get(platform, ""))
            self.json_response(200, hit or {"videoId": None})
        except Exception as exc:
            print(f"longplay error: {exc}", flush=True)
            self.json_response(200, {"videoId": None})

    def handle_info(self, query: dict[str, list[str]]) -> None:
        q = (query.get("q") or [""])[0].strip()
        platform = (query.get("platform") or [""])[0].strip()
        kind = (query.get("kind") or ["game"])[0].strip() or "game"
        slug = (query.get("slug") or [""])[0].strip()
        if len(q) < 2:
            self.json_response(400, {"error": "Need a title.", "extract": ""})
            return
        try:
            if kind == "console":
                payload = wikipedia_info(q, platform, "console")
                payload["source"] = "wikipedia"
                self.json_response(200, payload)
                return
            if kind == "peripheral":
                payload = wikipedia_info(q, platform, "peripheral")
                payload["source"] = "wikipedia"
                self.json_response(200, payload)
                return
            try:
                from catalog import rawg_info

                info = rawg_info(q, platform, slug)
                if info and (info.get("extract") or info.get("released") or info.get("genres")):
                    self.json_response(200, info)
                    return
            except Exception as exc:
                print(f"rawg info error: {exc}", flush=True)
            payload = wikipedia_info(q, platform, "game")
            payload["source"] = "wikipedia"
            try:
                from catalog import search_rawg

                hits = search_rawg(q, platform)
                if hits:
                    payload.setdefault("released", hits[0].get("released") or "")
                    payload.setdefault("genres", hits[0].get("genres") or [])
            except Exception as exc:
                print(f"rawg meta error: {exc}", flush=True)
            self.json_response(200, payload)
        except Exception as exc:
            print(f"info error: {exc}", flush=True)
            self.json_response(502, {"error": "Could not load info.", "extract": "", "title": q, "url": "", "cover": None})

    def settings_payload(self) -> dict:
        from catalog import load_config, rawg_configured
        from ebay import ebay_app_id
        from markets import market_choices, normalize_locale, public_market, resolve_market

        saved = normalize_locale(str(load_config().get("locale") or "auto"))
        accept = self.headers.get("Accept-Language") or ""
        market = resolve_market(saved, accept)
        return {
            "rawg": rawg_configured(),
            "ebay": bool(ebay_app_id()),
            "locale": saved if saved != "auto" else "",
            "resolved": public_market(market) if market else None,
            "markets": market_choices(),
        }

    def request_locale(self, query: dict[str, list[str]] | None = None) -> tuple[str, str]:
        from catalog import load_config
        from markets import normalize_locale

        accept = self.headers.get("Accept-Language") or ""
        requested = ""
        if query:
            requested = (query.get("locale") or [""])[0].strip()
        if not requested:
            requested = str(load_config().get("locale") or "auto")
        return normalize_locale(requested), accept

    def handle_settings_get(self) -> None:
        try:
            self.json_response(200, self.settings_payload())
        except Exception as exc:
            print(f"settings error: {exc}", flush=True)
            self.json_response(200, {"rawg": False, "ebay": False, "locale": "auto", "markets": []})

    def handle_settings_post(self) -> None:
        length = int(self.headers.get("Content-Length") or 0)
        try:
            body = json.loads(self.rfile.read(length).decode("utf-8") or "{}")
        except json.JSONDecodeError:
            self.json_response(400, {"error": "Bad JSON."})
            return
        data = {}
        if "rawg_key" in body:
            data["rawg_key"] = str(body.get("rawg_key") or "").strip()
        if "ebay_app_id" in body:
            data["ebay_app_id"] = str(body.get("ebay_app_id") or "").strip()
        if "locale" in body:
            from markets import normalize_locale

            data["locale"] = normalize_locale(str(body.get("locale") or "auto"))
        try:
            from catalog import save_config

            if data:
                save_config(data)
            self.json_response(200, self.settings_payload())
        except OSError as exc:
            print(f"settings error: {exc}", flush=True)
            self.json_response(500, {"error": "Could not save settings."})

    def handle_backup_post(self) -> None:
        length = int(self.headers.get("Content-Length") or 0)
        if length > 8_000_000:
            self.json_response(413, {"error": "Backup too large."})
            return
        try:
            body = json.loads(self.rfile.read(length).decode("utf-8") or "{}")
        except json.JSONDecodeError:
            self.json_response(400, {"error": "Bad JSON."})
            return
        if not isinstance(body, dict):
            self.json_response(400, {"error": "Bad backup."})
            return
        try:
            folder = portable_dir() / "userdata"
            folder.mkdir(exist_ok=True)
            dest = folder / "shelf-backup.json"
            prev = folder / "shelf-backup-prev.json"
            if dest.exists():
                dest.replace(prev)
            dest.write_text(json.dumps(body, indent=2) + "\n", encoding="utf-8")
            self.json_response(200, {"ok": True, "path": str(dest)})
        except OSError as exc:
            print(f"backup error: {exc}", flush=True)
            self.json_response(500, {"error": "Could not write backup."})

    def do_POST(self) -> None:
        parsed = urlparse(self.path)
        if parsed.path == "/api/settings":
            self.handle_settings_post()
            return
        if parsed.path == "/api/backup":
            self.handle_backup_post()
            return
        self.send_error(404, "Not found")

    def handle_finn(self, query: dict[str, list[str]]) -> None:
        q = (query.get("q") or [""])[0].strip()
        platform = (query.get("platform") or [""])[0].strip()
        locale, accept = self.request_locale(query)
        if len(q) < 2:
            self.json_response(400, {"error": "Need a title.", "items": [], "searchUrl": ""})
            return
        try:
            from finn import search_classifieds
            from markets import classifieds_search_url, resolve_market
        except Exception as exc:
            print(f"classifieds import error: {exc}", flush=True)
            self.json_response(502, {"error": "Classifieds checker unavailable.", "items": [], "searchUrl": ""})
            return
        try:
            payload = search_classifieds(q, platform, locale=locale, accept_language=accept, limit=5)
            self.json_response(200, payload)
        except Exception as exc:
            print(f"classifieds error: {exc}", flush=True)
            fallback = classifieds_search_url(resolve_market(locale, accept), q)
            self.json_response(502, {"error": "Could not reach classifieds.", "items": [], "searchUrl": fallback})

    def handle_ebay(self, query: dict[str, list[str]]) -> None:
        q = (query.get("q") or [""])[0].strip()
        platform = (query.get("platform") or [""])[0].strip()
        locale, accept = self.request_locale(query)
        from markets import ebay_search_url, resolve_market

        fallback = ebay_search_url(resolve_market(locale, accept), q or "video games")
        if len(q) < 2:
            self.json_response(400, {"error": "Need a title.", "items": [], "searchUrl": fallback})
            return
        try:
            from ebay import search_ebay
        except Exception as exc:
            print(f"ebay import error: {exc}", flush=True)
            self.json_response(502, {"error": "eBay checker unavailable.", "items": [], "searchUrl": fallback})
            return
        try:
            payload = search_ebay(q, platform, locale=locale, accept_language=accept, limit=5)
            self.json_response(200, payload)
        except Exception as exc:
            print(f"ebay error: {exc}", flush=True)
            self.json_response(502, {"error": "Could not reach eBay.", "items": [], "searchUrl": fallback})

    def handle_image(self, query: dict[str, list[str]]) -> None:
        raw = (query.get("u") or [""])[0]
        parsed = urlparse(raw)
        if parsed.scheme not in {"http", "https"} or not image_host_ok(parsed.hostname):
            self.send_error(400, "Image host not allowed")
            return
        try:
            req = Request(raw, headers={"User-Agent": BROWSER_UA, "Accept": "image/*,*/*"})
            with urlopen(req, timeout=12, context=SSL_CTX) as resp:
                data = resp.read()
                ctype = resp.headers.get("Content-Type", "image/jpeg")
        except (HTTPError, URLError, TimeoutError):
            self.send_error(502, "Could not load cover")
            return
        self.send_response(200)
        self.send_header("Content-Type", ctype)
        self.send_header("Cache-Control", "max-age=86400")
        self.send_header("Content-Length", str(len(data)))
        super().end_headers()
        self.wfile.write(data)

    def json_response(self, status: int, payload: dict) -> None:
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


def create_server(host: str = "127.0.0.1", port: int = PORT) -> ThreadingHTTPServer:
    ThreadingHTTPServer.allow_reuse_address = False
    return ThreadingHTTPServer((host, port), Handler)


def main() -> None:
    server = create_server()
    print(f"Game collection running at http://127.0.0.1:{PORT}", flush=True)
    print("Press Ctrl+C to stop.", flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopped.")
        server.server_close()


if __name__ == "__main__":
    main()
