import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Questions fréquentes sur Repère : crédits, annulation, lieux partenaires.",
};

const QUESTIONS = [
  {
    question: "Comment fonctionnent les crédits ?",
    answer:
      "Chaque réservation consomme un nombre de crédits selon le type d'espace et la durée. Vous achetez des crédits à l'unité ou via un abonnement mensuel — voir la page Tarifs.",
  },
  {
    question: "Puis-je annuler une réservation ?",
    answer:
      "Oui, tant que le créneau n'a pas commencé, depuis votre historique de réservations. Les crédits sont recrédités automatiquement.",
  },
  {
    question: "Les lieux sont-ils vérifiés ?",
    answer:
      "Chaque lieu est ajouté manuellement par l'équipe Repère après une visite, avant d'être publié sur la plateforme.",
  },
  {
    question: "Y a-t-il une application mobile ?",
    answer:
      "Une application est en préparation. Elle utilisera le NFC pour l'accès aux lieux et la géolocalisation pour repérer un espace libre à proximité — pas une simple copie du site.",
  },
  {
    question: "Comment référencer mon lieu sur Repère ?",
    answer:
      "Écrivez-nous depuis votre espace compte une fois inscrit : nous organisons une visite avant toute mise en ligne.",
  },
  {
    question: "Mes données sont-elles protégées ?",
    answer:
      "Vos informations de compte et vos réservations ne sont visibles que par vous et par les administrateurs du lieu concerné.",
  },
];

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      <h1 className="font-display text-3xl font-medium text-ink">Questions fréquentes</h1>

      <div className="mt-12 divide-y divide-line border-t border-line">
        {QUESTIONS.map((item) => (
          <details key={item.question} className="group py-5">
            <summary className="flex cursor-pointer list-none items-center justify-between text-ink marker:content-none">
              <span className="font-medium">{item.question}</span>
              <span className="text-ink-muted transition-transform group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="mt-3 text-sm text-ink-muted">{item.answer}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
