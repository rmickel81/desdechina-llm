import type { Metadata } from 'next';
import { Fraunces, Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

// Las dos de la portada. Son las mismas que usa desdechina.es, para que las
// dos webs se reconozcan como de la misma casa. `display: swap` es
// obligatorio: sin él, el titular protagonista parpadea al cargar.
const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
  axes: ['SOFT', 'WONK', 'opsz'],
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'DesdeChina LLM',
  description:
    'Trabaja con los mejores modelos de IA china usando tu propia API key de OpenRouter',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${inter.variable} ${fraunces.variable} ${mono.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
