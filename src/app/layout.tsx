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
  // Esta frase es la que sale en Google y la que se pega al compartir el
  // enlace, y decía justo lo contrario de lo que hace la aplicación: que hace
  // falta una clave propia de OpenRouter. No hace falta ninguna; la pone la
  // instalación. Con cuenta de correo y contraseña basta.
  description:
    'Los mejores modelos de IA china, ordenados por lo que quieres hacer y no por quién los fabrica. Sin darte de alta en OpenRouter y sin poner tarjeta.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${inter.variable} ${fraunces.variable} ${mono.variable}`}>
      <head>
        {/* Sin JavaScript nadie levanta la cortina de entrada, así que sin
            JavaScript no se pinta. El contenido va debajo y queda intacto. */}
        <noscript>
          <style>{`[data-preloader]{display:none!important}`}</style>
        </noscript>
      </head>
      <body className="font-sans">{children}</body>
    </html>
  );
}
