import type { Metadata } from 'next';
import './globals.css';
import { site } from '@/content/site';
export const metadata: Metadata = {
  title: `${site.name} ${site.descriptor} — Viviendas con carácter mediterráneo`,
  description:
    'Encuentra tu próxima vivienda en la Costa Brava. Selección ficticia de casas, villas y apartamentos mediterráneos. Web de demostración.',
  robots: { index: false, follow: false },
  icons: { icon: '/favicon.svg' },
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
