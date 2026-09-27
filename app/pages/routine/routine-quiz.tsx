"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ProductCard } from "@/components/product/product-card";
import { Button, buttonClasses } from "@/components/ui/button";
import { ArrowRightIcon } from "@/components/ui/icons";
import { useCartActions } from "@/components/cart/cart-context";
import type { ProductCardData } from "@/lib/shopify/types";
import { cn, formatMoney } from "@/lib/utils";

type Question = { id: "concern" | "type" | "depth"; title: string; accent: string; options: { value: string; label: string; hint?: string }[] };

const QUESTIONS: Question[] = [
  {
    id: "concern",
    title: "What would you most like to",
    accent: "address?",
    options: [
      { value: "wrinkles", label: "Fine lines & wrinkles", hint: "Expression lines, crow's feet" },
      { value: "firmness", label: "Loss of firmness", hint: "Skin that feels less bouncy" },
      { value: "texture", label: "Uneven texture", hint: "Rough or bumpy surface" },
      { value: "dullness", label: "Dullness", hint: "Tired, lacklustre tone" },
      { value: "hydration", label: "Dehydration", hint: "Tight, thirsty skin" },
    ],
  },
  {
    id: "type",
    title: "How would you describe your",
    accent: "skin?",
    options: [
      { value: "dry", label: "Dry" },
      { value: "normal", label: "Normal" },
      { value: "combination", label: "Combination" },
      { value: "oily", label: "Oily" },
      { value: "sensitive", label: "Sensitive" },
    ],
  },
  {
    id: "depth",
    title: "How many steps do you",
    accent: "enjoy?",
    options: [
      { value: "essential", label: "Essential", hint: "One targeted treatment" },
      { value: "duo", label: "A considered duo", hint: "Serum + cream" },
      { value: "ritual", label: "The full ritual", hint: "Every step, morning & evening" },
    ],
  },
];

const norm = (s: string) => s.toLowerCase().replace(/[^a-z]/g, "");

const CONCERN_LABEL: Record<string, string> = {
  wrinkles: "fine lines",
  firmness: "firmness",
  texture: "texture",
  dullness: "radiance",
  hydration: "hydration",
};
const STEP_LABEL: Record<string, string> = { Cleanser: "Cleanse", Serum: "Treat", Cream: "Seal" };

type Pick = { product: ProductCardData; reason: string };

/**
 * Rule-based matching (no AI): every product's Shopify metafields
 * `worth.skin_concerns` + `worth.skin_types` are compared with the answers.
 * Concern match +3, exact skin-type match +1.5 ("All skin types" +1), in stock +0.5.
 */
function score(p: ProductCardData, answers: Record<string, string>) {
  let s = 0;
  const reasons: string[] = [];
  const concerns = p.meta.skinConcerns.map(norm);
  const types = p.meta.skinTypes.map(norm);
  if (answers.concern && concerns.some((c) => c.includes(answers.concern) || answers.concern.includes(c))) {
    s += 3;
    reasons.push(`Targets ${CONCERN_LABEL[answers.concern] ?? answers.concern}`);
  }
  if (answers.type && types.includes(answers.type)) {
    s += 1.5;
    reasons.push(`Suited to ${answers.type} skin`);
  } else if (types.some((t) => t.includes("all"))) {
    s += 1;
    reasons.push("Suits all skin types");
  }
  if (p.availableForSale) s += 0.5;
  return { s, reason: reasons.join(" · ") || "A gentle everyday essential" };
}

/** Builds the routine by ritual step: essential = serum; duo = serum + cream; full = cleanser + serum + cream + one extra. */
function buildRoutine(products: ProductCardData[], answers: Record<string, string>) {
  const ranked = products
    .filter((p) => p.variants.length && p.availableForSale)
    .map((p) => ({ product: p, ...score(p, answers) }))
    .sort((a, b) => b.s - a.s);
  const taken = new Set<string>();
  const best = (type: string) => {
    const hit = ranked.find((r) => r.product.productType === type && !taken.has(r.product.id));
    if (hit) taken.add(hit.product.id);
    return hit;
  };
  const plan = answers.depth === "essential" ? ["Serum"] : answers.depth === "duo" ? ["Serum", "Cream"] : ["Cleanser", "Serum", "Cream"];
  const picks = plan.map(best).filter(Boolean) as (typeof ranked)[number][];
  if (answers.depth === "ritual") {
    const extra = ranked.find((r) => ["Serum", "Cream"].includes(r.product.productType) && !taken.has(r.product.id) && r.s >= 3);
    if (extra) picks.push(extra);
  }
  // Nothing typed yet (e.g. new catalogue)? fall back to the best overall matches.
  const routine: Pick[] = (picks.length ? picks : ranked.filter((r) => r.product.productType !== "Accessory").slice(0, plan.length)).map(
    (r) => ({ product: r.product, reason: r.reason }),
  );
  const set = ranked.find((r) => r.product.productType === "Set" && r.s >= 3);
  return { routine, set: set ? { product: set.product, reason: set.reason } : null };
}

export function RoutineQuiz({ products }: { products: ProductCardData[] }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const { addItems } = useCartActions();

  const done = step >= QUESTIONS.length;
  const { routine, set } = useMemo(
    () => (done ? buildRoutine(products, answers) : { routine: [] as Pick[], set: null }),
    [done, answers, products],
  );
  const results = routine.map((r) => r.product);

  const total = results.reduce((sum, p) => sum + parseFloat(p.priceRange.minVariantPrice.amount), 0);

  if (done) {
    return (
      <div className="animate-fade-up">
        <div className="text-center">
          <p className="eyebrow text-accent-ink">Your ritual</p>
          <h2 className="mt-4 text-[28px] font-light tracking-[0.06em] uppercase md:text-[38px]">
            Curated <span className="serif-italic tracking-normal normal-case text-accent-ink">for you</span>
          </h2>
        </div>

        {results.length ? (
          <>
            <ol className="mt-12 grid grid-cols-2 gap-x-4 gap-y-12 md:gap-x-6 lg:grid-cols-4 lg:gap-x-8">
              {routine.map(({ product: p, reason }, i) => (
                <li key={p.id} className="flex flex-col">
                  <p className="text-center font-display text-[10px] tracking-[0.25em] text-accent-ink uppercase">
                    Step {i + 1}
                    {STEP_LABEL[p.productType] &&
                      ` · ${routine.slice(0, i).some((r) => r.product.productType === p.productType) ? "Boost" : STEP_LABEL[p.productType]}`}
                  </p>
                  <p className="mt-1 mb-3 text-center text-[11.5px] text-muted">{reason}</p>
                  <ProductCard product={p} className="flex-1" />
                </li>
              ))}
            </ol>
            {results.length > 1 && (
              <div className="mt-12 flex flex-col items-center gap-3">
                <Button
                  size="lg"
                  onClick={() =>
                    addItems(
                      results.flatMap((p) => {
                        const variant = p.variants.find((x) => x.availableForSale);
                        return variant ? [{ product: p, variant }] : [];
                      }),
                    )
                  }
                >
                  Add the ritual to bag · {formatMoney({ amount: total, currencyCode: results[0].priceRange.minVariantPrice.currencyCode })}
                </Button>
              </div>
            )}
            {set && (
              <div className="mx-auto mt-16 grid max-w-3xl items-center gap-6 border border-line bg-bg-soft p-6 sm:grid-cols-[160px_1fr] md:p-8">
                <Link href={`/products/${set.product.handle}`} className="relative block aspect-square overflow-hidden bg-surface">
                  {set.product.featuredImage && (
                    <Image src={set.product.featuredImage.url} alt={set.product.title} fill sizes="160px" className="object-cover" />
                  )}
                </Link>
                <div>
                  <p className="eyebrow text-accent-ink">Prefer a set?</p>
                  <p className="title-caps mt-2 text-[15px]">{set.product.title}</p>
                  <p className="mt-1 text-[12.5px] text-muted">{set.reason}</p>
                  <Link href={`/products/${set.product.handle}`} className={buttonClasses({ variant: "outline", size: "sm", className: "mt-4" })}>
                    View the set
                  </Link>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="mt-12 text-center">
            <p className="text-[15px] text-muted">Our collection is launching shortly — your recommendations will appear here.</p>
            <Link href="/" className={buttonClasses({ variant: "outline", className: "mt-8" })}>
              Join the Worth Letter
            </Link>
          </div>
        )}

        <div className="mt-12 text-center">
          <button
            type="button"
            onClick={() => {
              setAnswers({});
              setStep(0);
            }}
            className="text-[12px] tracking-wider text-muted underline underline-offset-4 hover:text-fg"
          >
            Retake the quiz
          </button>
        </div>
      </div>
    );
  }

  const q = QUESTIONS[step];
  return (
    <div className="mx-auto max-w-3xl">
      {/* Progress */}
      <div className="flex items-center gap-3" aria-hidden>
        {QUESTIONS.map((_, i) => (
          <span key={i} className={cn("h-px flex-1 transition-colors duration-500", i <= step ? "bg-accent" : "bg-line")} />
        ))}
      </div>
      <p className="mt-4 text-center font-display text-[10px] tracking-[0.25em] text-muted uppercase">
        Question {step + 1} of {QUESTIONS.length}
      </p>

      <fieldset key={q.id} className="animate-fade-up mt-10">
        <legend className="w-full text-center text-[26px] leading-tight font-light tracking-[0.05em] uppercase md:text-[34px]">
          {q.title} <span className="serif-italic tracking-normal normal-case text-accent-ink">{q.accent}</span>
        </legend>
        <div className="mt-10 grid gap-3 sm:grid-cols-2">
          {q.options.map((o) => {
            const selected = answers[q.id] === o.value;
            return (
              <button
                key={o.value}
                type="button"
                aria-pressed={selected}
                onClick={() => {
                  setAnswers((a) => ({ ...a, [q.id]: o.value }));
                  setStep((s) => s + 1);
                }}
                className={cn(
                  "group flex items-center justify-between border px-6 py-5 text-left transition-colors duration-300",
                  selected ? "border-fg bg-fg text-bg" : "border-line hover:border-fg",
                )}
              >
                <span>
                  <span className="block text-[15px]">{o.label}</span>
                  {o.hint && <span className={cn("mt-0.5 block text-[12px]", selected ? "text-bg/70" : "text-muted")}>{o.hint}</span>}
                </span>
                <ArrowRightIcon className="size-4 opacity-0 transition-opacity group-hover:opacity-100" />
              </button>
            );
          })}
        </div>
      </fieldset>

      {step > 0 && (
        <div className="mt-8 text-center">
          <button type="button" onClick={() => setStep((s) => s - 1)} className="text-[12px] tracking-wider text-muted underline underline-offset-4 hover:text-fg">
            Back
          </button>
        </div>
      )}
    </div>
  );
}
