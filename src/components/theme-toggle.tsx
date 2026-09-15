"use client";

import { Moon, MonitorSmartphone, Sun } from "lucide-react";
import { useTheme, type Theme } from "@/lib/theme/theme-provider";
import { cn } from "@/lib/utils/cn";

// Icon-only controls: each carries its own aria-label rather than relying on
// visible text, since the sun/moon/monitor glyphs alone aren't reliably
// announced by assistive tech.
const OPTIONS: { value: Theme; label: string; Icon: typeof Sun }[] = [
  { value: "light", label: "Thème clair", Icon: Sun },
  { value: "dark", label: "Thème sombre", Icon: Moon },
  { value: "system", label: "Thème système", Icon: MonitorSmartphone },
];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div
      role="radiogroup"
      aria-label="Thème"
      className="inline-flex shrink-0 items-center gap-0.5 rounded-sm border border-line bg-surface p-0.5"
    >
      {OPTIONS.map(({ value, label, Icon }) => {
        const active = theme === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={label}
            title={label}
            onClick={() => setTheme(value)}
            className={cn(
              "rounded-sm p-1.5 transition-colors duration-150",
              active ? "bg-pine text-pine-contrast" : "text-ink-muted hover:text-ink",
            )}
          >
            <Icon className="h-4 w-4" strokeWidth={1.75} />
          </button>
        );
      })}
    </div>
  );
}
