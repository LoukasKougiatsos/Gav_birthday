"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_SECTIONS } from "@/lib/nav";
import { NavIcon } from "@/components/icons/NavIcons";
import { SECTION_ACCENT } from "@/components/ui/accents";

export function SiteNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [lastPathname, setLastPathname] = useState(pathname);

  // Close the drawer whenever the route changes (React's "adjust state
  // during render" pattern, so this doesn't trigger an extra effect pass).
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setOpen(false);
  }

  const current = NAV_SECTIONS.find((s) => (s.href === "/" ? pathname === "/" : pathname.startsWith(s.href)));

  return (
    <>
      {/* The guide's masthead: forest-green band, terracotta letterpress
          rule beneath it, uppercase label on the left and the plate number
          on the right. */}
      <header
        className="sticky top-0 z-40 flex items-center justify-between border-b-[3px] border-terracotta bg-forest py-3 text-paper"
        style={{
          paddingTop: "calc(0.75rem + env(safe-area-inset-top))",
          paddingLeft: "calc(1rem + env(safe-area-inset-left))",
          paddingRight: "calc(1rem + env(safe-area-inset-right))",
        }}
      >
        <span className="flex items-center gap-2.5 font-[family-name:var(--font-label)] text-[13px] font-extrabold tracking-[0.18em] uppercase">
          <NavIcon kind={current?.icon ?? "home"} className="h-5 w-5" />
          {current?.label ?? "Αρχική"}
        </span>
        <button
          type="button"
          aria-label={open ? "Κλείσιμο μενού" : "Άνοιγμα μενού"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="flex h-10 w-10 items-center justify-center rounded-sm text-paper transition-colors hover:bg-paper/15 active:bg-paper/25"
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
            {open ? (
              <path d="M6 6l12 12M18 6 6 18" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>
      </header>

      {/* Backdrop */}
      <div
        onClick={() => setOpen(false)}
        aria-hidden="true"
        className={`fixed inset-0 z-40 bg-ink/40 transition-opacity duration-200 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* Drawer - the guide's contents page */}
      <nav
        aria-label="Ενότητες"
        className={`fixed inset-y-0 right-0 z-50 flex w-72 max-w-[85vw] flex-col overflow-y-auto border-l-[3px] border-forest bg-paper p-4 shadow-xl transition-transform duration-200 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        style={{
          paddingTop: "calc(1.5rem + env(safe-area-inset-top))",
          paddingRight: "calc(1rem + env(safe-area-inset-right))",
          paddingBottom: "calc(1rem + env(safe-area-inset-bottom))",
        }}
      >
        <p className="plate-rule mb-3">Περιεχόμενα</p>
        <div className="flex flex-col">
          {NAV_SECTIONS.map((section, i) => {
            const isActive = section.href === "/" ? pathname === "/" : pathname.startsWith(section.href);
            return (
              <Link
                key={section.key}
                href={section.href}
                className={`flex items-center gap-3 border-b border-ink/10 px-1 py-3 transition-colors ${
                  isActive ? "bg-terracotta-tint text-clay" : "text-ink hover:bg-sand/50"
                }`}
              >
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-sm ${SECTION_ACCENT[section.icon].badge}`}
                >
                  <NavIcon kind={section.icon} className="h-5 w-5" />
                </span>
                <span className="flex min-w-0 flex-col leading-tight">
                  <span className="text-[17px] font-bold">{section.label}</span>
                  <span className="plate-label">{section.labelEl}</span>
                </span>
                <span className="plate-label ml-auto shrink-0">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
