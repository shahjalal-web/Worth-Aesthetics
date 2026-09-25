import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AccountNav } from "@/components/account/account-nav";
import { ProfileForm } from "@/components/account/forms";
import { loadCustomer } from "@/lib/customer/load";

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse bg-surface/60" />}>
      <Profile />
    </Suspense>
  );
}

async function Profile() {
  const customer = await loadCustomer();
  if (!customer) redirect("/account");
  return (
    <>
      <AccountNav name={customer.firstName} />
      <h2 className="label-caps mb-8">Your details</h2>
      <ProfileForm firstName={customer.firstName} lastName={customer.lastName} email={customer.emailAddress?.emailAddress} />
    </>
  );
}
