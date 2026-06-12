import { Suspense } from "react";

import { LoginForm } from "./LoginForm";

export const metadata = { title: "Sign in — Gergoci Admin" };

export default function LoginPage() {
  return (
    <div className="flex flex-1 items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-bold tracking-tight text-brand-800">GERGOCI</h1>
        <p className="mt-1 text-sm text-slate-500">Admin dashboard</p>
        {/* useSearchParams in LoginForm requires a Suspense boundary to prerender */}
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
