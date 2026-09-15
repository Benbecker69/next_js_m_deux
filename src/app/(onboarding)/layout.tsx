import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { Logo } from "@/components/logo";
import { requireUser } from "@/lib/auth/session";

export default async function OnboardingLayout({ children }: { children: ReactNode }) {
  const user = await requireUser();
  if (user.onboardingCompletedAt) redirect("/tableau-de-bord");

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
