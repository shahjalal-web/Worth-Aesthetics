"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/account", label: "Overview" },
  { href: "/account/orders", label: "Orders" },
  { href: "/account/addresses", label: "Addresses" },
  { href: "/account/profile", label: "Profile" },
];

export function AccountNav({ name }: { name?: string | null }) {
  const pathname = usePathname();
  return (
    <div className="mb-12 flex flex-col gap-6 border-b border-line pb-6 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="eyebrow text-accent-ink">My account</p>
        <h1 className="mt-3 text-[28px] font-light tracking-[0.06em] uppercase md:text-[36px]">
          {name ? (
            <>
              Hello, <span className="serif-italic tracking-normal normal-case text-accent-ink">{name}</span>
            </>
          ) : (
            "Welcome"
          )}
        </h1>
      </div>
      <nav aria-label="Account" className="no-scrollbar -mx-5 overflow-x-auto px-5 md:mx-0 md:px-0">
        <ul className="flex items-center gap-6 whitespace-nowrap">
          {links.map((l) => {
            const active = l.href === "/account" ? pathname === l.href : pathname.startsWith(l.href);
            return (
              <li key={l.href}>
                <Link
                  href={l.href}
                  aria-current={active ? "page" : undefined}
                  className={cn("label-caps text-[10.5px] transition-colors hover:text-accent-ink", active && "text-accent-ink underline decoration-accent underline-offset-8")}
                >
                  {l.label}
                </Link>
              </li>
            );
          })}
          <li>
            <a href="/account/logout" className="label-caps text-[10.5px] text-muted hover:text-fg">
              Sign out
            </a>
          </li>
        </ul>
      </nav>
    </div>
  );
}
