import { Suspense } from "react";
import Image from "next/image";

import { getLogoUrl } from "@/lib/db/content";
import { SITE_NAME } from "@/lib/site";

import { LoginForm } from "./LoginForm";

export const metadata = { title: "Sign in — Gergoci Admin" };

export default async function LoginPage() {
  const logoUrl = await getLogoUrl();

  return (
    <main className="relative flex flex-1 items-center justify-center overflow-hidden bg-brand-950 px-4 py-16 text-white">
      {/* Architectural mullion hairlines + a blue glow, echoing the public footer */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <span className="absolute left-1/4 top-0 h-full w-px bg-white/5" />
        <span className="absolute left-2/4 top-0 h-full w-px bg-white/5" />
        <span className="absolute left-3/4 top-0 h-full w-px bg-white/5" />
        <div className="absolute -top-40 left-1/2 h-96 w-[60rem] -translate-x-1/2 bg-[radial-gradient(closest-side,rgba(0,64,255,0.35),transparent)]" />
      </div>

      {/* Oversized faint wordmark backdrop */}
      <p
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 select-none text-center font-display text-[clamp(5rem,22vw,20rem)] leading-[0.8] tracking-tight text-white/[0.03]"
      >
        {SITE_NAME.toUpperCase()}
      </p>

      <div className="relative w-full max-w-sm">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-8 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)] backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <Image
              src={logoUrl}
              alt=""
              aria-hidden
              width={40}
              height={40}
              unoptimized
              className="h-10 w-10 object-contain"
            />
            <div>
              <h1 className="font-display text-xl tracking-tight">{SITE_NAME.toUpperCase()}</h1>
              <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.24em] text-brand-100/60">
                Admin dashboard
              </p>
            </div>
          </div>

          {/* useSearchParams in LoginForm requires a Suspense boundary to prerender */}
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>

        <p className="mt-6 text-center font-display text-xs tracking-[0.18em] text-white/30">
          PEJË · KOSOVË
        </p>
      </div>
    </main>
  );
}
