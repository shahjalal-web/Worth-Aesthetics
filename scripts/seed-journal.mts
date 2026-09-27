/**
 * Seeds starter Journal articles (educational, cosmetic-claims only — CLAUDE.md §9)
 * into the `journal` blog. Cover images reuse product imagery already on Shopify's CDN.
 * Idempotent by article handle; never deletes. Articles are tagged `demo` so the
 * client can edit or remove them in Shopify admin → Content → Blog posts.
 *
 *   npx tsx --env-file=.env scripts/seed-journal.mts --dry-run
 *   npx tsx --env-file=.env scripts/seed-journal.mts
 */
import { admin, check, DRY_RUN, log } from "./lib/admin.mts";

type Seed = { handle: string; title: string; summary: string; image: string; tags: string[]; daysAgo: number; body: string };

const ARTICLES: Seed[] = [
  {
    handle: "what-are-peptides",
    title: "What Are Peptides? A Clear Guide to Skin’s Messengers",
    summary: "Short chains of amino acids with an outsized reputation. Here is what peptides are, why formulators love them and how to choose one.",
    image: "nad-pdrn-serum",
    tags: ["Science", "Peptides"],
    daysAgo: 3,
    body: `
<p>Peptides are short chains of amino acids — the same building blocks that make up proteins such as collagen and elastin. In skincare, they have become one of the most studied and most requested ingredient families, and for good reason: they are gentle, versatile and pair well with almost everything else in a routine.</p>
<h2>Why peptides in skincare?</h2>
<p>Because they are small and precise, peptides can be designed with a particular job in mind. Some are chosen to help soften the look of expression lines, others to support a firmer, more resilient-looking complexion, and others still to help skin feel comfortable and hydrated.</p>
<h2>The main families</h2>
<ul>
<li><strong>Signal peptides</strong> — such as Palmitoyl Tripeptide-1 — are formulated to help skin look smoother and firmer.</li>
<li><strong>Neurotransmitter-inspired peptides</strong> — such as Snap-8 — are chosen to help soften the look of expression lines.</li>
<li><strong>Carrier peptides</strong> — such as copper tripeptide (GHK-Cu) — are prized for supporting the look of healthy, resilient skin.</li>
</ul>
<h2>How to use them</h2>
<p>Peptides are best applied to clean skin, in a serum or cream that stays on the skin. They layer beautifully with hyaluronic acid and niacinamide, and they are comfortable enough for morning and evening use.</p>
<p>At Worth Aesthetics every formula is built around a multi-peptide complex, so each step of your ritual works in harmony with the next.</p>`,
  },
  {
    handle: "snap-8-expression-lines",
    title: "Snap-8, Explained: The Peptide for Expression Lines",
    summary: "Meet Acetyl Octapeptide-3 — the elegant, eight-amino-acid peptide behind our line-smoothing serum.",
    image: "snap-8-ghk-cu-face-serum",
    tags: ["Ingredients", "Peptides"],
    daysAgo: 9,
    body: `
<p>Snap-8 is the trade name for Acetyl Octapeptide-3, a peptide made from eight amino acids. It is an evolution of the well-known Argireline (Acetyl Hexapeptide-8), extended by two amino acids.</p>
<h2>What it does in a formula</h2>
<p>Snap-8 is chosen to help soften the look of expression lines — the fine lines around the eyes and forehead that come from everyday movement. Used consistently, skin looks smoother and more relaxed.</p>
<h2>Why we pair it with GHK-Cu</h2>
<p>On its own Snap-8 targets the look of lines; paired with copper tripeptide it becomes part of a more complete approach, supporting skin that looks firmer and more resilient too. That pairing is the heart of our Snap-8 + GHK-Cu Face Serum.</p>
<h2>How to use it</h2>
<p>Apply three to five drops morning and evening to cleansed skin, paying attention to areas where expression lines appear. Follow with moisturizer, and SPF in the morning.</p>`,
  },
  {
    handle: "ghk-cu-copper-peptide",
    title: "GHK-Cu: Why Copper Peptides Became a Modern Classic",
    summary: "Copper tripeptide has been studied for decades. We explain why it remains one of the most respected actives in skincare.",
    image: "ghk-cu-snap-8-firming-cream",
    tags: ["Ingredients", "Science"],
    daysAgo: 16,
    body: `
<p>GHK-Cu — copper tripeptide-1 — is a small peptide bound to copper. Its distinctive blue tint hints at the copper within, and its long research history has made it a favourite of formulators looking for a gentle, dependable active.</p>
<h2>What it brings to skin</h2>
<p>In skincare, GHK-Cu is valued for helping skin look firmer, smoother and more even. It is comfortable on most skin types and suits both morning and evening routines.</p>
<h2>How to pair it</h2>
<p>Copper peptides pair beautifully with hyaluronic acid and other peptides. As a rule of thumb, avoid applying them at exactly the same time as strong exfoliating acids or pure vitamin C — alternate them between morning and evening instead.</p>
<h2>In our formulas</h2>
<p>You will find GHK-Cu in our Snap-8 + GHK-Cu Face Serum and our Firming Cream, where it works alongside Snap-8 and hyaluronic acid for skin that looks firmer and feels deeply hydrated.</p>`,
  },
  {
    handle: "how-to-layer-serums-and-creams",
    title: "How to Layer Serums and Creams: The Ritual, Step by Step",
    summary: "Thin to thick, water to oil. A calm, three-step approach to getting the most from every formula you own.",
    image: "the-complete-regimen",
    tags: ["Rituals"],
    daysAgo: 23,
    body: `
<p>A considered routine does not need to be long. What matters most is the order in which you apply each formula, so that every layer can do its work.</p>
<h2>1. Cleanse</h2>
<p>Begin with a gentle cleanser that leaves skin clean but never tight. Pat dry, leaving the skin very slightly damp.</p>
<h2>2. Treat</h2>
<p>Apply serums from the thinnest to the richest texture. Press — rather than rub — each one into the skin and allow a few moments before the next.</p>
<h2>3. Seal</h2>
<p>Finish with a cream to lock in hydration and help every layer beneath it stay where it belongs. In the morning, always follow with SPF.</p>
<h2>A note on consistency</h2>
<p>Skin rewards patience. Most people notice their skin feels more comfortable within days, while the look of smoothness and firmness builds over several weeks of consistent use.</p>
<p>Not sure where to begin? Our <a href="/pages/routine">routine builder</a> suggests a ritual in under a minute.</p>`,
  },
  {
    handle: "nad-and-pdrn-radiance",
    title: "NAD+ and PDRN: The New Vocabulary of Radiant-Looking Skin",
    summary: "Two ingredients you will hear more about this year — what they are and why we put them together.",
    image: "radiance-peptide-serum",
    tags: ["Ingredients", "Science"],
    daysAgo: 31,
    body: `
<p>NAD+ (nicotinamide adenine dinucleotide) and PDRN (polydeoxyribonucleotide) are two of the most talked-about names in modern skincare. Both are associated with skin that looks revitalised and luminous.</p>
<h2>NAD+</h2>
<p>NAD+ is a coenzyme found naturally in every cell. In skincare, it is used to help tired-looking skin appear energised and radiant.</p>
<h2>PDRN</h2>
<p>PDRN has become a favourite in Korean skincare, where it is prized for leaving skin looking smoother, bouncier and more even.</p>
<h2>Why together?</h2>
<p>Paired, they create a serum designed for a revitalised, glowing-looking complexion. Our NAD+ PDRN Serum is housed in an airless pump to help protect the formula from light and air.</p>`,
  },
  {
    handle: "a-considered-evening-ritual",
    title: "A Considered Evening Ritual for Better-Looking Mornings",
    summary: "Ten quiet minutes that change how your skin looks at breakfast. Our favourite evening sequence.",
    image: "overnight-peptide-sleeping-mask",
    tags: ["Rituals"],
    daysAgo: 38,
    body: `
<p>Evening is when skin finally gets a break from sun, pollution and makeup — the perfect moment for a slower, more deliberate routine.</p>
<h2>Set the scene</h2>
<p>Dim the lights, warm your hands and take a breath. A ritual is as much about the pause as the products.</p>
<h2>The sequence</h2>
<ol>
<li>Cleanse thoroughly to remove the day.</li>
<li>Apply your peptide serum and press it in with your palms.</li>
<li>Massage a pearl of cream upward and outward — a sculpting stone makes this especially relaxing.</li>
<li>Two or three evenings a week, finish with an overnight mask for skin that looks rested and luminous by morning.</li>
</ol>
<h2>In the morning</h2>
<p>Rinse with lukewarm water, follow with a light serum, cream and SPF — and enjoy the difference in the mirror.</p>`,
  },
];

async function imageUrl(handle: string) {
  const r = await admin<{ productByIdentifier: { featuredMedia: { preview: { image: { url: string } | null } } | null } | null }>(
    `query($h: String!) { productByIdentifier(identifier: { handle: $h }) { featuredMedia { preview { image { url } } } } }`,
    { h: handle },
  );
  return r.productByIdentifier?.featuredMedia?.preview.image?.url;
}

console.log(`\nWorth Aesthetics — Journal seed ${DRY_RUN ? "(DRY RUN — no changes)" : ""}\n`);
try {
  const blogs = await admin<{ blogs: { nodes: { id: string; handle: string }[] } }>(`query { blogs(first: 25) { nodes { id handle } } }`);
  const blog = blogs.blogs.nodes.find((b) => b.handle === "journal");
  if (!blog) throw new Error("Blog `journal` not found — run scripts/seed-content.mts first.");

  const existing = await admin<{ articles: { nodes: { handle: string }[] } }>(
    `query { articles(first: 100, query: "blog_id:${blog.id.split("/").pop()}") { nodes { handle } } }`,
  );
  const have = new Set(existing.articles.nodes.map((a) => a.handle));

  for (const a of ARTICLES) {
    if (have.has(a.handle)) {
      log.skip(`article /blogs/journal/${a.handle}`);
      continue;
    }
    log.create(`article /blogs/journal/${a.handle} — “${a.title}”`);
    if (DRY_RUN) continue;
    const url = await imageUrl(a.image);
    const res = await admin(
      `mutation($article: ArticleCreateInput!) { articleCreate(article: $article) { article { id } userErrors { field message } } }`,
      {
        article: {
          blogId: blog.id,
          handle: a.handle,
          title: a.title,
          summary: `<p>${a.summary}</p>`,
          body: a.body.trim(),
          author: { name: "Worth Aesthetics Editorial" },
          tags: [...a.tags, "demo"],
          isPublished: true,
          publishDate: new Date(Date.now() - a.daysAgo * 86_400_000).toISOString(),
          ...(url ? { image: { url, altText: a.title } } : {}),
        },
      },
    );
    check(res.articleCreate, `article ${a.handle}`);
  }
  console.log("\nDone.");
} catch (e) {
  console.error(`\n❌ ${(e as Error).message}\n`);
  process.exit(1);
}
