import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "accent" | "outline" | "ghost" | "link";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary: "bg-btn text-btn-fg hover:bg-btn-hover",
  accent: "bg-btn-alt text-btn-alt-fg hover:brightness-[1.06]",
  outline: "border border-fg/80 text-fg hover:bg-fg hover:text-bg",
  ghost: "text-fg hover:bg-surface",
  link: "px-0! h-auto! text-fg underline decoration-accent decoration-1 underline-offset-[6px] hover:text-accent-ink",
};

const sizes: Record<Size, string> = {
  sm: "h-10 px-5 text-[10.5px]",
  md: "h-12 px-8 text-[11px]",
  lg: "h-14 px-10 text-xs",
};

export function buttonClasses({
  variant = "primary",
  size = "md",
  className,
}: { variant?: Variant; size?: Size; className?: string } = {}) {
  return cn(
    "inline-flex items-center justify-center gap-3 font-display font-medium tracking-[0.18em] uppercase whitespace-nowrap",
    "transition-[background-color,color,border-color,filter,transform] duration-300 ease-(--ease-luxe)",
    "disabled:pointer-events-none disabled:opacity-50 active:scale-[0.99]",
    variants[variant],
    sizes[size],
    className,
  );
}

type Common = { variant?: Variant; size?: Size };

export function Button({
  variant,
  size,
  className,
  type = "button",
  ...props
}: ComponentProps<"button"> & Common) {
  return <button type={type} className={buttonClasses({ variant, size, className })} {...props} />;
}

export function ButtonLink({
  variant,
  size,
  className,
  ...props
}: ComponentProps<typeof Link> & Common) {
  return <Link className={buttonClasses({ variant, size, className })} {...props} />;
}
