import Image from "next/image";
import Link from "next/link";
import type { OrderSummary } from "@/lib/customer/api";
import { buttonClasses } from "@/components/ui/button";
import { cn, formatMoney } from "@/lib/utils";

export function formatOrderDate(iso: string) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(iso));
}

const pretty = (s: string | null | undefined) =>
  s ? s.toLowerCase().replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase()) : "—";

export function orderIdParam(gid: string) {
  return gid.split("/").pop()!;
}

export function StatusPill({ status }: { status: string | null | undefined }) {
  const s = (status ?? "").toUpperCase();
  const tone =
    s === "SUCCESS" || s === "FULFILLED" || s === "PAID" || s === "DELIVERED"
      ? "border-accent text-accent-ink"
      : s === "CANCELLED" || s === "FAILURE" || s === "REFUNDED"
        ? "border-line text-muted"
        : "border-fg/40 text-fg";
  return (
    <span className={cn("inline-block border px-2 py-0.5 font-display text-[9.5px] font-medium tracking-[0.15em] uppercase", tone)}>
      {pretty(status === "SUCCESS" ? "fulfilled" : status || "Processing")}
    </span>
  );
}

export function OrderRow({ order }: { order: OrderSummary }) {
  const fulfillment = order.fulfillments.nodes[0]?.status;
  return (
    <li className="border-b border-line py-6 first:border-t">
      <Link href={`/account/orders/${orderIdParam(order.id)}`} className="group grid items-center gap-4 sm:grid-cols-[1fr_auto]">
        <div className="flex items-center gap-5">
          <div className="flex -space-x-3">
            {order.lineItems.nodes.slice(0, 3).map((li, i) => (
              <div key={i} className="relative size-14 overflow-hidden rounded-full border-2 border-bg bg-surface">
                {li.image && <Image src={li.image.url} alt={li.image.altText ?? li.title} fill sizes="56px" className="object-cover" />}
              </div>
            ))}
          </div>
          <div>
            <p className="title-caps text-[14px] group-hover:text-accent-ink">Order {order.name}</p>
            <p className="mt-1 text-[12px] text-muted">{formatOrderDate(order.processedAt)}</p>
          </div>
        </div>
        <div className="flex items-center gap-5 sm:justify-end">
          <StatusPill status={fulfillment ?? "UNFULFILLED"} />
          <span className="text-[14px] tabular-nums">{formatMoney(order.totalPrice)}</span>
          <span className="label-caps text-[10px] underline decoration-accent underline-offset-4">View</span>
        </div>
      </Link>
    </li>
  );
}

export function SignInCard({ error, configured }: { error?: string; configured: boolean }) {
  const messages: Record<string, string> = {
    denied: "Sign-in was cancelled.",
    state: "Your sign-in session expired. Please try again.",
    nonce: "We couldn't verify your sign-in. Please try again.",
    token: "Something went wrong while signing you in. Please try again.",
  };
  return (
    <div className="mx-auto max-w-lg border border-line bg-bg p-8 text-center md:p-12">
      <p className="eyebrow text-accent-ink">Your account</p>
      <h1 className="mt-4 text-[28px] font-light tracking-[0.08em] uppercase">
        Welcome <span className="serif-italic tracking-normal normal-case text-accent-ink">back</span>
      </h1>
      {configured ? (
        <>
          <p className="mt-4 text-[14px] leading-relaxed text-muted">
            Sign in with your email — we&apos;ll send a one-time code. No password needed.
          </p>
          {error && messages[error] && (
            <p role="alert" className="mt-5 text-[13px] text-accent-ink">
              {messages[error]}
            </p>
          )}
          <a href="/account/login" className={buttonClasses({ size: "lg", className: "mt-8 w-full" })}>
            Sign in / Create account
          </a>
          <ul className="mt-8 space-y-2 text-left text-[13px] text-muted">
            {["Track orders and view your history", "Faster checkout with saved addresses", "Your bag follows you across devices"].map((b) => (
              <li key={b} className="flex gap-3">
                <span className="mt-2.5 h-px w-4 shrink-0 bg-accent" aria-hidden />
                {b}
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className="mt-4 text-[14px] leading-relaxed text-muted">
          Customer accounts are launching shortly. Your order confirmation email includes a link to track your order at any
          time.
        </p>
      )}
    </div>
  );
}
