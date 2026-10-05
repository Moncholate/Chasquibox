/* ============================================================================
   LOS TIEMPOS QUE UN CURSO YA VIO
   ----------------------------------------------------------------------------
   Para el dado: «sale un tiempo verbal, arma una oración». Solo puede salir lo
   que ese curso ya enseñó — es el mismo criterio que aplican Grammaster y
   Question Lab, y el motivo por el que existe `curriculum.json`.

   Aquí se compara solo el CURSO, no la unidad, y es a propósito: el dado no
   pregunta en qué unidad va la clase (eso lo hace Grammaster, que corrige y
   puntúa). Un tiempo de la semana que viene saliendo en un warm-up no rompe
   nada; en una actividad calificada sí, y por eso allá el filtro es más fino.
   ========================================================================== */
import { NIVELES, TIEMPOS, CURSOS } from './data/curriculum.generated.js';

/** Los tiempos vistos hasta ese curso, en el orden en que se enseñan. */
export const tiemposHasta = (nivel) => {
  const tope = NIVELES.indexOf(nivel);
  const hasta = tope < 0 ? NIVELES.length - 1 : tope;   // sin curso elegido, todos
  return Object.entries(TIEMPOS)
    .filter(([, v]) => NIVELES.indexOf(v.level) <= hasta)
    .sort((a, b) => NIVELES.indexOf(a[1].level) - NIVELES.indexOf(b[1].level))
    .map(([id, v]) => ({ id, level: v.level, es: v.label.es, en: v.label.en }));
};

/** Los cursos, en orden, para que el dado ofrezca elegir uno. */
export const CURSOS_DE_INGLES = NIVELES;

/** El nombre del curso, para rotularlo en pantalla. */
export const nombreDeCurso = (nivel, lang = 'es') => (CURSOS[nivel] || {})[lang] || '';
