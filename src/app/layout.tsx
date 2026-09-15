import type { Metadata } from "next";
import { Fraunces, Public_Sans } from "next/font/google";
import { ThemeProvider } from "@/lib/theme/theme-provider";
import { themeInitScript } from "@/lib/theme/theme-script";
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
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
