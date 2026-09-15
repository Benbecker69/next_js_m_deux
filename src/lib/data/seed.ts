import "server-only";
import type { Location, Preference, Reservation, Space, User } from "@/types/domain";

export const SEED_LOCATIONS: Location[] = [
  {
    id: "le-chantier-lyon",
    slug: "le-chantier-lyon",
    name: "Le Chantier",
    city: "Lyon",
    address: "12 rue de la Part-Dieu, 69003 Lyon",
    lat: 45.7605,
    lng: 4.8607,
    description:
      "Un ancien atelier industriel réhabilité en espace de travail, à deux pas de la gare Part-Dieu. Grandes verrières, mezzanine, et une salle de réunion vitrée qui donne sur les voies.",
    amenities: ["Wi-fi fibre", "Café inclus", "Imprimante", "Casiers"],
  },
  {
    id: "station-9-nantes",
    slug: "station-9-nantes",
    name: "Station 9",
    city: "Nantes",
    address: "9 quai des Antilles, 44200 Nantes",
    lat: 47.2065,
    lng: -1.5484,
    description:
      "Sur l'Île de Nantes, à proximité des Machines. Beaucoup de lumière naturelle, des phone booths insonorisées pour les appels, et une terrasse sur le quai.",
    amenities: ["Terrasse", "Phone booths", "Wi-fi fibre", "Parking vélo"],
  },
  {
    id: "la-verriere-bordeaux",
    slug: "la-verriere-bordeaux",
    name: "La Verrière",
    city: "Bordeaux",
    address: "27 cours de la Marne, 33800 Bordeaux",
    lat: 44.8288,
    lng: -0.573,
    description:
      "Une ancienne serre horticole convertie en espace partagé, à la lisière du quartier Saint-Michel. Beaucoup de plantes, une grande table commune, et deux salles de réunion.",
    amenities: ["Cuisine équipée", "Wi-fi fibre", "Salle calme", "Casiers"],
  },
  {
    id: "le-comptoir-lille",
    slug: "le-comptoir-lille",
    name: "Le Comptoir",
    city: "Lille",
    address: "5 rue du Molinel, 59800 Lille",
    lat: 50.639,
    lng: 3.063,
    description:
      "En plein Vieux-Lille, dans un immeuble en briques du 19e siècle. Ambiance feutrée, cabines téléphoniques, et un accueil qui connaît vos habitudes.",
    amenities: ["Café inclus", "Phone booths", "Wi-fi fibre", "Casiers"],
  },
];

export const SEED_SPACES: Space[] = [
  // Le Chantier
  {
    id: "chantier-flex",
    locationId: "le-chantier-lyon",
    name: "Poste flex",
    type: "poste-flex",
    capacity: 1,
    pricePerHour: 4,
    status: "active",
  },
  {
    id: "chantier-bureau",
    locationId: "le-chantier-lyon",
    name: "Bureau privé",
    type: "bureau-prive",
    capacity: 1,
    pricePerHour: 9,
    status: "active",
  },
  {
    id: "chantier-salle",
    locationId: "le-chantier-lyon",
    name: "Salle Ampère",
    type: "salle-reunion",
    capacity: 4,
    pricePerHour: 18,
    status: "active",
  },
  // Station 9
  {
    id: "station9-flex",
    locationId: "station-9-nantes",
    name: "Poste flex",
    type: "poste-flex",
    capacity: 1,
    pricePerHour: 4,
    status: "active",
  },
  {
    id: "station9-booth",
    locationId: "station-9-nantes",
    name: "Phone booth",
    type: "phone-booth",
    capacity: 1,
    pricePerHour: 3,
    status: "active",
  },
  {
    id: "station9-bureau",
    locationId: "station-9-nantes",
    name: "Bureau privé",
    type: "bureau-prive",
    capacity: 1,
    pricePerHour: 8,
    status: "active",
  },
  // La Verrière
  {
    id: "verriere-flex",
    locationId: "la-verriere-bordeaux",
    name: "Poste flex",
    type: "poste-flex",
    capacity: 1,
    pricePerHour: 4,
    status: "active",
  },
  {
    id: "verriere-salle",
    locationId: "la-verriere-bordeaux",
    name: "Salle de réunion",
    type: "salle-reunion",
    capacity: 6,
    pricePerHour: 22,
    status: "active",
  },
  {
    id: "verriere-bureau",
    locationId: "la-verriere-bordeaux",
    name: "Bureau privé",
    type: "bureau-prive",
    capacity: 1,
    pricePerHour: 9,
    status: "active",
  },
  // Le Comptoir
  {
    id: "comptoir-flex",
    locationId: "le-comptoir-lille",
    name: "Poste flex",
    type: "poste-flex",
    capacity: 1,
    pricePerHour: 4,
    status: "active",
  },
  {
    id: "comptoir-bureau",
    locationId: "le-comptoir-lille",
    name: "Bureau privé",
    type: "bureau-prive",
    capacity: 1,
    pricePerHour: 8,
    status: "active",
  },
  {
    id: "comptoir-salle",
    locationId: "le-comptoir-lille",
    name: "Salle de réunion",
    type: "salle-reunion",
    capacity: 4,
    pricePerHour: 17,
    status: "active",
  },
];

export const SEED_USERS: User[] = [
  {
    id: "u-camille",
    name: "Camille Roussel",
    email: "camille@example.com",
    role: "member",
    memberType: "freelance",
    credits: 42,
    avatarUrl: null,
    onboardingCompletedAt: "2026-01-15T09:00:00.000Z",
    createdAt: "2026-01-10T09:00:00.000Z",
  },
  {
    id: "u-admin",
    name: "Nadia Ferrand",
    email: "admin@example.com",
    role: "admin",
    memberType: "entreprise",
    credits: 0,
    avatarUrl: null,
    onboardingCompletedAt: "2025-11-02T09:00:00.000Z",
    createdAt: "2025-11-01T09:00:00.000Z",
  },
];

export const SEED_RESERVATIONS: Reservation[] = [];

export const SEED_PREFERENCES: Preference[] = [
  {
    id: "u-camille",
    userId: "u-camille",
    defaultLocationId: "le-chantier-lyon",
    theme: "system",
    notificationsEnabled: true,
  },
  {
    id: "u-admin",
    userId: "u-admin",
    defaultLocationId: null,
    theme: "system",
    notificationsEnabled: true,
  },
];
