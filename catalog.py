import html as html_lib
import json
import re
import ssl
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from paths import portable_dir

ROOT = portable_dir()
CONFIG_PATH = ROOT / "config.json"
UA = "GameShelf/1.0 (local collection app)"
SSL_CTX = ssl.create_default_context()
RAWG_BASE = "https://api.rawg.io/api"

# https://api.rawg.io/api/platforms
RAWG_PLATFORMS = {
    "nes": 49,
    "snes": 79,
    "n64": 83,
    "gamecube": 105,
    "wii": 11,
    "wiiu": 10,
    "switch": 7,
    "switch2": 7,
    "gb": 26,
    "gbc": 43,
    "gba": 24,
    "ds": 9,
    "3ds": 8,
    "ps1": 27,
    "ps2": 15,
    "ps3": 16,
    "ps4": 18,
    "ps5": 187,
    "psp": 17,
    "vita": 19,
    "xbox": 80,
    "360": 14,
    "xb1": 1,
    "xss": 186,
    "mastersystem": 74,
    "genesis": 167,
    "saturn": 107,
    "dreamcast": 106,
    "pc": 4,
}


def load_config() -> dict:
    if not CONFIG_PATH.exists():
        return {}
    try:
        data = json.loads(CONFIG_PATH.read_text(encoding="utf-8"))
        return data if isinstance(data, dict) else {}
    except (OSError, json.JSONDecodeError):
        return {}


def save_config(data: dict) -> None:
    current = load_config()
    current.update(data)
    CONFIG_PATH.write_text(json.dumps(current, indent=2) + "\n", encoding="utf-8")


def rawg_key() -> str:
    return str(load_config().get("rawg_key") or "").strip()


def rawg_configured() -> bool:
    return bool(rawg_key())


def _rawg_get(path: str, params: dict) -> dict | None:
    key = rawg_key()
    if not key:
        return None
    query = {k: v for k, v in params.items() if v not in (None, "")}
    query["key"] = key
    url = f"{RAWG_BASE}{path}?{urlencode(query)}"
    req = Request(url, headers={"User-Agent": UA, "Accept": "application/json"})
    with urlopen(req, timeout=12, context=SSL_CTX) as resp:
        return json.loads(resp.read().decode("utf-8"))


def _clip(text: str, limit: int = 720) -> str:
    text = html_lib.unescape(re.sub(r"\s+", " ", text or "")).strip()
    if len(text) <= limit:
        return text
    cut = text[:limit].rsplit(" ", 1)[0]
    return cut.rstrip(",;:") + "…"


def _hit(game: dict) -> dict:
    released = (game.get("released") or "")[:4]
    platforms = [
        (p.get("platform") or {}).get("name")
        for p in (game.get("platforms") or [])[:3]
        if (p.get("platform") or {}).get("name")
    ]
    subtitle = " · ".join(part for part in (released, ", ".join(platforms)) if part)
    return {
        "title": game.get("name") or "",
        "subtitle": subtitle,
        "cover": game.get("background_image"),
        "slug": game.get("slug") or "",
    }


def search_rawg(query: str, platform: str) -> list[dict]:
    if not rawg_key():
        return []
    params = {"search": query, "page_size": 8}
    platform_id = RAWG_PLATFORMS.get(platform)
    if platform_id:
        params["platforms"] = str(platform_id)
    try:
        payload = _rawg_get("/games", params) or {}
        results = payload.get("results") or []
        if not results and platform_id:
            payload = _rawg_get("/games", {"search": query, "page_size": 8}) or {}
            results = payload.get("results") or []
        if results and not any(game.get("background_image") for game in results):
            payload = _rawg_get("/games", {"search": query, "page_size": 8}) or {}
            extra = payload.get("results") or []
            if extra:
                results = extra
    except (HTTPError, URLError, TimeoutError, json.JSONDecodeError, OSError):
        return []
    return [_hit(game) for game in results if game.get("name")]


def rawg_info(query: str, platform: str, slug: str = "") -> dict | None:
    if not rawg_key():
        return None
    game = None
    try:
        if slug:
            game = _rawg_get(f"/games/{slug}", {})
        if not game:
            hits = search_rawg(query, platform)
            if hits and hits[0].get("slug"):
                game = _rawg_get(f"/games/{hits[0]['slug']}", {})
    except (HTTPError, URLError, TimeoutError, json.JSONDecodeError, OSError):
        return None
    if not game or not game.get("name"):
        return None
    extract = game.get("description_raw") or ""
    if not extract:
        extract = re.sub(r"<[^>]+>", " ", game.get("description") or "")
    return {
        "title": game.get("name") or query,
        "extract": _clip(extract),
        "url": f"https://rawg.io/games/{game.get('slug') or ''}",
        "cover": game.get("background_image"),
        "source": "rawg",
        "slug": game.get("slug") or "",
    }
