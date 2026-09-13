"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/clinic", label: "Σημερινή Περίπτωση" },
  { href: "/clinic/sanctuary", label: "Καταφύγιο" },
] as const;

export function ClinicTabs() {
  const pathname = usePathname();

  return (
    <nav aria-label="Ενότητες Ιατρείου" className="mx-auto flex max-w-md gap-1 px-4 pt-4">
      {TABS.map((tab) => {
        const isActive = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex-1 rounded-full px-3 py-2 text-center text-xs font-medium transition-colors ${
              isActive ? "bg-terracotta text-paper" : "bg-terracotta-tint text-clay hover:bg-terracotta/25"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
