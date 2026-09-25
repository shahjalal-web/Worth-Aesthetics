"use client";

import { cn } from "@/lib/utils";
import { MinusIcon, PlusIcon } from "./icons";

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 20,
  label = "Quantity",
  size = "sm",
  disabled,
}: {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  label?: string;
  size?: "sm" | "md";
  disabled?: boolean;
}) {
  const h = size === "sm" ? "h-9" : "h-12";
  const w = size === "sm" ? "w-8" : "w-11";
  return (
    <div
      className={cn("inline-flex items-center border border-line", h)}
      role="group"
      aria-label={label}
    >
      <button
        type="button"
        className={cn("flex h-full items-center justify-center text-fg hover:text-accent-ink disabled:opacity-30", w)}
        onClick={() => onChange(value - 1)}
        disabled={disabled || value <= min}
        aria-label="Decrease quantity"
      >
        <MinusIcon className="size-3.5" />
      </button>
      <span className="min-w-6 text-center text-[13px] tabular-nums" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        className={cn("flex h-full items-center justify-center text-fg hover:text-accent-ink disabled:opacity-30", w)}
        onClick={() => onChange(value + 1)}
        disabled={disabled || value >= max}
        aria-label="Increase quantity"
      >
        <PlusIcon className="size-3.5" />
      </button>
    </div>
  );
}
