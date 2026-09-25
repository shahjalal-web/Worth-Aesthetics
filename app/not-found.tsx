import { MolecularDivider } from "@/components/brand/molecular";
import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  return (
    <section className="container-wa flex min-h-[65vh] flex-col items-center justify-center py-24 text-center">
      <p className="eyebrow text-accent-ink">Error 404</p>
      <h1 className="mt-6 text-[34px] font-light tracking-[0.08em] uppercase md:text-5xl">
        Page <span className="serif-italic tracking-normal normal-case text-accent-ink">not found</span>
      </h1>
      <MolecularDivider className="my-8 w-64" />
      <p className="max-w-md text-[15px] leading-relaxed text-muted">
        The page you are looking for may have moved, or no longer exists. Let us guide you back.
      </p>
      <div className="mt-10 flex flex-wrap justify-center gap-4">
        <ButtonLink href="/collections/shop-all">Shop the collection</ButtonLink>
        <ButtonLink href="/" variant="outline">
          Return home
        </ButtonLink>
      </div>
    </section>
  );
}
