import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  accent,
  description,
  align = "center",
  className,
  action,
}: {
  eyebrow?: string;
  title: string;
  accent?: string;
  description?: ReactNode;
  align?: "center" | "left";
  className?: string;
  action?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-6",
        align === "center" ? "items-center text-center" : "md:flex-row md:items-end md:justify-between",
        className,
      )}
    >
      <div className={cn(align === "center" && "flex flex-col items-center")}>
        {eyebrow && <p className="eyebrow text-accent-ink">{eyebrow}</p>}
        <h2 className="mt-4 text-[26px] leading-[1.15] font-light tracking-[0.06em] uppercase md:text-[34px]">
          {title}
          {accent && (
            <>
              {" "}
              <span className="serif-italic tracking-normal normal-case text-accent-ink">{accent}</span>
            </>
          )}
        </h2>
        {description && (
          <p className={cn("mt-4 max-w-xl text-[15px] leading-relaxed text-muted", align === "center" && "mx-auto")}>
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}
