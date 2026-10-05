/* ============================================================================
   GRUPOS AL AZAR
   ----------------------------------------------------------------------------
   El profesor pega la lista del curso (la que ve en Blackboard Collaborate) y
   la app reparte. Dos modos, porque en clase se piden los dos: «de a cuatro» y
   «cuatro grupos».

   EL PROBLEMA DE VERDAD ERA QUIÉN FALTÓ. Borrar a mano de la lista pegada es
   incómodo y además la rompe: si al rato vuelve a repartir, hay que pegarla
   otra vez. En la pantalla cada nombre se apaga con un toque; apagado sigue
   estando, pero no entra en el sorteo.

   NO SE GUARDA NADA. Es la regla de las herramientas de clase, dicha por el
   profesor: la lista vive mientras la pestaña esté abierta. Por eso tampoco hay
   «no repetir parejas de la clase pasada»: eso exigiría recordar, y recordar
   nombres de alumnos es justo lo que no se hace.

   El limpiador de la lista y el barajador viven en `lista.js`, compartidos con
   la ruleta: dos versiones del mismo limpiador terminan limpiando distinto.

   Este archivo es PURO —ni React ni DOM— para poder probarlo:
   `tools/check-grupos.mjs`.
   ========================================================================== */
/* Con extensión: estos módulos los carga tambien Node en `tools/check-*.mjs`,
   y Node no resuelve la extensión solo como hace Vite. */
import { barajar } from './lista.js';

export { parsearLista as parsearNombres, barajar } from './lista.js';

/**
 * Reparte en grupos.
 *   modo 'porGrupo'  → `n` es cuántos van en cada grupo
 *   modo 'cantidad'  → `n` es cuántos grupos hay
 *
 * En los dos casos el reparto es POR RONDAS, no por trozos seguidos, así que
 * los tamaños nunca se diferencian en más de uno. Eso resuelve solo el caso
 * feo: «de a cuatro» con nueve personas no deja 4+4+1 —alguien trabajando
 * solo— sino 3+3+3.
 */
export const repartir = (nombres, { modo = 'porGrupo', n = 4, azar = Math.random } = {}) => {
  const gente = (nombres || []).filter(Boolean);
  if (!gente.length) return [];
  const tamano = Math.max(1, Math.floor(n) || 1);
  const cuantos = modo === 'cantidad'
    ? Math.min(tamano, gente.length)
    : Math.max(1, Math.ceil(gente.length / tamano));

  const grupos = Array.from({ length: cuantos }, () => []);
  barajar(gente, azar).forEach((nombre, i) => grupos[i % cuantos].push(nombre));
  return grupos;
};
