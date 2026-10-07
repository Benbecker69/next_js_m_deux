import { CalendarPlus, Clock, House, UserRound } from "lucide-react";
import { Logo } from "@/components/logo";
import type { Dictionary } from "@/lib/i18n/dictionaries/fr";

/**
 * A drawing of the mobile app's home screen, built from the same tokens as
 * the site (so it follows light and dark themes) rather than a screenshot
 * that would go stale. It shows the three things the app's home really
 * shows: the next booking, the balance, the tab bar. Decorative — the text
 * next to it says the same thing — hence `aria-hidden`.
 */
export function PhoneMock({ t }: { t: Dictionary["site"]["app"] }) {
  return (
    <div
      aria-hidden="true"
      className="mx-auto w-64 rounded-[2rem] border border-line bg-surface p-2 shadow-lg shadow-ink/10"
    >
      <div className="flex h-[30rem] flex-col overflow-hidden rounded-[1.5rem] bg-paper">
        <div className="flex items-center justify-between px-4 pt-5">
          <Logo />
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-pine/15 text-xs font-medium text-pine">
            C
          </span>
        </div>

        <div className="mx-3 mt-5 rounded-xl bg-pine p-4 text-pine-contrast">
          <p className="text-[11px]">{t.mockNext}</p>
          <p className="mt-1 font-display text-2xl font-medium">{t.mockSlot}</p>
          <p className="mt-1 truncate text-[11px]">{t.mockPlace}</p>
          <p className="mt-3 inline-block rounded-full bg-pine-contrast px-2 py-0.5 text-[10px] font-medium text-pine">
            {t.mockArrival}
          </p>
        </div>

        <div className="mx-3 mt-3 rounded-xl border border-line bg-surface p-4">
          <p className="text-[11px] text-ink-muted">{t.mockBalance}</p>
          <p className="mt-0.5 font-display text-3xl font-medium text-ink">
            250{" "}
            <span className="font-sans text-xs font-normal text-ink-muted">
              {t.mockCredits}
            </span>
          </p>
          {/* Two of the four figures of the real screen, as plain bars. */}
          <div className="mt-3 grid grid-cols-2 gap-3 border-t border-line pt-3">
            <div className="h-2 rounded-full bg-line" />
            <div className="h-2 rounded-full bg-line" />
            <div className="h-2 w-2/3 rounded-full bg-line" />
            <div className="h-2 w-1/2 rounded-full bg-line" />
          </div>
        </div>

        <div className="mt-auto flex items-center justify-around border-t border-line bg-surface px-2 py-3 text-ink-muted">
          <House className="h-5 w-5 text-pine" strokeWidth={1.75} />
          <CalendarPlus className="h-5 w-5" strokeWidth={1.75} />
          <Clock className="h-5 w-5" strokeWidth={1.75} />
          <UserRound className="h-5 w-5" strokeWidth={1.75} />
        </div>
      </div>
    </div>
  );
}
