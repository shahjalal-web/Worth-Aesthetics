// Dev helper: full-page screenshots with installed Chrome.
// Usage: npx tsx scripts/screenshot.mts <url> <outDir> [light|dark]
import { chromium } from "playwright-core";
const [url = "http://localhost:3100/", out = ".", theme = "light"] = process.argv.slice(2);
const browser = await chromium.launch({ channel: "chrome" });
for (const [name, viewport] of [["desktop", { width: 1440, height: 900 }], ["mobile", { width: 390, height: 844 }]] as const) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 1 });
  await ctx.addInitScript((t) => localStorage.setItem("wa-theme", t), theme);
  const page = await ctx.newPage();
  page.on("console", (m) => m.type() === "error" && console.log(`[${name} console]`, m.text()));
  page.on("pageerror", (e) => console.log(`[${name} pageerror]`, e.message));
  await page.goto(url, { waitUntil: "networkidle" });
  // scroll through to trigger reveal animations
  const h = await page.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y < h; y += 500) { await page.mouse.wheel(0, 500); await page.waitForTimeout(60); }
  await page.waitForTimeout(1200);
  const slug = new URL(url).pathname.replace(/\W+/g, "-").replace(/^-|-$/g, "") || "home";
  await page.screenshot({ path: `${out}/${slug}-${theme}-${name}.png`, fullPage: true });
  await ctx.close();
}
await browser.close();
