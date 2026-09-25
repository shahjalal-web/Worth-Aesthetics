import { siteConfig } from "@/lib/site-config";
import type { Money } from "@/lib/shopify/types";
import { formatMoney, toNumber } from "@/lib/utils";

export function FreeShippingBar({ subtotal }: { subtotal: Money }) {
  const threshold = siteConfig.freeShippingThreshold;
  const current = toNumber(subtotal);
  const remaining = Math.max(threshold - current, 0);
  const progress = Math.min(current / threshold, 1);

  return (
    <div className="space-y-3">
      <p className="text-center text-[13px] text-fg" aria-live="polite">
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
            <span className="serif-italic text-base text-accent-ink">Wonderful</span> — your order
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
