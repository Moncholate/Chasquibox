/* ============================================================================
   LOS HUECOS DE UN MOLDE
   ----------------------------------------------------------------------------
   Las herramientas del cierre proyectan frases que el docente escribe, y esas
   frases llevan huecos:

       «No me queda claro cuándo se usa ____ en vez de ____.»
       «Hoy pude ______ y hace un mes no.»

   El hueco se escribe como se escribe a mano —una fila de guiones bajos— y aquí
   se separa del texto para poder pintarlo distinto. NO es cosmética: proyectado,
   un hueco en la misma tinta que las palabras compite con ellas, y lo que el
   alumno tiene que leer es la frase, no la raya. Apagado, la raya dice «aquí
   falta algo» y se calla.

   POR QUÉ GUIONES BAJOS Y NO UN CÓDIGO PROPIO. Porque es lo que el docente ya
   escribe sin que nadie se lo enseñe, en el pizarrón y en la guía. Un `{hueco}`
   o un `[[ ]]` habría que explicarlo, y una herramienta que hay que aprender a
   escribir no se usa de pie con la clase esperando.

   TRES O MÁS. Dos guiones bajos seguidos aparecen en nombres de archivo y en
   código pegado; tres ya son una raya a propósito.

   Este archivo es PURO: `tools/check-molde.mjs`.
   ========================================================================== */

/** Lo que la herramienta escribe cuando pone un hueco por su cuenta. */
export const HUECO = '______';

/**
 * Parte una frase en trozos `{ tipo: 'texto' | 'hueco', valor }`.
 * Los huecos conservan su largo: quien escribió una raya larga quería una raya
 * larga, y en un molde el tamaño del hueco insinúa cuánto cabe.
 */
export const partirEnHuecos = (texto) => {
  const s = String(texto == null ? '' : texto);
  if (!s) return [];
  const trozos = [];
  const re = /_{3,}/g;
  let ultimo = 0, m;
  while ((m = re.exec(s)) !== null) {
    if (m.index > ultimo) trozos.push({ tipo: 'texto', valor: s.slice(ultimo, m.index) });
    trozos.push({ tipo: 'hueco', valor: m[0] });
    ultimo = m.index + m[0].length;
  }
  if (ultimo < s.length) trozos.push({ tipo: 'texto', valor: s.slice(ultimo) });
  return trozos;
};

/** ¿Hay algo que proyectar? Un molde de puros huecos no dice nada. */
export const tieneTexto = (texto) => partirEnHuecos(texto).some(t => t.tipo === 'texto' && t.valor.trim());
