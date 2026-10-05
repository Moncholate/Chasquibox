/* El crucigrama, comprobado.
   ----------------------------------------------------------------------------
   Un crucigrama mal armado NO da error: da una cuadrícula que se ve perfecta y
   que el alumno no puede resolver. Y se descubre en la sala, con la hoja ya
   repartida.

   LA PRUEBA QUE IMPORTA es la de las palabras fantasma. Se lee la cuadrícula
   como la lee un alumno —toda tira de dos o más letras seguidas, en horizontal
   y en vertical— y CADA UNA tiene que ser una palabra que el docente escribió,
   en su sitio exacto. Si «CAT» y «DOG» quedan pegados en filas contiguas, la
   cuadrícula contiene «CD», «AO» y «TG»; el generador cree que puso dos
   palabras y el alumno ve cinco.

   Se corre sobre cientos de crucigramas con azar reproducible: un fallo de
   colocación que aparece con una lista de cada veinte no se caza mirando uno.

   Correr:  node tools/check-crucigrama.mjs        (desde Grammar HUB/) */
import { readFileSync } from 'node:fs';
import { parsearPalabras, generar, pistas, MIN_LARGO, MAX_PALABRAS } from '../src/crucigrama.js';

let problemas = 0;
const fallo = (m) => { console.log('   ✗ ' + m); problemas++; };
const ok = (m) => console.log('   ✓ ' + m);

const azarFijo = (semilla) => () => {
  semilla = (semilla * 1664525 + 1013904223) % 4294967296;
  return semilla / 4294967296;
};

const LISTAS = {
  clase: ['apple', 'orange', 'lemon', 'melon', 'grape', 'banana', 'peach', 'plum', 'cherry', 'mango'],
  verbos: ['work', 'study', 'travel', 'listen', 'write', 'read', 'speak', 'watch', 'play', 'cook', 'clean', 'drive'],
  cortas: ['at', 'in', 'on', 'to', 'up', 'of'],
  mixta: ['refrigerator', 'ice cream', 'e-mail', 'niño', 'sun', 'moon', 'star', 'rain'],
};
const entradas = (l) => parsearPalabras(l.join('\n')).lista;

/** Toda tira de 2+ letras seguidas que un alumno leería en la cuadrícula. */
const tirasDe = (c) => {
  const out = [];
  const empujar = (letras, fila, col, dir) => {
    if (letras.length >= 2) out.push({ palabra: letras, fila, col, dir });
  };
  for (let f = 0; f < c.alto; f++) {
    let acc = '', inicio = 0;
    for (let x = 0; x <= c.ancho; x++) {
      const l = x < c.ancho ? c.celdas[f][x] : null;
      if (l) { if (!acc) inicio = x; acc += l; }
      else { empujar(acc, f, inicio, 'h'); acc = ''; }
    }
  }
  for (let col = 0; col < c.ancho; col++) {
    let acc = '', inicio = 0;
    for (let y = 0; y <= c.alto; y++) {
      const l = y < c.alto ? c.celdas[y][col] : null;
      if (l) { if (!acc) inicio = y; acc += l; }
      else { empujar(acc, inicio, col, 'v'); acc = ''; }
    }
  }
  return out;
};

console.log('\nla lista pegada se lee como se escribe');
{
  const { lista, fuera } = parsearPalabras(
    'apple\nbanana = a yellow fruit\ncherry\tuna fruta roja\ngrape - una fruta morada\n\n1. lemon\napple\na\n'
  );
  const dice = (p) => `${p.palabra}${p.pista ? '|' + p.pista : ''}`;
  const esperado = ['APPLE', 'BANANA|a yellow fruit', 'CHERRY|una fruta roja', 'GRAPE|una fruta morada', 'LEMON'];
  if (JSON.stringify(lista.map(dice)) === JSON.stringify(esperado)) {
    ok('los tres separadores (=, tabulación, guion con espacios) y la palabra sola');
    ok('la numeración de la lista y las líneas vacías se van');
  } else fallo(`quedó ${JSON.stringify(lista.map(dice))}`);

  if (fuera.some(f => f.motivo === 'repetida') && fuera.some(f => f.motivo === 'corta')) {
    ok('la repetida y la de una letra se descartan Y se dicen');
  } else fallo(`descartes: ${JSON.stringify(fuera)}`);

  const raro = parsearPalabras('ice cream\ne-mail\nniño').lista.map(p => p.palabra);
  if (JSON.stringify(raro) === JSON.stringify(['ICECREAM', 'EMAIL', 'NIÑO'])) {
    ok('espacios, guiones y tildes salen de la respuesta y la eñe se queda: una casilla es una letra');
  } else fallo(`las raras dieron ${JSON.stringify(raro)}`);

  const original = parsearPalabras('ice cream = a cold dessert').lista[0];
  if (original.original === 'ice cream') ok('pero se guarda como se escribió, que es lo que se enseña al corregir');
  else fallo(`el original quedó ${original.original}`);

  if (parsearPalabras('').lista.length === 0 && parsearPalabras(null).lista.length === 0) ok('vacío y null no revientan');
  else fallo('el vacío devolvió algo');

  /* Con LETRAS y no con números: el parser quita los dígitos de la respuesta,
     así que 'palabra0'…'palabra49' eran las cincuenta la misma palabra y 49
     se descartaban por repetidas. El fixture medía otra cosa. */
  const distinta = (i) => 'word' + String.fromCharCode(97 + i % 26) + String.fromCharCode(97 + Math.floor(i / 26));
  const muchas = parsearPalabras(Array.from({ length: MAX_PALABRAS + 10 }, (_, i) => distinta(i)).join('\n'));
  if (muchas.lista.length === MAX_PALABRAS && muchas.fuera.length === 10) ok(`el tope de ${MAX_PALABRAS} se respeta y las de más se dicen`);
  else fallo(`con ${MAX_PALABRAS + 10} palabras quedaron ${muchas.lista.length}`);
}

console.log('\nNINGUNA PALABRA FANTASMA — la prueba que importa');
{
  let malos = 0, tiras = 0;
  for (const [nombre, lista] of Object.entries(LISTAS)) {
    for (let s = 1; s <= 60; s++) {
      const c = generar({ palabras: entradas(lista), azar: azarFijo(s) });
      if (!c.colocadas.length) continue;
      const puestas = new Set(c.colocadas.map(p => `${p.palabra}@${p.fila},${p.col},${p.dir}`));
      for (const t of tirasDe(c)) {
        tiras++;
        if (!puestas.has(`${t.palabra}@${t.fila},${t.col},${t.dir}`)) {
          fallo(`«${nombre}» semilla ${s}: la cuadrícula contiene «${t.palabra}» (${t.dir} en ${t.fila},${t.col}) y nadie la escribió`);
          malos++;
          break;
        }
      }
      if (malos) break;
    }
    if (malos) break;
  }
  if (!malos) ok(`${tiras} tiras leídas en 240 crucigramas, y todas son palabras que el docente escribió`);
}

console.log('\ntodo lo colocado está donde dice que está');
{
  let malos = 0;
  for (const [nombre, lista] of Object.entries(LISTAS)) {
    for (let s = 1; s <= 40; s++) {
      const c = generar({ palabras: entradas(lista), azar: azarFijo(s) });
      for (const p of c.colocadas) {
        for (let i = 0; i < p.palabra.length; i++) {
          const f = p.fila + (p.dir === 'v' ? i : 0);
          const col = p.col + (p.dir === 'h' ? i : 0);
          if (c.celdas[f]?.[col] !== p.palabra[i]) {
            fallo(`«${nombre}» semilla ${s}: ${p.palabra} no está en (${p.fila},${p.col},${p.dir})`);
            malos++; break;
          }
        }
        if (malos) break;
      }
      if (malos) break;
    }
    if (malos) break;
  }
  if (!malos) ok('cada palabra colocada se lee letra a letra en sus coordenadas');
}

console.log('\ntodas cruzan: esto es un crucigrama, no una sopa de letras');
{
  let sueltas = 0;
  for (const lista of Object.values(LISTAS)) {
    for (let s = 1; s <= 30; s++) {
      const c = generar({ palabras: entradas(lista), azar: azarFijo(s) });
      for (const p of c.colocadas.slice(1)) {
        const cruza = c.colocadas.some(q => q !== p && q.dir !== p.dir &&
          (p.dir === 'h'
            ? (q.col >= p.col && q.col < p.col + p.palabra.length && p.fila >= q.fila && p.fila < q.fila + q.palabra.length)
            : (q.fila >= p.fila && q.fila < p.fila + p.palabra.length && p.col >= q.col && p.col < q.col + q.palabra.length)));
        if (!cruza) { fallo(`${p.palabra} quedó suelta, sin cruzar con nada`); sueltas++; break; }
      }
      if (sueltas) break;
    }
    if (sueltas) break;
  }
  if (!sueltas) ok('salvo la primera, todas cruzan al menos una palabra');
}

console.log('\nse coloca lo que se puede, y lo que no se dice');
{
  const c = generar({ palabras: entradas(LISTAS.clase), azar: azarFijo(4) });
  if (c.colocadas.length + c.fuera.length === LISTAS.clase.length) ok('colocadas + fuera = las que se pidieron: ninguna se pierde por el camino');
  else fallo(`${c.colocadas.length} + ${c.fuera.length} ≠ ${LISTAS.clase.length}`);

  /* Una palabra sin ninguna letra en común NO se puede colocar, y tiene que
     salir en `fuera` en vez de desaparecer o reventar. */
  const rara = generar({ palabras: entradas(['abc', 'xyz']), azar: azarFijo(1) });
  const lasDos = [...rara.colocadas, ...rara.fuera].map(p => p.palabra).sort().join(',');
  /* Cuál de las dos entra lo decide el barajado, y da igual: lo que no puede
     pasar es que la otra desaparezca en silencio. */
  if (rara.colocadas.length === 1 && rara.fuera.length === 1 && lasDos === 'ABC,XYZ') {
    ok('sin letras en común, una entra y la otra queda fuera CON NOMBRE');
  } else fallo(`«abc/xyz» dio ${JSON.stringify([rara.colocadas.map(p=>p.palabra), rara.fuera.map(p=>p.palabra)])}`);

  const media = LISTAS.clase.map(w => entradas([w])[0]);
  const total = media.length;
  let colocadasMedia = 0;
  for (let s = 1; s <= 30; s++) colocadasMedia += generar({ palabras: media, azar: azarFijo(s) }).colocadas.length;
  const tasa = colocadasMedia / (30 * total);
  if (tasa > 0.7) ok(`entra el ${Math.round(tasa * 100)} % de las palabras de una lista normal`);
  else fallo(`solo entra el ${Math.round(tasa * 100)} %: el generador se rinde demasiado pronto`);
}

console.log('\nla numeración es la del crucigrama de papel');
{
  const c = generar({ palabras: entradas(LISTAS.verbos), azar: azarFijo(7) });
  const nums = c.colocadas.map(p => p.numero);
  if (nums.every(n => Number.isInteger(n) && n >= 1)) ok('todas llevan número');
  else fallo(`hay palabras sin número: ${JSON.stringify(nums)}`);

  /* Dos palabras que empiezan en la MISMA casilla comparten número. */
  const porCasilla = new Map();
  for (const p of c.colocadas) {
    const key = `${p.fila},${p.col}`;
    if (porCasilla.has(key) && porCasilla.get(key) !== p.numero) fallo('dos palabras en la misma casilla con números distintos');
    porCasilla.set(key, p.numero);
  }
  ok('dos palabras que arrancan en la misma casilla llevan el mismo número');

  /* Y el orden es el de lectura: arriba-abajo, izquierda-derecha. */
  const orden = [...c.numeros].sort((a, b) => a.numero - b.numero);
  const bien = orden.every((x, i) => i === 0 || (x.fila > orden[i-1].fila || (x.fila === orden[i-1].fila && x.col > orden[i-1].col)));
  if (bien) ok('numeradas en orden de lectura, como en papel');
  else fallo('la numeración no sigue el orden de lectura');

  const { horizontales, verticales } = pistas(c);
  if (horizontales.length + verticales.length === c.colocadas.length) ok('las dos listas de pistas suman todas las palabras');
  else fallo('las listas de pistas no cuadran');
}

console.log('\nla cuadrícula está recortada y cabe');
{
  /* Contador propio: `problemas` es global y venir sucio de una sección anterior
     hacía que esta se callara aunque pasara. */
  let mal = 0;
  for (let s = 1; s <= 20; s++) {
    const c = generar({ palabras: entradas(LISTAS.verbos), azar: azarFijo(s) });
    const filaVacia = c.celdas.some(f => f.every(x => !x));
    const colVacia = Array.from({ length: c.ancho }, (_, i) => c.celdas.every(f => !f[i])).some(Boolean);
    if (filaVacia || colVacia) { fallo(`semilla ${s}: la cuadrícula tiene una fila o columna entera vacía`); mal++; break; }
    if (c.celdas.length !== c.alto || c.celdas[0].length !== c.ancho) { fallo('el tamaño declarado no es el real'); mal++; break; }
    if (Math.max(c.ancho, c.alto) > 30) { fallo(`semilla ${s}: cuadrícula de ${c.ancho}×${c.alto}, no cabe en una hoja`); mal++; break; }
  }
  if (!mal) ok('sin filas ni columnas vacías en los bordes, y nunca más de 30 casillas de lado');
}

console.log('\n«otra vez» da otro crucigrama');
{
  const l = entradas(LISTAS.verbos);
  const firma = (c) => c.colocadas.map(p => `${p.palabra}${p.fila},${p.col}${p.dir}`).join('|');
  const distintos = new Set(Array.from({ length: 12 }, (_, s) => firma(generar({ palabras: l, azar: azarFijo(s + 1) }))));
  if (distintos.size >= 6) ok(`doce tiradas dieron ${distintos.size} crucigramas distintos`);
  else fallo(`doce tiradas dieron solo ${distintos.size} distintos: «otra vez» apenas cambia nada`);

  const a = firma(generar({ palabras: l, azar: azarFijo(3) }));
  const b = firma(generar({ palabras: l, azar: azarFijo(3) }));
  if (a === b) ok('con la misma semilla, el mismo crucigrama: es reproducible y por eso se puede probar');
  else fallo('el mismo azar dio dos resultados');
}

console.log('\nlos bordes no revientan');
{
  const casos = [
    [[], 'sin palabras'],
    [entradas(['solo']), 'una sola palabra'],
    [entradas(['at', 'to']), 'dos palabras de dos letras'],
    [entradas(LISTAS.cortas), 'solo palabras cortas'],
    [entradas(LISTAS.mixta), 'con espacios, guiones y tildes'],
  ];
  for (const [palabras, que] of casos) {
    try {
      const c = generar({ palabras, azar: azarFijo(5) });
      const sano = Number.isInteger(c.ancho) && Number.isInteger(c.alto) && Array.isArray(c.colocadas) && Array.isArray(c.fuera);
      if (!sano) { fallo(`${que} devolvió algo raro`); continue; }
      const fantasmas = c.colocadas.length
        ? tirasDe(c).filter(t => !c.colocadas.some(p => p.palabra === t.palabra && p.fila === t.fila && p.col === t.col && p.dir === t.dir))
        : [];
      if (fantasmas.length) fallo(`${que}: ${fantasmas.map(f => f.palabra).join(', ')} son fantasmas`);
      else ok(`${que} → ${c.ancho}×${c.alto}, ${c.colocadas.length} colocadas, sin fantasmas`);
    } catch (e) { fallo(`${que} lanzó ${e.message}`); }
  }
  if (generar().colocadas.length === 0) ok('sin argumentos tampoco revienta');
  else fallo('generar() sin nada devolvió algo');
}

console.log('\nCADA PALABRA SE LEE ENTERA Y SOLA DONDE DICE QUE ESTÁ');
{
  /* La otra mitad de «ninguna palabra fantasma», y hacía falta las dos. Aquella
     mira la cuadrícula y pregunta si lo que se lee está en la lista; esta mira
     la lista y pregunta si cada palabra se lee tal cual donde la pista promete.
     Se puede pasar la primera y fallar esta: con «CAT» ya puesta, «CATS» encima
     deja una cuadrícula donde todo lo que se lee es de la lista, pero la pista
     número 3 dice CAT y ahí pone CATS. Salió al reintentar las que no entraban:
     la cuadrícula llega más llena y aparecen los solapes. */
  let malas = 0, miradas = 0;
  for (const [nombre, lista] of Object.entries(LISTAS)) {
    for (let s = 1; s <= 40; s++) {
      const c = generar({ palabras: entradas(lista), azar: azarFijo(s) });
      for (const p of c.colocadas) {
        miradas++;
        const df = p.dir === 'v' ? 1 : 0, dc = p.dir === 'h' ? 1 : 0;
        const antes = c.celdas[p.fila - df]?.[p.col - dc];
        const luego = c.celdas[p.fila + df * p.palabra.length]?.[p.col + dc * p.palabra.length];
        if (antes || luego) {
          fallo(`«${nombre}» semilla ${s}: la pista dice «${p.palabra}» pero la cuadrícula sigue con «${antes || ''}…${luego || ''}» pegado`);
          malas++;
          break;
        }
      }
      if (malas) break;
    }
    if (malas) break;
  }
  if (!malas) ok(`${miradas} palabras colocadas, y cada una se lee entera y sola donde su pista dice`);
}

console.log('\nCON VOCABULARIO DE VERDAD, Y CUÁNTAS SE QUEDAN FUERA');
{
  /* Las cuatro listas de arriba están escritas a mano y comparten muchas
     letras: son un examen fácil. El vocabulario del curso no lo es, y es lo que
     el docente va a pegar. De aquí salieron las dos mejoras de colocación —
     varias pasadas y varios órdenes— que bajaron lo que se queda fuera del 11%
     al 1,6%. Si alguien las toca, este número lo dirá. */
  const v = JSON.parse(readFileSync(new URL('./vocabulary.json', import.meta.url), 'utf8'));
  const aplanar = (x, acc) => {
    if (Array.isArray(x)) x.forEach(y => aplanar(y, acc));
    else if (x && typeof x === 'object') Object.values(x).forEach(y => aplanar(y, acc));
    else if (typeof x === 'string') acc.push(x);
    return acc;
  };
  const pozo = [...new Set(aplanar(v, []).filter(s => /^[a-zA-Z]{3,12}$/.test(s)).map(s => s.toLowerCase()))];

  let fantasmas = 0, tiras = 0, fuera = 0, total = 0, casos = 0;
  let ejemplo = null;
  for (let s = 1; s <= 400; s++) {
    const az = azarFijo(s);
    const cuantas = 6 + Math.floor(az() * 12);
    const palabras = [];
    while (palabras.length < cuantas) {
      const w = pozo[Math.floor(az() * pozo.length)];
      if (!palabras.includes(w)) palabras.push(w);
    }
    const c = generar({ palabras: entradas(palabras), azar: az });
    if (!c.colocadas.length) continue;
    casos++; total += cuantas; fuera += c.fuera.length;
    const puestas = new Set(c.colocadas.map(p => `${p.palabra}@${p.fila},${p.col},${p.dir}`));
    for (const t of tirasDe(c)) {
      tiras++;
      if (!puestas.has(`${t.palabra}@${t.fila},${t.col},${t.dir}`) && !ejemplo) {
        ejemplo = `semilla ${s}: «${t.palabra}» (${t.dir} en ${t.fila},${t.col}) con ${palabras.join(' ')}`;
        fantasmas++;
      }
    }
  }
  if (!fantasmas) ok(`${tiras} tiras leídas en ${casos} crucigramas de vocabulario del curso, y todas son palabras de la lista`);
  else fallo(`fantasma con vocabulario real — ${ejemplo}`);

  const pct = fuera / total * 100;
  if (pct <= 4) ok(`se quedan fuera el ${pct.toFixed(1)}% de las palabras (eran el 11% antes de reintentar y probar varios órdenes)`);
  else fallo(`se queda fuera el ${pct.toFixed(1)}%: la colocación empeoró`);
}

console.log(problemas ? `\n✗ ${problemas} problema(s)` : '\nCRUCIGRAMA OK');
process.exit(problemas ? 1 : 0);
