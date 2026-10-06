import type { Metadata } from "next";
import Image from "next/image";
import { Check } from "lucide-react";
import { SpacePhoto } from "@/components/space-photo";
import { SPACE_TYPES, activeSpaces, formatPriceRange, priceRange } from "@/lib/catalog";
import { getCachedSpaces } from "@/lib/data/spaces";
import { getT } from "@/lib/i18n/locale";
import { SPACE_TYPE_LABELS } from "@/types/domain";
import { CtaBand } from "../_components/cta-band";
import { PageIntro, Section } from "../_components/section";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.pricing.title, description: t.pricing.subtitle };
}

export default async function PricingPage() {
  const [allSpaces, t] = await Promise.all([getCachedSpaces(), getT()]);
  const spaces = activeSpaces(allSpaces);

  // Prices are read from the spaces themselves: if an admin changes one, this
  // page follows without anyone editing the copy.
  const types = SPACE_TYPES.flatMap((type) => {
    const range = priceRange(spaces.filter((space) => space.type === type));
    return range ? [{ type, range }] : [];
  });

  return (
    <>
      <PageIntro
        title={t.pricing.title}
        lead={t.pricing.subtitle}
        aside={
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-sm border border-line md:w-80">
            <Image
              src="/images/marketing/pricing-hero.jpg"
              alt={t.pricing.heroAlt}
              fill
              sizes="(min-width: 768px) 20rem, 100vw"
              className="object-cover"
              priority
            />
          </div>
        }
      />

      <Section title={t.pricing.costByType}>
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {types.map(({ type, range }) => (
            <li
              key={type}
              className="flex flex-col overflow-hidden rounded-sm border border-line bg-surface"
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
                <p className="mt-2 text-sm text-ink-muted">{t.site.types.pitch[type]}</p>
                <p className="mt-auto pt-4 text-sm text-ink-muted">
                  <span className="font-display text-2xl font-medium tabular-nums text-ink">
                    {formatPriceRange(range)}
                  </span>{" "}
                  {t.site.types.perHour}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </Section>

      <Section title={t.pricing.howToGetCredits} tinted>
        <ul className="grid gap-5 md:grid-cols-3">
          {t.pricing.packs.map((pack) => (
            <li
              key={pack.name}
              className="flex flex-col rounded-sm border border-line bg-paper p-6"
            >
              <h3 className="font-medium text-ink">{pack.name}</h3>
              <p className="mt-4 font-display text-3xl font-medium tabular-nums text-ink">
                {pack.price}
              </p>
              <p className="mt-3 text-sm text-ink-muted">{pack.credits}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section>
        <div className="grid gap-12 md:grid-cols-2">
          <div>
            <h2 className="font-display text-2xl font-medium text-ink">
              {t.site.pricingPage.examplesTitle}
            </h2>
            <dl className="mt-6 divide-y divide-line border-y border-line">
              {t.site.pricingPage.examples.map((example) => (
                <div
                  key={example.label}
                  className="flex items-baseline justify-between gap-6 py-4"
                >
                  <dt className="text-ink">{example.label}</dt>
                  <dd className="shrink-0 font-display text-lg font-medium tabular-nums text-ink">
                    {example.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
          <div>
            <h2 className="font-display text-2xl font-medium text-ink">
              {t.site.pricingPage.rulesTitle}
            </h2>
            <ul className="mt-6 flex flex-col gap-4">
              {t.site.pricingPage.rules.map((rule) => (
                <li key={rule} className="flex items-start gap-3 text-ink">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-pine" strokeWidth={2} />
                  {rule}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <CtaBand />
    </>
  );
}
