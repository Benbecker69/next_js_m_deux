"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";

const TABS = [
  { href: "/parametres/profil", label: "Profil" },
  { href: "/parametres/preferences", label: "Préférences" },
  { href: "/parametres/securite", label: "Sécurité" },
];

export function SettingsTabs() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-2 border-b border-line">
      {TABS.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "-mb-px border-b-2 px-1 pb-3 text-sm transition-colors",
              active
                ? "border-pine text-pine"
                : "border-transparent text-ink-muted hover:text-ink",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
