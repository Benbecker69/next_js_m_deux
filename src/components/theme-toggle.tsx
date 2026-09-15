"use client";

import { useTheme, type Theme } from "@/lib/theme/theme-provider";
import { cn } from "@/lib/utils/cn";

const OPTIONS: { value: Theme; label: string }[] = [
  { value: "light", label: "Clair" },
  { value: "dark", label: "Sombre" },
  { value: "system", label: "Système" },
];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div
      role="radiogroup"
      aria-label="Thème"
      className="inline-flex items-center gap-0.5 rounded-sm border border-line bg-surface p-0.5"
    >
      {OPTIONS.map((option) => {
        const active = theme === option.value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => setTheme(option.value)}
            className={cn(
              "rounded-sm px-2.5 py-1 text-xs font-medium transition-colors",
              active ? "bg-pine text-pine-contrast" : "text-ink-muted hover:text-ink",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
