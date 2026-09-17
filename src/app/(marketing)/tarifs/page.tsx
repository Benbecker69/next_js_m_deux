import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { getT } from "@/lib/i18n/locale";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.pricing.title, description: t.pricing.subtitle };
}

export default async function PricingPage() {
  const t = await getT();

  return (
    <div className="mx-auto max-w-6xl px-6 py-20">
      <div className="grid gap-10 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <h1 className="font-display text-3xl font-medium text-ink">
            {t.pricing.title}
          </h1>
          <p className="mt-4 max-w-xl text-ink-muted">{t.pricing.subtitle}</p>
        </div>
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-sm border border-line md:w-72">
          <Image
            src="/images/marketing/pricing-hero.jpg"
            alt={t.pricing.heroAlt}
            fill
            sizes="(min-width: 768px) 18rem, 100vw"
            className="object-cover"
          />
        </div>
      </div>

      <section className="mt-14">
        <h2 className="font-display text-lg font-medium text-ink">
          {t.pricing.costByType}
        </h2>
        <div className="mt-6 divide-y divide-line border-t border-line">
          {t.pricing.spaces.map((item) => (
            <div
              key={item.type}
              className="grid gap-1 py-4 sm:grid-cols-[200px_160px_1fr] sm:items-baseline sm:gap-6"
            >
              <span className="text-ink">{item.type}</span>
              <span className="text-sm tabular-nums text-pine">{item.price}</span>
              <span className="text-sm text-ink-muted">{item.detail}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-14">
        <h2 className="font-display text-lg font-medium text-ink">
          {t.pricing.howToGetCredits}
        </h2>
        <div className="mt-6 divide-y divide-line border-t border-line">
          {t.pricing.packs.map((pack) => (
            <div
              key={pack.name}
              className="grid gap-1 py-4 sm:grid-cols-[200px_1fr_160px] sm:items-baseline sm:gap-6"
            >
              <span className="text-ink">{pack.name}</span>
              <span className="text-sm text-ink-muted">{pack.credits}</span>
              <span className="text-sm tabular-nums text-pine sm:text-right">
                {pack.price}
              </span>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-14">
        <Link href="/inscription" className={buttonVariants({ size: "lg" })}>
          {t.home.createAccount}
        </Link>
      </div>
    </div>
  );
}
