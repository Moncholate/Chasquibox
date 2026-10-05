/* La ruleta y el temporizador, comprobados.
   ----------------------------------------------------------------------------
   Las dos cosas que se rompen en silencio aquí:

     · el ÁNGULO. Media vuelta de más y el puntero para en el borde entre dos
       sectores: parece que funciona hasta que alguien mira de cerca y la
       ruleta pierde toda su autoridad delante del curso.
     · el SIN REPETIR. Si la vuelta no se agota entera, el warm-up repite
       preguntas y deja otras sin salir, que es justo lo contrario de repasar.

   Y del reloj, el formato: «3:5» en vez de «3:05» se ve feo justo cuando toda
   la clase lo está mirando.

   Correr:  node tools/check-ruleta.mjs        (desde Grammar HUB/) */
import { siguienteIndice, centroDelSector, deltaHasta, ordenInicial, queRotular, ROTULO_HASTA } from '../src/ruleta.js';
import { formatoReloj, estadoReloj, PRESETS } from '../src/temporizador.js';

let problemas = 0;
const fallo = (m) => { console.log('   ✗ ' + m); problemas++; };
const ok = (m) => console.log('   ✓ ' + m);

const azarFijo = (semilla) => () => {
  semilla = (semilla * 1664525 + 1013904223) % 4294967296;
  return semilla / 4294967296;
};

console.log('\nel puntero para en el CENTRO del sector, no en el borde');
{
  let mal = 0;
  for (const total of [2, 3, 5, 8, 12, 20, 37]) {
    for (let indice = 0; indice < total; indice++) {
      for (const rotacionActual of [0, 17, 359, 1234.5, -40]) {
        const delta = deltaHasta({ indice, total, rotacionActual, vueltas: 4 });
        const final = rotacionActual + delta;
        /* Donde queda el centro del sector después de girar, medido desde
           arriba: tiene que ser 0 (mod 360). */
        const donde = ((final + centroDelSector(indice, total)) % 360 + 360) % 360;
        const error = Math.min(donde, 360 - donde);
        if (error > 0.001) { fallo(`${total} sectores, i=${indice}, desde ${rotacionActual}°: queda a ${donde.toFixed(2)}°`); mal++; }
        if (delta < 4 * 360) { fallo(`${total} sectores, i=${indice}: giró ${delta}°, menos de las 4 vueltas`); mal++; }
      }
    }
  }
  if (!mal) ok('7 tamaños de rueda × cada sector × 5 posiciones de partida, siempre centrado y siempre hacia adelante');
}

console.log('\nsin repetir: salen todas antes de que se repita ninguna');
{
  const total = 12;
  let usados = [];
  const salidas = [];
  for (let i = 0; i < total; i++) {
    const { indice, reinicia } = siguienteIndice({ total, usados, azar: azarFijo(i + 1) });
    if (reinicia) fallo(`reinició en la tirada ${i + 1}, y aún quedaban pendientes`);
    salidas.push(indice);
    usados = [...usados, indice];
  }
  if (new Set(salidas).size !== total) fallo(`en ${total} tiradas salieron ${new Set(salidas).size} distintas`);
  else ok('doce tarjetas, doce tiradas, ninguna repetida');

  const { reinicia } = siguienteIndice({ total, usados, azar: azarFijo(99) });
  if (!reinicia) fallo('con la vuelta agotada debería avisar de que empieza otra');
  else ok('agotada la vuelta, avisa y vuelve a empezar');

  let repes = 0;
  for (let s = 1; s <= 50; s++) {
    const ultima = usados[usados.length - 1];
    const { indice } = siguienteIndice({ total, usados, azar: azarFijo(s) });
    if (indice === ultima) repes++;
  }
  if (repes) fallo(`al reiniciar repitió la última ${repes} veces de 50`);
  else ok('al reiniciar nunca repite la que acaba de salir');
}

console.log('\ncon «sin repetir» apagado, sigue sorteando');
{
  /* UN solo generador para las 40 tiradas, y no uno por semilla: con semillas
     seguidas este LCG devuelve valores casi idénticos —cambian en 0,0004— y las
     40 caían en el mismo sector. El fallo era de la prueba, no de la ruleta. */
  const vistos = new Set();
  const azar = azarFijo(7);
  for (let s = 1; s <= 40; s++) vistos.add(siguienteIndice({ total: 6, usados: [0, 1, 2, 3, 4, 5], sinRepetir: false, azar }).indice);
  if (vistos.size < 2) fallo('debería seguir dando índices variados aunque estén todos usados');
  else ok('ignora lo usado y sortea entre todas');
}

console.log('\nbordes de la ruleta');
{
  if (siguienteIndice({ total: 0 }) !== null) fallo('sin tarjetas no hay tirada');
  else ok('lista vacía → no hay tirada');
  const una = siguienteIndice({ total: 1, usados: [0], azar: azarFijo(1) });
  if (una.indice !== 0) fallo('con una sola tarjeta siempre sale esa');
  else ok('una sola tarjeta no se queda sin salida');
  if (ordenInicial(['a', 'b', 'c'], azarFijo(2)).length !== 3) fallo('el orden inicial no puede perder tarjetas');
  else ok('barajar el orden no pierde ni añade');
}

console.log('\nel reloj se lee bien');
{
  const casos = [[0, '0:00'], [5, '0:05'], [59, '0:59'], [60, '1:00'], [65, '1:05'], [600, '10:00'], [-3, '0:00']];
  let mal = 0;
  for (const [s, esperado] of casos) {
    if (formatoReloj(s) !== esperado) { fallo(`${s}s → «${formatoReloj(s)}», se esperaba «${esperado}»`); mal++; }
  }
  if (!mal) ok('los segundos siempre con dos cifras, y nunca en negativo');

  if (estadoReloj(60) !== 'normal' || estadoReloj(11) !== 'normal') fallo('con más de 10 s el reloj está normal');
  else if (estadoReloj(10) !== 'poco' || estadoReloj(1) !== 'poco') fallo('los últimos 10 s tienen que avisar');
  else if (estadoReloj(0) !== 'fin') fallo('a cero, se acabó');
  else ok('avisa en los últimos diez segundos y marca el final');

  if (!PRESETS.length || PRESETS.some(p => !(p > 0))) fallo('los presets tienen que ser minutos positivos');
  else ok(`presets: ${PRESETS.join(', ')} min`);
}


console.log('\nla rueda nunca se queda muda');
{
  /* EL FALLO QUE ESTO IMPIDE: con trece tarjetas o más, la rueda dejaba de
     rotular POR COMPLETO. La regla de fondo era buena —una pregunta de warm-up
     no cabe en un sector de 18°— pero el resultado era una rueda de colores
     girando sin una sola marca, y eso no se lee como una decisión de diseño:
     se lee como que la herramienta se rompió, y así lo reportó el profesor con
     una lista de warm-up normal. Un número de una o dos cifras cabe en
     cualquier sector y arregla justo eso. */
  const mudas = [1, 5, 12, 13, 20, 40].filter(n => !queRotular(n).numero);
  if (mudas.length) fallo(`sin ninguna marca con ${mudas.join(", ")} tarjetas: la rueda se ve rota`);
  else ok('de 1 a 40 tarjetas, todos los sectores llevan su número');

  if (queRotular(ROTULO_HASTA).palabra && !queRotular(ROTULO_HASTA + 1).palabra) {
    ok(`la palabra se rotula hasta ${ROTULO_HASTA} y no más: apretada en un sector estrecho queda ilegible`);
  } else fallo('el corte de la palabra no está donde dice');

  if (!queRotular(0).palabra) ok('sin tarjetas no se rotula nada');
  else fallo('con cero tarjetas intentó rotular');
}
console.log(problemas ? `\n✗ ${problemas} problema(s)` : '\nRULETA Y RELOJ OK');
process.exit(problemas ? 1 : 0);
