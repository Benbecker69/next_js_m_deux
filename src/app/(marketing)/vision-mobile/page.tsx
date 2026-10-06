import type { Metadata } from "next";
import { BadgeCheck, History, MapPin, QrCode } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getT } from "@/lib/i18n/locale";
import { CtaBand } from "../_components/cta-band";
import { PhoneMock } from "../_components/phone-mock";
import { PageIntro, Section } from "../_components/section";
import { GeolocRadarDiagram } from "./_components/geoloc-radar-diagram";
import { NfcTapDiagram } from "./_components/nfc-tap-diagram";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.nav.mobileVision, description: t.site.appPage.lead };
}

// Same order as `t.site.appPage.features`: book nearby, confirm arrival,
// scan the space's code, keep the record.
const FEATURE_ICONS = [MapPin, BadgeCheck, QrCode, History];

// The page describes the app as it is — what it does today first, what is
// only planned (the NFC badge) last and labelled as such.
export default async function MobileAppPage() {
  const t = await getT();
  const app = t.site.appPage;

  return (
    <>
      <PageIntro
        eyebrow={<Badge variant="success">{app.status}</Badge>}
        title={app.title}
        lead={app.lead}
        aside={<PhoneMock t={t.site.app} />}
      />

      <Section title={app.featuresTitle}>
        <ul className="grid gap-5 sm:grid-cols-2">
          {app.features.map((feature, index) => {
            const Icon = FEATURE_ICONS[index];
            return (
              <li
                key={feature.title}
                className="rounded-sm border border-line bg-surface p-6"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-sm bg-pine/10 text-pine">
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
                </span>
                <h3 className="mt-4 font-display text-xl font-medium text-ink">
                  {feature.title}
                </h3>
                <p className="mt-2 text-ink-muted">{feature.description}</p>
              </li>
            );
          })}
        </ul>
      </Section>

      <Section tinted>
        <div className="grid gap-10 md:grid-cols-2 md:items-center md:gap-16">
          <GeolocRadarDiagram />
          <div>
            <h2 className="font-display text-3xl font-medium text-ink">
              {app.sharedTitle}
            </h2>
            <p className="mt-4 text-lg text-ink-muted">{app.sharedBody}</p>
            <p className="mt-4 text-ink-muted">{t.visionMobile.todayDescription}</p>
          </div>
        </div>
      </Section>

      <Section title={app.nextTitle}>
        <div className="grid gap-10 md:grid-cols-2 md:items-center md:gap-16">
          <div>
            <Badge variant="warning">{t.visionMobile.badge}</Badge>
            <h3 className="mt-4 font-display text-2xl font-medium text-ink">
              {t.visionMobile.nfcTitle}
            </h3>
            <p className="mt-3 text-ink-muted">{t.visionMobile.nfcDescription}</p>
          </div>
          <NfcTapDiagram />
        </div>
      </Section>

      <CtaBand />
    </>
  );
}
