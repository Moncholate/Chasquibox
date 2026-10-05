/* ============================================================================
   LA RULETA
   ----------------------------------------------------------------------------
   Para los warm-ups: el profesor pone verbos («que armen una oración con este»)
   o preguntas de unidades pasadas, y la ruleta saca una.

   DOS DECISIONES QUE VIENEN DE PARA QUÉ SE USA:

   1. El resultado se lee FUERA de la rueda, en grande. Una pregunta no cabe en
      un sector, y con veinte tarjetas cada sector mide 18°: pelear con la
      geometría para que el texto entre ahí es perder el tiempo. La rueda es la
      expectativa mientras gira; el cartel de abajo es la información.
   2. «Sin repetir» hasta que salgan todas. Un warm-up con veinte preguntas en
      el que la misma sale tres veces seguidas deja de ser un repaso. Como no se
      guarda nada, la vuelta dura lo que dure la clase, que es justo lo que hace
      falta.

   Este archivo es PURO: la geometría y el sorteo, sin DOM. La rueda se dibuja
   en el componente, pero el ángulo al que tiene que parar se calcula aquí
   porque es lo que se rompe en silencio — media vuelta de más y el puntero cae
   en el borde entre dos sectores, que parece bien hasta que alguien mira.
   ========================================================================== */
import { barajar } from './lista.js';

/**
 * Cuál sale ahora.
 * `usados` son los índices que ya salieron en esta vuelta; cuando se acaban,
 * la vuelta empieza de nuevo (y se devuelve `reinicia: true` para poder
 * decirlo en pantalla).
 */
export const siguienteIndice = ({ total, usados = [], sinRepetir = true, azar = Math.random }) => {
  if (!total || total < 1) return null;
  if (!sinRepetir) return { indice: Math.floor(azar() * total), reinicia: false };

  const pendientes = [...Array(total).keys()].filter(i => !usados.includes(i));
  if (pendientes.length) {
    return { indice: pendientes[Math.floor(azar() * pendientes.length)], reinicia: false };
  }
  /* Se acabó la vuelta: se reparte de nuevo. Se evita repetir la última que
     salió, porque dos seguidas iguales es justo lo que «sin repetir» promete
     que no pasa. */
  const ultima = usados[usados.length - 1];
  const opciones = total > 1 ? [...Array(total).keys()].filter(i => i !== ultima) : [0];
  return { indice: opciones[Math.floor(azar() * opciones.length)], reinicia: true };
};

/** El centro del sector `i`, en grados desde arriba y en sentido horario. */
export const centroDelSector = (indice, total) => (360 / total) * indice + (360 / total) / 2;

/**
 * Cuántos grados hay que SUMAR a la rotación actual para que el sector `indice`
 * quede bajo el puntero (arriba, las 12).
 *
 * Siempre avanza —nunca gira hacia atrás— y da al menos `vueltas` completas,
 * que es lo que hace que parezca una ruleta y no un salto.
 */
export const deltaHasta = ({ indice, total, rotacionActual = 0, vueltas = 4 }) => {
  if (!total || total < 1) return 0;
  const objetivo = (360 - centroDelSector(indice, total)) % 360;   // dónde tiene que quedar la rueda
  const actual = ((rotacionActual % 360) + 360) % 360;
  const avance = ((objetivo - actual) % 360 + 360) % 360;
  return vueltas * 360 + avance;
};

/**
 * QUÉ SE ROTULA EN CADA SECTOR, que es lo que decide si la rueda dice algo.
 *
 * El NÚMERO va siempre. Antes, con más de doce tarjetas la rueda se quedaba sin
 * una sola etiqueta —el texto no cabe en un sector de 18°— y una rueda de
 * colores girando sin nada escrito no parece una decisión de diseño: parece que
 * se rompió. Lo reportó el profesor con una lista de warm-up normal. Un número
 * de una o dos cifras cabe en cualquier sector, y con él la rueda siempre dice
 * en cuál cayó; el texto entero se lee en el cartel de abajo, que es donde
 * siempre estuvo la información.
 *
 * La PALABRA solo cuando de verdad cabe. Ese sigue siendo el motivo original y
 * no ha cambiado: una pregunta de warm-up no entra en un sector estrecho, y
 * apretarla hasta que quepa la deja ilegible, que es peor que no ponerla.
 */
export const ROTULO_HASTA = 12;
export const queRotular = (total) => ({
  numero: true,
  palabra: total > 0 && total <= ROTULO_HASTA,
});

/** El orden en que se dibujan las tarjetas. Se baraja una vez, no en cada giro:
    si la rueda se reordenara sola, el alumno no vería girar nada. */
export const ordenInicial = (items, azar = Math.random) => barajar(items, azar);
