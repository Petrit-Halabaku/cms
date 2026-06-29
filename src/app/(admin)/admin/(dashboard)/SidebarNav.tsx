"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileText,
  FolderTree,
  HelpCircle,
  Image as ImageIcon,
  Handshake,
  LayoutDashboard,
  Package,
  Palette,
  Users,
  type LucideIcon,
} from "lucide-react";

type NavItem = { href: string; label: string; icon: LucideIcon; adminOnly?: boolean };

const NAV: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/pages", label: "Pages", icon: FileText },
  { href: "/admin/media", label: "Media", icon: ImageIcon },
  { href: "/admin/partners", label: "Partners", icon: Handshake },
  { href: "/admin/faqs", label: "FAQs", icon: HelpCircle },
  { href: "/admin/branding", label: "Branding", icon: Palette },
  { href: "/admin/users", label: "Users", icon: Users, adminOnly: true },
];

export function SidebarNav({ isAdmin = false }: { isAdmin?: boolean }) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  const items = NAV.filter((item) => !item.adminOnly || isAdmin);

  return (
    <nav className="flex-1 space-y-1 p-3" aria-label="Admin sections">
      {items.map((item) => {
        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              active
                ? "bg-white/[0.08] text-white"
                : "text-white/55 hover:bg-white/5 hover:text-white"
            }`}
          >
            {active && (
              <span
                aria-hidden
                className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-brand-200"
              />
            )}
            <item.icon
              className={`h-4 w-4 shrink-0 transition-colors ${
                active ? "text-brand-200" : "text-white/40 group-hover:text-white/70"
              }`}
              aria-hidden
            />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
