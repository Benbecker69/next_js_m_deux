import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/logo";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center px-6 py-16">
      <Link href="/">
        <Logo />
      </Link>
      <main id="contenu" className="mt-10 w-full max-w-sm border-t border-line pt-10">
        {children}
      </main>
    </div>
  );
}
