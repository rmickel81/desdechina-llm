// Comprueba que todos los IDs de src/config/models.ts existen en OpenRouter.
// Un ID inexistente no falla al compilar: falla en producción, cuando alguien
// intenta usar esa sección. Por eso se verifica en CI.
//
// Si OpenRouter no responde, avisa pero no rompe el build: un corte suyo no
// debe bloquear un despliegue.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(join(here, '..', 'src', 'config', 'models.ts'), 'utf8');

// Claves de MODELS: una línea con dos espacios de sangría, comillas y llave.
const declared = [...source.matchAll(/^ {2}"([^"]+)": \{/gm)].map((m) => m[1]);

// IDs citados dentro de los arrays `models: [...]` de cada tarea.
const referenced = [...source.matchAll(/models:\s*\[([^\]]*)\]/g)].flatMap((block) =>
  [...block[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]),
);

if (declared.length === 0) {
  console.error('No se ha encontrado ningún modelo en models.ts.');
  process.exit(1);
}

// Toda tarea debe apuntar a modelos declarados.
const huerfanos = [...new Set(referenced)].filter((id) => !declared.includes(id));
if (huerfanos.length > 0) {
  console.error('Tareas que apuntan a modelos no declarados:');
  for (const id of huerfanos) console.error('  ✗', id);
  process.exit(1);
}

let catalogo;
try {
  const response = await fetch('https://openrouter.ai/api/v1/models');
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  catalogo = new Set((await response.json()).data.map((m) => m.id));
} catch (error) {
  console.warn(`No se ha podido consultar OpenRouter (${error.message}). Se omite la comprobación.`);
  process.exit(0);
}

const faltan = declared.filter((id) => !catalogo.has(id));
if (faltan.length > 0) {
  console.error(`${faltan.length} de ${declared.length} modelos no existen en OpenRouter:`);
  for (const id of faltan) console.error('  ✗', id);
  console.error('\nCorrígelos en src/config/models.ts antes de desplegar.');
  process.exit(1);
}

console.log(`Los ${declared.length} modelos existen en OpenRouter.`);
