/* ============================================================================
   EL MURO DE LOGROS
   ----------------------------------------------------------------------------
   Las otras cuatro herramientas del cierre preguntan por el HUECO: qué no puedo
   hacer, qué me quedó a medias, qué tuve mal, qué creía y estaba equivocado. Es
   un desequilibrio, y lo cazó el profesor: un cierre que solo saca déficits
   desmoraliza. Falta el registro contrario.

   Esto lo pone. Cada uno nombra algo que HOY pudo, el docente lo escribe, y la
   pantalla se va llenando. Lo que se ve al final no es el logro de nadie en
   particular: es que veinticinco cosas pequeñas juntas son un avance. Eso solo
   se ve si están todas a la vista al mismo tiempo, y por eso es un muro y no
   una lista que se lee y se olvida.

   AQUÍ VIVE LO QUE NO ES DE LA PANTALLA:

   · CABEN DE VERDAD. Con veinticinco tarjetas a tamaño de una, el muro se sale
     del proyector y hay que hacer scroll — que proyectando es lo mismo que
     perderlo. Las tarjetas ENCOGEN a medida que se llenan, en escalones y no de
     forma continua: un tamaño que cambia en cada tarjeta hace que el muro
     parpadee entero cada vez que alguien habla.
   · NO SE REPITE. Dos «pedir comida» seguidos se leen como un error de la
     herramienta aunque dos alumnos digan lo mismo. Se compara sin tildes ni
     mayúsculas, que es como se repiten de verdad.
   · SE PUEDE BORRAR EL ÚLTIMO. Escribiendo de pie y rápido se cuela una letra
     de más; sin deshacer, la única salida sería vaciar el muro.

   Nada se guarda: el muro muere con la pestaña, como todo en esta sección.

   Este archivo es PURO: `tools/check-muro.mjs`.
   ========================================================================== */

/** Tope: más allá, el muro no se lee ni encogiendo, y un curso son 25-40. */
export const TOPE = 40;

/**
 * En cuántas columnas y a qué escala se dibuja un muro de `n` tarjetas.
 *
 * En ESCALONES a propósito. Con una fórmula continua, cada tarjeta nueva cambia
 * el tamaño de todas y el muro entero parpadea justo cuando alguien acaba de
 * decir la suya en voz alta — que es el momento en que hay que mirarla.
 */
export const forma = (n) => {
  if (n <= 4)  return { columnas: 2, escala: 1 };
  if (n <= 9)  return { columnas: 3, escala: 0.82 };
  if (n <= 16) return { columnas: 4, escala: 0.66 };
  if (n <= 25) return { columnas: 5, escala: 0.54 };
  return { columnas: 6, escala: 0.45 };
};

/** Sin tildes, sin mayúsculas y sin espacios de sobra: así se repiten de verdad. */
const clave = (s) => String(s == null ? '' : s)
  .toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .replace(/\s+/g, ' ').trim();

/**
 * Añade un logro. Devuelve el muro nuevo — no toca el que le pasan.
 * Vacío o repetido: devuelve el mismo, y quien llama decide si avisa.
 */
export const agregar = (muro = [], texto = '') => {
  const limpio = String(texto == null ? '' : texto).replace(/\s+/g, ' ').trim();
  if (!limpio) return muro;
  if (muro.length >= TOPE) return muro;
  const k = clave(limpio);
  if (muro.some(x => clave(x) === k)) return muro;
  return [...muro, limpio];
};

/** ¿Se puede añadir esto? Para poder decirlo ANTES de tocar el botón. */
export const cabe = (muro = [], texto = '') => {
  const limpio = String(texto == null ? '' : texto).replace(/\s+/g, ' ').trim();
  if (!limpio) return { puede: false, motivo: 'vacio' };
  if (muro.length >= TOPE) return { puede: false, motivo: 'lleno' };
  if (muro.some(x => clave(x) === clave(limpio))) return { puede: false, motivo: 'repetido' };
  return { puede: true, motivo: null };
};

/** Quitar el último, que es el que se acaba de escribir mal. */
export const quitarUltimo = (muro = []) => muro.slice(0, -1);
