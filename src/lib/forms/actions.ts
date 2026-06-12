"use server";

import { headers } from "next/headers";
import { z } from "zod";

import type { Locale } from "@/lib/database.types";
import { getDictionary } from "@/lib/i18n/dictionary";
import { createStaticClient } from "@/lib/supabase/static";

export type FormState = {
  status: "idle" | "success" | "error";
  message: string;
};

/**
 * Contact + quote form submissions.
 *  - zod validation, localized error messages
 *  - honeypot field ("website") — bots get a fake success
 *  - basic per-IP rate limit (5/hour, in-memory sliding window)
 *  - row inserted into form_submissions (anon RLS INSERT policy)
 *  - notification email via EmailJS server-side REST (no client fetch)
 */

const localeSchema = z.enum(["en", "sq"]).catch("en");

const contactSchema = z.object({
  name: z.string().trim().min(2),
  phone: z.string().trim().min(5),
  email: z.string().trim().email().or(z.literal("")),
  message: z.string().trim().min(5).max(5000),
});

const quoteSchema = z.object({
  name: z.string().trim().min(2),
  phone: z.string().trim().min(5),
  email: z.string().trim().email().or(z.literal("")),
  category: z.string().trim().min(1),
  dimensions: z.string().trim().max(200).optional().default(""),
  quantity: z.string().trim().max(20).optional().default(""),
  message: z.string().trim().max(5000).optional().default(""),
});

// --- rate limiting ----------------------------------------------------------

const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  // Opportunistic cleanup so the map cannot grow unbounded.
  if (hits.size > 10_000) {
    for (const [key, times] of hits) {
      if (times.every((t) => now - t >= WINDOW_MS)) hits.delete(key);
    }
  }
  return false;
}

async function clientIp(): Promise<string> {
  const headerStore = await headers();
  return (
    headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headerStore.get("x-real-ip") ??
    "unknown"
  );
}

// --- email notification -----------------------------------------------------

async function sendNotification(
  formType: "contact" | "quote",
  payload: Record<string, string>,
  locale: Locale,
): Promise<void> {
  const serviceId = process.env.EMAILJS_SERVICE_ID;
  const templateId =
    formType === "contact"
      ? process.env.EMAILJS_TEMPLATE_ID_CONTACT
      : process.env.EMAILJS_TEMPLATE_ID_QUOTE;
  const publicKey = process.env.EMAILJS_PUBLIC_KEY;
  const privateKey = process.env.EMAILJS_PRIVATE_KEY;
  const notifyEmail = process.env.NOTIFY_EMAIL;

  if (!serviceId || !templateId || !publicKey || !privateKey) {
    console.warn(`[forms] EmailJS not configured — skipped ${formType} notification email.`);
    return;
  }

  const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      service_id: serviceId,
      template_id: templateId,
      user_id: publicKey,
      accessToken: privateKey,
      template_params: {
        ...payload,
        form_type: formType,
        locale,
        notify_email: notifyEmail ?? "",
        submitted_at: new Date().toISOString(),
      },
    }),
  });
  if (!response.ok) {
    console.error(`[forms] EmailJS send failed (${response.status}): ${await response.text()}`);
  }
}

// --- shared submit pipeline ---------------------------------------------------

async function handleSubmission(
  formType: "contact" | "quote",
  schema: typeof contactSchema | typeof quoteSchema,
  formData: FormData,
): Promise<FormState> {
  const locale = localeSchema.parse(formData.get("locale"));
  const dict = getDictionary(locale);

  // Honeypot: real users never fill this; bots get a quiet "success".
  if (String(formData.get("website") ?? "") !== "") {
    return { status: "success", message: dict.form.success };
  }

  if (rateLimited(await clientIp())) {
    return { status: "error", message: dict.form.rateLimited };
  }

  const raw = Object.fromEntries(
    [...formData.entries()].filter(([, value]) => typeof value === "string"),
  ) as Record<string, string>;
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return { status: "error", message: dict.form.invalid };
  }

  const payload = Object.fromEntries(
    Object.entries(parsed.data).filter(([, value]) => value !== ""),
  ) as Record<string, string>;

  const supabase = createStaticClient(); // anon — RLS permits only this INSERT
  const { error } = await supabase
    .from("form_submissions")
    .insert({ form_type: formType, payload, locale });
  if (error) {
    console.error(`[forms] insert failed: ${error.message}`);
    return { status: "error", message: dict.form.error };
  }

  // Email failures are logged but never block the user-facing success.
  try {
    await sendNotification(formType, payload, locale);
  } catch (cause) {
    console.error("[forms] notification failed:", cause);
  }

  return { status: "success", message: dict.form.success };
}

export async function submitContact(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  return handleSubmission("contact", contactSchema, formData);
}

export async function submitQuote(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  return handleSubmission("quote", quoteSchema, formData);
}
