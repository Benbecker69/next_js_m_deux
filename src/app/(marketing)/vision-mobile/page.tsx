import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { getT } from "@/lib/i18n/locale";
import { NfcTapDiagram } from "./_components/nfc-tap-diagram";
import { GeolocRadarDiagram } from "./_components/geoloc-radar-diagram";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.nav.mobileVision, description: t.visionMobile.metaDescription };
}

export default async function VisionMobilePage() {
  const t = await getT();
  const comparison = [
    { title: t.visionMobile.todayTitle, description: t.visionMobile.todayDescription },
    {
      title: t.visionMobile.tomorrowTitle,
      description: t.visionMobile.tomorrowDescription,
    },
  ];

  return (
    <div className="mx-auto max-w-6xl px-6 py-20">
      <Badge variant="warning">{t.visionMobile.badge}</Badge>
      <h1 className="mt-4 font-display text-3xl font-medium text-ink">
        {t.visionMobile.title}
      </h1>
      <p className="mt-4 max-w-xl text-ink-muted">{t.visionMobile.subtitle}</p>

      <div className="mt-14 grid gap-8 border-t border-line pt-10 sm:grid-cols-2">
        <div>
          <NfcTapDiagram />
          <h2 className="mt-6 font-display text-lg font-medium text-ink">
            {t.visionMobile.nfcTitle}
          </h2>
          <p className="mt-2 text-sm text-ink-muted">{t.visionMobile.nfcDescription}</p>
        </div>

        <div>
          <GeolocRadarDiagram />
          <h2 className="mt-6 font-display text-lg font-medium text-ink">
            {t.visionMobile.geoTitle}
          </h2>
          <p className="mt-2 text-sm text-ink-muted">{t.visionMobile.geoDescription}</p>
        </div>
      </div>

      <div className="mt-16 border-t border-line pt-10">
        <h2 className="font-display text-lg font-medium text-ink">
          {t.visionMobile.comparisonTitle}
        </h2>
        <div className="mt-8 divide-y divide-line border-t border-line">
          {comparison.map((item) => (
            <div
              key={item.title}
              className="grid gap-2 py-8 sm:grid-cols-[240px_1fr] sm:gap-8"
            >
              <h3 className="font-display text-base font-medium text-ink">
                {item.title}
              </h3>
              <p className="text-sm text-ink-muted">{item.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-16">
        <Link href="/lieux" className={buttonVariants({ size: "lg" })}>
          {t.visionMobile.exploreCta}
        </Link>
      </div>
    </div>
  );
}
