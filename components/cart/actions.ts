"use server";

import { cookies } from "next/headers";
import { z } from "zod";
import { getSession } from "@/lib/customer/auth";
import {
  addToCart,
  linkCartToCustomer,
  createCart,
  getCart,
  removeFromCart,
  updateCartLines,
  updateCartNote,
} from "@/lib/shopify";
import { CART_COOKIE } from "@/lib/shopify/constants";
import type { Cart } from "@/lib/shopify/types";

export type CartResult = { cart?: Cart; error?: string };

const gid = z.string().startsWith("gid://shopify/");

async function setCartCookie(id: string) {
  (await cookies()).set(CART_COOKIE, id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 60, // 60 days — cart survives sessions
  });
}

async function currentCartId() {
  return (await cookies()).get(CART_COOKIE)?.value;
}

export async function addItemAction(merchandiseId: string, quantity = 1): Promise<CartResult> {
  return addLinesAction([{ merchandiseId, quantity }]);
}

export async function addLinesAction(input: { merchandiseId: string; quantity: number }[]): Promise<CartResult> {
  const parsed = z
    .array(z.object({ merchandiseId: gid, quantity: z.number().int().min(1).max(20) }))
    .min(1)
    .max(10)
    .safeParse(input);
  if (!parsed.success) return { error: "Invalid product selection." };

  try {
    const cartId = await currentCartId();
    const existing = cartId ? await getCart(cartId) : undefined;
    const lines = parsed.data;
    const cart = existing?.id ? await addToCart(existing.id, lines) : await createCart(lines);
    if (cart.id && cart.id !== cartId) {
      await setCartCookie(cart.id);
      // New cart for a signed-in customer → attach identity so the order lands in their account.
      const session = await getSession();
      if (session) await linkCartToCustomer(cart.id, session.accessToken).catch(() => undefined);
    }
    return { cart };
  } catch (e) {
    console.error("addItemAction", e);
    return { error: "We couldn't add this to your bag. Please try again." };
  }
}

export async function updateQuantityAction(lineId: string, quantity: number): Promise<CartResult> {
  const parsed = z.object({ lineId: gid, quantity: z.number().int().min(0).max(99) }).safeParse({
    lineId,
    quantity,
  });
  if (!parsed.success) return { error: "Invalid quantity." };

  const cartId = await currentCartId();
  if (!cartId) return { error: "Your bag has expired. Please refresh." };
  try {
    const cart =
      quantity === 0
        ? await removeFromCart(cartId, [lineId])
        : await updateCartLines(cartId, [{ id: lineId, quantity }]);
    return { cart };
  } catch (e) {
    console.error("updateQuantityAction", e);
    return { error: "We couldn't update your bag. Please try again." };
  }
}

export async function updateNoteAction(note: string): Promise<CartResult> {
  const parsed = z.string().max(500).safeParse(note);
  if (!parsed.success) return { error: "Note is too long (500 characters max)." };
  const cartId = await currentCartId();
  if (!cartId) return {};
  try {
    return { cart: await updateCartNote(cartId, parsed.data) };
  } catch (e) {
    console.error("updateNoteAction", e);
    return { error: "We couldn't save your note." };
  }
}
