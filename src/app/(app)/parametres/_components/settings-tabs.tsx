"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, SlidersHorizontal, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils/cn";

// Icons are chosen here, not passed down from the Server Component parent:
// Lucide components aren't plain serializable data, so they can't cross the
// server→client boundary as props (only href/label, which need translation,
// come from the server).
const ICONS = {
  "/parametres/profil": User,
  "/parametres/preferences": SlidersHorizontal,
  "/parametres/securite": ShieldCheck,
} as const;

export function SettingsTabs({ tabs }: { tabs: { href: string; label: string }[] }) {
  const pathname = usePathname();

  return (
    <nav className="inline-flex flex-wrap items-center gap-1 rounded-sm border border-line bg-paper p-1">
      {tabs.map(({ href, label }) => {
        const active = pathname === href;
        const Icon = ICONS[href as keyof typeof ICONS];
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-2 rounded-sm px-3 py-1.5 text-sm transition-colors",
              active ? "bg-surface text-pine shadow-sm" : "text-ink-muted hover:text-ink",
            )}
          >
            {Icon && <Icon className="h-4 w-4" strokeWidth={1.75} />}
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
