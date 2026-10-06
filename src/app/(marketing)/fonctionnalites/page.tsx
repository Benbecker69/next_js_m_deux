import type { Metadata } from "next";
import Image from "next/image";
import { getT } from "@/lib/i18n/locale";
import { cn } from "@/lib/utils/cn";
import { CtaBand } from "../_components/cta-band";
import { PageIntro } from "../_components/section";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.features.title, description: t.features.subtitle };
}

// Real photos (Unsplash, free license, see CLAUDE.md): these four blocks
// describe things that exist today, on real coworking floors, so a generic
// "people working in a bright space" photo doesn't claim anything false.
// Local files under /public so next/image can optimize them (resize per
// breakpoint, serve WebP/AVIF) with zero extra config.
const FEATURE_IMAGES = [
  "/images/marketing/feature-search.jpg",
  "/images/marketing/feature-dashboard.jpg",
  "/images/marketing/feature-backoffice.jpg",
  "/images/marketing/feature-mobile.jpg",
];

export default async function FeaturesPage() {
  const t = await getT();

  return (
    <>
      <PageIntro title={t.features.title} lead={t.features.subtitle} />

      {/* One block per feature, photo and text swapping sides so the page
          reads as a walk through the product rather than a list. */}
      <div className="border-b border-line">
        {t.features.items.map((feature, index) => (
          <section
            key={feature.title}
            className={cn(
              "border-t border-line first:border-t-0",
              index % 2 === 1 && "bg-surface",
            )}
          >
            <div
              className={cn(
                "mx-auto flex max-w-6xl flex-col gap-8 px-6 py-14 md:items-center md:gap-16",
                index % 2 === 1 ? "md:flex-row-reverse" : "md:flex-row",
              )}
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-sm border border-line md:w-1/2">
                <Image
                  src={FEATURE_IMAGES[index]}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="object-cover"
                  priority={index === 0}
                />
              </div>
              <div className="md:w-1/2">
                <h2 className="font-display text-3xl font-medium text-ink">
                  {feature.title}
                </h2>
                <p className="mt-4 max-w-md text-lg text-ink-muted">
                  {feature.description}
                </p>
              </div>
            </div>
          </section>
        ))}
      </div>

      <CtaBand />
    </>
  );
}
