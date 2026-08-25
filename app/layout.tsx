import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Budgo",
  description:
    "Tu presupuesto marca el camino. Budgo encuentra el alojamiento perfecto.",
  icons: {
    icon: "/budgo-logo.png",
    shortcut: "/budgo-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
