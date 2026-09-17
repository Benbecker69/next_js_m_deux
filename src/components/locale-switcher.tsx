"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { setLocaleAction } from "@/lib/i18n/actions";
import type { Locale } from "@/lib/i18n/locale";
import { cn } from "@/lib/utils/cn";
import { FlagIcon } from "@/components/flag-icon";

const LABEL: Record<Locale, string> = { fr: "Français", en: "English" };
const LOCALES: Locale[] = ["fr", "en"];

// Locale lives server-side only (a cookie read in getLocale()) — this just
// renders the current value passed down from a Server Component parent and
// asks setLocaleAction to change it.
//
// `dropUp`: the dropdown defaults to opening below and left-aligned to the
// trigger's right edge — fine when the trigger sits near the top-right of
// the page (marketing header, auth layout), but the sidebar footers place
// it near the bottom-left, where that same positioning pushes the list
// past both the left and bottom edges of the viewport. Callers there pass
// `dropUp` to flip it: open above the trigger, left-aligned so it grows
// toward the right instead.
export function LocaleSwitcher({
  locale,
  dropUp = false,
}: {
  locale: Locale;
  dropUp?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const select = (next: Locale) => {
    setOpen(false);
    startTransition(() => setLocaleAction(next));
  };

  const otherLocales = LOCALES.filter((value) => value !== locale);

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        disabled={pending}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Langue : ${LABEL[locale]}`}
        title={LABEL[locale]}
        className="flex h-8 w-8 items-center justify-center rounded-sm border border-line bg-surface transition-colors hover:border-ink/30"
      >
        <FlagIcon
          locale={locale}
          className="block h-3.5 w-5 overflow-hidden rounded-[2px]"
        />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label="Choisir une langue"
          className={cn(
            "animate-toast-in absolute z-20 min-w-36 rounded-sm border border-line bg-surface p-1 shadow-md",
            dropUp ? "bottom-full left-0 mb-1" : "right-0 mt-1",
          )}
        >
          {otherLocales.map((value) => (
            <li key={value} role="option" aria-selected={false}>
              <button
                type="button"
                onClick={() => select(value)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm text-ink",
                  "transition-colors hover:bg-paper",
                )}
              >
                <FlagIcon
                  locale={value}
                  className="block h-3.5 w-5 overflow-hidden rounded-[2px]"
                />
                {LABEL[value]}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
