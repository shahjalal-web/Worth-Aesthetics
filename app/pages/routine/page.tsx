import type { Metadata } from "next";
import { PageHero } from "@/components/ui/page-hero";
import { getProducts } from "@/lib/shopify";
import { RoutineQuiz } from "./routine-quiz";

export const metadata: Metadata = {
  title: "Build Your Routine",
  description: "Answer three questions and we'll curate a peptide ritual for your skin.",
  alternates: { canonical: "/pages/routine" },
};

export default async function RoutinePage() {
  const products = await getProducts({ first: 50 });
  return (
    <>
      <PageHero
        eyebrow="Build your routine"
        title="Your ritual,"
        accent="considered"
        intro="Three questions. One curated routine, built around your skin."
        crumbs={[{ label: "Home", href: "/" }, { label: "Build Your Routine" }]}
      />
      <section className="container-wa py-16 md:py-24">
        <RoutineQuiz products={products} />
      </section>
    </>
  );
}
