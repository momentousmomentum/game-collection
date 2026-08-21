import html as html_lib
import json
import re
import ssl
import xml.etree.ElementTree as ET
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from catalog import load_config
from markets import ebay_search_url, public_market, query_with_platform, resolve_market

FINDING_BASE = "https://svcs.ebay.com/services/search/FindingService/v1"
BROWSER_UA = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36"
)
SSL_CTX = ssl.create_default_context()
PRICE_RE = re.compile(
    r"(?:USD|US\s*\$|AUD|CAD|CHF|DKK|EUR|GBP|NOK|PLN|SEK|\$|€|£|kr)\s*([0-9][0-9\s,]*(?:[.,][0-9]{1,2})?)",
    re.I,
)


def ebay_app_id() -> str:
    return str(load_config().get("ebay_app_id") or "").strip()


def _fetch(url: str, accept: str, lang: str) -> bytes:
    req = Request(
        url,
        headers={
            "User-Agent": BROWSER_UA,
            "Accept": accept,
            "Accept-Language": lang or "en-US,en;q=0.9",
        },
    )
    with urlopen(req, timeout=14, context=SSL_CTX) as resp:
        return resp.read()


def _parse_price(text: str, fallback: str) -> tuple[float | None, str]:
    match = PRICE_RE.search(text or "")
    if not match:
        return None, fallback
    raw = match.group(0).upper()
    try:
        amount = float(match.group(1).replace(" ", "").replace(",", ""))
    except ValueError:
        return None, fallback
    currency = fallback or "USD"
    if "€" in match.group(0) or "EUR" in raw:
        currency = "EUR"
    elif "£" in match.group(0) or "GBP" in raw:
        currency = "GBP"
    elif "AUD" in raw:
        currency = "AUD"
    elif "CAD" in raw:
        currency = "CAD"
    elif "CHF" in raw:
        currency = "CHF"
    elif "DKK" in raw:
        currency = "DKK"
    elif "NOK" in raw:
        currency = "NOK"
    elif "SEK" in raw:
        currency = "SEK"
    elif "PLN" in raw:
        currency = "PLN"
    elif "USD" in raw or "$" in match.group(0):
        currency = "USD"
    return amount, currency


def _from_rss(xml_bytes: bytes, limit: int, fallback: str) -> list[dict]:
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
        price, currency = _parse_price(f"{title} {desc}", fallback)
        items.append({"title": title, "url": link, "price": price, "currency": currency})
        if len(items) >= limit:
            break
    return items


def _from_finding(query: str, market: dict, limit: int) -> list[dict]:
    app_id = ebay_app_id()
    if not app_id:
        return []
    ebay = market["ebay"]
    params = {
        "OPERATION-NAME": "findItemsAdvanced",
        "SERVICE-VERSION": "1.13.0",
        "SECURITY-APPNAME": app_id,
        "GLOBAL-ID": ebay["global_id"],
        "RESPONSE-DATA-FORMAT": "JSON",
        "REST-PAYLOAD": "true",
        "keywords": query,
        "categoryId": ebay.get("category") or "139973",
        "paginationInput.entriesPerPage": str(limit),
        "sortOrder": "PricePlusShippingLowest",
        "itemFilter(0).name": "ListingType",
        "itemFilter(0).value": "FixedPrice",
    }
    lang = market.get("display") or "en"
    payload = json.loads(
        _fetch(FINDING_BASE + "?" + urlencode(params), "application/json", lang).decode("utf-8", "replace")
    )
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
        currency = price_node.get("@currencyId") or ebay.get("currency") or "USD"
        if title and link:
            items.append({"title": title, "url": link, "price": price, "currency": currency})
        if len(items) >= limit:
            break
    return items


def search_ebay(query: str, platform: str, locale: str = "auto", accept_language: str = "", limit: int = 5) -> dict:
    market = resolve_market(locale, accept_language)
    q = query_with_platform(query, platform)
    if not market:
        return {"query": q, "searchUrl": ebay_search_url(None, q), "items": [], "market": None, "error": "Pick a market first."}
    html_url = ebay_search_url(market, q)
    lang = market.get("display") or "en"
    fallback_currency = market["ebay"]["currency"]
    items = []
    try:
        items = _from_finding(q, market, limit)
    except (HTTPError, URLError, TimeoutError, OSError, json.JSONDecodeError, KeyError, IndexError) as exc:
        print(f"ebay finding: {exc}", flush=True)
        items = []
    blocked = False
    if not items:
        try:
            items = _from_rss(
                _fetch(ebay_search_url(market, q, rss=True), "application/rss+xml,application/xml,text/xml,*/*", lang),
                limit,
                fallback_currency,
            )
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
    return {
        "query": q,
        "searchUrl": html_url,
        "items": items,
        "error": error,
        "market": public_market(market),
    }
