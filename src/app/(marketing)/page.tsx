import Link from "next/link";
import Image from "next/image";
import { buttonVariants } from "@/components/ui/button";
import { LocationArt } from "@/components/location-art";
import { SPACE_TYPE_LABELS } from "@/types/domain";
import { getCachedLocations } from "@/lib/data/locations";
import { getCachedSpaces } from "@/lib/data/spaces";
import { getT } from "@/lib/i18n/locale";
import { SpacePlan } from "./_components/space-plan";

export default async function MarketingHomePage() {
  const [locations, spaces, t] = await Promise.all([
    getCachedLocations(),
    getCachedSpaces(),
    getT(),
  ]);
  const featuredLocations = locations.slice(0, 2).map((location) => {
    const types = [
      ...new Set(
        spaces
          .filter((space) => space.locationId === location.id)
          .map((space) => SPACE_TYPE_LABELS[space.type]),
      ),
    ];
    return { ...location, typesLabel: types.join(", ") };
  });

  return (
    <>
      <section className="border-b border-line">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 md:grid-cols-2 md:items-center md:py-28">
          <div>
            <h1 className="animate-hero-reveal font-display text-4xl font-medium leading-tight text-ink sm:text-5xl">
              {t.home.heroTitle}
            </h1>
            <p className="animate-hero-reveal mt-6 max-w-md text-lg text-ink-muted [animation-delay:100ms]">
              {t.home.heroSubtitle}
            </p>
            <div className="animate-hero-reveal mt-8 flex flex-wrap gap-4 [animation-delay:200ms]">
              <Link href="/inscription" className={buttonVariants({ size: "lg" })}>
                {t.common.bookSpace}
              </Link>
              <Link
                href="/lieux"
                className={buttonVariants({ variant: "secondary", size: "lg" })}
              >
                {t.common.seeLocations}
              </Link>
            </div>
          </div>
          <div className="animate-hero-reveal [animation-delay:150ms]">
            <SpacePlan />
          </div>
        </div>
      </section>

      <section className="border-b border-line">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="font-display text-2xl font-medium text-ink">
            {t.home.howItWorks}
          </h2>
          <ol className="mt-10 grid gap-10 sm:grid-cols-3">
            {t.home.steps.map((step, index) => (
              <li key={step.title} className="border-t border-line pt-4">
                <span className="text-sm text-ink-muted">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-2 font-display text-lg font-medium text-ink">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm text-ink-muted">{step.description}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-b border-line">
        <div className="relative mx-auto aspect-[16/7] max-w-6xl overflow-hidden border-y border-line sm:aspect-[21/8]">
          <Image
            src="/images/marketing/hero-lounge.jpg"
            alt={t.home.loungeAlt}
            fill
            sizes="100vw"
            className="object-cover"
          />
        </div>
      </section>

      <section className="border-b border-line">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-2xl font-medium text-ink">
              {t.home.featuredTitle}
            </h2>
            <Link href="/lieux" className="text-sm text-pine hover:underline">
              {t.home.seeAll}
            </Link>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {featuredLocations.map((location) => (
              <Link
                key={location.slug}
                href={`/lieux/${location.slug}`}
                className="group block transition-transform duration-150 hover:-translate-y-0.5"
              >
                <LocationArt
                  slug={location.slug}
                  variant="top"
                  className="transition-colors duration-150 group-hover:border-pine"
                />
                <div className="rounded-b-sm border border-t-0 border-line bg-surface p-6 shadow-sm transition-[border-color,box-shadow] duration-150 group-hover:border-pine group-hover:shadow-md">
                  <h3 className="font-display text-lg font-medium text-ink">
                    {location.name}
                  </h3>
                  <p className="mt-1 text-sm text-ink-muted">{location.city}</p>
                  <p className="mt-4 text-sm text-ink">{location.typesLabel}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-6xl px-6 py-20 text-center md:text-left">
          <h2 className="font-display text-2xl font-medium text-ink">
            {t.home.finalTitle}
          </h2>
          <div className="mt-6">
            <Link href="/inscription" className={buttonVariants({ size: "lg" })}>
              {t.home.createAccount}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
