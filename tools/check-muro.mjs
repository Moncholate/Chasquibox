/* El muro de logros, comprobado.
   ----------------------------------------------------------------------------
   Este muro se llena EN VIVO delante del curso, con el docente escribiendo de
   pie mientras alguien acaba de decir su logro en voz alta. Las tres formas de
   arruinar ese momento no dan error, solo quedan mal:

     1. Que dos logros iguales se vean como un error de la herramienta. Dos
        alumnos pueden decir lo mismo; el muro no tiene por qué mostrarlo dos
        veces, y menos seguidos.
     2. Que con veinticinco tarjetas el muro se salga del proyector. Proyectando,
        hacer scroll es lo mismo que perderlo: lo que enseña es verlas TODAS a la
        vez.
     3. Que el tamaño cambie con cada tarjeta nueva. El muro entero parpadearía
        justo cuando hay que mirar la que se acaba de añadir.

   Correr:  node tools/check-muro.mjs        (desde Grammar HUB/) */
import { agregar, cabe, quitarUltimo, forma, TOPE } from '../src/muro.js';

let problemas = 0;
const fallo = (m) => { console.log('   ✗ ' + m); problemas++; };
const ok = (m) => console.log('   ✓ ' + m);

console.log('\nañadir logros');
{
  let m = [];
  m = agregar(m, 'pedir comida');
  m = agregar(m, 'entender el audio');
  if (m.length === 2 && m[0] === 'pedir comida') ok('se añaden en orden, el primero primero');
  else fallo(`quedó ${JSON.stringify(m)}`);

  if (agregar([], '  escribir   cinco  frases  ')[0] === 'escribir cinco frases') ok('los espacios de sobra se limpian');
  else fallo('no se limpiaron los espacios');

  const antes = ['a'];
  agregar(antes, 'b');
  if (antes.length === 1) ok('no se toca el muro que se le pasa: devuelve uno nuevo');
  else fallo('mutó el array original');
}

console.log('\nno se repite, aunque dos digan lo mismo');
{
  let m = agregar(agregar([], 'Pedir comida'), 'pedir comida');
  if (m.length === 1) ok('la misma frase con otra mayúscula no entra dos veces');
  else fallo(`entró dos veces: ${JSON.stringify(m)}`);

  m = agregar(agregar([], 'pedir la hora'), 'PEDIR  LA  HORA');
  if (m.length === 1) ok('ni con espacios de más');
  else fallo('los espacios burlaron el repetido');

  m = agregar(agregar([], 'describir mi día'), 'describir mi dia');
  if (m.length === 1) ok('ni sin tilde: «mi día» y «mi dia» son lo mismo escritos rápido');
  else fallo('la tilde burló el repetido');

  m = agregar(agregar([], 'pedir comida'), 'pedir bebida');
  if (m.length === 2) ok('dos logros parecidos pero distintos sí entran los dos');
  else fallo('se comió un logro distinto');
}

console.log('\nlo que no entra, se sabe ANTES de tocar el botón');
{
  const casos = [
    [[], '', 'vacio', 'nada escrito'],
    [[], '   ', 'vacio', 'solo espacios'],
    [['pedir comida'], 'Pedir Comida', 'repetido', 'uno que ya está'],
    [Array.from({ length: TOPE }, (_, i) => 'l' + i), 'otro más', 'lleno', 'el muro lleno'],
    [[], 'algo nuevo', null, 'uno que sí'],
  ];
  for (const [m, t, motivo, que] of casos) {
    const r = cabe(m, t);
    if (r.motivo === motivo && r.puede === (motivo === null)) ok(`${que} → ${motivo || 'entra'}`);
    else fallo(`${que}: dio ${JSON.stringify(r)}`);
  }
  if (agregar([], '').length === 0 && agregar([], null).length === 0) ok('y añadir vacío no rompe nada');
  else fallo('añadir vacío metió algo');
}

console.log('\nel tope existe y no se pasa');
{
  let m = [];
  for (let i = 0; i < TOPE + 15; i++) m = agregar(m, 'logro ' + i);
  if (m.length === TOPE) ok(`se para en ${TOPE}: más allá no se lee ni encogiendo`);
  else fallo(`llegó a ${m.length}`);
}

console.log('\nborrar el último');
{
  const m = ['a', 'b', 'c'];
  const q = quitarUltimo(m);
  if (q.length === 2 && q[1] === 'b') ok('quita el último, que es el que se acaba de escribir mal');
  else fallo(`quedó ${JSON.stringify(q)}`);
  if (quitarUltimo([]).length === 0) ok('sobre un muro vacío no revienta');
  else fallo('quitar de un muro vacío hizo algo raro');
  if (m.length === 3) ok('tampoco muta el original');
  else fallo('quitarUltimo mutó el array');
}

console.log('\ncaben en la pantalla, y sin parpadear');
{
  /* Cuantas más tarjetas, más chicas y más columnas: nunca al revés. */
  let mal = 0;
  for (let n = 1; n < 40; n++) {
    const a = forma(n), b = forma(n + 1);
    if (b.escala > a.escala || b.columnas < a.columnas) { fallo(`de ${n} a ${n + 1} el muro CRECE`); mal++; }
  }
  if (!mal) ok('de 1 a 40, cada tarjeta nueva encoge el muro o lo deja igual, nunca lo agranda');

  /* Y que sea en escalones: si cada n diera un tamaño distinto, el muro entero
     parpadearía en cada añadido. */
  const escalas = new Set(Array.from({ length: 40 }, (_, i) => forma(i + 1).escala));
  if (escalas.size <= 6) ok(`solo ${escalas.size} tamaños en total: cambia a saltos, no en cada tarjeta`);
  else fallo(`${escalas.size} tamaños distintos: el muro parpadearía`);

  /* Un curso de verdad tiene que caber sin apretarse: 25 en 5 columnas son 5
     filas, que es lo que entra en un proyector. */
  const c25 = forma(25);
  if (c25.columnas === 5 && Math.ceil(25 / c25.columnas) === 5) ok('25 logros → 5×5, que es lo que cabe en un proyector');
  else fallo(`25 logros dieron ${c25.columnas} columnas`);

  if (forma(0).columnas >= 1 && forma(0).escala > 0) ok('un muro vacío también tiene forma');
  else fallo('forma(0) devolvió algo inservible');
}

console.log(problemas ? `\n✗ ${problemas} problema(s)` : '\nMURO OK');
process.exit(problemas ? 1 : 0);
