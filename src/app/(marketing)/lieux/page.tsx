import type { Metadata } from "next";
import Link from "next/link";
import { EmptyState } from "@/components/ui/empty-state";
import { buttonVariants } from "@/components/ui/button";
import {
  SPACE_TYPES,
  filterLocations,
  isSpaceType,
  listCities,
  summarizeLocation,
} from "@/lib/catalog";
import { getCachedLocations } from "@/lib/data/locations";
import { getCachedSpaces } from "@/lib/data/spaces";
import { getT } from "@/lib/i18n/locale";
import { cn } from "@/lib/utils/cn";
import { SPACE_TYPE_LABELS } from "@/types/domain";
import { CtaBand } from "../_components/cta-band";
import { LocationCard } from "../_components/location-card";
import { PageIntro } from "../_components/section";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.locations.title, description: t.locations.metaDescription };
}

/** `/lieux`, `/lieux?ville=Lyon`, `/lieux?type=salle-reunion`, or both. */
function locationsHref(filters: { city?: string; type?: string }): string {
  const params = new URLSearchParams();
  if (filters.city) params.set("ville", filters.city);
  if (filters.type) params.set("type", filters.type);
  const query = params.toString();
  return query ? `/lieux?${query}` : "/lieux";
}

// The filters live in the URL (`searchParams`), not in client state: the
// page stays a Server Component, a filtered view can be shared or
// bookmarked, and the home page's search form lands here already filtered.
export default async function LocationsPage({ searchParams }: PageProps<"/lieux">) {
  const [locations, spaces, t, params] = await Promise.all([
    getCachedLocations(),
    getCachedSpaces(),
    getT(),
    searchParams,
  ]);

  const cities = listCities(locations);
  // A value that is not a real city or type is ignored rather than trusted.
  const city =
    typeof params.ville === "string" && cities.includes(params.ville)
      ? params.ville
      : undefined;
  const type = isSpaceType(params.type) ? params.type : undefined;

  const summaries = locations.map((location) => summarizeLocation(location, spaces));
  const results = filterLocations(summaries, { city, type });

  return (
    <>
      <PageIntro title={t.locations.title} lead={t.site.locationsPage.lead} />

      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-col gap-4">
          <FilterRow label={t.site.search.city}>
            <FilterLink href={locationsHref({ type })} active={!city}>
              {t.site.locationsPage.all}
            </FilterLink>
            {cities.map((item) => (
              <FilterLink
                key={item}
                href={locationsHref({ city: item, type })}
                active={city === item}
              >
                {item}
              </FilterLink>
            ))}
          </FilterRow>
          <FilterRow label={t.site.search.type}>
            <FilterLink href={locationsHref({ city })} active={!type}>
              {t.site.locationsPage.all}
            </FilterLink>
            {SPACE_TYPES.map((item) => (
              <FilterLink
                key={item}
                href={locationsHref({ city, type: item })}
                active={type === item}
              >
                {SPACE_TYPE_LABELS[item]}
              </FilterLink>
            ))}
          </FilterRow>
        </div>

        <p className="mt-10 text-sm text-ink-muted" aria-live="polite">
          {results.length}{" "}
          {results.length === 1
            ? t.site.locationsPage.countOne
            : t.site.locationsPage.countMany}
        </p>

        {results.length === 0 ? (
          <EmptyState
            className="mt-4"
            title={t.site.locationsPage.none}
            description={t.site.locationsPage.noneHint}
            action={
              <Link href="/lieux" className={buttonVariants({ size: "sm" })}>
                {t.site.locationsPage.reset}
              </Link>
            }
          />
        ) : (
          <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((summary, index) => (
              <LocationCard
                key={summary.location.id}
                summary={summary}
                t={t.site.places}
                headingLevel="h2"
                priority={index === 0}
              />
            ))}
          </div>
        )}
      </div>

      <CtaBand />
    </>
  );
}

function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
      <p className="w-28 shrink-0 text-sm font-medium text-ink">{label}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function FilterLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "true" : undefined}
      // Filtering should not jump back to the top of the page.
      scroll={false}
      className={cn(
        "rounded-sm border px-3 py-1.5 text-sm transition-colors",
        active
          ? "border-pine bg-pine/10 text-pine"
          : "border-line bg-surface text-ink-muted hover:border-ink/30 hover:text-ink",
      )}
    >
      {children}
    </Link>
  );
}
