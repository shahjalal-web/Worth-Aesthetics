import { cn } from "@/lib/utils";

/**
 * INTERIM brand mark (original design, not the client's WA roundel).
 * A hexagonal "peptide ring" framing a W drawn as a connected molecular chain,
 * with the apex node in Champagne Taupe. Swap for the official SVG when supplied.
 */
export function LogoMark({ className, title }: { className?: string; title?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      className={cn("shrink-0", className)}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      {/* Hexagonal frame */}
      <path
        d="M24 2.8 42.4 13.4v21.2L24 45.2 5.6 34.6V13.4Z"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
      {/* W as a molecular chain */}
      <path
        d="M13.2 15.6 18.6 32.2 24 21.4l5.4 10.8 5.4-16.6"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <g fill="currentColor">
        <circle cx="13.2" cy="15.6" r="1.9" />
        <circle cx="18.6" cy="32.2" r="1.9" />
        <circle cx="29.4" cy="32.2" r="1.9" />
        <circle cx="34.8" cy="15.6" r="1.9" />
      </g>
      {/* Apex node — the accent */}
      <circle cx="24" cy="21.4" r="2.5" fill="var(--wa-taupe, #B89F6B)" />
    </svg>
  );
}

export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-3 text-fg select-none", className)} role="img" aria-label="Worth Aesthetics">
      <LogoMark className={compact ? "size-7" : "size-8 md:size-9"} />
      <span className="flex flex-col leading-none" aria-hidden>
        <span className="font-display text-[14px] font-semibold tracking-[0.34em] md:text-[16px]">WORTH</span>
        {!compact && (
          <span className="mt-[5px] font-display text-[7px] font-medium tracking-[0.47em] text-muted md:text-[8px]">
            AESTHETICS
          </span>
        )}
      </span>
    </span>
  );
}
