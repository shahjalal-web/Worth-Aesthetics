"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { toStateCode } from "@/lib/us-states";
import { ADDRESS_CREATE, ADDRESS_DELETE, ADDRESS_UPDATE, CUSTOMER_UPDATE, customerFetch } from "@/lib/customer/api";

export type FormState = { status: "idle" | "success" | "error"; message?: string };

type Payload = { userErrors: { message: string }[] };
const firstError = (p: Payload | undefined) => p?.userErrors?.[0]?.message;

export async function updateProfileAction(_: FormState, form: FormData): Promise<FormState> {
  const parsed = z
    .object({ firstName: z.string().trim().max(60), lastName: z.string().trim().max(60) })
    .safeParse({ firstName: form.get("firstName"), lastName: form.get("lastName") });
  if (!parsed.success) return { status: "error", message: "Please check your details." };
  try {
    const data = await customerFetch<{ customerUpdate: Payload }>(CUSTOMER_UPDATE, { input: parsed.data });
    const err = firstError(data.customerUpdate);
    if (err) return { status: "error", message: err };
    revalidatePath("/account", "layout");
    return { status: "success", message: "Your details have been saved." };
  } catch {
    return { status: "error", message: "We couldn't save your details. Please try again." };
  }
}

const addressSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(60),
  lastName: z.string().trim().min(1, "Last name is required").max(60),
  company: z.string().trim().max(100).optional(),
  address1: z.string().trim().min(3, "Address is required").max(120),
  address2: z.string().trim().max(120).optional(),
  city: z.string().trim().min(2, "City is required").max(80),
  zoneCode: z
    .string({ error: "Please choose a state" })
    .transform((v, ctx) => toStateCode(v) ?? (ctx.addIssue({ code: "custom", message: "Please choose a valid US state" }), z.NEVER)),
  zip: z.string().trim().regex(/^\d{5}(-\d{4})?$/, "Please enter a 5-digit US ZIP code, e.g. 10001"),
  territoryCode: z.literal("US", { error: "We currently ship within the United States only" }).default("US"),
  phoneNumber: z
    .string()
    .trim()
    .regex(/^\+?[\d\s().-]{7,20}$/, "Please enter a valid phone number, e.g. +1 212 555 0100")
    // Shopify expects E.164 — assume US (+1) for 10-digit numbers.
    .transform((v) => {
      const digits = v.replace(/\D/g, "");
      if (v.startsWith("+")) return `+${digits}`;
      if (digits.length === 10) return `+1${digits}`;
      return `+${digits}`;
    })
    .optional(),
});

export async function saveAddressAction(_: FormState, form: FormData): Promise<FormState> {
  const raw = Object.fromEntries(
    ["firstName", "lastName", "company", "address1", "address2", "city", "zoneCode", "zip", "territoryCode", "phoneNumber"].map(
      (k) => [k, (form.get(k) as string) || undefined],
    ),
  );
  const parsed = addressSchema.safeParse(raw);
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0]?.message ?? "Please check the address." };

  const addressId = form.get("addressId") as string | null;
  const defaultAddress = form.get("default") === "on";
  try {
    const data = addressId
      ? await customerFetch<{ customerAddressUpdate: Payload }>(ADDRESS_UPDATE, { addressId, address: parsed.data, defaultAddress })
      : await customerFetch<{ customerAddressCreate: Payload }>(ADDRESS_CREATE, { address: parsed.data, defaultAddress });
    const err = firstError("customerAddressUpdate" in data ? data.customerAddressUpdate : data.customerAddressCreate);
    if (err) {
      // Shopify validates ZIP against the chosen state — explain that in plain words.
      const friendly = /zip/i.test(err) ? "This ZIP code doesn't match the selected state. Please check both." : err;
      return { status: "error", message: friendly };
    }
    revalidatePath("/account/addresses");
    return { status: "success", message: "Address saved." };
  } catch {
    return { status: "error", message: "We couldn't save this address. Please try again." };
  }
}

export async function deleteAddressAction(form: FormData) {
  const addressId = z.string().min(1).safeParse(form.get("addressId"));
  if (!addressId.success) return;
  await customerFetch(ADDRESS_DELETE, { addressId: addressId.data });
  revalidatePath("/account/addresses");
}

export async function setDefaultAddressAction(form: FormData) {
  const addressId = z.string().min(1).safeParse(form.get("addressId"));
  if (!addressId.success) return;
  await customerFetch(ADDRESS_UPDATE, { addressId: addressId.data, defaultAddress: true });
  revalidatePath("/account/addresses");
}
