import Link from "next/link";

/**
 * 404 inside the locale tree. not-found.tsx receives no params, so it shows
 * both languages.
 */
export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-32 text-center">
      <p className="text-sm font-semibold text-brand-700">404</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
        Page not found · Faqja nuk u gjet
      </h1>
      <p className="mt-4 max-w-md text-slate-600">
        The page you are looking for does not exist or has moved.
        <br />
        Faqja që kërkoni nuk ekziston ose është zhvendosur.
      </p>
      <div className="mt-8 flex gap-3">
        <Link
          href="/"
          className="rounded-md bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-800"
        >
          Back to homepage
        </Link>
        <Link
          href="/sq"
          className="rounded-md border border-brand-700 px-5 py-2.5 text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-50"
        >
          Kthehu në ballinë
        </Link>
      </div>
    </div>
  );
}
