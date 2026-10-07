import Link from "next/link";
import Image from "next/image";
import { Check } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { DashLink } from "@/components/dash-link";
import { SpacePhoto } from "@/components/space-photo";
import { SPACE_TYPE_LABELS } from "@/types/domain";
import {
  SPACE_TYPES,
  activeSpaces,
  formatPriceRange,
  listCities,
  priceRange,
  summarizeLocation,
} from "@/lib/catalog";
import { getCachedLocations } from "@/lib/data/locations";
import { getCachedSpaces } from "@/lib/data/spaces";
import { getT } from "@/lib/i18n/locale";
import { CtaBand } from "./_components/cta-band";
import { LocationCard } from "./_components/location-card";
import { PhoneMock } from "./_components/phone-mock";
import { SearchForm } from "./_components/search-form";
import { Section } from "./_components/section";

// The home page answers, in order, the questions of someone who has never
// heard of Repère: what is it and can I find a place (hero + search), what
// can I book and for how much (space types), where (locations), how
// (steps), what does it cost me (credits), what about my phone (app), what
// if… (questions) — then asks them to start.
export default async function MarketingHomePage() {
  const [locations, allSpaces, t] = await Promise.all([
    getCachedLocations(),
    getCachedSpaces(),
    getT(),
  ]);
  const spaces = activeSpaces(allSpaces);
  const summaries = locations.map((location) => summarizeLocation(location, allSpaces));
  const lowestPrice = priceRange(spaces)?.min;

  // Only the types that at least one location really offers.
  const types = SPACE_TYPES.flatMap((type) => {
    const range = priceRange(spaces.filter((space) => space.type === type));
    return range ? [{ type, range }] : [];
  });

  const facts = [
    { value: String(locations.length), label: t.site.facts.locations },
    { value: String(spaces.length), label: t.site.facts.spaces },
    ...(lowestPrice !== undefined
      ? [{ value: String(lowestPrice), label: t.site.facts.price }]
      : []),
  ];

  return (
    <>
      <section className="border-b border-line">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 py-14 md:grid-cols-[1.1fr_1fr] md:items-center md:py-20">
          <div>
            <h1 className="animate-hero-reveal font-display text-5xl font-medium leading-[1.05] text-ink sm:text-6xl">
              {t.home.heroTitlePrefix}
              <em className="italic">{t.home.heroTitleEmphasis}</em>
            </h1>
            <p className="animate-hero-reveal mt-6 max-w-md text-lg text-ink-muted [animation-delay:100ms]">
              {t.home.heroSubtitle}
            </p>
            <div className="animate-hero-reveal mt-8 [animation-delay:200ms]">
              <SearchForm cities={listCities(locations)} t={t.site.search} />
            </div>
          </div>
          <div className="animate-hero-reveal relative aspect-[4/3] overflow-hidden rounded-sm border border-line [animation-delay:150ms] md:aspect-[5/6]">
            <Image
              src="/images/marketing/home-hero.jpg"
              alt={t.home.heroImageAlt}
              fill
              sizes="(min-width: 768px) 45vw, 100vw"
              className="object-cover"
              // The page's largest image: fetched first, never lazily.
              loading="eager"
              fetchPriority="high"
            />
          </div>
        </div>

        {/* Counted from the database, not typed in the copy. */}
        <dl className="mx-auto grid max-w-6xl border-t border-line px-6 sm:grid-cols-3 sm:divide-x sm:divide-line">
          {facts.map((fact) => (
            <div
              key={fact.label}
              className="flex items-baseline gap-3 py-5 sm:px-6 sm:first:pl-0"
            >
              <dd className="font-display text-3xl font-medium tabular-nums text-ink">
                {fact.value}
              </dd>
              <dt className="text-sm text-ink-muted">{fact.label}</dt>
            </div>
          ))}
        </dl>
      </section>

      <Section title={t.site.types.title} subtitle={t.site.types.subtitle}>
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {types.map(({ type, range }) => (
            <li key={type}>
              <Link
                href={`/lieux?type=${type}`}
                className="group flex h-full flex-col overflow-hidden rounded-sm border border-line bg-surface transition-colors duration-150 hover:border-pine"
              >
                <SpacePhoto
                  type={type}
                  variant="cover"
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                />
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="font-display text-lg font-medium text-ink">
                    {SPACE_TYPE_LABELS[type]}
                  </h3>
                  <p className="mt-2 text-sm text-ink-muted">
                    {t.site.types.pitch[type]}
                  </p>
                  <p className="mt-auto pt-4 text-sm text-ink-muted">
                    <span className="font-display text-xl font-medium text-ink">
                      {formatPriceRange(range)}
                    </span>{" "}
                    {t.site.types.perHour}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      <Section
        title={t.site.places.title}
        subtitle={t.site.places.subtitle}
        action={<DashLink href="/lieux">{t.home.seeAll}</DashLink>}
      >
        <div className="grid gap-6 sm:grid-cols-2">
          {summaries.slice(0, 4).map((summary) => (
            <LocationCard key={summary.location.id} summary={summary} t={t.site.places} />
          ))}
        </div>
      </Section>

      {/* The three steps are a real sequence, hence the numbers. */}
      <Section title={t.home.howItWorks} tinted>
        <ol className="grid gap-10 sm:grid-cols-3">
          {t.home.steps.map((step, index) => (
            <li key={step.title} className="border-t-2 border-pine pt-5">
              <span className="font-display text-3xl font-medium text-pine">
                {index + 1}
              </span>
              <h3 className="mt-3 font-display text-xl font-medium text-ink">
                {step.title}
              </h3>
              <p className="mt-2 text-ink-muted">{step.description}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section>
        <div className="grid gap-12 md:grid-cols-2 md:items-center">
          <div>
            <h2 className="font-display text-3xl font-medium text-ink">
              {t.site.credits.title}
            </h2>
            <p className="mt-4 text-ink-muted">{t.site.credits.body}</p>
            <ul className="mt-6 flex flex-col gap-3">
              {t.site.credits.points.map((point) => (
                <li key={point} className="flex items-start gap-3 text-ink">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-pine" strokeWidth={2} />
                  {point}
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <Link href="/tarifs" className={buttonVariants({ variant: "secondary" })}>
                {t.site.credits.cta}
              </Link>
            </div>
          </div>
          {/* The price list itself, so the claim on the left can be checked. */}
          <dl className="divide-y divide-line rounded-sm border border-line bg-surface">
            {types.map(({ type, range }) => (
              <div key={type} className="flex items-baseline justify-between gap-4 p-5">
                <dt className="text-ink">{SPACE_TYPE_LABELS[type]}</dt>
                <dd className="text-sm text-ink-muted">
                  <span className="font-display text-xl font-medium tabular-nums text-ink">
                    {formatPriceRange(range)}
                  </span>{" "}
                  {t.site.types.perHour}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </Section>

      <Section tinted>
        <div className="grid gap-12 md:grid-cols-[auto_1fr] md:items-center md:gap-16">
          <PhoneMock t={t.site.app} />
          <div>
            <h2 className="font-display text-3xl font-medium text-ink">
              {t.site.app.title}
            </h2>
            <p className="mt-4 max-w-xl text-ink-muted">{t.site.app.body}</p>
            <ul className="mt-6 flex flex-col gap-3">
              {t.site.app.points.map((point) => (
                <li key={point} className="flex items-start gap-3 text-ink">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-pine" strokeWidth={2} />
                  {point}
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <Link
                href="/vision-mobile"
                className={buttonVariants({ variant: "secondary" })}
              >
                {t.site.app.cta}
              </Link>
            </div>
          </div>
        </div>
      </Section>

      <Section
        title={t.site.faqTeaser.title}
        action={<DashLink href="/faq">{t.site.faqTeaser.cta}</DashLink>}
      >
        <div className="grid gap-x-12 gap-y-8 md:grid-cols-3">
          {t.faq.questions.slice(0, 3).map((item) => (
            <div key={item.question}>
              <h3 className="font-medium text-ink">{item.question}</h3>
              <p className="mt-2 text-sm text-ink-muted">{item.answer}</p>
            </div>
          ))}
        </div>
      </Section>

      <CtaBand />
    </>
  );
}
