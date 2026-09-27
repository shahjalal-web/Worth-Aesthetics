/**
 * Renders studio-style PLACEHOLDER packshots (SVG → JPEG via headless Chrome) for the
 * demo catalogue, so the store never looks empty before final photography arrives.
 * Output: public/placeholder/demo/<name>-1.jpg (packshot) and -2.jpg (pedestal scene).
 *
 *   npx tsx scripts/generate-placeholder-images.mts
 */
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright-core";

type Glass = "frost" | "amber" | "black" | "champagne" | "white";
type Cap = "gold" | "black" | "silver";
export type Shape =
  | { kind: "dropper"; glass: Glass; cap: Cap; line: string; size: string }
  | { kind: "airless"; glass: Glass; cap: Cap; line: string; size: string; slim?: boolean }
  | { kind: "jar"; glass: Glass; cap: Cap; line: string; size: string }
  | { kind: "tube"; glass: Glass; cap: Cap; line: string; size: string; small?: boolean }
  | { kind: "stone" }
  | { kind: "tray" }
  | { kind: "case" }
  | { kind: "set"; items: Shape[] };

const GLASS: Record<Glass, { a: string; b: string; ink: string; label: string }> = {
  frost: { a: "#f7f4ef", b: "#dcd5ca", ink: "#2d2b2a", label: "#ffffff" },
  white: { a: "#ffffff", b: "#e4ded4", ink: "#2d2b2a", label: "#f6f1e8" },
  amber: { a: "#b8742f", b: "#5e3413", ink: "#f6ecd9", label: "#efe6d4" },
  black: { a: "#3b3836", b: "#141312", ink: "#d9c393", label: "#1f1d1b" },
  champagne: { a: "#e6d6b6", b: "#b69c6a", ink: "#2d2b2a", label: "#f7f0e2" },
};
const CAP: Record<Cap, [string, string, string]> = {
  gold: ["#f1dfae", "#c19a52", "#8a6a31"],
  black: ["#4a4644", "#1d1b1a", "#0b0a0a"],
  silver: ["#fbfbfb", "#c9c9c9", "#8d8d8d"],
};

let uid = 0;
const id = (p: string) => `${p}${++uid}`;

function grad(a: string, b: string, horizontal = true) {
  const g = id("g");
  return {
    id: g,
    def: `<linearGradient id="${g}" ${horizontal ? 'x1="0" x2="1" y1="0" y2="0"' : 'x1="0" x2="0" y1="0" y2="1"'}>
      <stop offset="0" stop-color="${b}"/><stop offset=".28" stop-color="${a}"/><stop offset=".55" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`,
  };
}
function metal(c: Cap) {
  const [hi, mid, lo] = CAP[c];
  const g = id("m");
  return {
    id: g,
    def: `<linearGradient id="${g}" x1="0" x2="1"><stop offset="0" stop-color="${lo}"/><stop offset=".22" stop-color="${mid}"/><stop offset=".42" stop-color="${hi}"/><stop offset=".62" stop-color="${mid}"/><stop offset="1" stop-color="${lo}"/></linearGradient>`,
  };
}

/** Label block: monogram + wordmark + product line + size. */
function label(x: number, y: number, w: number, h: number, g: Glass, line: string, size: string, scale = 1) {
  const { ink, label: bg } = GLASS[g];
  const cx = x + w / 2;
  const s = scale;
  const words = line.split(" ");
  const mid = Math.ceil(words.length / 2);
  const l1 = words.slice(0, mid).join(" ");
  const l2 = words.slice(mid).join(" ");
  return `
  <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${bg}" opacity="${g === "frost" || g === "white" ? 0 : 0.14}"/>
  <g fill="${ink}" text-anchor="middle" font-family="Montserrat, sans-serif">
    <polygon points="${cx},${y + 26 * s} ${cx + 17 * s},${y + 36 * s} ${cx + 17 * s},${y + 56 * s} ${cx},${y + 66 * s} ${cx - 17 * s},${y + 56 * s} ${cx - 17 * s},${y + 36 * s}" fill="none" stroke="${ink}" stroke-width="${1.3 * s}"/>
    <path d="M${cx - 9 * s} ${y + 38 * s} L${cx - 4.5 * s} ${y + 54 * s} L${cx} ${y + 44 * s} L${cx + 4.5 * s} ${y + 54 * s} L${cx + 9 * s} ${y + 38 * s}" fill="none" stroke="${ink}" stroke-width="${1.4 * s}" stroke-linejoin="round"/>
    <text x="${cx}" y="${y + 92 * s}" font-size="${15 * s}" letter-spacing="${6 * s}" font-weight="600">WORTH</text>
    <text x="${cx}" y="${y + 108 * s}" font-size="${7.5 * s}" letter-spacing="${4 * s}">AESTHETICS</text>
    <line x1="${cx - 22 * s}" x2="${cx + 22 * s}" y1="${y + 124 * s}" y2="${y + 124 * s}" stroke="${ink}" stroke-width="${0.8 * s}" opacity=".6"/>
    <text x="${cx}" y="${y + 148 * s}" font-size="${12 * s}" letter-spacing="${2.4 * s}" font-weight="500">${l1.toUpperCase()}</text>
    <text x="${cx}" y="${y + 165 * s}" font-size="${12 * s}" letter-spacing="${2.4 * s}" font-weight="500">${l2.toUpperCase()}</text>
    <text x="${cx}" y="${y + h - 16 * s}" font-size="${7 * s}" letter-spacing="${2 * s}" opacity=".8">${size}</text>
  </g>`;
}

function highlight(x: number, y: number, w: number, h: number, r = 0, glass: Glass = "frost") {
  const o = glass === "black" ? 0.1 : glass === "amber" ? 0.22 : 0.35;
  return `<rect x="${x + w * 0.14}" y="${y + 14}" width="${Math.max(5, w * 0.035)}" height="${h - 28}" rx="${r}" fill="#fff" opacity="${o}"/>`;
}

/** Draws a shape standing on floor line `fy`, centred on `cx`, scaled by `s`. Returns [defs, body]. */
function draw(shape: Shape, cx: number, fy: number, s = 1): [string, string] {
  let defs = "";
  let out = "";
  const add = (d: { id: string; def: string }) => ((defs += d.def), d.id);

  switch (shape.kind) {
    case "dropper": {
      const G = GLASS[shape.glass];
      const w = 290 * s, h = 400 * s, x = cx - w / 2, y = fy - h;
      const body = add(grad(G.a, G.b));
      const cap = add(metal(shape.cap));
      const bulb = add(grad("#4a4644", "#121110"));
      out += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${34 * s}" fill="url(#${body})"/>`;
      out += `<rect x="${cx - 60 * s}" y="${y - 34 * s}" width="${120 * s}" height="${40 * s}" rx="${8 * s}" fill="url(#${body})"/>`;
      out += `<rect x="${cx - 66 * s}" y="${y - 118 * s}" width="${132 * s}" height="${88 * s}" rx="${6 * s}" fill="url(#${cap})"/>`;
      out += `<path d="M${cx - 44 * s} ${y - 118 * s} C${cx - 50 * s} ${y - 210 * s} ${cx + 50 * s} ${y - 210 * s} ${cx + 44 * s} ${y - 118 * s}Z" fill="url(#${bulb})"/>`;
      out += highlight(x, y, w, h, 4 * s, shape.glass);
      out += label(x + 20 * s, y + 70 * s, w - 40 * s, 250 * s, shape.glass, shape.line, shape.size, 1.15 * s);
      break;
    }
    case "airless": {
      const G = GLASS[shape.glass];
      const w = (shape.slim ? 150 : 200) * s, h = (shape.slim ? 480 : 600) * s, x = cx - w / 2, y = fy - h;
      const body = add(grad(G.a, G.b));
      const cap = add(metal(shape.cap));
      out += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${10 * s}" fill="url(#${body})"/>`;
      out += `<rect x="${x - 2 * s}" y="${fy - 26 * s}" width="${w + 4 * s}" height="${26 * s}" rx="${4 * s}" fill="url(#${cap})"/>`;
      out += `<rect x="${x}" y="${y - 150 * s}" width="${w}" height="${150 * s}" rx="${10 * s}" fill="url(#${cap})"/>`;
      out += highlight(x, y, w, h, 3 * s, shape.glass);
      const sc = (shape.slim ? 0.78 : 1) * s;
      out += label(x + 10 * s, y + 90 * s, w - 20 * s, 240 * sc, shape.glass, shape.line, shape.size, sc);
      break;
    }
    case "jar": {
      const G = GLASS[shape.glass];
      const w = 440 * s, h = 230 * s, x = cx - w / 2, y = fy - h;
      const body = add(grad(G.a, G.b));
      const cap = add(metal(shape.cap));
      out += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${22 * s}" fill="url(#${body})"/>`;
      out += `<rect x="${x - 6 * s}" y="${y - 118 * s}" width="${w + 12 * s}" height="${124 * s}" rx="${14 * s}" fill="url(#${cap})"/>`;
      out += `<ellipse cx="${cx}" cy="${y - 118 * s}" rx="${(w + 12 * s) / 2 - 6 * s}" ry="${10 * s}" fill="${CAP[shape.cap][0]}" opacity=".7"/>`;
      out += highlight(x, y, w, h, 3 * s, shape.glass);
      const { ink } = G;
      out += `<g fill="${ink}" text-anchor="middle" font-family="Montserrat, sans-serif">
        <text x="${cx}" y="${y + 70 * s}" font-size="${20 * s}" letter-spacing="${8 * s}" font-weight="600">WORTH</text>
        <text x="${cx}" y="${y + 92 * s}" font-size="${9 * s}" letter-spacing="${5 * s}">AESTHETICS</text>
        <line x1="${cx - 30 * s}" x2="${cx + 30 * s}" y1="${y + 112 * s}" y2="${y + 112 * s}" stroke="${ink}" stroke-width="${s}" opacity=".6"/>
        <text x="${cx}" y="${y + 144 * s}" font-size="${14 * s}" letter-spacing="${3 * s}" font-weight="500">${shape.line.toUpperCase()}</text>
        <text x="${cx}" y="${y + 190 * s}" font-size="${8 * s}" letter-spacing="${2.4 * s}" opacity=".8">${shape.size}</text></g>`;
      break;
    }
    case "tube": {
      const G = GLASS[shape.glass];
      const k = shape.small ? 0.78 : 1;
      const wTop = 250 * s * k, wBot = 150 * s * k, h = 560 * s * k, capH = 90 * s * k;
      const y = fy - h - capH;
      const body = add(grad(G.a, G.b));
      const cap = add(metal(shape.cap));
      out += `<path d="M${cx - wTop / 2} ${y} H${cx + wTop / 2} L${cx + wBot / 2} ${y + h} H${cx - wBot / 2}Z" fill="url(#${body})"/>`;
      out += `<rect x="${cx - wTop / 2}" y="${y - 10 * s}" width="${wTop}" height="${22 * s}" fill="url(#${body})"/>`;
      for (let i = 0; i < 7; i++) out += `<line x1="${cx - wTop / 2 + 8 * s}" x2="${cx + wTop / 2 - 8 * s}" y1="${y - 4 * s + i * 3.2 * s}" y2="${y - 4 * s + i * 3.2 * s}" stroke="${G.b}" stroke-width="${0.8 * s}" opacity=".6"/>`;
      out += `<rect x="${cx - wBot / 2 - 4 * s}" y="${fy - capH}" width="${wBot + 8 * s}" height="${capH}" rx="${6 * s}" fill="url(#${cap})"/>`;
      out += label(cx - wTop / 2 + 30 * s, y + 90 * s * k, wTop - 60 * s, 250 * s * k, shape.glass, shape.line, shape.size, 0.95 * s * k);
      break;
    }
    case "stone": {
      const g = add({ id: "rq", def: `<radialGradient id="rq" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#fbe9e6"/><stop offset=".55" stop-color="#eec8c3"/><stop offset="1" stop-color="#c9958f"/></radialGradient>` });
      out += `<path d="M${cx - 260 * s} ${fy - 40 * s} C${cx - 300 * s} ${fy - 190 * s} ${cx - 120 * s} ${fy - 250 * s} ${cx - 40 * s} ${fy - 170 * s} C${cx + 10 * s} ${fy - 120 * s} ${cx + 60 * s} ${fy - 150 * s} ${cx + 120 * s} ${fy - 210 * s} C${cx + 220 * s} ${fy - 300 * s} ${cx + 330 * s} ${fy - 140 * s} ${cx + 250 * s} ${fy - 50 * s} C${cx + 150 * s} ${fy + 10 * s} ${cx - 180 * s} ${fy + 20 * s} ${cx - 260 * s} ${fy - 40 * s}Z" fill="url(#${g})"/>`;
      out += `<path d="M${cx - 200 * s} ${fy - 150 * s} C${cx - 150 * s} ${fy - 200 * s} ${cx - 90 * s} ${fy - 190 * s} ${cx - 60 * s} ${fy - 165 * s}" stroke="#fff" stroke-width="${10 * s}" stroke-linecap="round" fill="none" opacity=".45"/>`;
      break;
    }
    case "tray": {
      const t = add({ id: "tv", def: `<linearGradient id="tv" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#efe3cf"/><stop offset="1" stop-color="#cdb895"/></linearGradient>` });
      const w = 640 * s;
      out += `<rect x="${cx - w / 2}" y="${fy - 70 * s}" width="${w}" height="${70 * s}" rx="${35 * s}" fill="url(#${t})"/>`;
      out += `<ellipse cx="${cx}" cy="${fy - 70 * s}" rx="${w / 2 - 20 * s}" ry="${26 * s}" fill="#e2d2b6"/>`;
      for (let i = 0; i < 9; i++) out += `<path d="M${cx - w / 2 + 40 * s + i * 64 * s} ${fy - 50 * s} q${20 * s} ${10 * s} ${40 * s} 0" stroke="#b9a07a" stroke-width="${1.2 * s}" fill="none" opacity=".5"/>`;
      break;
    }
    case "case": {
      const c = add({ id: "cs", def: `<linearGradient id="cs" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#c98c56"/><stop offset="1" stop-color="#8a5429"/></linearGradient>` });
      const w = 560 * s, h = 360 * s, x = cx - w / 2, y = fy - h;
      out += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${70 * s}" fill="url(#${c})"/>`;
      out += `<path d="M${x + 40 * s} ${y + 60 * s} H${x + w - 40 * s}" stroke="#e7c796" stroke-width="${6 * s}" stroke-linecap="round"/>`;
      out += `<rect x="${cx - 18 * s}" y="${y + 44 * s}" width="${36 * s}" height="${34 * s}" rx="${6 * s}" fill="#e7c796"/>`;
      out += `<g fill="none" stroke="#6e4020" stroke-width="${2.2 * s}" opacity=".75"><polygon points="${cx},${y + 150 * s} ${cx + 40 * s},${y + 173 * s} ${cx + 40 * s},${y + 219 * s} ${cx},${y + 242 * s} ${cx - 40 * s},${y + 219 * s} ${cx - 40 * s},${y + 173 * s}"/><path d="M${cx - 21 * s} ${y + 178 * s} L${cx - 10 * s} ${y + 214 * s} L${cx} ${y + 192 * s} L${cx + 10 * s} ${y + 214 * s} L${cx + 21 * s} ${y + 178 * s}"/></g>`;
      out += `<text x="${cx}" y="${y + 290 * s}" text-anchor="middle" font-family="Montserrat" font-size="${18 * s}" letter-spacing="${8 * s}" font-weight="600" fill="#6e4020" opacity=".75">WORTH</text>`;
      break;
    }
    case "set": {
      const n = shape.items.length;
      const spread = n === 2 ? 250 : n === 3 ? 260 : 205;
      const sc = n >= 4 ? 0.62 : n === 3 ? 0.72 : 0.85;
      // back row first so front items overlap nicely
      const order = shape.items.map((it, i) => ({ it, i })).sort((a, b) => Math.abs(b.i - (n - 1) / 2) - Math.abs(a.i - (n - 1) / 2));
      for (const { it, i } of order) {
        const offset = (i - (n - 1) / 2) * spread * s;
        const [d, b] = draw(it, cx + offset, fy, sc * s);
        defs += d;
        out += `<ellipse cx="${cx + offset}" cy="${fy}" rx="${140 * sc * s}" ry="${14 * s}" fill="#000" opacity=".12" filter="url(#blur)"/>` + b;
      }
      break;
    }
  }
  return [defs, out];
}

function scene(shape: Shape, variant: 1 | 2, tone: string) {
  uid = 0;
  const W = 1200, H = 1500;
  const pedestal = variant === 2;
  const fy = pedestal ? 1100 : 1200;
  const flat = shape.kind === "stone" || shape.kind === "tray" || shape.kind === "case";
  const scale = shape.kind === "set" ? 1.05 : flat ? 1.2 : pedestal ? 1.2 : 1.38;
  const [defs, body] = draw(shape, W / 2, fy, scale);
  const bgTop = variant === 1 ? "#fbf9f5" : tone;
  const bgBot = variant === 1 ? tone : "#e9dfcf";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="${bgTop}"/><stop offset="1" stop-color="${bgBot}"/></linearGradient>
    <radialGradient id="light" cx=".78" cy=".08" r=".9"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
    <linearGradient id="ped" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#f1e7d7"/><stop offset="1" stop-color="#d6c4a6"/></linearGradient>
    <filter id="blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="14"/></filter>
    <filter id="soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="40"/></filter>
    ${defs}
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" fill="url(#light)"/>
  ${variant === 1 ? `<rect x="0" y="${fy}" width="${W}" height="${H - fy}" fill="#000" opacity=".025"/>` : ""}
  ${
    pedestal
      ? `<ellipse cx="600" cy="${fy + 150}" rx="470" ry="40" fill="#000" opacity=".12" filter="url(#soft)"/>
         <rect x="130" y="${fy}" width="940" height="220" fill="url(#ped)"/>
         <ellipse cx="600" cy="${fy}" rx="470" ry="50" fill="#f5ede0"/>
         ${Array.from({ length: 6 }, (_, i) => `<path d="M${210 + i * 130} ${fy + 60 + (i % 3) * 30} q40 12 90 0" stroke="#bfa887" stroke-width="1.5" fill="none" opacity=".45"/>`).join("")}`
      : ""
  }
  <ellipse cx="600" cy="${fy + 4}" rx="300" ry="26" fill="#000" opacity=".16" filter="url(#blur)"/>
  ${body}
  <path d="M-100 ${H} L${pedestal ? 520 : 460} -100 L${pedestal ? 760 : 700} -100 L140 ${H}Z" fill="#fff" opacity=".07"/>
</svg>`;
}

export type ImageSpec = { name: string; shape: Shape; tone: string };

export async function renderImages(specs: ImageSpec[], outDir = path.join(process.cwd(), "public", "placeholder", "demo")) {
  await mkdir(outDir, { recursive: true });
  const browser = await chromium.launch({ channel: "chrome" });
  const page = await browser.newPage({ viewport: { width: 1200, height: 1500 } });
  await page.setContent(
    `<html><head><link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600&display=block" rel="stylesheet"></head><body style="margin:0"><div id="s"></div></body></html>`,
  );
  await page.evaluate(() => document.fonts.ready);
  const files: string[] = [];
  for (const spec of specs) {
    for (const v of [1, 2] as const) {
      await page.evaluate((svg) => (document.getElementById("s")!.innerHTML = svg), scene(spec.shape, v, spec.tone));
      await page.evaluate(() => document.fonts.ready);
      const file = path.join(outDir, `${spec.name}-${v}.jpg`);
      await page.locator("svg").screenshot({ path: file, type: "jpeg", quality: 88 });
      files.push(file);
      console.log(`🖼️  ${path.relative(process.cwd(), file)}`);
    }
  }
  await browser.close();
  return files;
}
