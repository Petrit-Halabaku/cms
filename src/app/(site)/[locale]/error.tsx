"use client";

import { useEffect } from "react";

/** Public-site error boundary — bilingual, with a retry. */
export default function SiteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-32 text-center">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">
        Something went wrong · Diçka shkoi keq
      </h1>
      <p className="mt-3 max-w-md text-slate-600">
        Please try again in a moment. · Ju lutemi provoni përsëri pas pak.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-8 rounded-md bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-800"
      >
        Try again · Provo përsëri
      </button>
    </div>
  );
}
