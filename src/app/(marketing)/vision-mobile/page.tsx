import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { NfcTapDiagram } from "./_components/nfc-tap-diagram";
import { GeolocRadarDiagram } from "./_components/geoloc-radar-diagram";

export const metadata: Metadata = {
  title: "Vision mobile",
  description:
    "Ce que l'application mobile Repère permettra : badge NFC à l'entrée des lieux et géolocalisation en temps réel pour trouver un espace libre.",
};

const TODAY_VS_TOMORROW = [
  {
    title: "Déjà réel, dans le navigateur",
    description:
      "Le tri « autour de moi » sur la page de réservation utilise votre position GPS réelle (Geolocation API du navigateur) pour classer les lieux par distance. Aucune maquette : le calcul de distance tourne pour de vrai.",
  },
  {
    title: "En préparation, côté application mobile",
    description:
      "Le badge NFC à l'entrée d'un lieu et le suivi de position en continu demandent une application native ou PWA installée, avec accès matériel au lecteur NFC du téléphone. Cette page en présente le principe ; l'intégration viendra dans une phase ultérieure du projet.",
  },
];

export default function VisionMobilePage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-20">
      <Badge variant="warning">En préparation</Badge>
      <h1 className="mt-4 font-display text-3xl font-medium text-ink">
        L&apos;app mobile, pensée avant d&apos;être codée.
      </h1>
      <p className="mt-4 max-w-xl text-ink-muted">
        Deux usages sont prévus pour l&apos;application mobile Repère : badger à
        l&apos;entrée d&apos;un lieu et repérer l&apos;espace libre le plus proche en
        temps réel. Voici comment ça fonctionnera.
      </p>

      <div className="mt-14 grid gap-8 border-t border-line pt-10 sm:grid-cols-2">
        <div>
          <NfcTapDiagram />
          <h2 className="mt-6 font-display text-lg font-medium text-ink">
            Badge NFC à l&apos;entrée
          </h2>
          <p className="mt-2 text-sm text-ink-muted">
            Un simple contact du téléphone sur le lecteur du lieu confirme votre
            réservation et déverrouille l&apos;accès — plus besoin de présenter quoi que
            ce soit à l&apos;accueil.
          </p>
        </div>

        <div>
          <GeolocRadarDiagram />
          <h2 className="mt-6 font-display text-lg font-medium text-ink">
            Espaces libres autour de vous
          </h2>
          <p className="mt-2 text-sm text-ink-muted">
            Une fois dans le lieu, l&apos;app localise en temps réel les postes et bureaux
            encore disponibles, plutôt qu&apos;une liste figée à l&apos;étage.
          </p>
        </div>
      </div>

      <div className="mt-16 border-t border-line pt-10">
        <h2 className="font-display text-lg font-medium text-ink">
          Ce qui existe déjà, ce qui reste à construire
        </h2>
        <div className="mt-8 divide-y divide-line border-t border-line">
          {TODAY_VS_TOMORROW.map((item) => (
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
          Voir les lieux dès maintenant
        </Link>
      </div>
    </div>
  );
}
