import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "timectrl",
  description: "Enkel registrering av tid når arbeidsdagen består av mange små prosjektbytter.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "timectrl", statusBarStyle: "black-translucent" },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg", apple: "/timectrl-icon-180.png" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="no"><body>{children}</body></html>;
}
