"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdmin } from "@/lib/admin/auth";
import type { ActionResult } from "@/lib/admin/actions/products";
import { createServiceClient } from "@/lib/supabase/service";

const createUserSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["admin", "editor"]),
});

export type CreateUserPayload = z.infer<typeof createUserSchema>;

/**
 * Create a new dashboard user. Admin-only. Creates the auth user with the
 * service role (RLS forbids writing to `profiles` from a normal session) and
 * writes the matching profile row that grants dashboard access. New users
 * default to `editor`: full content access, but no user management.
 */
export async function createUser(payload: CreateUserPayload): Promise<ActionResult> {
  // Outside the try so an auth redirect propagates instead of being swallowed.
  await requireAdmin();

  const parsed = createUserSchema.safeParse(payload);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid data" };
  }
  const { email, password, role } = parsed.data;

  try {
    const service = createServiceClient();

    const { data: created, error: createError } = await service.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (createError || !created.user) {
      const duplicate = createError?.message?.toLowerCase().includes("already");
      return {
        ok: false,
        error: duplicate
          ? "A user with that email already exists."
          : createError?.message ?? "Could not create user.",
      };
    }

    const { error: profileError } = await service
      .from("profiles")
      .insert({ id: created.user.id, role });
    if (profileError) {
      // Roll back the orphaned auth user so the email can be reused.
      await service.auth.admin.deleteUser(created.user.id);
      return { ok: false, error: `Could not assign a role: ${profileError.message}` };
    }

    revalidatePath("/admin/users");
    return { ok: true, id: created.user.id };
  } catch (err) {
    console.error("createUser failed:", err);
    return { ok: false, error: err instanceof Error ? err.message : "Could not create user." };
  }
}

/**
 * Delete a dashboard user. Admin-only. This is a HARD delete: the auth user is
 * permanently removed (not soft-deleted), which cascades to the `profiles` row
 * via the FK. Admins cannot delete their own account, which prevents accidental
 * self-lockout.
 */
export async function deleteUser(userId: string): Promise<ActionResult> {
  const { user } = await requireAdmin();

  if (!userId) return { ok: false, error: "Missing user id." };
  if (userId === user.id) {
    return { ok: false, error: "You cannot delete your own account." };
  }

  try {
    const service = createServiceClient();
    // shouldSoftDelete = false → permanent hard delete from auth.users.
    const { error } = await service.auth.admin.deleteUser(userId, false);
    if (error) {
      return { ok: false, error: error.message ?? "Could not delete user." };
    }

    revalidatePath("/admin/users");
    return { ok: true, id: userId };
  } catch (err) {
    console.error("deleteUser failed:", err);
    return { ok: false, error: err instanceof Error ? err.message : "Could not delete user." };
  }
}
