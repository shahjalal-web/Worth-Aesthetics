import { siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";
import { LockIcon, ReturnIcon, TruckIcon } from "./icons";

/**
 * Trust signals shown near buy buttons.
 * TBC: guarantee / returns wording and cruelty-free claim must be confirmed by
 * the client before they are shown (see docs/OPEN_QUESTIONS.md).
 */
export function TrustRow({ className, compact = false }: { className?: string; compact?: boolean }) {
  const items = [
    { icon: LockIcon, label: "Secure checkout" },
    { icon: TruckIcon, label: `Free US shipping $${siteConfig.freeShippingThreshold}+` },
    { icon: ReturnIcon, label: "Easy returns" }, // TBC: confirm returns policy
  ];
  return (
    <ul
      className={cn(
        "grid grid-cols-3 gap-2 text-center text-muted",
        compact ? "text-[10px]" : "text-[11px]",
        className,
      )}
    >
      {items.map(({ icon: Icon, label }) => (
        <li key={label} className="flex flex-col items-center gap-1.5">
          <Icon className="size-[18px] text-accent" />
          <span className="leading-tight tracking-wide">{label}</span>
        </li>
      ))}
    </ul>
  );
}

/** Accepted payment methods (text badges — official marks TBC). */
export function PaymentBadges({ className, compact = false }: { className?: string; compact?: boolean }) {
  const methods = ["Shop Pay", "Apple Pay", "G Pay", "PayPal", "Visa", "Mastercard", "Amex"];
  return (
    <ul
      className={cn("flex items-center justify-center", compact ? "flex-nowrap gap-1" : "flex-wrap gap-1.5", className)}
      aria-label="Accepted payment methods"
    >
      {methods.map((m) => (
        <li
          key={m}
          className={cn(
            "shrink-0 rounded-[3px] border border-line font-display font-medium tracking-wider text-muted",
            compact ? "px-1 py-px text-[8px]" : "px-1.5 py-0.5 text-[9px]",
          )}
        >
          {m}
        </li>
      ))}
    </ul>
  );
}
