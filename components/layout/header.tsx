"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Logo } from "@/components/brand/logo";
import { BagButton } from "@/components/cart/bag-button";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { ArrowRightIcon, ChevronRightIcon, CloseIcon, MenuIcon, SearchIcon, UserIcon } from "@/components/ui/icons";
import { Sheet } from "@/components/ui/sheet";
import { mainNav, type NavItem } from "@/lib/site-config";
import { cn } from "@/lib/utils";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mega, setMega] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const closeTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menus on navigation (adjust state during render, not in an effect)
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setMega(null);
    setMobileOpen(false);
  }

  useEffect(() => {
    if (!mega) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMega(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mega]);

  const openMega = (label: string | null) => {
    window.clearTimeout(closeTimer.current);
    setMega(label);
  };
  const scheduleClose = () => {
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setMega(null), 140);
  };

  const active = mainNav.find((n) => n.label === mega && n.mega);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b bg-bg/95 backdrop-blur-md transition-[border-color,box-shadow] duration-300",
        scrolled || mega ? "border-line shadow-[0_8px_30px_-24px_rgb(0_0_0/0.35)]" : "border-transparent",
      )}
      onMouseLeave={scheduleClose}
    >
      <div className="container-wa grid h-16 grid-cols-[1fr_auto_1fr] items-center md:h-[76px]">
        {/* Left: nav (desktop) / menu (mobile) */}
        <div className="flex items-center">
          <button
            type="button"
            className="-ml-2 inline-flex size-10 items-center justify-center lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <MenuIcon className="size-[22px]" />
          </button>
          <Link
            href="/search"
            className="inline-flex size-10 items-center justify-center lg:hidden"
            aria-label="Search"
          >
            <SearchIcon className="size-[19px]" />
          </Link>
          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="flex items-center gap-8 xl:gap-10">
              {mainNav.map((item) => (
                <li key={item.label} onMouseEnter={() => openMega(item.mega ? item.label : null)}>
                  {item.mega ? (
                    <button
                      type="button"
                      className={cn(
                        "label-caps relative py-7 text-[11px] transition-colors hover:text-accent-ink",
                        mega === item.label && "text-accent-ink",
                      )}
                      aria-expanded={mega === item.label}
                      aria-controls="mega-panel"
                      onClick={() => openMega(mega === item.label ? null : item.label)}
                      onFocus={() => openMega(item.label)}
                    >
                      {item.label}
                      <NavUnderline active={mega === item.label} />
                    </button>
                  ) : (
                    <Link
                      href={item.href}
                      className={cn(
                        "label-caps relative block py-7 text-[11px] transition-colors hover:text-accent-ink",
                        pathname === item.href && "text-accent-ink",
                      )}
                      onFocus={() => setMega(null)}
                    >
                      {item.label}
                      <NavUnderline active={pathname === item.href} />
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Center: logo */}
        <Link href="/" aria-label="Worth Aesthetics — home" className="justify-self-center px-2">
          <Logo />
        </Link>

        {/* Right: utilities */}
        <div className="flex items-center justify-end gap-0.5 md:gap-1.5">
          <Link
            href="/search"
            className="hidden size-10 items-center justify-center transition-colors hover:text-accent-ink lg:inline-flex"
            aria-label="Search"
          >
            <SearchIcon className="size-[19px]" />
          </Link>
          <Link
            href="/account"
            className="hidden size-10 items-center justify-center transition-colors hover:text-accent-ink sm:inline-flex"
            aria-label="Account"
          >
            <UserIcon className="size-[20px]" />
          </Link>
          <ThemeToggle />
          <BagButton />
        </div>
      </div>

      {/* Mega menu panel */}
      <div
        id="mega-panel"
        className={cn(
          "absolute inset-x-0 top-full hidden border-b border-line bg-bg lg:block",
          "transition-[opacity,visibility,translate] duration-300 ease-(--ease-luxe)",
          active ? "visible translate-y-0 opacity-100" : "invisible -translate-y-1 opacity-0",
        )}
        onMouseEnter={() => active && openMega(active.label)}
      >
        {active?.mega && <MegaPanel item={active} />}
      </div>

      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </header>
  );
}

function NavUnderline({ active }: { active: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "absolute inset-x-0 bottom-5 h-px origin-left bg-accent transition-transform duration-300 ease-(--ease-luxe)",
        active ? "scale-x-100" : "scale-x-0",
      )}
    />
  );
}

function MegaPanel({ item }: { item: NavItem }) {
  const mega = item.mega!;
  return (
    <div className="container-wa grid grid-cols-12 gap-10 py-12">
      <div className="col-span-7 grid grid-cols-2 gap-10">
        {mega.groups.map((g) => (
          <div key={g.title}>
            <p className="eyebrow text-muted">{g.title}</p>
            <ul className="mt-5 space-y-3.5">
              {g.links.map((l) => (
                <li key={l.href + l.label}>
                  <Link
                    href={l.href}
                    className="group inline-flex items-center gap-2 text-[15px] font-light transition-colors hover:text-accent-ink"
                  >
                    {l.label}
                    <ArrowRightIcon className="size-3.5 -translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      {mega.feature && (
        <Link href={mega.feature.href} className="group col-span-5 grid grid-cols-2 items-center gap-6 bg-bg-soft">
          <div className="relative aspect-[4/5] overflow-hidden">
            <Image
              src={mega.feature.image}
              alt=""
              fill
              sizes="240px"
              className="object-cover transition-transform duration-700 ease-(--ease-luxe) group-hover:scale-[1.04]"
            />
          </div>
          <div className="pr-6">
            <p className="eyebrow text-accent-ink">{mega.feature.eyebrow}</p>
            <p className="serif-italic mt-3 text-3xl leading-tight">{mega.feature.title}</p>
            <span className="label-caps mt-5 inline-flex items-center gap-2 text-[10px]">
              Discover <ArrowRightIcon className="size-3.5" />
            </span>
          </div>
        </Link>
      )}
    </div>
  );
}

function MobileNav({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [expanded, setExpanded] = useState<string | null>(null);
  return (
    <Sheet open={open} onClose={onClose} side="left" label="Menu">
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <Logo compact />
          <button
            type="button"
            onClick={onClose}
            className="-mr-2 inline-flex size-10 items-center justify-center"
            aria-label="Close menu"
          >
            <CloseIcon className="size-5" />
          </button>
        </div>
        <nav aria-label="Mobile" className="flex-1 overflow-y-auto px-5 py-4">
          <ul className="divide-y divide-line">
            {mainNav.map((item) => (
              <li key={item.label}>
                {item.mega ? (
                  <>
                    <button
                      type="button"
                      className="flex w-full items-center justify-between py-5 text-left"
                      aria-expanded={expanded === item.label}
                      onClick={() => setExpanded((e) => (e === item.label ? null : item.label))}
                    >
                      <span className="title-caps text-[15px]">{item.label}</span>
                      <ChevronRightIcon
                        className={cn(
                          "size-4 text-accent transition-transform duration-300",
                          expanded === item.label && "rotate-90",
                        )}
                      />
                    </button>
                    <div
                      className={cn(
                        "grid transition-[grid-template-rows] duration-300 ease-(--ease-luxe)",
                        expanded === item.label ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                      )}
                    >
                      <ul className="overflow-hidden">
                        {item.mega.groups.flatMap((g) => g.links).map((l) => (
                          <li key={l.href + l.label}>
                            <Link href={l.href} className="block py-2.5 pl-4 text-[14px] text-muted hover:text-fg">
                              {l.label}
                            </Link>
                          </li>
                        ))}
                        <li className="h-3" aria-hidden />
                      </ul>
                    </div>
                  </>
                ) : (
                  <Link href={item.href} className="title-caps block py-5 text-[15px]">
                    {item.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>
        <div className="space-y-1 border-t border-line bg-bg-soft px-5 py-5">
          <Link href="/account" className="flex items-center gap-3 py-2 text-[14px]">
            <UserIcon className="size-5 text-accent" /> Account
          </Link>
          <Link href="/search" className="flex items-center gap-3 py-2 text-[14px]">
            <SearchIcon className="size-5 text-accent" /> Search
          </Link>
          <div className="flex items-center gap-3 py-1 text-[14px]">
            <ThemeToggle className="-ml-2.5 text-accent" /> <span className="-ml-1.5">Appearance</span>
          </div>
        </div>
      </div>
    </Sheet>
  );
}
