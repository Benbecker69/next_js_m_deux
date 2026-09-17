import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { requireAdmin } from "@/lib/auth/session";
import { getUserById } from "@/lib/data/users";
import { listReservationsByUser } from "@/lib/data/reservations";
import { listSpaces } from "@/lib/data/spaces";
import { listLocations } from "@/lib/data/locations";
import { MEMBER_TYPE_LABELS, RESERVATION_STATUS_LABELS } from "@/types/domain";
import { getLocale, getDictionary, INTL_LOCALE } from "@/lib/i18n/locale";
import { UserForm } from "./_components/user-form";
import { updateUserAdminAction } from "./_actions";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const user = await getUserById(id);
  return { title: user ? user.name : "Utilisateur" };
}

export default async function AdminUserDetailPage({
  params,
}: PageProps<"/admin/utilisateurs/[id]">) {
  const { id } = await params;
  const [admin, user, locale] = await Promise.all([
    requireAdmin(),
    getUserById(id),
    getLocale(),
  ]);
  if (!user) notFound();
  const t = getDictionary(locale);

  const [reservations, spaces, locations] = await Promise.all([
    listReservationsByUser(user.id),
    listSpaces(),
    listLocations(),
  ]);
  const sortedReservations = [...reservations].sort(
    (a, b) => new Date(b.startAt).getTime() - new Date(a.startAt).getTime(),
  );

  const boundAction = updateUserAdminAction.bind(null, user.id);

  return (
    <div className="mx-auto max-w-4xl px-5 py-10 sm:px-8 sm:py-12">
      <h1 className="font-display text-2xl font-medium text-ink">{user.name}</h1>
      <p className="mt-1 text-sm text-ink-muted">{user.email}</p>

      <div className="mt-8 grid gap-12 md:grid-cols-2">
        <div>
          <dl className="divide-y divide-line border-t border-line text-sm">
            <div className="flex justify-between py-3">
              <dt className="text-ink-muted">{t.adminUserDetail.type}</dt>
              <dd className="text-ink">
                {user.memberType ? MEMBER_TYPE_LABELS[user.memberType] : "—"}
              </dd>
            </div>
            <div className="flex justify-between py-3">
              <dt className="text-ink-muted">{t.adminUserDetail.memberSince}</dt>
              <dd className="text-ink">
                {new Date(user.createdAt).toLocaleDateString(INTL_LOCALE[locale], {
                  dateStyle: "long",
                })}
              </dd>
            </div>
          </dl>

          <div className="mt-8 border-t border-line pt-8">
            <UserForm
              user={user}
              isSelf={user.id === admin.id}
              action={boundAction}
              t={t.adminUserDetail}
              genericError={t.errors.generic}
            />
          </div>
        </div>

        <div>
          <h2 className="font-display text-lg font-medium text-ink">
            {t.adminUserDetail.reservationsTitle}
          </h2>
          {sortedReservations.length === 0 ? (
            <p className="mt-4 text-sm text-ink-muted">
              {t.adminUserDetail.noReservations}
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-line border-t border-line">
              {sortedReservations.map((reservation) => {
                const space = spaces.find((item) => item.id === reservation.spaceId);
                const location = space
                  ? locations.find((item) => item.id === space.locationId)
                  : null;
                const badge = RESERVATION_STATUS_LABELS[reservation.status];
                return (
                  <li key={reservation.id} className="py-3 text-sm">
                    <Link
                      href={`/admin/reservations/${reservation.id}`}
                      className="flex flex-col gap-2 transition-colors hover:text-pine sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                    >
                      <div className="min-w-0">
                        <p className="text-ink">
                          {space?.name ?? "Espace"} · {location?.name ?? ""}
                        </p>
                        <p className="mt-1 text-xs text-ink-muted">
                          {new Date(reservation.startAt).toLocaleString(
                            INTL_LOCALE[locale],
                            { dateStyle: "medium", timeStyle: "short" },
                          )}
                        </p>
                      </div>
                      <Badge variant={badge.variant}>{badge.label}</Badge>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
