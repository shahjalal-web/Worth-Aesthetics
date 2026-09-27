import { cacheLife } from "next/cache";
import Link from "next/link";
import { LogoMark } from "@/components/brand/logo";
import { MolecularLattice } from "@/components/brand/molecular";
import { InstagramIcon, TikTokIcon } from "@/components/ui/icons";
import { footerNav, legalNav, siteConfig } from "@/lib/site-config";
import { PrivacyChoicesLink } from "@/components/consent/consent-banner";
import { NewsletterForm } from "./newsletter";

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-band-line bg-band text-band-fg">
      <MolecularLattice className="pointer-events-none absolute -top-10 -right-16 w-[420px] opacity-[0.12]" />

      <div className="container-wa relative grid gap-14 py-16 md:py-20 lg:grid-cols-12 lg:gap-10">
        {/* Newsletter */}
        <div className="lg:col-span-5">
          <p className="eyebrow text-band-accent">The Worth Letter</p>
          <h2 className="mt-4 max-w-md font-sans text-2xl leading-snug font-light tracking-wide md:text-[28px]">
            Peptide science, rituals and first access —{" "}
            <span className="serif-italic text-band-accent">delivered quietly.</span>
          </h2>
          <div className="mt-8 max-w-md">
            <NewsletterForm tone="dark" />
          </div>
        </div>

        {/* Links */}
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:col-span-6 lg:col-start-7">
          {footerNav.map((group) => (
            <div key={group.title}>
              <p className="eyebrow text-band-accent">{group.title}</p>
              <ul className="mt-5 space-y-3">
                {group.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-[14px] text-band-fg transition-colors hover:text-band-accent">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="container-wa relative">
        <div className="h-px bg-band-line" />
        <div className="flex flex-col gap-6 py-8 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-5">
            <p className="flex items-center gap-2.5 font-display text-[13px] font-semibold tracking-[0.34em]">
              <LogoMark className="size-7 text-band-fg" />
              WORTH
            </p>
            <span className="h-4 w-px bg-band-line" aria-hidden />
            <p className="text-[12px] text-band-muted">
              © <CopyrightYear /> {siteConfig.name}. All rights reserved.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            {legalNav.map((l) => (
              <Link key={l.href} href={l.href} className="text-[12px] text-band-muted hover:text-band-accent">
                {l.label}
              </Link>
            ))}
            <PrivacyChoicesLink className="text-[12px] text-band-muted hover:text-band-accent" />
            <div className="flex items-center gap-1">
              {/* TBC: social URLs from client */}
              <a
                href={siteConfig.social.instagram || "#"}
                aria-label="Instagram"
                className="inline-flex size-9 items-center justify-center text-band-muted hover:text-band-accent"
              >
                <InstagramIcon className="size-[18px]" />
              </a>
              <a
                href={siteConfig.social.tiktok || "#"}
                aria-label="TikTok"
                className="inline-flex size-9 items-center justify-center text-band-muted hover:text-band-accent"
              >
                <TikTokIcon className="size-[18px]" />
              </a>
            </div>
          </div>
        </div>
        <div className="pb-6" />
      </div>
    </footer>
  );
}

async function CopyrightYear() {
  "use cache";
  cacheLife("days");
  return <>{new Date().getFullYear()}</>;
}
