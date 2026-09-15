import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/session";
import { getUserById } from "@/lib/data/users";
import { MEMBER_TYPE_LABELS } from "@/types/domain";
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
  const admin = await requireAdmin();
  const user = await getUserById(id);
  if (!user) notFound();

  const boundAction = updateUserAdminAction.bind(null, user.id);

  return (
    <div className="mx-auto max-w-md px-8 py-12">
      <h1 className="font-display text-2xl font-medium text-ink">{user.name}</h1>
      <p className="mt-1 text-sm text-ink-muted">{user.email}</p>

      <dl className="mt-6 divide-y divide-line border-t border-line text-sm">
        <div className="flex justify-between py-3">
          <dt className="text-ink-muted">Type</dt>
          <dd className="text-ink">
            {user.memberType ? MEMBER_TYPE_LABELS[user.memberType] : "—"}
          </dd>
        </div>
        <div className="flex justify-between py-3">
          <dt className="text-ink-muted">Membre depuis</dt>
          <dd className="text-ink">
            {new Date(user.createdAt).toLocaleDateString("fr-FR", { dateStyle: "long" })}
          </dd>
        </div>
      </dl>

      <div className="mt-8 border-t border-line pt-8">
        <UserForm user={user} isSelf={user.id === admin.id} action={boundAction} />
      </div>
    </div>
  );
}
