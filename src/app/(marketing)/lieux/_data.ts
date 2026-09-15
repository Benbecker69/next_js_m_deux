// Static and illustrative for now — replaced by the real repository
// (src/lib/data/locations.ts) once the mock-but-persisted data layer lands.
// Shape mirrors the future Location/Space domain model on purpose, so that
// swap is a data-source change, not a page rewrite.

export type SpaceOffering = {
  type: string;
  pricePerHour: number; // credits
};

export type MarketingLocation = {
  slug: string;
  name: string;
  city: string;
  address: string;
  description: string;
  amenities: string[];
  spaces: SpaceOffering[];
};

export const MARKETING_LOCATIONS: MarketingLocation[] = [
  {
    slug: "le-chantier-lyon",
    name: "Le Chantier",
    city: "Lyon",
    address: "12 rue de la Part-Dieu, 69003 Lyon",
    description:
      "Un ancien atelier industriel réhabilité en espace de travail, à deux pas de la gare Part-Dieu. Grandes verrières, mezzanine, et une salle de réunion vitrée qui donne sur les voies.",
    amenities: ["Wi-fi fibre", "Café inclus", "Imprimante", "Casiers"],
    spaces: [
      { type: "Poste flex", pricePerHour: 4 },
      { type: "Bureau privé", pricePerHour: 9 },
      { type: "Salle de réunion (4 pers.)", pricePerHour: 18 },
    ],
  },
  {
    slug: "station-9-nantes",
    name: "Station 9",
    city: "Nantes",
    address: "9 quai des Antilles, 44200 Nantes",
    description:
      "Sur l'Île de Nantes, à proximité des Machines. Beaucoup de lumière naturelle, des phone booths insonorisées pour les appels, et une terrasse sur le quai.",
    amenities: ["Terrasse", "Phone booths", "Wi-fi fibre", "Parking vélo"],
    spaces: [
      { type: "Poste flex", pricePerHour: 4 },
      { type: "Phone booth", pricePerHour: 3 },
      { type: "Bureau privé", pricePerHour: 8 },
    ],
  },
  {
    slug: "la-verriere-bordeaux",
    name: "La Verrière",
    city: "Bordeaux",
    address: "27 cours de la Marne, 33800 Bordeaux",
    description:
      "Une ancienne serre horticole convertie en espace partagé, à la lisière du quartier Saint-Michel. Beaucoup de plantes, une grande table commune, et deux salles de réunion.",
    amenities: ["Cuisine équipée", "Wi-fi fibre", "Salle calme", "Casiers"],
    spaces: [
      { type: "Poste flex", pricePerHour: 4 },
      { type: "Salle de réunion (6 pers.)", pricePerHour: 22 },
      { type: "Bureau privé", pricePerHour: 9 },
    ],
  },
  {
    slug: "le-comptoir-lille",
    name: "Le Comptoir",
    city: "Lille",
    address: "5 rue du Molinel, 59800 Lille",
    description:
      "En plein Vieux-Lille, dans un immeuble en briques du 19e siècle. Ambiance feutrée, cabines téléphoniques, et un accueil qui connaît vos habitudes.",
    amenities: ["Café inclus", "Phone booths", "Wi-fi fibre", "Casiers"],
    spaces: [
      { type: "Poste flex", pricePerHour: 4 },
      { type: "Bureau privé", pricePerHour: 8 },
      { type: "Salle de réunion (4 pers.)", pricePerHour: 17 },
    ],
  },
];
