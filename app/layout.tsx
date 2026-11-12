import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Budgo | Viajes según tu presupuesto",
  description:
    "Planifica escapadas según tu presupuesto. Compara propuestas y confirma precio y disponibilidad con el proveedor de reserva.",
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
