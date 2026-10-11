"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AlertTriangle, Trash2, UserPlus, X } from "lucide-react";

import { createUser, deleteUser } from "@/lib/admin/actions/users";

export type AdminUser = {
  id: string;
  email: string;
  role: "admin" | "editor";
  createdAt: string;
  lastSignInAt: string | null;
};

const ROLE_LABEL: Record<AdminUser["role"], string> = {
  admin: "Admin",
  editor: "Editor",
};

function formatDate(value: string | null) {
  if (!value) return "Never";
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function UsersManager({
  users,
  currentUserId,
}: {
  users: AdminUser[];
  currentUserId: string;
}) {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<AdminUser["role"]>("editor");
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [pendingDelete, setPendingDelete] = useState<AdminUser | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [rowError, setRowError] = useState<string | null>(null);

  async function onCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCreating(true);
    setFormError(null);

    const result = await createUser({ email, password, role });
    if (!result.ok) {
      setFormError(result.error);
      setCreating(false);
      return;
    }

    setEmail("");
    setPassword("");
    setRole("editor");
    setCreating(false);
    router.refresh();
  }

  const closeDeleteModal = () => {
    if (!deleting) setPendingDelete(null);
  };

  async function confirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    setRowError(null);

    const result = await deleteUser(pendingDelete.id);
    if (!result.ok) {
      setRowError(result.error);
      setDeleting(false);
      setPendingDelete(null);
      return;
    }

    setDeleting(false);
    setPendingDelete(null);
    router.refresh();
  }

  // Close the confirm dialog on Escape.
  useEffect(() => {
    if (!pendingDelete) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !deleting) setPendingDelete(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pendingDelete, deleting]);

  const inputClass =
    "w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 transition-colors focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600";

  return (
    <div className="mt-8 space-y-8">
      {/* Add user */}
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <UserPlus className="h-4 w-4 text-brand-700" aria-hidden />
          Add a user
        </h2>
        <form onSubmit={onCreate} className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-1">
            <label htmlFor="new-email" className="block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              id="new-email"
              type="email"
              required
              autoComplete="off"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`mt-1.5 ${inputClass}`}
            />
          </div>
          <div className="sm:col-span-1">
            <label htmlFor="new-password" className="block text-sm font-medium text-slate-700">
              Temporary password
            </label>
            <input
              id="new-password"
              type="text"
              required
              minLength={8}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              className={`mt-1.5 ${inputClass}`}
            />
          </div>
          <div className="sm:col-span-2">
            <span className="block text-sm font-medium text-slate-700">Role</span>
            <div className="mt-2 grid gap-3 sm:grid-cols-2">
              {(["editor", "admin"] as const).map((value) => (
                <label
                  key={value}
                  className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
                    role === value
                      ? "border-brand-600 bg-brand-50/60 ring-1 ring-brand-600"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={value}
                    checked={role === value}
                    onChange={() => setRole(value)}
                    className="mt-0.5 accent-brand-700"
                  />
                  <span>
                    <span className="block text-sm font-semibold text-slate-900">
                      {ROLE_LABEL[value]}
                    </span>
                    <span className="block text-xs text-slate-500">
                      {value === "editor"
                        ? "Edit all content. Cannot manage users."
                        : "Full access, including managing users."}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </div>

          {formError && (
            <p className="sm:col-span-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {formError}
            </p>
          )}

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={creating}
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <UserPlus className="h-4 w-4" aria-hidden />
              {creating ? "Adding…" : "Add user"}
            </button>
            <p className="mt-2 text-xs text-slate-500">
              Share the email and temporary password with them. They can use it to sign in right
              away.
            </p>
          </div>
        </form>
      </section>

      {/* User list */}
      <section>
        {rowError && (
          <p className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {rowError}
          </p>
        )}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Last sign-in</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => {
                const isSelf = u.id === currentUserId;
                return (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {u.email}
                      {isSelf && <span className="ml-2 text-xs text-slate-400">(you)</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          u.role === "admin"
                            ? "bg-brand-50 text-brand-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {ROLE_LABEL[u.role]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{formatDate(u.lastSignInAt)}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => setPendingDelete(u)}
                        disabled={isSelf}
                        title={isSelf ? "You cannot delete your own account" : "Remove user"}
                        className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:text-slate-300 disabled:hover:bg-transparent"
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden />
                        Remove
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Delete confirmation modal */}
      {pendingDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-brand-950/60 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-user-title"
          onClick={closeDeleteModal}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_30px_80px_-20px_rgba(1,38,83,0.5)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
                <AlertTriangle className="h-5 w-5" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.24em] text-red-600">
                      Confirm
                    </p>
                    <h2
                      id="delete-user-title"
                      className="mt-0.5 font-display text-xl tracking-tight text-slate-900"
                    >
                      Remove user
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={closeDeleteModal}
                    disabled={deleting}
                    aria-label="Close"
                    className="text-slate-400 transition-colors hover:text-slate-600 disabled:opacity-50"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <p className="mt-2 text-sm text-slate-600">
                  Permanently delete <strong className="text-slate-900">{pendingDelete.email}</strong>?
                  This <strong>cannot be undone</strong> — their account is erased and they lose
                  dashboard access immediately.
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeDeleteModal}
                disabled={deleting}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleting}
                className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" aria-hidden />
                {deleting ? "Removing…" : "Delete user"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
