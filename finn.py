import html as html_lib
import json
import re
import ssl
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

GAMES_CATEGORY = "1.93.3905"
SEARCH_BASE = "https://www.finn.no/recommerce/forsale/search"
BROWSER_UA = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36"
)
SSL_CTX = ssl.create_default_context()

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


def search_url(query: str) -> str:
    return SEARCH_BASE + "?" + urlencode({"q": query, "sub_category": GAMES_CATEGORY})


def _fetch_html(url: str) -> str:
    req = Request(
        url,
        headers={
            "User-Agent": BROWSER_UA,
            "Accept": "text/html,application/xhtml+xml",
            "Accept-Language": "nb-NO,nb;q=0.9,en;q=0.8",
        },
    )
    with urlopen(req, timeout=12, context=SSL_CTX) as resp:
        return resp.read().decode("utf-8", "replace")


def _parse_listings(html: str, limit: int) -> list[dict]:
    match = re.search(r'<script[^>]*id="seoStructuredData"[^>]*>(.*?)</script>', html, re.S)
    if not match:
        return []
    try:
        payload = json.loads(match.group(1))
    except json.JSONDecodeError:
        return []
    elements = payload.get("mainEntity", {}).get("itemListElement") or []
    items = []
    for element in elements:
        product = element.get("item") or {}
        offers = product.get("offers") or {}
        raw_price = offers.get("price")
        try:
            price = float(str(raw_price).replace(" ", "").replace(",", ".")) if raw_price is not None else None
        except ValueError:
            price = None
        title = html_lib.unescape(product.get("name") or "").strip()
        link = product.get("url") or ""
        if not title or not link:
            continue
        items.append({"title": title, "url": link, "price": price, "currency": offers.get("priceCurrency") or "NOK"})
        if len(items) >= limit:
            break
    return items


def search_finn(query: str, platform: str, limit: int = 5) -> dict:
    hint = PLATFORM_HINT.get(platform, "")
    q = " ".join(part for part in (query, hint) if part).strip()
    url = search_url(q)
    items = []
    try:
        items = _parse_listings(_fetch_html(url), limit)
    except (HTTPError, URLError, TimeoutError, OSError):
        items = []
    return {"query": q, "searchUrl": url, "items": items}
