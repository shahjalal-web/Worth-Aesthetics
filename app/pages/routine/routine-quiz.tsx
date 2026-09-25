"use client";

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

function score(p: ProductCardData, answers: Record<string, string>) {
  let s = 0;
  const concerns = p.meta.skinConcerns.map(norm);
  const types = p.meta.skinTypes.map(norm);
  if (answers.concern && concerns.some((c) => c.includes(answers.concern) || answers.concern.includes(c))) s += 3;
  if (answers.type && (types.includes(answers.type) || types.some((t) => t.includes("all")))) s += 1;
  if (p.availableForSale) s += 0.5;
  return s;
}

export function RoutineQuiz({ products }: { products: ProductCardData[] }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const { addItems } = useCartActions();

  const done = step >= QUESTIONS.length;
  const results = useMemo(() => {
    if (!done) return [];
    const count = answers.depth === "essential" ? 1 : answers.depth === "duo" ? 2 : 4;
    return products
      .filter((p) => p.variants.length)
      .map((p) => ({ p, s: score(p, answers) }))
      .sort((a, b) => b.s - a.s)
      .slice(0, count)
      .map(({ p }) => p)
      .sort((a, b) => (a.meta.routineStep ?? "9").localeCompare(b.meta.routineStep ?? "9"));
  }, [done, answers, products]);

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
              {results.map((p, i) => (
                <li key={p.id}>
                  <p className="mb-3 text-center font-display text-[10px] tracking-[0.25em] text-accent-ink uppercase">Step {i + 1}</p>
                  <ProductCard product={p} />
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
