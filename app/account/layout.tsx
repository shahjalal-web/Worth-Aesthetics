import type { Metadata } from "next";
import type { ReactNode } from "react";
import { MolecularLattice } from "@/components/brand/molecular";

export const metadata: Metadata = {
  title: "Account",
  robots: { index: false, follow: false },
};

export default function AccountLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-[70vh] overflow-hidden bg-bg-soft">
      <MolecularLattice className="pointer-events-none absolute -top-10 -right-16 w-96 opacity-30" />
      <div className="container-wa relative py-14 md:py-20">{children}</div>
    </div>
  );
}
