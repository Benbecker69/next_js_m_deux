// Core domain types — shared by the mock data layer (src/lib/data) and,
// unchanged, by whatever real database replaces it later (see CLAUDE.md).

export type UserRole = "member" | "admin";
export type MemberType = "freelance" | "entreprise" | "etudiant";

export const MEMBER_TYPE_LABELS: Record<MemberType, string> = {
  freelance: "Freelance",
  entreprise: "Entreprise",
  etudiant: "Étudiant",
};

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  memberType: MemberType | null;
  credits: number;
  avatarUrl: string | null;
  onboardingCompletedAt: string | null; // ISO date, null until onboarding is done
  createdAt: string; // ISO date
};

export type Location = {
  id: string;
  slug: string;
  name: string;
  city: string;
  address: string;
  lat: number;
  lng: number;
  description: string;
  amenities: string[];
};

export type SpaceType = "poste-flex" | "bureau-prive" | "salle-reunion" | "phone-booth";
export type SpaceStatus = "active" | "maintenance";

export const SPACE_TYPE_LABELS: Record<SpaceType, string> = {
  "poste-flex": "Poste flex",
  "bureau-prive": "Bureau privé",
  "salle-reunion": "Salle de réunion",
  "phone-booth": "Phone booth",
};

export type Space = {
  id: string;
  locationId: string;
  name: string;
  type: SpaceType;
  capacity: number;
  pricePerHour: number; // credits
  status: SpaceStatus;
};

export type ReservationStatus = "confirmed" | "cancelled" | "completed";

export type Reservation = {
  id: string;
  userId: string;
  spaceId: string;
  startAt: string; // ISO datetime
  endAt: string; // ISO datetime
  status: ReservationStatus;
  creditsSpent: number;
  createdAt: string; // ISO datetime
};

export type Theme = "light" | "dark" | "system";

export type Preference = {
  id: string; // same value as userId — kept so Preference fits createCollection<T>
  userId: string;
  defaultLocationId: string | null;
  theme: Theme;
  notificationsEnabled: boolean;
};
