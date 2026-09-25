import type { ReactNode } from "react";
import { PlusIcon } from "./icons";

/** Zero-JS accordion built on <details>. */
export function AccordionItem({
  title,
  children,
  defaultOpen,
}: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details className="group border-b border-line" open={defaultOpen}>
      <summary className="flex cursor-pointer list-none items-center justify-between py-5 [&::-webkit-details-marker]:hidden">
        <span className="label-caps text-[11px]">{title}</span>
        <PlusIcon className="size-4 text-accent transition-transform duration-300 group-open:rotate-45" />
      </summary>
      <div className="pb-6 text-[14px] leading-relaxed text-muted">{children}</div>
    </details>
  );
}
