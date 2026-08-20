function fallbackBadge(name) {
  const glyph = (name || "?").slice(0, 4).toUpperCase();
  const size = glyph.length >= 4 ? 10 : 13;
  return `<svg class="logo-svg" viewBox="0 0 48 48" aria-hidden="true">
    <rect width="48" height="48" rx="10" fill="#6b6158"/>
    <text x="24" y="24" text-anchor="middle" dominant-baseline="middle" fill="#fff" font-size="${size}" font-family="Figtree,Segoe UI,sans-serif" font-weight="700">${glyph}</text>
  </svg>`;
}

const LOGO_FILES = new Set([
  "nes",
  "snes",
  "n64",
  "gamecube",
  "wii",
  "wiiu",
  "switch",
  "switch2",
  "gb",
  "gbc",
  "gba",
  "ds",
  "3ds",
  "ps1",
  "ps2",
  "ps3",
  "ps4",
  "ps5",
  "psp",
  "vita",
  "xbox",
  "360",
  "xb1",
  "xss",
  "mastersystem",
  "genesis",
  "saturn",
  "dreamcast",
  "pc",
]);

export function consoleLogo(id, name) {
  const label = name || id;
  const inner = LOGO_FILES.has(id)
    ? `<img src="/logos/${id}.svg" alt="${escapeAttr(label)}" />`
    : fallbackBadge(label);
  return `<span class="console-logo" title="${escapeAttr(label)}">${inner}</span>`;
}

function escapeAttr(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;");
}
