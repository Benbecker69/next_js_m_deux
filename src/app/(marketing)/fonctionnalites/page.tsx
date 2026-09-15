import type { Metadata } from "next";
import Image from "next/image";
import { cn } from "@/lib/utils/cn";
import { getT } from "@/lib/i18n/locale";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.features.title, description: t.features.subtitle };
}

// Real photos (Unsplash, free license, see CLAUDE.md) rather than more line
// art here: these four rows describe things that exist today, on real
// coworking floors — unlike the location cards (a specific fictional venue)
// or the vision-mobile page (a feature that doesn't exist yet), a generic
// "people working in a bright, plant-filled space" photo doesn't claim
// anything false. Local files under /public so next/image can optimize
// them (resize per breakpoint, serve WebP/AVIF) with zero extra config.
const FEATURE_IMAGES = [
  "/images/marketing/feature-search.jpg",
  "/images/marketing/feature-dashboard.jpg",
  "/images/marketing/feature-backoffice.jpg",
  "/images/marketing/feature-mobile.jpg",
];

export default async function FeaturesPage() {
  const t = await getT();

  return (
    <div className="mx-auto max-w-6xl px-6 py-20">
      <h1 className="font-display text-3xl font-medium text-ink">{t.features.title}</h1>
      <p className="mt-4 max-w-xl text-ink-muted">{t.features.subtitle}</p>

      <div className="mt-14 divide-y divide-line border-t border-line">
        {t.features.items.map((feature, index) => (
          <div
            key={feature.title}
            className={cn(
              "flex flex-col gap-6 py-10 sm:items-center sm:gap-10",
              index % 2 === 1 ? "sm:flex-row-reverse" : "sm:flex-row",
            )}
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-sm border border-line sm:w-2/5">
              <Image
                src={FEATURE_IMAGES[index]}
                alt={feature.title}
                fill
                sizes="(min-width: 640px) 40vw, 100vw"
                className="object-cover"
              />
            </div>
            <div className="sm:w-3/5">
              <h2 className="font-display text-lg font-medium text-ink">
                {feature.title}
              </h2>
              <p className="mt-2 text-sm text-ink-muted">{feature.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
