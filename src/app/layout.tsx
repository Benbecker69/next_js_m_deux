import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Fraunces, Public_Sans } from "next/font/google";
import { ThemeProvider } from "@/lib/theme/theme-provider";
import { themeInitScript } from "@/lib/theme/theme-script";
import { ToastProvider } from "@/lib/feedback/toast-provider";
import { FlashToast } from "@/lib/feedback/flash-toast";
import { SITE_URL } from "@/lib/site-config";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

const publicSans = Public_Sans({
  variable: "--font-public-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Repère — réservez votre espace de coworking",
    template: "%s · Repère",
  },
  description:
    "Repère, la plateforme pour trouver et réserver un espace de coworking près de chez vous.",
};

// Matches --paper in globals.css so the mobile browser chrome (address bar)
// follows the system color scheme instead of defaulting to white. Tracks
// prefers-color-scheme only — the in-app light/dark toggle overrides the
// page itself via data-theme, but can't repaint browser chrome without a
// live script, which isn't worth it for this cosmetic detail.
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ededea" },
    { media: "(prefers-color-scheme: dark)", color: "#14171a" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={`${fraunces.variable} ${publicSans.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="min-h-full font-sans antialiased">
        {/* Sets data-theme before hydration to avoid a flash of the wrong theme. */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        {/*
          Bypass-blocks link (WCAG 2.4.1): every layout in the app renders a
          nav with several links before the actual page content — the app
          and admin sidebars in particular. Hidden until focused, so a mouse
          user never sees it; a keyboard user tabbing in lands on it first.
        */}
        <a
          href="#contenu"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-sm focus:border focus:border-line focus:bg-surface focus:px-4 focus:py-2 focus:text-sm focus:text-ink"
        >
          Aller au contenu
        </a>
        <ThemeProvider>
          <ToastProvider>
            {/* useSearchParams needs a Suspense boundary, per Next.js. */}
            <Suspense fallback={null}>
              <FlashToast />
            </Suspense>
            {children}
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
