import type { Metadata } from "next";
import { Archivo } from "next/font/google";

import "../globals.css";

/** Root layout for the admin tree — English only, never indexed. */

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Gergoci Admin",
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${archivo.variable} h-full`}>
      <body className="flex min-h-full flex-col bg-slate-50">{children}</body>
    </html>
  );
}
