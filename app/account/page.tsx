import Link from "next/link";
import { Suspense } from "react";
import { AccountNav } from "@/components/account/account-nav";
import { OrderRow, SignInCard } from "@/components/account/account-ui";
import { buttonClasses } from "@/components/ui/button";
import { isCustomerAccountConfigured } from "@/lib/customer/auth";
import { loadCustomer } from "@/lib/customer/load";

export default function AccountPage(props: PageProps<"/account">) {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse bg-surface/60" />}>
      <AccountContent searchParams={props.searchParams} />
    </Suspense>
  );
}

async function AccountContent({ searchParams }: Pick<PageProps<"/account">, "searchParams">) {
  const { error } = await searchParams;
  const customer = await loadCustomer();
  if (!customer) return <SignInCard configured={isCustomerAccountConfigured()} error={typeof error === "string" ? error : undefined} />;

  const orders = customer.orders.nodes;
  const address = customer.defaultAddress;

  return (
    <>
      <AccountNav name={customer.firstName} />
      <div className="grid gap-12 lg:grid-cols-12">
        <section className="lg:col-span-8" aria-labelledby="recent-orders">
          <div className="flex items-end justify-between">
            <h2 id="recent-orders" className="label-caps">
              Recent orders
            </h2>
            {orders.length > 0 && (
              <Link href="/account/orders" className="text-[12px] text-muted underline underline-offset-4 hover:text-fg">
                View all
              </Link>
            )}
          </div>
          {orders.length ? (
            <ul className="mt-6">
              {orders.map((o) => (
                <OrderRow key={o.id} order={o} />
              ))}
            </ul>
          ) : (
            <div className="mt-6 border border-line bg-bg p-10 text-center">
              <p className="serif-italic text-2xl">No orders yet</p>
              <p className="mt-2 text-[14px] text-muted">When you place an order, it will appear here.</p>
              <Link href="/collections/shop-all" className={buttonClasses({ className: "mt-6" })}>
                Start shopping
              </Link>
            </div>
          )}
        </section>

        <aside className="space-y-6 lg:col-span-4">
          <div className="border border-line bg-bg p-6">
            <h2 className="label-caps">Profile</h2>
            <p className="mt-4 text-[14px]">
              {[customer.firstName, customer.lastName].filter(Boolean).join(" ") || "—"}
            </p>
            <p className="mt-1 text-[13px] text-muted">{customer.emailAddress?.emailAddress}</p>
            <Link href="/account/profile" className="mt-4 inline-block text-[12px] underline decoration-accent underline-offset-4">
              Edit profile
            </Link>
          </div>
          <div className="border border-line bg-bg p-6">
            <h2 className="label-caps">Default address</h2>
            {address ? (
              <address className="mt-4 text-[13px] leading-relaxed text-muted not-italic">
                {address.formatted.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </address>
            ) : (
              <p className="mt-4 text-[13px] text-muted">No address saved yet.</p>
            )}
            <Link href="/account/addresses" className="mt-4 inline-block text-[12px] underline decoration-accent underline-offset-4">
              Manage addresses
            </Link>
          </div>
        </aside>
      </div>
    </>
  );
}
