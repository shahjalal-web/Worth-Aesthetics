import { createHmac, timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";
import type { NextRequest } from "next/server";
import { TAGS } from "@/lib/shopify/constants";

/**
 * Shopify webhook → cache revalidation.
 * Subscribe (Shopify admin → Settings → Notifications → Webhooks, or via the app) to:
 *   products/create|update|delete, collections/create|update|delete, inventory_levels/update
 * pointing at https://<site>/api/revalidate. Requests are verified with HMAC-SHA256.
 */
export async function POST(req: NextRequest) {
  const secret = process.env.SHOPIFY_REVALIDATION_SECRET;
  if (!secret) return Response.json({ ok: false, error: "Not configured" }, { status: 500 });

  const raw = await req.text();
  const received = req.headers.get("x-shopify-hmac-sha256") ?? "";
  const digest = createHmac("sha256", secret).update(raw, "utf8").digest("base64");

  const a = Buffer.from(digest);
  const b = Buffer.from(received);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return Response.json({ ok: false, error: "Invalid signature" }, { status: 401 });
  }

  const topic = req.headers.get("x-shopify-topic") ?? "";
  const tags = new Set<string>();

  if (topic.startsWith("products/") || topic.startsWith("inventory")) {
    tags.add(TAGS.products);
    try {
      const handle = (JSON.parse(raw) as { handle?: string }).handle;
      if (handle) tags.add(`product:${handle}`);
    } catch {
      /* body not JSON — product tag still revalidated */
    }
  }
  if (topic.startsWith("collections/")) tags.add(TAGS.collections);
  if (topic.startsWith("metaobjects/") || topic.startsWith("shop/")) tags.add(TAGS.content);

  if (!tags.size) return Response.json({ ok: true, revalidated: [], topic });

  for (const tag of tags) revalidateTag(tag, "max");
  return Response.json({ ok: true, revalidated: [...tags], topic, now: Date.now() });
}
