import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { SPACE_TYPE_LABELS } from "@/types/domain";
import { getCachedLocations } from "@/lib/data/locations";
import { getCachedSpaces } from "@/lib/data/spaces";
import { SpacePlan } from "./_components/space-plan";

const STEPS = [
  {
    title: "Cherchez",
    description: "Filtrez les lieux par ville, type d'espace et disponibilité du jour.",
  },
  {
    title: "Réservez",
    description:
      "Choisissez un créneau : l'espace est bloqué immédiatement, pas de surprise sur place.",
  },
  {
    title: "Travaillez",
    description: "Présentez-vous à l'accueil, votre réservation est déjà confirmée.",
  },
];

export default async function MarketingHomePage() {
  const [locations, spaces] = await Promise.all([
    getCachedLocations(),
    getCachedSpaces(),
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
              Un bureau, pas une adresse à deviner.
            </h1>
            <p className="animate-hero-reveal mt-6 max-w-md text-lg text-ink-muted [animation-delay:100ms]">
              Repère référence des espaces de coworking dans toute la France et vous
              laisse réserver un bureau, une salle ou un poste flex pour la journée, en
              quelques clics.
            </p>
            <div className="animate-hero-reveal mt-8 flex flex-wrap gap-4 [animation-delay:200ms]">
              <Link href="/inscription" className={buttonVariants({ size: "lg" })}>
                Réserver un espace
              </Link>
              <Link
                href="/lieux"
                className={buttonVariants({ variant: "secondary", size: "lg" })}
              >
                Voir les lieux
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
            Comment ça marche
          </h2>
          <ol className="mt-10 grid gap-10 sm:grid-cols-3">
            {STEPS.map((step, index) => (
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
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-2xl font-medium text-ink">Quelques lieux</h2>
            <Link href="/lieux" className="text-sm text-pine hover:underline">
              Tout voir
            </Link>
          </div>
          <div className="mt-10 grid divide-y divide-line rounded-sm border border-line sm:grid-cols-2 sm:divide-x sm:divide-y-0">
            {featuredLocations.map((location) => (
              <Link
                key={location.slug}
                href={`/lieux/${location.slug}`}
                className="block p-6 transition-colors hover:bg-surface"
              >
                <h3 className="font-display text-lg font-medium text-ink">
                  {location.name}
                </h3>
                <p className="mt-1 text-sm text-ink-muted">{location.city}</p>
                <p className="mt-4 text-sm text-ink">{location.typesLabel}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-6xl px-6 py-20 text-center md:text-left">
          <h2 className="font-display text-2xl font-medium text-ink">
            Votre bureau du jour, réservé en moins de deux minutes.
          </h2>
          <div className="mt-6">
            <Link href="/inscription" className={buttonVariants({ size: "lg" })}>
              Créer un compte
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
