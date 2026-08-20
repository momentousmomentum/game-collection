import json
import re
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

import ssl

SSL_CTX = ssl.create_default_context()
BROWSER_UA = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36"
)
# Public WEB client key shipped in youtube.com (same class of key yt-dlp uses).
INNERTUBE_KEY = "AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8"
INNERTUBE_VERSION = "2.20240815.00.00"

INVIDIOUS = (
    "https://inv.nadeko.net",
    "https://invidious.nerdvpn.de",
    "https://yewtu.be",
    "https://invidious.fdn.fr",
)

LONGPLAY_HINT = re.compile(
    r"\blong\s*-?\s*plays?\b|\bfull\s+game\b|\bno\s*commentary\b|\bcomplete\s+playthrough\b",
    re.I,
)
REJECT = re.compile(
    r"\b(trailer|teaser|review|ost|soundtrack|speed\s*run|speedrun|reaction|shorts?|tiktok|music video|ending only)\b",
    re.I,
)
STOP = {"the", "a", "an", "of", "and", "or", "to", "for", "in", "on", "edition", "version", "game"}
KNOWN_CHANNELS = (
    "world of longplays",
    "longplayarchive",
    "longplay archiv",
    "retro longplay",
    "complete playthroughs",
)

_CACHE: dict[str, dict | None] = {}


def _get_json(url: str, timeout: int = 8, data: bytes | None = None) -> dict | list | None:
    headers = {"User-Agent": BROWSER_UA, "Accept": "application/json"}
    if data is not None:
        headers["Content-Type"] = "application/json"
    req = Request(url, data=data, headers=headers)
    with urlopen(req, timeout=timeout, context=SSL_CTX) as resp:
        return json.loads(resp.read().decode("utf-8"))


def _tokens(value: str) -> set[str]:
    words = re.findall(r"[a-z0-9]+", value.lower())
    return {w for w in words if w not in STOP and len(w) > 1}


def _seconds(text: str) -> int:
    parts = [int(p) for p in re.findall(r"\d+", text or "")]
    if not parts:
        return 0
    total = 0
    for part in parts:
        total = total * 60 + part
    return total


def _walk_renderers(node, found: list) -> None:
    if isinstance(node, dict):
        if "videoRenderer" in node and isinstance(node["videoRenderer"], dict):
            found.append(node["videoRenderer"])
        for value in node.values():
            _walk_renderers(value, found)
    elif isinstance(node, list):
        for item in node:
            _walk_renderers(item, found)


def _text(node) -> str:
    if not isinstance(node, dict):
        return ""
    if node.get("simpleText"):
        return str(node["simpleText"])
    runs = node.get("runs") or []
    return "".join(str(run.get("text") or "") for run in runs if isinstance(run, dict))


def _score(title: str, author: str, seconds: int, want: set[str]) -> int:
    blob = f"{title} {author}"
    if REJECT.search(title):
        return -1
    if not LONGPLAY_HINT.search(blob):
        return -1
    got = _tokens(title)
    overlap = len(want & got)
    need = 2 if len(want) >= 3 else 1
    if want and overlap < need:
        return -1
    score = 40 + overlap * 15
    if re.search(r"\blong\s*-?\s*plays?\b", title, re.I):
        score += 35
    author_l = author.lower()
    if any(name in author_l for name in KNOWN_CHANNELS):
        score += 25
    if seconds and seconds < 8 * 60:
        score -= 50
    elif seconds >= 20 * 60:
        score += 12
    return score


def _pick(candidates: list[dict], query: str) -> dict | None:
    want = _tokens(query)
    ranked = []
    for item in candidates:
        video_id = item.get("videoId") or ""
        title = item.get("title") or ""
        author = item.get("author") or ""
        seconds = int(item.get("seconds") or 0)
        if not video_id or not title:
            continue
        score = _score(title, author, seconds, want)
        if score < 40:
            continue
        ranked.append((score, item))
    if not ranked:
        return None
    ranked.sort(key=lambda row: row[0], reverse=True)
    best = ranked[0][1]
    return {
        "videoId": best["videoId"],
        "title": best["title"],
        "author": best.get("author") or "",
        "url": "https://www.youtube.com/watch?v=" + best["videoId"],
    }


def _from_innertube(query: str) -> list[dict]:
    payload = {
        "context": {
            "client": {
                "hl": "en",
                "gl": "US",
                "clientName": "WEB",
                "clientVersion": INNERTUBE_VERSION,
            }
        },
        "query": query,
    }
    url = "https://www.youtube.com/youtubei/v1/search?" + urlencode(
        {"key": INNERTUBE_KEY, "prettyPrint": "false"}
    )
    data = _get_json(url, timeout=10, data=json.dumps(payload).encode("utf-8"))
    renderers: list = []
    _walk_renderers(data, renderers)
    hits = []
    for vr in renderers:
        hits.append(
            {
                "videoId": vr.get("videoId") or "",
                "title": _text(vr.get("title") or {}),
                "author": _text((vr.get("ownerText") or vr.get("longBylineText") or {})),
                "seconds": _seconds(_text(vr.get("lengthText") or {})),
            }
        )
    return hits


def _from_invidious(query: str) -> list[dict]:
    path = "/api/v1/search?" + urlencode({"q": query, "type": "video"})
    for base in INVIDIOUS:
        try:
            rows = _get_json(base + path, timeout=7)
        except (HTTPError, URLError, TimeoutError, json.JSONDecodeError, OSError):
            continue
        if not isinstance(rows, list):
            continue
        hits = []
        for row in rows:
            if not isinstance(row, dict):
                continue
            hits.append(
                {
                    "videoId": row.get("videoId") or "",
                    "title": row.get("title") or "",
                    "author": row.get("author") or "",
                    "seconds": int(row.get("lengthSeconds") or 0),
                }
            )
        if hits:
            return hits
    return []


def find_longplay(title: str, platform_hint: str = "") -> dict | None:
    title = (title or "").strip()
    if len(title) < 2:
        return None
    cache_key = f"{title.lower()}|{platform_hint.lower()}"
    if cache_key in _CACHE:
        return _CACHE[cache_key]
    queries = []
    if platform_hint:
        queries.append(f"{title} {platform_hint} longplay")
    queries.append(f"{title} longplay")
    hit = None
    for q in queries:
        candidates: list[dict] = []
        try:
            candidates = _from_innertube(q)
        except (HTTPError, URLError, TimeoutError, json.JSONDecodeError, OSError) as exc:
            print(f"longplay innertube: {exc}", flush=True)
        if not candidates:
            try:
                candidates = _from_invidious(q)
            except (HTTPError, URLError, TimeoutError, json.JSONDecodeError, OSError) as exc:
                print(f"longplay invidious: {exc}", flush=True)
        hit = _pick(candidates, title)
        if hit:
            break
    _CACHE[cache_key] = hit
    return hit
