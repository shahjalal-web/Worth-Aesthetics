import { siteConfig } from "@/lib/site-config";
import type { Money } from "@/lib/shopify/types";
import { cn, formatMoney, toNumber } from "@/lib/utils";

export function FreeShippingBar({ subtotal, compact = false }: { subtotal: Money; compact?: boolean }) {
  const threshold = siteConfig.freeShippingThreshold;
  const current = toNumber(subtotal);
  const remaining = Math.max(threshold - current, 0);
  const progress = Math.min(current / threshold, 1);

  return (
    <div className={compact ? "space-y-2" : "space-y-3"}>
      <p className={cn("text-center text-fg", compact ? "text-[12px]" : "text-[13px]")} aria-live="polite">
        {remaining > 0 ? (
          <>
            You&apos;re{" "}
            <span className="font-normal text-accent-ink">
              {formatMoney({ amount: remaining, currencyCode: subtotal.currencyCode })}
            </span>{" "}
            away from complimentary shipping
          </>
        ) : (
          <>
            <span className={cn("serif-italic text-accent-ink", compact ? "text-[14px]" : "text-base")}>Wonderful</span> — your order
            ships complimentary
          </>
        )}
      </p>
      <div
        className="relative h-[2px] w-full overflow-hidden bg-line"
        role="progressbar"
        aria-label="Progress toward free shipping"
        aria-valuemin={0}
        aria-valuemax={threshold}
        aria-valuenow={Math.min(current, threshold)}
      >
        <div
          className="absolute inset-y-0 left-0 bg-accent transition-[width] duration-500 ease-(--ease-luxe)"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
    </div>
  );
}
