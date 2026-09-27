import { siteConfig } from "@/lib/site-config";
import type { Policy } from "@/lib/shopify/types";

/**
 * Interim policy summaries shown ONLY while the matching policy is empty in
 * Shopify admin → Settings → Policies. As soon as the client publishes a policy
 * there, Shopify's text replaces these automatically. Figures come from
 * siteConfig (all TBC — see docs/OPEN_QUESTIONS.md).
 */
const threshold = siteConfig.freeShippingThreshold;

const interimNote = `<p><em>This is a summary of how we currently operate. Our full policy is being finalised and will appear here shortly. Questions? <a href="/pages/contact">Contact our client care team</a>.</em></p>`;

export const fallbackPolicies: Policy[] = [
  {
    url: "/policies/shipping-policy",
    handle: "shipping-policy",
    title: "Shipping Policy",
    body: `
<h2>Complimentary shipping</h2>
<p>US orders over $${threshold} ship free. Below that, the shipping cost is shown clearly at checkout before you pay — never as a surprise.</p>
<h2>Dispatch times</h2>
<p>${siteConfig.dispatchText}</p>
<h2>Delivery estimates</h2>
<p>Estimated delivery times for each shipping option are shown at checkout.</p>
<h2>Tracking</h2>
<p>You'll receive a confirmation email with a tracking link the moment your order leaves us. Signed-in clients can also follow every order from <a href="/account/orders">their account</a>.</p>
<h2>Where we ship</h2>
<p>We currently ship within the United States.</p>
${interimNote}`,
  },
  {
    url: "/policies/refund-policy",
    handle: "refund-policy",
    title: "Returns & Refunds",
    body: `
<h2>Our promise</h2>
<p>${siteConfig.returnsText}</p>
<h2>How to start a return</h2>
<ol>
<li>Email our client care team with your order number.</li>
<li>We'll reply with everything you need to send it back.</li>
<li>Once your return arrives and is checked, we refund your original payment method.</li>
</ol>
<h2>Refund timing</h2>
<p>Refunds go back to your original payment method. Your bank may take a few days to show the credit.</p>
<h2>Damaged or incorrect items</h2>
<p>If anything arrives damaged or isn't what you ordered, let us know as soon as possible and we'll put it right.</p>
${interimNote}`,
  },
  {
    url: "/policies/terms-of-service",
    handle: "terms-of-service",
    title: "Terms of Service",
    body: `
<h2>Using this site</h2>
<p>By browsing or purchasing from ${siteConfig.name} you agree to use this site lawfully and to provide accurate information when you place an order.</p>
<h2>Orders and pricing</h2>
<p>All prices are shown in US dollars. We confirm every order by email; checkout and payment are processed securely by Shopify. If a pricing error occurs we will contact you before your order ships.</p>
<h2>Product information</h2>
<p>Our products are cosmetics intended for external use only. Patch test before first use and discontinue if irritation occurs. Individual results vary.</p>
<h2>Intellectual property</h2>
<p>All content on this site — including text, imagery and the ${siteConfig.name} name and marks — belongs to ${siteConfig.name} and may not be reused without permission.</p>
<h2>Privacy</h2>
<p>How we handle your data is described in our <a href="/policies/privacy-policy">Privacy Policy</a>.</p>
${interimNote}`,
  },
];
