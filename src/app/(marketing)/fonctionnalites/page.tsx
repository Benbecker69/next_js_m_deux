import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fonctionnalités",
  description:
    "Ce que Repère permet de faire, de la recherche d'un espace à la gestion d'un lieu.",
};

const FEATURES = [
  {
    title: "Recherche et réservation",
    description:
      "Filtrez les lieux par ville, type d'espace et disponibilité. Triez par distance grâce à la géolocalisation de votre navigateur. Un créneau réservé est bloqué immédiatement.",
  },
  {
    title: "Tableau de bord et historique",
    description:
      "Vos réservations à venir et passées, vos crédits restants, et l'annulation en un clic tant que le créneau n'a pas commencé.",
  },
  {
    title: "Back-office pour les lieux",
    description:
      "Chaque lieu référencé dispose d'un espace de gestion : disponibilités, réservations, utilisateurs, statistiques d'occupation.",
  },
  {
    title: "Pensé pour le mobile",
    description:
      "Une application mobile est en préparation : badge NFC pour l'accès aux lieux, géolocalisation en temps réel pour trouver un espace libre autour de vous.",
  },
];

export default function FeaturesPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-20">
      <h1 className="font-display text-3xl font-medium text-ink">Fonctionnalités</h1>
      <p className="mt-4 max-w-xl text-ink-muted">
        De la recherche d&apos;un bureau à la gestion d&apos;un lieu, ce que Repère permet
        aujourd&apos;hui.
      </p>

      <div className="mt-14 divide-y divide-line border-t border-line">
        {FEATURES.map((feature) => (
          <div
            key={feature.title}
            className="grid gap-2 py-8 sm:grid-cols-[240px_1fr] sm:gap-8"
          >
            <h2 className="font-display text-lg font-medium text-ink">{feature.title}</h2>
            <p className="text-sm text-ink-muted">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
