import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/ui/page-hero";
import { siteConfig } from "@/lib/site-config";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with the Worth Aesthetics team.",
  alternates: { canonical: "/pages/contact" },
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="We're here"
        accent="to help"
        intro="Questions about an order, a product or your ritual — send us a note and we'll be in touch."
        crumbs={[{ label: "Home", href: "/" }, { label: "Contact" }]}
      />
      <section className="py-16 md:py-24">
        <div className="container-wa grid gap-14 lg:grid-cols-12">
          <aside className="space-y-10 lg:col-span-4">
            <div>
              <h2 className="label-caps text-accent-ink">Before you write</h2>
              <p className="mt-3 text-[14px] leading-relaxed text-muted">
                Many answers — shipping times, returns, how to layer products — are in our{" "}
                <Link href="/pages/faq" className="text-fg underline decoration-accent underline-offset-4">
                  help centre
                </Link>
                .
              </p>
            </div>
            <div>
              <h2 className="label-caps text-accent-ink">Email</h2>
              <p className="mt-3 text-[14px] text-muted">
                {siteConfig.contactEmail ? (
                  <a href={`mailto:${siteConfig.contactEmail}`} className="text-fg underline decoration-accent underline-offset-4">
                    {siteConfig.contactEmail}
                  </a>
                ) : (
                  "Use the form and we'll reply by email."
                )}
              </p>
            </div>
            <div>
              <h2 className="label-caps text-accent-ink">Response time</h2>
              <p className="mt-3 text-[14px] text-muted">Monday to Friday, within one business day.</p>
            </div>
          </aside>
          <div className="lg:col-span-7 lg:col-start-6">
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}
