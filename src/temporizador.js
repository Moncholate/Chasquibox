/* ============================================================================
   EL TEMPORIZADOR
   ----------------------------------------------------------------------------
   «Tres minutos para esto». Es lo que más se usa en una sala después del dado.

   Lo único que tiene lógica de verdad es el formato y los avisos, y va aquí
   para poder probarlo: un reloj que muestre «3:5» en vez de «3:05», o que diga
   «-1» al pasarse, se ve feo justo cuando toda la clase lo está mirando.
   ========================================================================== */

/** Los presets del profesor. El resto se escribe a mano. */
export const PRESETS = [1, 2, 3, 5, 10];

/** Segundos → «m:ss». Nunca baja de cero: al llegar, se queda en 0:00. */
export const formatoReloj = (segundos) => {
  const s = Math.max(0, Math.floor(Number(segundos) || 0));
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, '0')}`;
};

/**
 * En qué estado visual está el reloj:
 *   'normal'  · queda tiempo de sobra
 *   'poco'    · los últimos 10 s, para que se note sin mirar el número
 *   'fin'     · se acabó
 * Diez segundos y no treinta porque el aviso tiene que significar «ya», no
 * «pronto»: si se enciende demasiado antes, deja de mirarse.
 */
export const estadoReloj = (segundos) => {
  const s = Math.max(0, Math.floor(Number(segundos) || 0));
  if (s === 0) return 'fin';
  return s <= 10 ? 'poco' : 'normal';
};
