import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter, Montserrat } from "next/font/google";
import { cookies } from "next/headers";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { CartProvider } from "@/components/cart/cart-context";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { ThemeScript } from "@/components/theme/theme-script";
import { getAnnouncements, getCart, getProducts } from "@/lib/shopify";
import { CART_COOKIE } from "@/lib/shopify/constants";
import { siteConfig } from "@/lib/site-config";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-inter",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-montserrat",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["italic"],
  variable: "--font-cormorant",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: `${siteConfig.name} — Peptide Skincare`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  openGraph: { siteName: siteConfig.name, type: "website", locale: "en_US" },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#141312" },
  ],
};

async function readCart() {
  const cartId = (await cookies()).get(CART_COOKIE)?.value;
  return getCart(cartId);
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // Not awaited: cart streams in behind Suspense boundaries.
  const cartPromise = readCart();
  const upsellPromise = getProducts({ sortKey: "BEST_SELLING", first: 6 });
  const announcements = await getAnnouncements();

  return (
    <html
      lang="en"
      data-theme="light"
      suppressHydrationWarning
      className={`${inter.variable} ${montserrat.variable} ${cormorant.variable}`}
    >
      <head>
        <ThemeScript />
      </head>
      <body className="flex min-h-dvh flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:bg-bg focus:px-4 focus:py-2 focus:text-sm"
        >
          Skip to content
        </a>
        <CartProvider cartPromise={cartPromise}>
          <AnnouncementBar
            messages={announcements.length ? announcements : [...siteConfig.announcements]}
          />
          <Header />
          <main id="main" className="flex-1">
            {children}
          </main>
          <Footer />
          <CartDrawer upsellPromise={upsellPromise} />
        </CartProvider>
      </body>
    </html>
  );
}
