import { cn } from "@/lib/utils";

/** Minimal "molecular node" divider — thin hairlines with connected nodes. */
export function MolecularDivider({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-4 text-accent", className)} aria-hidden>
      <span className="h-px flex-1 bg-line" />
      <svg width="64" height="14" viewBox="0 0 64 14" fill="none">
        <path d="M4 7h14l8-5 12 10 8-5h14" stroke="currentColor" strokeWidth="0.75" />
        <circle cx="4" cy="7" r="1.6" fill="currentColor" />
        <circle cx="26" cy="2" r="1.6" fill="currentColor" />
        <circle cx="38" cy="12" r="1.6" fill="currentColor" />
        <circle cx="60" cy="7" r="1.6" fill="currentColor" />
      </svg>
      <span className="h-px flex-1 bg-line" />
    </div>
  );
}

/** Decorative lattice used as a faint background texture. */
export function MolecularLattice({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 240 240"
      fill="none"
      aria-hidden
      className={cn("text-accent", className)}
    >
      <g stroke="currentColor" strokeWidth="0.6" opacity="0.55">
        <path d="M40 60 L100 30 L160 70 L200 40" />
        <path d="M100 30 L110 110 L160 70" />
        <path d="M40 60 L60 140 L110 110 L170 160 L200 120 L160 70" />
        <path d="M60 140 L90 200 L170 160" />
        <path d="M200 120 L220 190 L170 160" />
      </g>
      <g fill="currentColor">
        {[
          [40, 60],
          [100, 30],
          [160, 70],
          [200, 40],
          [110, 110],
          [60, 140],
          [170, 160],
          [200, 120],
          [90, 200],
          [220, 190],
        ].map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="2.4" />
        ))}
      </g>
    </svg>
  );
}
