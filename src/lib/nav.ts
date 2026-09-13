import type { IconKind } from "@/components/icons/NavIcons";

export interface NavSection {
  key: string;
  href: string;
  label: string;
  labelEl: string;
  icon: IconKind;
}

// Greek is the primary label everywhere; the English name survives only as
// the small secondary line in the drawer (`labelEl` kept as the field name
// so existing call sites don't all have to change shape).
export const NAV_SECTIONS: NavSection[] = [
  { key: "home", href: "/", label: "Αρχική", labelEl: "Home", icon: "home" },
  { key: "clinic", href: "/clinic", label: "Το Ιατρείο", labelEl: "The Clinic", icon: "clinic" },
  { key: "plants", href: "/plants", label: "Κήπος", labelEl: "Garden", icon: "plants" },
  { key: "kitchen", href: "/kitchen", label: "Κουζίνα", labelEl: "Kitchen", icon: "kitchen" },
  { key: "discover", href: "/discover", label: "Ανακάλυψε", labelEl: "Discover", icon: "discover" },
  { key: "mind", href: "/mind", label: "Ψυχή", labelEl: "Mind", icon: "mind" },
  { key: "us", href: "/us", label: "Εμείς", labelEl: "Us", icon: "us" },
];
