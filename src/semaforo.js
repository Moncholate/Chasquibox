/* ============================================================================
   EL SEMÁFORO DEL CIERRE
   ----------------------------------------------------------------------------
   La primera herramienta que no es para empezar la clase sino para cerrarla. El
   profesor proyecta un objetivo, el curso levanta la mano en uno de tres
   niveles, y el semáforo muestra DÓNDE ESTÁ EL CURSO.

   LOS TRES NIVELES SON CRITERIOS, NO SENSACIONES, y ahí está todo lo demás.
   «¿Les quedó claro?» produce un coro de síes porque le pide al alumno que
   evalúe algo que no ha vuelto a mirar. «Se lo puedo explicar a alguien» es un
   umbral que se comprueba solo: o puedes o no puedes, y lo sabes al intentarlo.

   POR QUÉ UN SEMÁFORO Y NO UN GRÁFICO DE BARRAS. Idea del profesor, y es mejor
   que lo que había propuesto: un semáforo se lee sin leer. Desde el fondo de la
   sala, «estamos en ámbar» entra por los ojos antes que cualquier número, y el
   objeto ya significa algo para todo el mundo —verde sigue, ámbar ojo, rojo
   para— sin que haya que explicar la leyenda.

   DOS SEÑALES PARA EL MISMO DATO: cada luz cambia de BRILLO y de TAMAÑO a la
   vez. Redundar aquí no es un lujo. Un proyector en una sala con luz aplasta
   justo el extremo tenue de la escala, que es donde vive la mitad de la
   información; el tamaño sobrevive a eso. Y quien no distingue bien el rojo del
   verde sigue viendo cuál manda.

   LA INTENSIDAD ES RESPECTO AL CURSO ENTERO, no a la luz más votada. Normalizar
   al máximo haría que un curso 80 % en rojo se viera exactamente igual que uno
   80 % en verde —la luz de arriba a tope y las otras dos apagadas— y eso es lo
   contrario de para qué existe esto.

   Este archivo es PURO —ni React ni DOM— para poder probarlo:
   `tools/check-semaforo.mjs`. La pantalla vive en `components/Semaforo.jsx`.
   ========================================================================== */

/** De arriba abajo, como en un semáforo de la calle. */
export const LUCES = ['verde', 'ambar', 'rojo'];

/**
 * Con qué proporción una luz llega a brillar del todo.
 *
 * NO es 1. Con tres opciones, una mayoría clara del curso ronda el 55 %, así
 * que atar el brillo a la proporción cruda dejaría el semáforo a media luz
 * SIEMPRE — nunca se vería un verde de verdad encendido y la herramienta
 * parecería estropeada. Con el tope en la mitad, media clase enciende la luz
 * entera; por encima no hay más brillo que dar, y por debajo baja proporcional.
 * El significado absoluto se conserva donde importa: 5 de 25 se ven tenues.
 */
export const PLENO = 0.5;

/* Una luz sin votos sigue siendo una LÁMPARA APAGADA, no un agujero: se ve el
   cristal oscuro y se ve su tamaño mínimo. Que una opción no la eligiera nadie
   es información, y desaparecer no la comunica — la esconde. */
export const BRILLO_MIN = 0.12;
export const TAMANO_MIN = 0.45;

/** Suma limpia: lo que entra puede venir de un contador tocado a lo bestia. */
const entero = (n) => {
  const v = Math.floor(Number(n));
  return Number.isFinite(v) && v > 0 ? v : 0;
};

/**
 * Cómo se ve el semáforo con este conteo.
 *
 * Devuelve, por luz: los votos, su proporción, y las dos señales visuales ya
 * calculadas (0…1) para que la pantalla solo tenga que multiplicar.
 * `dominante` es la luz que manda, y es `null` cuando hay empate: decir «el
 * curso está en ámbar» con 10 y 10 sería mentir a la sala.
 */
export const lectura = (conteo = {}) => {
  const votos = Object.fromEntries(LUCES.map(l => [l, entero((conteo || {})[l])]));
  const total = LUCES.reduce((s, l) => s + votos[l], 0);

  const luces = LUCES.map(id => {
    const n = votos[id];
    const proporcion = total ? n / total : 0;
    const fuerza = total ? Math.min(1, proporcion / PLENO) : 0;
    return {
      id,
      votos: n,
      proporcion,
      brillo: BRILLO_MIN + (1 - BRILLO_MIN) * fuerza,
      tamano: TAMANO_MIN + (1 - TAMANO_MIN) * fuerza,
    };
  });

  const mayor = Math.max(...luces.map(l => l.votos));
  const arriba = mayor > 0 ? luces.filter(l => l.votos === mayor) : [];

  return {
    total,
    luces,
    dominante: arriba.length === 1 ? arriba[0].id : null,
    empate: arriba.length > 1,
  };
};

/** Sumar y restar una mano. Restar existe porque contar manos de pie SE FALLA,
    y sin deshacer la única salida sería reiniciar y volver a contar. */
export const sumar = (conteo, luz, delta = 1) => ({
  ...conteo,
  [luz]: Math.max(0, entero((conteo || {})[luz]) + delta),
});

export const VACIO = Object.fromEntries(LUCES.map(l => [l, 0]));
