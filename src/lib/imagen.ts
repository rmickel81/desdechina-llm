// Validación de las imágenes que llegan del navegador. Vive aparte de la ruta
// para poder probarla: la aritmética de base64 es fácil de equivocar y aquí
// se decide si una petición se paga o se rechaza.

// La imagen viaja en base64 dentro del JSON, así que ocupa un tercio más de
// lo que pesa el archivo. El navegador ya la reduce antes de mandarla; este
// tope es la red de seguridad contra una petición hecha a mano.
export const MAX_IMAGE_BYTES = 3 * 1024 * 1024;

export const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];

const DATA_URL = /^data:(image\/[a-z+]+);base64,([A-Za-z0-9+/]+={0,2})$/;

/** Bytes reales que representa un bloque de base64. */
export function base64Bytes(b64: string): number {
  const relleno = b64.endsWith('==') ? 2 : b64.endsWith('=') ? 1 : 0;
  return (b64.length / 4) * 3 - relleno;
}

/**
 * Comprueba una `data:` URL de imagen. Devuelve el motivo del rechazo, o null
 * si es buena. No se fía del tipo declarado sin más: también mide lo que
 * ocupa de verdad una vez descodificada.
 */
export function revisarImagen(dataUrl: string): string | null {
  if (typeof dataUrl !== 'string') return 'La imagen no es válida.';
  const m = DATA_URL.exec(dataUrl);
  if (!m) return 'El formato de la imagen no es válido.';
  if (!IMAGE_TYPES.includes(m[1])) return 'Solo se aceptan imágenes PNG, JPEG, WebP o GIF.';
  if (m[2].length % 4 !== 0) return 'El formato de la imagen no es válido.';
  if (base64Bytes(m[2]) > MAX_IMAGE_BYTES) {
    return 'La imagen pesa demasiado. Prueba con una más pequeña.';
  }
  return null;
}
