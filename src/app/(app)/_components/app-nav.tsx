"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BadgeCheck,
  CalendarCheck,
  CalendarPlus,
  House,
  Shield,
  UserRound,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

// Icons are chosen here, not passed down from the Server Component parent:
// Lucide components aren't plain serializable data, so they can't cross the
// server→client boundary as props (only href/label, which need translation,
// come from the server). The sidebar and the phone's tab bar share this map,
// so a page has the same icon in both.
const ICONS = {
  "/tableau-de-bord": House,
  "/reserver": CalendarPlus,
  "/reservations": CalendarCheck,
  "/arrivees": BadgeCheck,
  "/parametres": UserRound,
  "/admin": Shield,
} as const;

export type NavItem = { href: string; label: string };

/** A page is "current" on its own URL and on everything under it. */
function isCurrent(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

// Client Components because highlighting the current page needs the
// pathname, which only the client router knows (`usePathname`) — everything
// else in the layout stays server-rendered.

/**
 * The sidebar's links (md and up), in groups separated by a hairline: what a
 * member does every day first, the account after, administration last and
 * only for admins. The "book" button above them is the layout's own.
 */
export function AppNav({ groups, label }: { groups: NavItem[][]; label: string }) {
  const pathname = usePathname();

  return (
    <nav aria-label={label} className="flex flex-col">
      {groups.map((items, index) => (
        <ul
          key={index}
          className={cn(
            "flex flex-col gap-1",
            index > 0 ? "mt-4 border-t border-line pt-4" : undefined,
          )}
        >
          {items.map(({ href, label: itemLabel }) => {
            const active = isCurrent(pathname, href);
            const Icon = ICONS[href as keyof typeof ICONS];
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm transition-colors",
                    active
                      ? "bg-pine/10 font-medium text-pine"
                      : "text-ink-muted hover:bg-surface hover:text-ink",
                  )}
                >
                  {Icon && <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />}
                  {itemLabel}
                </Link>
              </li>
            );
          })}
        </ul>
      ))}
    </nav>
  );
}

/**
 * Below md the sidebar has no room: the same pages become a tab bar fixed to
 * the bottom of the screen, where the thumb is — the same pattern as the
 * mobile app, instead of a menu hidden behind a burger. Administration,
 * language and sign-out are reached from the account page.
 */
export function AppTabBar({ items, label }: { items: NavItem[]; label: string }) {
  const pathname = usePathname();

  return (
    <nav
      aria-label={label}
      // `env(safe-area-inset-bottom)`: clear of the iPhone's home indicator.
      className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <ul className="mx-auto flex max-w-lg">
        {items.map(({ href, label: itemLabel }) => {
          const active = isCurrent(pathname, href);
          const Icon = ICONS[href as keyof typeof ICONS];
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-14 flex-col items-center justify-center gap-1 px-1 text-[11px] transition-colors",
                  active ? "font-medium text-pine" : "text-ink-muted",
                )}
              >
                {Icon && <Icon className="h-5 w-5" strokeWidth={1.75} />}
                <span className="max-w-full truncate">{itemLabel}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
