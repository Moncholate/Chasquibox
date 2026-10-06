/* ============================================================================
   SONDA DEL LECTOR DE LISTAS
   ----------------------------------------------------------------------------
   `palabras.js` es de las DOS actividades —crucigrama y sopa— y no tenía sonda,
   aunque su propio comentario decía que sí. Se notó del peor modo posible: el
   docente vio en la cuadrícula palabras que nadie escribió.

   No las inventaba el crucigrama. Las inventaba este lector, que daba por hecho
   una palabra por renglón y solo tres separadores: «apple, orange, lemon» salía
   como una única palabra APPLEORANGELEMON, y «apple: manzana» como APPLEMANZANA.
   Ninguna sonda de más abajo podía cazarlo, porque para el crucigrama y para la
   sopa esas eran palabras de la lista, tan legítimas como cualquier otra.

   De ahí que lo que se prueba aquí sea, sobre todo, LO QUE LA GENTE PEGA DE
   VERDAD: pares con dos puntos, listas con comas, paréntesis, planillas con
   tabulación, renglones numerados. Y lo que NO hay que partir, que es la mitad
   difícil: «e-mail», «twenty-one», y una pista que lleve una coma dentro.
   ========================================================================== */
import { parsearPalabras, soloLetras, barajar, MIN_LARGO, MAX_LARGO, MAX_PALABRAS } from '../src/palabras.js';

let problemas = 0;
const fallo = (m) => { console.log('   ✗ ' + m); problemas++; };
const ok = (m) => console.log('   ✓ ' + m);

const NL = String.fromCharCode(10);
const TAB = String.fromCharCode(9);

/** Lo que sale, en una línea, para poder compararlo de un vistazo. */
const leer = (t) => parsearPalabras(t).lista.map(x => x.palabra).join(' ');
const pistaDe = (t) => parsearPalabras(t).lista.map(x => x.pista).join(' | ');

console.log('\nUNA PALABRA POR RENGLÓN, QUE ES EL CASO FÁCIL');
{
  const casos = [
    ['apple' + NL + 'orange', 'APPLE ORANGE'],
    ['  apple  ' + NL + NL + ' orange ', 'APPLE ORANGE'],
    ['1. apple' + NL + '2) orange' + NL + '3 - lemon', 'APPLE ORANGE LEMON'],
    ['Apple' + NL + 'ORANGE', 'APPLE ORANGE'],
  ];
  let mal = 0;
  for (const [entra, sale] of casos) {
    const dio = leer(entra);
    if (dio !== sale) { fallo(`«${entra.replace(/\n/g, '⏎')}» → «${dio}», se esperaba «${sale}»`); mal++; }
  }
  if (!mal) ok(`${casos.length} formas de escribir la misma lista dan la misma lista`);
}

console.log('\nLA PISTA, DETRÁS DE CUALQUIERA DE LOS SEPARADORES QUE SE USAN');
{
  const casos = [
    ['apple = manzana', 'APPLE', 'manzana'],
    ['apple=manzana', 'APPLE', 'manzana'],
    ['apple: manzana', 'APPLE', 'manzana'],
    ['apple:manzana', 'APPLE', 'manzana'],
    ['apple / manzana', 'APPLE', 'manzana'],
    ['apple/manzana', 'APPLE', 'manzana'],
    ['apple - manzana', 'APPLE', 'manzana'],
    ['apple' + TAB + 'manzana', 'APPLE', 'manzana'],
    ['apple (manzana)', 'APPLE', 'manzana'],
    ['apple [manzana]', 'APPLE', 'manzana'],
  ];
  let mal = 0;
  for (const [entra, palabra, pista] of casos) {
    if (leer(entra) !== palabra || pistaDe(entra) !== pista) {
      fallo(`«${entra}» → «${leer(entra)}» / «${pistaDe(entra)}»`);
      mal++;
    }
  }
  if (!mal) ok(`${casos.length} maneras de escribir «apple = manzana», y las ${casos.length} se entienden`);
}

console.log('\nVARIAS PALABRAS EN UN RENGLÓN — de aquí salían los engendros');
{
  const casos = [
    ['apple, orange, lemon, grape', 'APPLE ORANGE LEMON GRAPE'],
    ['apple; orange; lemon', 'APPLE ORANGE LEMON'],
    ['apple , orange ,lemon', 'APPLE ORANGE LEMON'],
    ['apple: manzana, orange: naranja', 'APPLE ORANGE'],
    ['apple (manzana), orange (naranja)', 'APPLE ORANGE'],
  ];
  let mal = 0;
  for (const [entra, sale] of casos) {
    const dio = leer(entra);
    if (dio !== sale) { fallo(`«${entra}» → «${dio}», se esperaba «${sale}»`); mal++; }
  }
  if (!mal) ok(`${casos.length} renglones con varias palabras se abren en varias`);
}

console.log('\nLO QUE NO SE PARTE, QUE ES LA MITAD DIFÍCIL');
{
  /* Partir de más es tan malo como no partir: rompe palabras reales del curso y
     además lo hace en silencio. */
  const casos = [
    ['e-mail', 'EMAIL', ''],
    ['twenty-one', 'TWENTYONE', ''],
    ['T-shirt', 'TSHIRT', ''],
    ['ice cream', 'ICECREAM', ''],
    ['living room', 'LIVINGROOM', ''],
    ['apple = fruta roja, redonda', 'APPLE', 'fruta roja, redonda'],
    ['apple (fruta roja, redonda)', 'APPLE', 'fruta roja, redonda'],
  ];
  let mal = 0;
  for (const [entra, palabra, pista] of casos) {
    if (leer(entra) !== palabra || pistaDe(entra) !== pista) {
      fallo(`«${entra}» → «${leer(entra)}» / «${pistaDe(entra)}», se esperaba «${palabra}» / «${pista}»`);
      mal++;
    }
  }
  if (!mal) ok('el guion pegado, los nombres de dos palabras y las pistas con coma quedan enteros');
}

console.log('\nNINGUNA PALABRA MÁS LARGA DE LO CREÍBLE');
{
  /* La red de seguridad: si algún día llega un separador que no reconocemos, el
     renglón entero se pegará otra vez. Que al menos no acabe en la cuadrícula. */
  const largo = 'esto es un renglon entero que se pego sin separadores';
  const r = parsearPalabras(largo);
  if (r.lista.length === 0 && r.fuera[0]?.motivo === 'larga') ok(`un renglón pegado entero se descarta y se dice por qué («larga»), no se coloca`);
  else fallo(`un renglón de ${soloLetras(largo).length} letras acabó en la lista`);

  const justo = parsearPalabras('a'.repeat(MAX_LARGO) + NL + 'b'.repeat(MAX_LARGO + 1));
  if (justo.lista.length === 1 && justo.fuera.length === 1) ok(`el corte está en ${MAX_LARGO} letras: ${MAX_LARGO} entra, ${MAX_LARGO + 1} no`);
  else fallo(`el corte de ${MAX_LARGO} no está donde dice`);

  const refri = parsearPalabras('refrigerator' + NL + 'responsibility' + NL + 'grandmother');
  if (refri.lista.length === 3) ok('las palabras largas del temario (refrigerator, responsibility) siguen entrando');
  else fallo('el tope se llevó por delante una palabra legítima del temario');
}

console.log('\nLO QUE SE CAE, SE DICE Y CON SU MOTIVO');
{
  const r = parsearPalabras(['a', 'apple', 'apple', 'Ápple', 'orange'].join(NL));
  const motivos = r.fuera.map(x => x.motivo).join(' ');
  if (leer(['a', 'apple', 'apple', 'Ápple', 'orange'].join(NL)) === 'APPLE ORANGE') ok('lo corto y lo repetido se caen, y la tilde no crea una palabra nueva');
  else fallo(`salió «${leer(['a', 'apple', 'apple', 'Ápple', 'orange'].join(NL))}»`);
  if (motivos === 'corta repetida repetida') ok('cada descarte lleva escrito su motivo: ' + motivos);
  else fallo('los motivos fueron: ' + motivos);

  const muchas = parsearPalabras(Array.from({ length: MAX_PALABRAS + 5 }, (_, i) => 'pal' + 'a'.repeat(i % 7) + 'x'.repeat(Math.floor(i / 7)) + 'z'.repeat(i % 3) + i.toString(36).replace(/[0-9]/g, 'q')).join(NL));
  if (muchas.lista.length <= MAX_PALABRAS) ok(`el tope de ${MAX_PALABRAS} se respeta`);
  else fallo(`salieron ${muchas.lista.length} palabras`);
}

console.log('\nLO QUE NO PUEDE ROMPERSE NUNCA');
{
  if (leer('') === '' && leer(null) === '' && leer('   ') === '') ok('vacío, nulo y solo espacios no revientan: dan lista vacía');
  else fallo('el vacío no se maneja');

  if (soloLetras('niño') === 'NIÑO' && soloLetras('café') === 'CAFE') ok('las tildes se planchan y la eñe se queda: una casilla es una letra');
  else fallo('las tildes no se planchan, o la eñe se perdió');

  const solosigno = parsearPalabras('!!!' + NL + '123' + NL + '---');
  if (solosigno.lista.length === 0) ok('un renglón sin ninguna letra no se cuela como palabra');
  else fallo('un renglón sin letras acabó en la lista: ' + leer('!!!'));

  /* MIN_LARGO existe para que «at» y «in» sigan valiendo: son del temario. */
  if (leer('at' + NL + 'in' + NL + 'on') === 'AT IN ON' && MIN_LARGO === 2) ok('las de dos letras del temario (at, in, on) entran');
  else fallo('las palabras de dos letras no entran');

  const antes = [{ palabra: 'A' }, { palabra: 'B' }, { palabra: 'C' }];
  const copia = barajar(antes, () => 0.5);
  if (antes.length === copia.length && antes[0].palabra === 'A') ok('barajar devuelve una copia y no toca la lista original');
  else fallo('barajar modificó la lista que recibió');
}

console.log('\nla Ñ es una letra, no una N con tilde');
{
  /* En Teacher's Utility Belt la sopa la usan docentes de cualquier asignatura. «año»
     convertido en «ANO» no se puede proyectar en una sala. */
  if (soloLetras('año') === 'AÑO') ok('«año» queda AÑO');
  else fallo(`«año» quedó ${soloLetras('año')}`);
  if (soloLetras('año'.normalize('NFD')) === 'AÑO') ok('también si la ñ viene descompuesta (n + tilde)');
  else fallo(`la ñ descompuesta quedó ${soloLetras('año'.normalize('NFD'))}`);
  if (soloLetras('Canción') === 'CANCION') ok('las tildes de las vocales se siguen quitando');
  else fallo(`«Canción» quedó ${soloLetras('Canción')}`);
}

console.log(problemas ? `\nLECTOR DE LISTAS:${problemas} problema(s)\n` : '\nLECTOR DE LISTAS OK\n');
process.exit(problemas ? 1 : 0);
