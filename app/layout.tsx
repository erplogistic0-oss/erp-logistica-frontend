import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LogiControl — IMPEMAR GROUP",
  description: "ERP Logística IMPEMAR GROUP",
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