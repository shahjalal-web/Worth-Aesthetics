import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AccountNav } from "@/components/account/account-nav";
import { OrderRow } from "@/components/account/account-ui";
import { customerFetch, NotAuthenticatedError, ORDERS_QUERY, type OrderSummary } from "@/lib/customer/api";
import { getSession } from "@/lib/customer/auth";

export default function OrdersPage() {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse bg-surface/60" />}>
      <Orders />
    </Suspense>
  );
}

async function Orders() {
  if (!(await getSession())) redirect("/account");
  let orders: OrderSummary[];
  try {
    const data = await customerFetch<{ customer: { orders: { nodes: OrderSummary[] } } }>(ORDERS_QUERY);
    orders = data.customer.orders.nodes;
  } catch (e) {
    if (e instanceof NotAuthenticatedError) redirect("/account");
    throw e;
  }
  return (
    <>
      <AccountNav />
      <h2 className="label-caps">Order history</h2>
      {orders.length ? (
        <ul className="mt-6">
          {orders.map((o) => (
            <OrderRow key={o.id} order={o} />
          ))}
        </ul>
      ) : (
        <p className="mt-6 text-[14px] text-muted">You haven&apos;t placed any orders yet.</p>
      )}
    </>
  );
}
