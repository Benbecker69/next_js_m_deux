// Seeds the database with the same demo data the old mock layer shipped
// with. Runs standalone (via `npm run db:seed` / `prisma db seed`), outside
// the Next.js server runtime — no `@/` alias, no "server-only" import.
import { randomBytes, scryptSync } from "node:crypto";
import { PrismaPg } from "@prisma/adapter-pg";
// Explicit /index.js: this script runs through plain `node` (see
// package.json's `prisma.migrations.seed`), whose stricter ESM resolver
// doesn't do directory-import resolution the way bundlers/TS do — unlike
// the `@/generated/prisma` alias used from application code.
import { PrismaClient } from "../src/generated/prisma/index.js";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// Mirrors src/lib/auth/password.ts's hashPassword, kept in sync manually —
// duplicated because that module is server-only and this script runs
// through plain `node`, not the Next.js server runtime.
function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = scryptSync(password, salt, 64);
  return `${salt}:${derivedKey.toString("hex")}`;
}

const DEMO_PASSWORD = "demo1234";

const LOCATIONS = [
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

const SPACES = [
  // Le Chantier
  {
    id: "chantier-flex",
    locationId: "le-chantier-lyon",
    name: "Poste flex",
    type: "poste-flex",
    capacity: 1,
    pricePerHour: 4,
    status: "active" as const,
  },
  {
    id: "chantier-bureau",
    locationId: "le-chantier-lyon",
    name: "Bureau privé",
    type: "bureau-prive",
    capacity: 1,
    pricePerHour: 9,
    status: "active" as const,
  },
  {
    id: "chantier-salle",
    locationId: "le-chantier-lyon",
    name: "Salle Ampère",
    type: "salle-reunion",
    capacity: 4,
    pricePerHour: 18,
    status: "active" as const,
  },
  // Station 9
  {
    id: "station9-flex",
    locationId: "station-9-nantes",
    name: "Poste flex",
    type: "poste-flex",
    capacity: 1,
    pricePerHour: 4,
    status: "active" as const,
  },
  {
    id: "station9-booth",
    locationId: "station-9-nantes",
    name: "Phone booth",
    type: "phone-booth",
    capacity: 1,
    pricePerHour: 3,
    status: "active" as const,
  },
  {
    id: "station9-bureau",
    locationId: "station-9-nantes",
    name: "Bureau privé",
    type: "bureau-prive",
    capacity: 1,
    pricePerHour: 8,
    status: "active" as const,
  },
  // La Verrière
  {
    id: "verriere-flex",
    locationId: "la-verriere-bordeaux",
    name: "Poste flex",
    type: "poste-flex",
    capacity: 1,
    pricePerHour: 4,
    status: "active" as const,
  },
  {
    id: "verriere-salle",
    locationId: "la-verriere-bordeaux",
    name: "Salle de réunion",
    type: "salle-reunion",
    capacity: 6,
    pricePerHour: 22,
    status: "active" as const,
  },
  {
    id: "verriere-bureau",
    locationId: "la-verriere-bordeaux",
    name: "Bureau privé",
    type: "bureau-prive",
    capacity: 1,
    pricePerHour: 9,
    status: "active" as const,
  },
  // Le Comptoir
  {
    id: "comptoir-flex",
    locationId: "le-comptoir-lille",
    name: "Poste flex",
    type: "poste-flex",
    capacity: 1,
    pricePerHour: 4,
    status: "active" as const,
  },
  {
    id: "comptoir-bureau",
    locationId: "le-comptoir-lille",
    name: "Bureau privé",
    type: "bureau-prive",
    capacity: 1,
    pricePerHour: 8,
    status: "active" as const,
  },
  {
    id: "comptoir-salle",
    locationId: "le-comptoir-lille",
    name: "Salle de réunion",
    type: "salle-reunion",
    capacity: 4,
    pricePerHour: 17,
    status: "active" as const,
  },
];

const USERS = [
  {
    id: "u-camille",
    name: "Camille Roussel",
    email: "camille@example.com",
    role: "member" as const,
    memberType: "freelance" as const,
    credits: 250,
    onboardingCompletedAt: new Date("2026-01-15T09:00:00.000Z"),
    createdAt: new Date("2026-01-10T09:00:00.000Z"),
  },
  {
    id: "u-admin",
    name: "Nadia Ferrand",
    email: "admin@example.com",
    role: "admin" as const,
    memberType: "entreprise" as const,
    credits: 500,
    onboardingCompletedAt: new Date("2025-11-02T09:00:00.000Z"),
    createdAt: new Date("2025-11-01T09:00:00.000Z"),
  },
];

async function main() {
  for (const location of LOCATIONS) {
    await prisma.location.upsert({
      where: { id: location.id },
      update: location,
      create: location,
    });
  }
  console.log(`Seeded ${LOCATIONS.length} locations.`);

  for (const space of SPACES) {
    await prisma.space.upsert({ where: { id: space.id }, update: space, create: space });
  }
  console.log(`Seeded ${SPACES.length} spaces.`);

  const passwordHash = hashPassword(DEMO_PASSWORD);
  for (const user of USERS) {
    await prisma.user.upsert({
      where: { id: user.id },
      update: { ...user, passwordHash },
      create: { ...user, passwordHash },
    });
    await prisma.preference.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id },
    });
  }
  console.log(`Seeded ${USERS.length} users (demo password: "${DEMO_PASSWORD}").`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
