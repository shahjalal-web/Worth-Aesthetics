import { cn } from "@/lib/utils";
import { LOCKUP, MONOGRAM, WORDMARK } from "./logo-paths";

type Group = { viewBox: string; paths: readonly string[] };

function Paths({ group, className, title }: { group: Group; className?: string; title?: string }) {
  return (
    <svg
      viewBox={group.viewBox}
      fill="currentColor"
      className={cn("shrink-0", className)}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      {group.paths.map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  );
}

/** Official WA roundel monogram (client vector artwork). Inherits `currentColor`. */
export function LogoMark({ className, title }: { className?: string; title?: string }) {
  return <Paths group={MONOGRAM} className={className} title={title} />;
}

/** Official WORTH / AESTHETICS wordmark, with the molecular node inside the "O". */
export function Wordmark({ className, title }: { className?: string; title?: string }) {
  return <Paths group={WORDMARK} className={className} title={title} />;
}

/** Stacked lockup (roundel above wordmark) — hero moments, sign-in, social images. */
export function LogoStacked({ className, title = "Worth Aesthetics" }: { className?: string; title?: string }) {
  return <Paths group={LOCKUP} className={className} title={title} />;
}

/** Horizontal lockup for the header: roundel + wordmark. */
export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5 select-none", className)} role="img" aria-label="Worth Aesthetics">
      <LogoMark className={compact ? "h-8 w-auto" : "h-9 w-auto md:h-10"} />
      <Wordmark className={compact ? "h-5.5 w-auto" : "h-6 w-auto md:h-7"} />
    </span>
  );
}
