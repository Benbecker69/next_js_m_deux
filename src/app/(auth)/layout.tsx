import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/logo";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { getLocale } from "@/lib/i18n/locale";

export default async function AuthLayout({ children }: { children: ReactNode }) {
  const locale = await getLocale();

  return (
    <div className="flex min-h-screen flex-col items-center px-6 py-16">
      <div className="flex w-full max-w-sm items-center justify-between">
        <Link href="/">
          <Logo />
        </Link>
        <LocaleSwitcher locale={locale} />
      </div>
      <main id="contenu" className="mt-10 w-full max-w-sm border-t border-line pt-10">
        {children}
      </main>
    </div>
  );
}
