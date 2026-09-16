import type { Metadata, Viewport } from "next";
import { Alegreya, Alegreya_Sans, Roboto_Mono } from "next/font/google";
import { SiteNav } from "@/components/nav/SiteNav";
import { SyncGate } from "@/components/sync/SyncGate";
import "./globals.css";

// Three faces, each with one job - this is what carries the field-guide
// register. Alegreya sets headings and body copy, Alegreya Sans the
// uppercase letterspaced section labels, Roboto Mono the plate numbers and
// figure captions. All three ship a Greek subset, which the whole UI needs.
const alegreya = Alegreya({
  variable: "--font-alegreya",
  subsets: ["latin", "greek"],
  weight: ["400", "500", "700", "800"],
  style: ["normal", "italic"],
});

const alegreyaSans = Alegreya_Sans({
  variable: "--font-alegreya-sans",
  subsets: ["latin", "greek"],
  weight: ["400", "700", "800"],
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin", "greek"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  // The site's name stays in English on purpose - it's the one bit of
  // "branding"; every piece of UI text below it is Greek.
  title: "Our Corner",
  description: "Η δική μας γωνιά — μόνο για εμάς, κάθε μέρα.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Matches the forest-green nav bar rather than the page, so the iOS
  // status bar reads as part of the header.
  themeColor: "#3a4a31",
  // Lets iOS extend the page under the notch/Dynamic Island and home
  // indicator so the env(safe-area-inset-*) values below actually apply,
  // instead of Safari just leaving that strip solid black.
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${alegreya.variable} ${alegreyaSans.variable} ${robotoMono.variable} h-full antialiased`}
    >
      {/* Background comes from globals.css (parchment + ruled grain) -
          don't re-add bg-paper here or it hides the grain. */}
      <body className="min-h-full flex flex-col text-ink">
        <SiteNav />
        <main className="flex-1" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
          <SyncGate>{children}</SyncGate>
        </main>
      </body>
    </html>
  );
}
