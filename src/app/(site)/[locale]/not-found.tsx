import Link from "next/link";

/**
 * 404 inside the locale tree. not-found.tsx receives no params, so it shows
 * both languages.
 */
export default function NotFound() {
  return (
    <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-4 py-32 text-center">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <span className="absolute top-0 left-1/4 h-full w-px bg-line/70" />
        <span className="absolute top-0 left-2/4 h-full w-px bg-line/70" />
        <span className="absolute top-0 left-3/4 h-full w-px bg-line/70" />
      </div>
      <p className="relative font-serif text-2xl italic text-brand-700">404</p>
      <h1 className="relative mt-3 font-display text-3xl text-slate-900 sm:text-5xl">
        Page not found · Faqja nuk u gjet
      </h1>
      <p className="relative mt-5 max-w-md text-slate-600">
        The page you are looking for does not exist or has moved.
        <br />
        Faqja që kërkoni nuk ekziston ose është zhvendosur.
      </p>
      <div className="relative mt-9 flex gap-3">
        <Link
          href="/"
          className="rounded-full bg-brand-700 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-800"
        >
          Back to homepage
        </Link>
        <Link
          href="/sq"
          className="rounded-full border border-brand-700 px-6 py-3 text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-50"
        >
          Kthehu në ballinë
        </Link>
      </div>
    </div>
  );
}
