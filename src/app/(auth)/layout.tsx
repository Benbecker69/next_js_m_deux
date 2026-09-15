import Link from "next/link";
import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center px-6 py-16">
      <Link href="/" className="font-display text-lg font-medium text-ink">
        Repère
      </Link>
      <main id="contenu" className="mt-10 w-full max-w-sm border-t border-line pt-10">
        {children}
      </main>
    </div>
  );
}
