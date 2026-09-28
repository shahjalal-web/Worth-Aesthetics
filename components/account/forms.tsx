"use client";

import { useActionState, useState } from "react";
import { saveAddressAction, updateProfileAction, type FormState } from "@/app/account/actions";
import { Button } from "@/components/ui/button";
import { ChevronDownIcon } from "@/components/ui/icons";
import { US_STATES } from "@/lib/us-states";
import { stateForZip } from "@/lib/us-zip";
import type { CustomerAddress } from "@/lib/customer/api";
import { cn } from "@/lib/utils";

const input =
  "mt-2 h-12 w-full border border-line bg-bg px-4 text-[14px] placeholder:text-muted focus:border-accent focus:outline-none";

function Field({ label, name, defaultValue, required, autoComplete, className, placeholder, inputMode, pattern, title, onChange }: {
  onChange?: (value: string) => void;
  inputMode?: "numeric" | "tel" | "email" | "text";
  pattern?: string;
  title?: string;
  label: string;
  name: string;
  defaultValue?: string | null;
  required?: boolean;
  autoComplete?: string;
  className?: string;
  placeholder?: string;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="label-caps text-[10px]">
        {label}
        {required && <span className="text-accent-ink"> *</span>}
      </span>
      <input name={name} defaultValue={defaultValue ?? ""} required={required} autoComplete={autoComplete} placeholder={placeholder} inputMode={inputMode} pattern={pattern} title={title} onChange={onChange ? (e) => onChange(e.target.value) : undefined} className={input} />
    </label>
  );
}

function Select({ label, name, defaultValue, value, onChange, options, required, autoComplete }: {
  value?: string;
  onChange?: (value: string) => void;
  label: string;
  name: string;
  defaultValue?: string | null;
  options: [value: string, label: string][];
  required?: boolean;
  autoComplete?: string;
}) {
  return (
    <label className="block">
      <span className="label-caps text-[10px]">
        {label}
        {required && <span className="text-accent-ink"> *</span>}
      </span>
      <span className="relative mt-2 block">
        <select
          name={name}
          {...(value !== undefined ? { value, onChange: (e) => onChange?.(e.target.value) } : { defaultValue: defaultValue ?? "" })}
          required={required}
          autoComplete={autoComplete}
          className={cn(input, "mt-0 appearance-none pr-10")}
        >
          {!(value ?? defaultValue) && <option value="" disabled>Select…</option>}
          {options.map(([value, text]) => (
            <option key={value} value={value}>
              {text}
            </option>
          ))}
        </select>
        <ChevronDownIcon className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-muted" />
      </span>
    </label>
  );
}

function Message({ state }: { state: FormState }) {
  if (!state.message) return null;
  return (
    <p role={state.status === "error" ? "alert" : "status"} className={cn("text-[13px]", state.status === "error" ? "text-accent-ink" : "text-muted")}>
      {state.message}
    </p>
  );
}

export function ProfileForm({ firstName, lastName, email }: { firstName: string | null; lastName: string | null; email?: string }) {
  const [state, action, pending] = useActionState(updateProfileAction, { status: "idle" } as FormState);
  return (
    <form action={action} className="grid max-w-xl gap-6 sm:grid-cols-2">
      <Field label="First name" name="firstName" defaultValue={firstName} autoComplete="given-name" />
      <Field label="Last name" name="lastName" defaultValue={lastName} autoComplete="family-name" />
      <label className="block sm:col-span-2">
        <span className="label-caps text-[10px]">Email</span>
        <input value={email ?? ""} readOnly disabled className={cn(input, "opacity-60")} />
        <span className="mt-1 block text-[12px] text-muted">Your email is your sign-in and can&apos;t be changed here.</span>
      </label>
      <div className="flex items-center gap-5 sm:col-span-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save changes"}
        </Button>
        <Message state={state} />
      </div>
    </form>
  );
}

export function AddressForm({ address, onDone }: { address?: CustomerAddress; onDone?: () => void }) {
  const [state, action, pending] = useActionState(async (prev: FormState, form: FormData) => {
    const result = await saveAddressAction(prev, form);
    if (result.status === "success") onDone?.();
    return result;
  }, { status: "idle" } as FormState);
  // Pre-select the state from the ZIP so the two always agree.
  const [zone, setZone] = useState(address?.zoneCode ?? "");

  return (
    <form action={action} className="grid gap-5 sm:grid-cols-2">
      {address && <input type="hidden" name="addressId" value={address.id} />}
      <Field label="First name" name="firstName" defaultValue={address?.firstName} required autoComplete="given-name" />
      <Field label="Last name" name="lastName" defaultValue={address?.lastName} required autoComplete="family-name" />
      <Field label="Company" name="company" defaultValue={address?.company} autoComplete="organization" className="sm:col-span-2" />
      <Field label="Address" name="address1" defaultValue={address?.address1} required autoComplete="address-line1" className="sm:col-span-2" />
      <Field label="Apartment, suite" name="address2" defaultValue={address?.address2} autoComplete="address-line2" className="sm:col-span-2" />
      <Field label="City" name="city" defaultValue={address?.city} required autoComplete="address-level2" />
      <Select label="State" name="zoneCode" value={zone} onChange={setZone} options={US_STATES} required autoComplete="address-level1" />
      <Field label="ZIP code" name="zip" defaultValue={address?.zip} required autoComplete="postal-code" placeholder="10001" inputMode="numeric" pattern="\d{5}(-\d{4})?" title="5-digit US ZIP code, e.g. 10001" onChange={(v) => { const st = stateForZip(v); if (st && US_STATES.some(([c]) => c === st)) setZone(st); }} />
      <Select label="Country" name="territoryCode" defaultValue="US" options={[["US", "United States"]]} required autoComplete="country" />
      <Field label="Phone" name="phoneNumber" defaultValue={address?.phoneNumber} autoComplete="tel" placeholder="+1 212 555 0100" className="sm:col-span-2" />
      <label className="flex items-center gap-3 text-[13px] sm:col-span-2">
        <input type="checkbox" name="default" className="size-4 accent-[var(--accent)]" /> Set as default address
      </label>
      <div className="flex items-center gap-5 sm:col-span-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save address"}
        </Button>
        {onDone && (
          <button type="button" onClick={onDone} className="text-[12px] text-muted underline underline-offset-4">
            Cancel
          </button>
        )}
        <Message state={state} />
      </div>
    </form>
  );
}

export function AddressEditor({ address }: { address?: CustomerAddress }) {
  const [open, setOpen] = useState(false);
  if (!open) {
    return address ? (
      <button type="button" onClick={() => setOpen(true)} className="text-[12px] underline decoration-accent underline-offset-4">
        Edit
      </button>
    ) : (
      <Button variant="outline" onClick={() => setOpen(true)}>
        Add a new address
      </Button>
    );
  }
  return (
    <div className="mt-6 w-full border border-line bg-bg p-6 md:p-8">
      <AddressForm address={address} onDone={() => setOpen(false)} />
    </div>
  );
}
