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
  catalogo = new Map((await response.json()).data.map((m) => [m.id, m]));
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

// Un modelo declarado que ninguna tarea ofrece no se puede elegir en la
// aplicación, y su enlace a la ficha no lo ve nadie: es peso muerto.
const sinTarea = declared.filter((id) => !referenced.includes(id));
if (sinTarea.length > 0) {
  console.error('Modelos declarados que ninguna sección ofrece:');
  for (const id of sinTarea) console.error('  ✗', id);
  console.error('\nAñádelos a una tarea o quítalos de MODELS.');
  process.exit(1);
}

// La franja de coste se escribe a mano y los precios de OpenRouter se mueven:
// siguen al proveedor por defecto de cada modelo, que cambia. Aquí solo se
// avisa —un cambio de precio ajeno no debe tumbar un despliegue—, pero el
// aviso es la señal de que toca repasar la franja en models.ts.
const franja = (salida) => (salida < 0.6 ? 'economico' : salida <= 2 ? 'equilibrado' : 'premium');
const tiers = new Map(
  [...source.matchAll(/^ {2}"([^"]+)": \{[\s\S]*?tier: "([^"]+)"/gm)].map((m) => [m[1], m[2]]),
);

const desajustadas = [];
for (const [id, tier] of tiers) {
  const salida = Number(catalogo.get(id)?.pricing?.completion) * 1e6;
  if (!Number.isFinite(salida)) continue;
  const hoy = franja(salida);
  if (hoy !== tier) desajustadas.push(`${id}: tier "${tier}", hoy el precio lo pone en "${hoy}"`);
}
for (const aviso of desajustadas) console.warn('  aviso —', aviso);

console.log(`Los ${declared.length} modelos existen en OpenRouter.`);
