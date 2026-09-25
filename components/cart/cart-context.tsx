"use client";

import {
  createContext,
  use,
  useCallback,
  useContext,
  useMemo,
  useOptimistic,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import type { Cart, CartLine, Money, ProductCardData, ProductVariant } from "@/lib/shopify/types";
import { addItemAction, addLinesAction, updateNoteAction, updateQuantityAction, type CartResult } from "./actions";

type Op =
  | { type: "add"; product: ProductCardData; variant: ProductVariant; quantity: number }
  | { type: "update"; lineId: string; quantity: number };

type CartContextValue = {
  cartPromise: Promise<Cart | undefined>;
  serverCart: Cart | undefined | null; // null = not updated client-side yet
  pending: Op[];
  isPending: boolean;
  isOpen: boolean;
  error: string | null;
  open: () => void;
  close: () => void;
  addItem: (product: ProductCardData, variant: ProductVariant, quantity?: number) => void;
  addItems: (items: { product: ProductCardData; variant: ProductVariant; quantity?: number }[]) => void;
  updateQuantity: (lineId: string, quantity: number) => void;
  saveNote: (note: string) => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function emptyCart(currencyCode = "USD"): Cart {
  const zero = { amount: "0", currencyCode };
  return {
    id: undefined,
    checkoutUrl: "",
    note: null,
    totalQuantity: 0,
    cost: { subtotalAmount: zero, totalAmount: zero, totalTaxAmount: null },
    lines: [],
  };
}

const money = (amount: number, currencyCode: string): Money => ({
  amount: amount.toFixed(2),
  currencyCode,
});

/** Applies not-yet-confirmed operations so the UI responds instantly. */
function applyOps(base: Cart | undefined, ops: Op[]): Cart {
  if (!ops.length && base) return base;
  let cart: Cart = base ? { ...base, lines: [...base.lines] } : emptyCart();

  for (const op of ops) {
    if (op.type === "add") {
      const { variant, product, quantity } = op;
      const unit = parseFloat(variant.price.amount);
      const existing = cart.lines.find((l) => l.merchandise.id === variant.id);
      if (existing) {
        const q = existing.quantity + quantity;
        cart.lines = cart.lines.map((l) =>
          l === existing
            ? { ...l, quantity: q, cost: { ...l.cost, totalAmount: money(unit * q, variant.price.currencyCode) } }
            : l,
        );
      } else {
        const line: CartLine = {
          id: `optimistic:${variant.id}`,
          quantity,
          cost: { totalAmount: money(unit * quantity, variant.price.currencyCode), compareAtAmountPerQuantity: variant.compareAtPrice },
          merchandise: {
            id: variant.id,
            title: variant.title,
            selectedOptions: variant.selectedOptions,
            image: variant.image,
            product: {
              id: product.id,
              handle: product.handle,
              title: product.title,
              featuredImage: product.featuredImage,
            },
          },
        };
        cart.lines = [line, ...cart.lines];
      }
    } else {
      cart.lines = cart.lines
        .map((l) => {
          if (l.id !== op.lineId) return l;
          const unit = parseFloat(l.cost.totalAmount.amount) / Math.max(l.quantity, 1);
          return {
            ...l,
            quantity: op.quantity,
            cost: { ...l.cost, totalAmount: money(unit * op.quantity, l.cost.totalAmount.currencyCode) },
          };
        })
        .filter((l) => l.quantity > 0);
    }
  }

  const currency = cart.lines[0]?.cost.totalAmount.currencyCode ?? cart.cost.subtotalAmount.currencyCode;
  const subtotal = cart.lines.reduce((s, l) => s + parseFloat(l.cost.totalAmount.amount), 0);
  cart = {
    ...cart,
    totalQuantity: cart.lines.reduce((s, l) => s + l.quantity, 0),
    cost: { ...cart.cost, subtotalAmount: money(subtotal, currency), totalAmount: money(subtotal, currency) },
  };
  return cart;
}

export function CartProvider({
  cartPromise,
  children,
}: {
  cartPromise: Promise<Cart | undefined>;
  children: ReactNode;
}) {
  const [serverCart, setServerCart] = useState<Cart | undefined | null>(null);
  const [pending, addPending] = useOptimistic<Op[], Op>([], (state, op) => [...state, op]);
  const [isPending, startTransition] = useTransition();
  const [isOpen, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handle = useCallback((result: CartResult) => {
    if (result.error) setError(result.error);
    else setError(null);
    if (result.cart) setServerCart(result.cart);
  }, []);

  const addItem = useCallback(
    (product: ProductCardData, variant: ProductVariant, quantity = 1) => {
      setOpen(true);
      startTransition(async () => {
        addPending({ type: "add", product, variant, quantity });
        handle(await addItemAction(variant.id, quantity));
      });
    },
    [addPending, handle],
  );

  const addItems = useCallback(
    (items: { product: ProductCardData; variant: ProductVariant; quantity?: number }[]) => {
      if (!items.length) return;
      setOpen(true);
      startTransition(async () => {
        for (const i of items) addPending({ type: "add", product: i.product, variant: i.variant, quantity: i.quantity ?? 1 });
        handle(await addLinesAction(items.map((i) => ({ merchandiseId: i.variant.id, quantity: i.quantity ?? 1 }))));
      });
    },
    [addPending, handle],
  );

  const updateQuantity = useCallback(
    (lineId: string, quantity: number) => {
      if (lineId.startsWith("optimistic:")) return;
      startTransition(async () => {
        addPending({ type: "update", lineId, quantity });
        handle(await updateQuantityAction(lineId, quantity));
      });
    },
    [addPending, handle],
  );

  const saveNote = useCallback(
    (note: string) => {
      startTransition(async () => {
        handle(await updateNoteAction(note));
      });
    },
    [handle],
  );

  const value = useMemo<CartContextValue>(
    () => ({
      cartPromise,
      serverCart,
      pending,
      isPending,
      isOpen,
      error,
      open: () => setOpen(true),
      close: () => setOpen(false),
      addItem,
      addItems,
      updateQuantity,
      saveNote,
    }),
    [cartPromise, serverCart, pending, isPending, isOpen, error, addItem, addItems, updateQuantity, saveNote],
  );

  return <CartContext value={value}>{children}</CartContext>;
}

export function useCartActions() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCartActions must be used within CartProvider");
  return ctx;
}

/** Returns the current cart (suspends until the initial cart loads). */
export function useCart() {
  const ctx = useCartActions();
  const initial = use(ctx.cartPromise);
  const base = ctx.serverCart === null ? initial : ctx.serverCart;
  const cart = useMemo(() => applyOps(base, ctx.pending), [base, ctx.pending]);
  return { ...ctx, cart };
}
