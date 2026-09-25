import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getPolicies } from "@/lib/shopify";

/** Policy text is managed in Shopify admin → Settings → Policies. */
export async function generateStaticParams() {
  const policies = await getPolicies();
  const handles = policies.map((p) => p.handle);
  return (handles.length ? handles : ["privacy-policy"]).map((handle) => ({ handle }));
}

export async function generateMetadata({ params }: PageProps<"/policies/[handle]">): Promise<Metadata> {
  const { handle } = await params;
  const policy = (await getPolicies()).find((p) => p.handle === handle);
  return {
    title: policy?.title ?? "Policy",
    alternates: { canonical: `/policies/${handle}` },
  };
}

export default function PolicyPage(props: PageProps<"/policies/[handle]">) {
  return (
    <Suspense fallback={<div className="min-h-[60vh]" />}>
      <Policy params={props.params} />
    </Suspense>
  );
}

async function Policy({ params }: Pick<PageProps<"/policies/[handle]">, "params">) {
  const { handle } = await params;
  const policy = (await getPolicies()).find((p) => p.handle === handle);
  if (!policy) notFound();
  return (
    <article className="container-wa max-w-3xl py-16 md:py-24">
      <p className="eyebrow text-center text-accent-ink">Policies</p>
      <h1 className="mt-5 text-center text-[30px] font-light tracking-[0.08em] uppercase md:text-[40px]">{policy.title}</h1>
      <div className="wa-prose mt-12 border-t border-line pt-12" dangerouslySetInnerHTML={{ __html: policy.body }} />
    </article>
  );
}
