import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "TransitFlow SN — Logistique et douane",
    template: "%s | TransitFlow SN",
  },
  description:
    "Plateforme de gestion des expéditions, documents douaniers et suivis maritimes au Sénégal.",
  keywords: [
    "logistique Sénégal",
    "transitaire",
    "import export",
    "suivi conteneur",
    "gestion douanière",
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
