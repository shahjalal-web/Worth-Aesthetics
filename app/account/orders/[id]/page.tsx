import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { AccountNav } from "@/components/account/account-nav";
import { formatOrderDate, StatusPill } from "@/components/account/account-ui";
import { buttonClasses } from "@/components/ui/button";
import { customerFetch, NotAuthenticatedError, ORDER_QUERY, type OrderDetail } from "@/lib/customer/api";
import { getSession } from "@/lib/customer/auth";
import { formatMoney } from "@/lib/utils";

export default function OrderPage(props: PageProps<"/account/orders/[id]">) {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse bg-surface/60" />}>
      <Order params={props.params} />
    </Suspense>
  );
}

async function Order({ params }: Pick<PageProps<"/account/orders/[id]">, "params">) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();
  if (!(await getSession())) redirect(`/account/login?returnTo=/account/orders/${id}`);

  let order: OrderDetail | null;
  try {
    order = (await customerFetch<{ order: OrderDetail | null }>(ORDER_QUERY, { id: `gid://shopify/Order/${id}` })).order;
  } catch (e) {
    if (e instanceof NotAuthenticatedError) redirect("/account");
    throw e;
  }
  if (!order) notFound();

  const tracking = order.fulfillments.nodes.flatMap((f) => f.trackingInformation);
  const status = order.cancelledAt ? "CANCELLED" : (order.fulfillments.nodes[0]?.status ?? "UNFULFILLED");
  const totals = [
    ["Subtotal", order.subtotal],
    ["Shipping", order.totalShipping],
    ["Tax", order.totalTax],
  ] as const;

  return (
    <>
      <AccountNav />
      <Link href="/account/orders" className="text-[12px] text-muted underline underline-offset-4 hover:text-fg">
        ← All orders
      </Link>
      <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-[26px] font-light tracking-[0.06em] uppercase">Order {order.name}</h2>
          <p className="mt-1 text-[13px] text-muted">Placed {formatOrderDate(order.processedAt)}</p>
        </div>
        <StatusPill status={status} />
      </div>

      <div className="mt-10 grid gap-12 lg:grid-cols-12">
        <section className="lg:col-span-8" aria-label="Items">
          <ul className="divide-y divide-line border-y border-line">
            {order.lineItems.nodes.map((li) => (
              <li key={li.id} className="flex gap-5 py-5">
                <div className="relative aspect-[4/5] w-20 shrink-0 overflow-hidden bg-surface">
                  {li.image && <Image src={li.image.url} alt={li.image.altText ?? li.title} fill sizes="80px" className="object-cover" />}
                </div>
                <div className="flex flex-1 items-start justify-between gap-4">
                  <div>
                    <p className="title-caps text-[13px]">{li.title}</p>
                    {li.variantTitle && <p className="mt-1 text-[12px] text-muted">{li.variantTitle}</p>}
                    <p className="mt-1 text-[12px] text-muted">Qty {li.quantity}</p>
                  </div>
                  {li.totalPrice && <p className="text-[14px] tabular-nums">{formatMoney(li.totalPrice)}</p>}
                </div>
              </li>
            ))}
          </ul>
          <dl className="mt-6 ml-auto max-w-xs space-y-2 text-[14px]">
            {totals.map(([label, m]) =>
              m ? (
                <div key={label} className="flex justify-between text-muted">
                  <dt>{label}</dt>
                  <dd className="tabular-nums">{formatMoney(m)}</dd>
                </div>
              ) : null,
            )}
            <div className="flex justify-between border-t border-line pt-3 text-base">
              <dt>Total</dt>
              <dd className="tabular-nums">{formatMoney(order.totalPrice)}</dd>
            </div>
          </dl>
        </section>

        <aside className="space-y-6 lg:col-span-4">
          {order.shippingAddress && (
            <div className="border border-line bg-bg p-6">
              <h3 className="label-caps">Shipping to</h3>
              <address className="mt-4 text-[13px] leading-relaxed text-muted not-italic">
                {order.shippingAddress.name && <span className="block text-fg">{order.shippingAddress.name}</span>}
                {order.shippingAddress.formatted.map((l) => (
                  <span key={l} className="block">
                    {l}
                  </span>
                ))}
              </address>
            </div>
          )}
          <div className="border border-line bg-bg p-6">
            <h3 className="label-caps">Delivery</h3>
            {tracking.length ? (
              <ul className="mt-4 space-y-2 text-[13px]">
                {tracking.map((t, i) => (
                  <li key={i}>
                    {t.company && <span className="text-muted">{t.company}: </span>}
                    {t.url ? (
                      <a href={t.url} target="_blank" rel="noopener noreferrer" className="underline decoration-accent underline-offset-4">
                        {t.number ?? "Track parcel"}
                      </a>
                    ) : (
                      t.number
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-[13px] text-muted">Tracking details will appear here once your order ships.</p>
            )}
            <a href={order.statusPageUrl} target="_blank" rel="noopener noreferrer" className={buttonClasses({ variant: "outline", size: "sm", className: "mt-6 w-full" })}>
              Order status page
            </a>
          </div>
        </aside>
      </div>
    </>
  );
}
