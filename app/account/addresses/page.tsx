import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AccountNav } from "@/components/account/account-nav";
import { AddressEditor } from "@/components/account/forms";
import { loadCustomer } from "@/lib/customer/load";
import { deleteAddressAction, setDefaultAddressAction } from "../actions";

export default function AddressesPage() {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse bg-surface/60" />}>
      <Addresses />
    </Suspense>
  );
}

async function Addresses() {
  const customer = await loadCustomer();
  if (!customer) redirect("/account");
  const defaultId = customer.defaultAddress?.id;

  return (
    <>
      <AccountNav name={customer.firstName} />
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="label-caps">Saved addresses</h2>
      </div>
      <ul className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {customer.addresses.nodes.map((a) => (
          <li key={a.id} className="flex flex-col border border-line bg-bg p-6">
            {a.id === defaultId && <p className="eyebrow mb-3 text-accent-ink">Default</p>}
            <address className="flex-1 text-[13px] leading-relaxed text-muted not-italic">
              {a.formatted.map((l) => (
                <span key={l} className="block">
                  {l}
                </span>
              ))}
            </address>
            <div className="mt-5 flex flex-wrap items-center gap-4">
              <AddressEditor address={a} />
              {a.id !== defaultId && (
                <form action={setDefaultAddressAction}>
                  <input type="hidden" name="addressId" value={a.id} />
                  <button className="text-[12px] text-muted underline underline-offset-4 hover:text-fg">Make default</button>
                </form>
              )}
              <form action={deleteAddressAction}>
                <input type="hidden" name="addressId" value={a.id} />
                <button className="text-[12px] text-muted underline underline-offset-4 hover:text-fg">Remove</button>
              </form>
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-8">
        <AddressEditor />
      </div>
    </>
  );
}
