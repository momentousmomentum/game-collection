import html as html_lib
import json
import re
import ssl
import xml.etree.ElementTree as ET
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from catalog import load_config
from finn import PLATFORM_HINT

SEARCH_BASE = "https://www.ebay.com/sch/i.html"
FINDING_BASE = "https://svcs.ebay.com/services/search/FindingService/v1"
GAMES_CATEGORY = "139973"
BROWSER_UA = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36"
)
SSL_CTX = ssl.create_default_context()
PRICE_RE = re.compile(
    r"(?:USD|US\s*\$|\$|EUR|€|GBP|£)\s*([0-9][0-9,]*(?:\.[0-9]{1,2})?)",
    re.I,
)


def ebay_app_id() -> str:
    return str(load_config().get("ebay_app_id") or "").strip()


def search_url(query: str, rss: bool = False) -> str:
    params = {"_nkw": query, "_sacat": GAMES_CATEGORY, "_sop": "15", "LH_BIN": "1"}
    if rss:
        params["_rss"] = "1"
    return SEARCH_BASE + "?" + urlencode(params)


def _fetch(url: str, accept: str) -> bytes:
    req = Request(
        url,
        headers={
            "User-Agent": BROWSER_UA,
            "Accept": accept,
            "Accept-Language": "en-US,en;q=0.9",
        },
    )
    with urlopen(req, timeout=14, context=SSL_CTX) as resp:
        return resp.read()


def _parse_price(text: str) -> tuple[float | None, str]:
    match = PRICE_RE.search(text or "")
    if not match:
        return None, ""
    raw = match.group(0)
    try:
        amount = float(match.group(1).replace(",", ""))
    except ValueError:
        return None, ""
    currency = "USD"
    if "€" in raw or "EUR" in raw.upper():
        currency = "EUR"
    elif "£" in raw or "GBP" in raw.upper():
        currency = "GBP"
    return amount, currency


def _from_rss(xml_bytes: bytes, limit: int) -> list[dict]:
    try:
        root = ET.fromstring(xml_bytes)
    except ET.ParseError:
        return []
    items = []
    for node in root.findall(".//item"):
        title = html_lib.unescape((node.findtext("title") or "").strip())
        link = (node.findtext("link") or "").strip()
        desc = html_lib.unescape(node.findtext("description") or "")
        if not title or not link:
            continue
        price, currency = _parse_price(f"{title} {desc}")
        items.append({"title": title, "url": link, "price": price, "currency": currency or "USD"})
        if len(items) >= limit:
            break
    return items


def _from_finding(query: str, limit: int) -> list[dict]:
    app_id = ebay_app_id()
    if not app_id:
        return []
    params = {
        "OPERATION-NAME": "findItemsAdvanced",
        "SERVICE-VERSION": "1.13.0",
        "SECURITY-APPNAME": app_id,
        "RESPONSE-DATA-FORMAT": "JSON",
        "REST-PAYLOAD": "true",
        "keywords": query,
        "categoryId": GAMES_CATEGORY,
        "paginationInput.entriesPerPage": str(limit),
        "sortOrder": "PricePlusShippingLowest",
        "itemFilter(0).name": "ListingType",
        "itemFilter(0).value": "FixedPrice",
    }
    payload = json.loads(_fetch(FINDING_BASE + "?" + urlencode(params), "application/json").decode("utf-8", "replace"))
    ack = payload.get("findItemsAdvancedResponse") or []
    if not ack:
        return []
    result = (ack[0].get("searchResult") or [{}])[0]
    rows = result.get("item") or []
    items = []
    for row in rows:
        title = html_lib.unescape(((row.get("title") or [""])[0] or "").strip())
        link = ((row.get("viewItemURL") or [""])[0] or "").strip()
        selling = (row.get("sellingStatus") or [{}])[0]
        price_node = (selling.get("currentPrice") or [{}])[0]
        raw = price_node.get("__value__")
        try:
            price = float(raw) if raw is not None else None
        except (TypeError, ValueError):
            price = None
        currency = price_node.get("@currencyId") or "USD"
        if title and link:
            items.append({"title": title, "url": link, "price": price, "currency": currency})
        if len(items) >= limit:
            break
    return items


def search_ebay(query: str, platform: str, limit: int = 5) -> dict:
    hint = PLATFORM_HINT.get(platform, "")
    q = " ".join(part for part in (query, hint) if part).strip()
    html_url = search_url(q)
    items = []
    try:
        items = _from_finding(q, limit)
    except (HTTPError, URLError, TimeoutError, OSError, json.JSONDecodeError, KeyError, IndexError) as exc:
        print(f"ebay finding: {exc}", flush=True)
        items = []
    blocked = False
    if not items:
        try:
            items = _from_rss(_fetch(search_url(q, rss=True), "application/rss+xml,application/xml,text/xml,*/*"), limit)
        except HTTPError as exc:
            blocked = exc.code in {403, 429}
            items = []
        except (URLError, TimeoutError, OSError):
            items = []
    error = ""
    if not items:
        if ebay_app_id():
            error = "No eBay listings found."
        elif blocked:
            error = "eBay blocked anonymous search. Add a free App ID under Catalog, or open the search link."
        else:
            error = "No listings found. Open eBay, or add an App ID under Catalog if search stays empty."
    return {"query": q, "searchUrl": html_url, "items": items, "error": error}
