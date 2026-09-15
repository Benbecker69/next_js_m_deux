import type { Locale } from "@/lib/i18n/locale";

/**
 * Hand-drawn SVG flags, not emoji: flag emoji render as a flat "FR"/"GB"
 * text fallback on Windows (no emoji-flag glyphs in the default font),
 * which defeats the point — an actual picture, everywhere, every OS.
 */
function FrFlag() {
  return (
    <svg viewBox="0 0 30 20" className="block h-full w-full" aria-hidden="true">
      <rect width="30" height="20" fill="#fff" />
      <rect width="10" height="20" fill="#002395" />
      <rect x="20" width="10" height="20" fill="#ED2939" />
    </svg>
  );
}

function GbFlag() {
  return (
    <svg viewBox="0 0 30 20" className="block h-full w-full" aria-hidden="true">
      <rect width="30" height="20" fill="#00247d" />
      <path d="M0,0 L30,20 M30,0 L0,20" stroke="#fff" strokeWidth="4.5" />
      <path d="M0,0 L30,20 M30,0 L0,20" stroke="#cf142b" strokeWidth="1.8" />
      <path d="M15,0 V20 M0,10 H30" stroke="#fff" strokeWidth="7" />
      <path d="M15,0 V20 M0,10 H30" stroke="#cf142b" strokeWidth="3.2" />
    </svg>
  );
}

const FLAGS: Record<Locale, () => React.JSX.Element> = { fr: FrFlag, en: GbFlag };

export function FlagIcon({ locale, className }: { locale: Locale; className?: string }) {
  const Flag = FLAGS[locale];
  return (
    <span className={className}>
      <Flag />
    </span>
  );
}
