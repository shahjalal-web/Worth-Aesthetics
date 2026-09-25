import type { Money } from "@/lib/shopify/types";
import { cn, formatMoney, toNumber } from "@/lib/utils";

export function Price({
  price,
  compareAt,
  from = false,
  className,
}: {
  price: Money;
  compareAt?: Money | null;
  from?: boolean;
  className?: string;
}) {
  const onSale = compareAt && toNumber(compareAt) > toNumber(price);
  return (
    <span className={cn("inline-flex items-baseline gap-2 tabular-nums", className)}>
      {from && <span className="text-[0.85em] text-muted">From</span>}
      <span className={cn(onSale && "text-accent-ink")}>{formatMoney(price)}</span>
      {onSale && (
        <s className="text-[0.85em] text-muted">
          <span className="sr-only">Original price </span>
          {formatMoney(compareAt)}
        </s>
      )}
    </span>
  );
}
