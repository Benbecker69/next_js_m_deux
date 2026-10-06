import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { getSession } from "@/lib/auth/session";
import { getT } from "@/lib/i18n/locale";

/**
 * The closing block of a public page: the one filled band of the site, so
 * the invitation to start is the last thing on the page and the only thing
 * that looks like it. It adapts to the visitor — someone signed in is sent
 * to book, not to create an account they already have.
 */
export async function CtaBand() {
  const [user, t] = await Promise.all([getSession(), getT()]);

  return (
    <section className="bg-pine text-pine-contrast">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-16 md:flex-row md:items-center md:justify-between">
        <div className="max-w-xl">
          <h2 className="font-display text-3xl font-medium leading-tight">
            {t.home.finalTitle}
          </h2>
          <p className="mt-3 opacity-90">
            {user ? t.site.finalCta.loggedBody : t.site.finalCta.body}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href={user ? "/reserver" : "/inscription"}
            // Inverted button: the band already carries the brand color.
            className={buttonVariants({ size: "lg", variant: "inverse" })}
          >
            {user ? t.common.bookSpace : t.site.createAccount}
          </Link>
          <Link
            href="/lieux"
            className={buttonVariants({ size: "lg", variant: "inverse-outline" })}
          >
            {t.site.finalCta.secondary}
          </Link>
        </div>
      </div>
    </section>
  );
}
