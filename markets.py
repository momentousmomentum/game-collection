from urllib.parse import quote, urlencode

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

VEND_CATEGORY = "1.93.3905"
EBAY_GAMES = "139973"

# FINN, Blocket, Tori, and DBA share Vend/Schibsted recommerce.
def _vend(site_id: str, name: str, host: str, currency: str, lang: str) -> dict:
    return {
        "id": site_id,
        "name": name,
        "kind": "vend",
        "host": host,
        "currency": currency,
        "lang": lang,
        "category": VEND_CATEGORY,
    }


def _link(site_id: str, name: str, currency: str, template: str) -> dict:
    return {"id": site_id, "name": name, "kind": "link", "currency": currency, "template": template}


def _ebay(host: str, global_id: str, currency: str) -> dict:
    return {"host": host, "global_id": global_id, "currency": currency, "category": EBAY_GAMES}


MARKETS = {
    "no": {
        "id": "no",
        "name": "Norway",
        "currency": "NOK",
        "display": "nb-NO",
        "classifieds": _vend("finn", "FINN", "www.finn.no", "NOK", "nb-NO,nb;q=0.9,en;q=0.8"),
        "ebay": _ebay("www.ebay.com", "EBAY-US", "USD"),
    },
    "se": {
        "id": "se",
        "name": "Sweden",
        "currency": "SEK",
        "display": "sv-SE",
        "classifieds": _vend("blocket", "Blocket", "www.blocket.se", "SEK", "sv-SE,sv;q=0.9,en;q=0.8"),
        "ebay": _ebay("www.ebay.com", "EBAY-US", "USD"),
    },
    "fi": {
        "id": "fi",
        "name": "Finland",
        "currency": "EUR",
        "display": "fi-FI",
        "classifieds": _vend("tori", "Tori", "www.tori.fi", "EUR", "fi-FI,fi;q=0.9,en;q=0.8"),
        "ebay": _ebay("www.ebay.com", "EBAY-US", "USD"),
    },
    "dk": {
        "id": "dk",
        "name": "Denmark",
        "currency": "DKK",
        "display": "da-DK",
        "classifieds": _vend("dba", "DBA", "www.dba.dk", "DKK", "da-DK,da;q=0.9,en;q=0.8"),
        "ebay": _ebay("www.ebay.com", "EBAY-US", "USD"),
    },
    "de": {
        "id": "de",
        "name": "Germany",
        "currency": "EUR",
        "display": "de-DE",
        "classifieds": _link(
            "kleinanzeigen",
            "Kleinanzeigen",
            "EUR",
            "https://www.kleinanzeigen.de/s-videospiele-konsolen/{q}/k0c227",
        ),
        "ebay": _ebay("www.ebay.de", "EBAY-DE", "EUR"),
    },
    "at": {
        "id": "at",
        "name": "Austria",
        "currency": "EUR",
        "display": "de-AT",
        "classifieds": _link(
            "willhaben",
            "willhaben",
            "EUR",
            "https://www.willhaben.at/iad/kaufen-und-verkaufen/marktplatz?keyword={q}",
        ),
        "ebay": _ebay("www.ebay.at", "EBAY-AT", "EUR"),
    },
    "nl": {
        "id": "nl",
        "name": "Netherlands",
        "currency": "EUR",
        "display": "nl-NL",
        "classifieds": _link("marktplaats", "Marktplaats", "EUR", "https://www.marktplaats.nl/q/{q}/"),
        "ebay": _ebay("www.ebay.nl", "EBAY-NL", "EUR"),
    },
    "be": {
        "id": "be",
        "name": "Belgium",
        "currency": "EUR",
        "display": "nl-BE",
        "classifieds": _link("2dehands", "2dehands", "EUR", "https://www.2dehands.be/q/{q}/"),
        "ebay": _ebay("www.ebay.be", "EBAY-NLBE", "EUR"),
    },
    "fr": {
        "id": "fr",
        "name": "France",
        "currency": "EUR",
        "display": "fr-FR",
        "classifieds": _link(
            "leboncoin",
            "Leboncoin",
            "EUR",
            "https://www.leboncoin.fr/recherche?category=43&text={q}",
        ),
        "ebay": _ebay("www.ebay.fr", "EBAY-FR", "EUR"),
    },
    "gb": {
        "id": "gb",
        "name": "United Kingdom",
        "currency": "GBP",
        "display": "en-GB",
        "classifieds": _link(
            "gumtree",
            "Gumtree",
            "GBP",
            "https://www.gumtree.com/search?search_category=video-games-consoles&q={q}",
        ),
        "ebay": _ebay("www.ebay.co.uk", "EBAY-GB", "GBP"),
    },
    "ie": {
        "id": "ie",
        "name": "Ireland",
        "currency": "EUR",
        "display": "en-IE",
        "classifieds": _link(
            "gumtree-ie",
            "Gumtree",
            "EUR",
            "https://www.gumtree.ie/s-video-games/v1c10p1?q={q}",
        ),
        "ebay": _ebay("www.ebay.ie", "EBAY-IE", "EUR"),
    },
    "us": {
        "id": "us",
        "name": "United States",
        "currency": "USD",
        "display": "en-US",
        "classifieds": None,
        "ebay": _ebay("www.ebay.com", "EBAY-US", "USD"),
    },
    "ca": {
        "id": "ca",
        "name": "Canada",
        "currency": "CAD",
        "display": "en-CA",
        "classifieds": None,
        "ebay": _ebay("www.ebay.ca", "EBAY-ENCA", "CAD"),
    },
    "au": {
        "id": "au",
        "name": "Australia",
        "currency": "AUD",
        "display": "en-AU",
        "classifieds": None,
        "ebay": _ebay("www.ebay.com.au", "EBAY-AU", "AUD"),
    },
    "it": {
        "id": "it",
        "name": "Italy",
        "currency": "EUR",
        "display": "it-IT",
        "classifieds": _link(
            "subito",
            "Subito",
            "EUR",
            "https://www.subito.it/annunci-italia/vendita/videogiochi/?q={q}",
        ),
        "ebay": _ebay("www.ebay.it", "EBAY-IT", "EUR"),
    },
    "es": {
        "id": "es",
        "name": "Spain",
        "currency": "EUR",
        "display": "es-ES",
        "classifieds": None,
        "ebay": _ebay("www.ebay.es", "EBAY-ES", "EUR"),
    },
    "pl": {
        "id": "pl",
        "name": "Poland",
        "currency": "PLN",
        "display": "pl-PL",
        "classifieds": None,
        "ebay": _ebay("www.ebay.pl", "EBAY-PL", "PLN"),
    },
    "ch": {
        "id": "ch",
        "name": "Switzerland",
        "currency": "CHF",
        "display": "de-CH",
        "classifieds": None,
        "ebay": _ebay("www.ebay.ch", "EBAY-CH", "CHF"),
    },
}

REGION_TO_LOCALE = {
    "no": "no",
    "se": "se",
    "fi": "fi",
    "dk": "dk",
    "de": "de",
    "at": "at",
    "nl": "nl",
    "be": "be",
    "fr": "fr",
    "gb": "gb",
    "uk": "gb",
    "ie": "ie",
    "us": "us",
    "ca": "ca",
    "au": "au",
    "it": "it",
    "es": "es",
    "pl": "pl",
    "ch": "ch",
}

LANG_TO_LOCALE = {
    "nb": "no",
    "nn": "no",
    "no": "no",
    "sv": "se",
    "da": "dk",
    "fi": "fi",
    "de": "de",
    "nl": "nl",
    "fr": "fr",
    "it": "it",
    "es": "es",
    "pl": "pl",
}


def infer_locale(accept_language: str) -> str:
    for part in (accept_language or "").split(","):
        tag = part.split(";")[0].strip().lower().replace("_", "-")
        if not tag:
            continue
        if tag in MARKETS:
            return tag
        if "-" in tag:
            lang, region = tag.split("-", 1)
            mapped = REGION_TO_LOCALE.get(region)
            if mapped:
                return mapped
            mapped = LANG_TO_LOCALE.get(lang)
            if mapped:
                return mapped
        mapped = LANG_TO_LOCALE.get(tag)
        if mapped:
            return mapped
    return "us"


def normalize_locale(value: str) -> str:
    key = (value or "").strip().lower()
    if key in {"", "auto"}:
        return "auto"
    return key if key in MARKETS else "auto"


def resolve_market(locale: str = "auto", accept_language: str = "") -> dict:
    key = normalize_locale(locale)
    if key == "auto":
        key = infer_locale(accept_language)
    return MARKETS.get(key) or MARKETS["us"]


def query_with_platform(query: str, platform: str) -> str:
    hint = PLATFORM_HINT.get(platform, "")
    return " ".join(part for part in (query, hint) if part).strip()


def classifieds_search_url(market: dict, query: str) -> str:
    site = market.get("classifieds") or {}
    if not site:
        return ""
    if site.get("kind") == "vend":
        return "https://" + site["host"] + "/recommerce/forsale/search?" + urlencode(
            {"q": query, "sub_category": site.get("category") or VEND_CATEGORY}
        )
    template = site.get("template") or ""
    return template.replace("{q}", quote(query))


def ebay_search_url(market: dict, query: str, rss: bool = False) -> str:
    ebay = market["ebay"]
    params = {"_nkw": query, "_sacat": ebay.get("category") or EBAY_GAMES, "_sop": "15", "LH_BIN": "1"}
    if rss:
        params["_rss"] = "1"
    return "https://" + ebay["host"] + "/sch/i.html?" + urlencode(params)


def public_market(market: dict) -> dict:
    site = market.get("classifieds")
    ebay = market["ebay"]
    return {
        "id": market["id"],
        "name": market["name"],
        "currency": market["currency"],
        "display": market["display"],
        "classifieds": {"id": site["id"], "name": site["name"], "currency": site.get("currency") or market["currency"]}
        if site
        else None,
        "ebay": {"name": "eBay", "host": ebay["host"], "currency": ebay["currency"]},
    }


def market_choices() -> list[dict]:
    rows = []
    for item in MARKETS.values():
        site = item.get("classifieds")
        label = f"{item['name']} ({item['currency']})"
        if site:
            label += f" — {site['name']}"
        rows.append({"id": item["id"], "label": label, "currency": item["currency"]})
    return rows
