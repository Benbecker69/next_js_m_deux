import type { Metadata } from "next";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Tarifs",
  description:
    "Comment fonctionnent les crédits Repère, et combien coûte chaque type d'espace.",
};

const SPACE_PRICES = [
  {
    type: "Poste flex",
    price: "4 crédits / heure",
    detail: "Un bureau parmi d'autres, dans l'espace commun.",
  },
  {
    type: "Phone booth",
    price: "3 crédits / heure",
    detail: "Cabine insonorisée pour un appel ou une visio.",
  },
  {
    type: "Bureau privé",
    price: "8 à 9 crédits / heure",
    detail: "Un bureau fermé, pour une personne.",
  },
  {
    type: "Salle de réunion",
    price: "17 à 22 crédits / heure",
    detail: "De 4 à 6 personnes selon le lieu.",
  },
];

const CREDIT_PACKS = [
  { name: "À la carte", credits: "Crédits achetés à l'unité", price: "1 crédit = 1 €" },
  { name: "Pack 100", credits: "100 crédits, valables 6 mois", price: "90 €" },
  {
    name: "Abonnement mensuel",
    credits: "150 crédits reconduits chaque mois",
    price: "120 € / mois",
  },
];

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-20">
      <h1 className="font-display text-3xl font-medium text-ink">Tarifs</h1>
      <p className="mt-4 max-w-xl text-ink-muted">
        Repère fonctionne par crédits. Chaque réservation consomme des crédits selon le
        type d&apos;espace et sa durée — pas d&apos;abonnement obligatoire.
      </p>

      <section className="mt-14">
        <h2 className="font-display text-lg font-medium text-ink">
          Coût par type d&apos;espace
        </h2>
        <div className="mt-6 divide-y divide-line border-t border-line">
          {SPACE_PRICES.map((item) => (
            <div
              key={item.type}
              className="grid gap-1 py-4 sm:grid-cols-[200px_160px_1fr] sm:items-baseline sm:gap-6"
            >
              <span className="text-ink">{item.type}</span>
              <span className="text-sm text-pine">{item.price}</span>
              <span className="text-sm text-ink-muted">{item.detail}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-14">
        <h2 className="font-display text-lg font-medium text-ink">
          Comment obtenir des crédits
        </h2>
        <div className="mt-6 divide-y divide-line border-t border-line">
          {CREDIT_PACKS.map((pack) => (
            <div
              key={pack.name}
              className="grid gap-1 py-4 sm:grid-cols-[200px_1fr_160px] sm:items-baseline sm:gap-6"
            >
              <span className="text-ink">{pack.name}</span>
              <span className="text-sm text-ink-muted">{pack.credits}</span>
              <span className="text-sm text-pine sm:text-right">{pack.price}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-14">
        <Link href="/inscription" className={buttonVariants({ size: "lg" })}>
          Créer un compte
        </Link>
      </div>
    </div>
  );
}
