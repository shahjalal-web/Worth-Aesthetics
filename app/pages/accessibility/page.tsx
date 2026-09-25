import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/ui/page-hero";

export const metadata: Metadata = {
  title: "Accessibility",
  description: "Our commitment to an accessible shopping experience.",
  alternates: { canonical: "/pages/accessibility" },
};

export default function AccessibilityPage() {
  return (
    <>
      <PageHero
        eyebrow="Accessibility"
        title="Designed for"
        accent="everyone"
        crumbs={[{ label: "Home", href: "/" }, { label: "Accessibility" }]}
      />
      <article className="container-wa max-w-3xl py-16 md:py-24">
        <div className="wa-prose">
          <p>
            Worth Aesthetics is committed to making our website accessible to all customers, including people with
            disabilities. We aim to conform to the Web Content Accessibility Guidelines (WCAG) 2.2, Level AA.
          </p>
          <h2>What we do</h2>
          <ul>
            <li>Every page can be navigated with a keyboard, with clearly visible focus states.</li>
            <li>Text and background colours are checked to meet AA contrast ratios in both light and dark themes.</li>
            <li>Images carry descriptive alternative text; decorative images are hidden from screen readers.</li>
            <li>Menus, the shopping bag and dialogs are announced to assistive technology and trap focus while open.</li>
            <li>Animation is kept subtle and is switched off when your device requests reduced motion.</li>
          </ul>
          <h2>Ongoing work</h2>
          <p>
            Accessibility is an ongoing effort. We regularly review the site with automated tools and manual testing,
            and we fix issues as we find them.
          </p>
          <h2>Feedback</h2>
          <p>
            If you experience any difficulty using our website, please <Link href="/pages/contact">contact us</Link>.
            Tell us the page and the problem, and we will do our best to help and to provide the information or
            product you need in an alternative way.
          </p>
        </div>
      </article>
    </>
  );
}
