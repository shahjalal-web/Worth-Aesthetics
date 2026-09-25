import { cn } from "@/lib/utils";

/**
 * TEXT PLACEHOLDER — TBC: replace with the client's official SVG logo
 * (WA monogram roundel + WORTH AESTHETICS wordmark). Do not trace from photos.
 * The "O" node below is a minimal nod to the molecular motif, not the real mark.
 */
export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <span
      className={cn("inline-flex flex-col items-center leading-none text-fg select-none", className)}
      aria-label="Worth Aesthetics"
      role="img"
    >
      <span className="font-display text-[15px] font-semibold tracking-[0.34em] md:text-[17px]">
        W
        <span className="relative inline-block">
          O
          <span
            aria-hidden
            className="absolute top-1/2 left-1/2 size-[3px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent"
          />
        </span>
        RTH
      </span>
      {!compact && (
        <span className="mt-[5px] font-display text-[7.5px] font-medium tracking-[0.52em] text-muted md:text-[8.5px]">
          AESTHETICS
        </span>
      )}
    </span>
  );
}
