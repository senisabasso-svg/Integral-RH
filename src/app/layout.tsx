import type { Metadata } from "next";
import { APP_NAME, APP_TAGLINE } from "@/lib/dominio";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: APP_NAME, template: `%s | ${APP_NAME}` },
  description: `${APP_TAGLINE}. Selección de personal, consultoría legal, contabilidad, coaching, psicología organizacional y medicina laboral.`,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-slate-50 font-sans text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
