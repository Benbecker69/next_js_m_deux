"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";

// Client Component only because marking the current page needs the pathname
// (`usePathname`); the links and their labels come from the Server Component
// header, which already resolved the dictionary.
export function NavLinks({ links }: { links: { href: string; label: string }[] }) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navigation principale"
      className="hidden items-stretch gap-1 md:flex"
    >
      {links.map((link) => {
        const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              // The underline sits on the header's own bottom border, so the
              // current page reads as a tab of the header.
              "-mb-px flex items-center border-b-2 px-3 text-sm transition-colors",
              active
                ? "border-pine text-ink"
                : "border-transparent text-ink-muted hover:text-ink",
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
