import html as html_lib
import json
import re
import ssl
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from markets import (
    PLATFORM_HINT,
    classifieds_search_url,
    public_market,
    query_with_platform,
    resolve_market,
)

BROWSER_UA = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36"
)
SSL_CTX = ssl.create_default_context()


def _fetch_html(url: str, lang: str) -> str:
    req = Request(
        url,
        headers={
            "User-Agent": BROWSER_UA,
            "Accept": "text/html,application/xhtml+xml",
            "Accept-Language": lang or "en;q=0.8",
        },
    )
    with urlopen(req, timeout=12, context=SSL_CTX) as resp:
        return resp.read().decode("utf-8", "replace")


def _parse_listings(html: str, limit: int, fallback_currency: str) -> list[dict]:
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
        items.append(
            {
                "title": title,
                "url": link,
                "price": price,
                "currency": offers.get("priceCurrency") or fallback_currency,
            }
        )
        if len(items) >= limit:
            break
    return items


def search_classifieds(query: str, platform: str, locale: str = "auto", accept_language: str = "", limit: int = 5) -> dict:
    market = resolve_market(locale, accept_language)
    q = query_with_platform(query, platform)
    if not market:
        return {"query": q, "searchUrl": "", "items": [], "market": None, "error": "Pick a market first."}
    url = classifieds_search_url(market, q)
    site = market.get("classifieds")
    payload = {"query": q, "searchUrl": url, "items": [], "market": public_market(market)}
    if not site:
        payload["error"] = "No local classifieds site for this country — eBay still works."
        return payload
    if site.get("kind") != "vend":
        payload["error"] = f"Open {site['name']} for listings."
        return payload
    try:
        payload["items"] = _parse_listings(_fetch_html(url, site.get("lang") or ""), limit, site.get("currency") or market["currency"])
    except (HTTPError, URLError, TimeoutError, OSError):
        payload["items"] = []
        payload["error"] = f"Could not reach {site['name']}."
    if not payload["items"] and "error" not in payload:
        payload["error"] = f"No {site['name']} listings found."
    return payload


def search_finn(query: str, platform: str, limit: int = 5) -> dict:
    return search_classifieds(query, platform, locale="no", limit=limit)


def search_url(query: str) -> str:
    return classifieds_search_url(resolve_market("no"), query)
