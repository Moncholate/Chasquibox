/* La sopa de letras, comprobada.
   ----------------------------------------------------------------------------
   Una sopa mal armada NO da error: da una cuadrícula perfecta con una palabra
   que no está, o con un hueco en blanco, o —la peor— con las palabras tan
   evidentes que el ejercicio no existe. Las tres se descubren en la sala.

   LAS CUATRO QUE IMPORTAN:

     1. QUE LA PALABRA ESTÉ DONDE DICE. Se lee la cuadrícula letra a letra desde
        las coordenadas y en la dirección declaradas. Si no se lee, el alumno
        busca algo que no está y la culpa se la lleva él.
     2. QUE LA DIFICULTAD SIGNIFIQUE ALGO. En «fácil» no puede colarse una
        diagonal ni una palabra al revés: un curso que apenas reconoce la palabra
        escrita del derecho no puede toparse con «ELPPA».
     3. QUE NO QUEDEN HUECOS. Una casilla vacía en una sopa es un agujero: se ve
        a un metro y señala dónde NO hay palabra.
     4. QUE EL RELLENO NO DELATE. Si se rellena con el alfabeto uniforme, las K y
        las W del relleno dibujan el negativo de las palabras y la sopa se
        resuelve mirando la textura, sin leer una letra.

   Correr:  node tools/check-sopa.mjs        (desde Grammar HUB/) */
import { generar, ladoPara, NIVELES, DIRECCIONES, casillasDe, MAX_LADO, segmentoEntre, palabraEntre } from '../src/sopa.js';
import { parsearPalabras } from '../src/palabras.js';

let problemas = 0;
const fallo = (m) => { console.log('   ✗ ' + m); problemas++; };
const ok = (m) => console.log('   ✓ ' + m);

const azarFijo = (semilla) => () => {
  semilla = (semilla * 1664525 + 1013904223) % 4294967296;
  return semilla / 4294967296;
};

const LISTAS = {
  fruta: ['apple', 'orange', 'lemon', 'melon', 'grape', 'banana', 'peach', 'plum', 'cherry', 'mango'],
  verbos: ['work', 'study', 'travel', 'listen', 'write', 'read', 'speak', 'watch', 'play', 'cook', 'clean', 'drive'],
  cortas: ['at', 'in', 'on', 'to', 'up', 'of', 'by', 'we'],
  larga: ['refrigerator', 'extraordinary', 'sun', 'moon'],
};
const entradas = (l) => parsearPalabras(l.join('\n')).lista;
const sopas = (lista, dif = 'media', veces = 60) =>
  Array.from({ length: veces }, (_, s) => generar({ palabras: entradas(lista), dificultad: dif, azar: azarFijo(s + 1) }));

/** La firma de un conjunto de casillas, para compararlas de un vistazo. */
const clave = (casillas) => casillas.map(c => `${c.fila},${c.col}`).join('|');

/** Lee la palabra desde sus coordenadas, como la leería un alumno. */
const leer = (sopa, p) => casillasDe(p).map(({ fila, col }) => sopa.celdas[fila]?.[col]).join('');

console.log('\nCADA PALABRA ESTÁ DONDE DICE QUE ESTÁ');
{
  let malas = 0, leidas = 0;
  for (const [nombre, lista] of Object.entries(LISTAS)) {
    for (const dif of Object.keys(NIVELES)) {
      for (const sopa of sopas(lista, dif, 25)) {
        for (const p of sopa.colocadas) {
          leidas++;
          if (leer(sopa, p) !== p.palabra) {
            fallo(`«${nombre}»/${dif}: ${p.palabra} no se lee en (${p.fila},${p.col}) hacia ${p.dir} — sale «${leer(sopa, p)}»`);
            malas++; break;
          }
        }
        if (malas) break;
      }
      if (malas) break;
    }
    if (malas) break;
  }
  if (!malas) ok(`${leidas} palabras leídas desde sus coordenadas en 300 sopas, todas correctas`);
}

console.log('\nnada se sale de la cuadrícula');
{
  let malas = 0;
  for (const lista of Object.values(LISTAS)) {
    for (const dif of Object.keys(NIVELES)) {
      for (const sopa of sopas(lista, dif, 20)) {
        for (const p of sopa.colocadas) {
          const fuera = casillasDe(p).some(({ fila, col }) => fila < 0 || col < 0 || fila >= sopa.lado || col >= sopa.lado);
          if (fuera) { fallo(`${p.palabra} se sale de la cuadrícula`); malas++; break; }
        }
        if (malas) break;
      }
    }
  }
  if (!malas) ok('ninguna palabra asoma por fuera de la cuadrícula');
}

console.log('\nLA DIFICULTAD SIGNIFICA ALGO');
{
  const usadas = (dif) => new Set(sopas(LISTAS.verbos, dif, 60).flatMap(s => s.colocadas.map(p => p.dir)));

  const facil = usadas('facil');
  const permitidasFacil = new Set(NIVELES.facil);
  const coladas = [...facil].filter(d => !permitidasFacil.has(d));
  if (coladas.length) fallo(`en «fácil» se colaron ${coladas.join(', ')}: un curso básico no puede toparse con «ELPPA»`);
  else ok('en «fácil» solo → y ↓: se lee como se lee');

  const media = usadas('media');
  const alReves = [...media].filter(d => ['O', 'N', 'NO', 'SO'].includes(d));
  if (alReves.length) fallo(`en «media» hay palabras al revés (${alReves.join(', ')})`);
  else ok('en «media» entran las diagonales hacia abajo, pero nada al revés');
  if (media.has('SE') || media.has('NE')) ok('y las diagonales aparecen de verdad, no solo en la lista de permitidas');
  else fallo('en «media» nunca sale una diagonal: la dificultad no cambia nada');

  const dificil = usadas('dificil');
  if ([...dificil].some(d => ['O', 'N', 'NO', 'SO'].includes(d))) ok('en «difícil» sí salen al revés: ya no se reconoce, se reconstruye');
  else fallo('en «difícil» nunca sale una palabra al revés');

  if (dificil.size > media.size && media.size > facil.size) ok('cada nivel usa más direcciones que el anterior');
  else fallo(`las direcciones por nivel no crecen: ${facil.size} / ${media.size} / ${dificil.size}`);
}

console.log('\nno quedan huecos');
{
  let malas = 0;
  for (const lista of Object.values(LISTAS)) {
    for (const sopa of sopas(lista, 'media', 20)) {
      if (!sopa.lado) continue;
      const hueco = sopa.celdas.some(f => f.some(c => !c || !/^[A-Z]$/.test(c)));
      if (hueco) { fallo('hay una casilla vacía o con algo que no es una letra'); malas++; break; }
      if (sopa.celdas.length !== sopa.lado || sopa.celdas.some(f => f.length !== sopa.lado)) {
        fallo('la cuadrícula no es cuadrada'); malas++; break;
      }
    }
    if (malas) break;
  }
  if (!malas) ok('todas las casillas llevan una letra, y la cuadrícula es cuadrada');
}

console.log('\nEL RELLENO NO DELATA');
{
  /* Con relleno uniforme del alfabeto, las letras que el vocabulario no usa
     —K, W, X, Z— aparecerían por todas partes y dibujarían el negativo de las
     palabras. Se comprueba que las letras de la sopa salgan del vocabulario. */
  let malas = 0;
  for (const [nombre, lista] of Object.entries(LISTAS)) {
    for (const sopa of sopas(lista, 'media', 20)) {
      if (!sopa.colocadas.length) continue;
      const delVocabulario = new Set(sopa.colocadas.flatMap(p => p.palabra.split('')));
      const enLaSopa = new Set(sopa.celdas.flat());
      const intrusas = [...enLaSopa].filter(l => !delVocabulario.has(l));
      if (intrusas.length) {
        fallo(`«${nombre}»: la sopa trae ${intrusas.join(', ')}, que no están en ninguna palabra — el relleno delata`);
        malas++; break;
      }
    }
    if (malas) break;
  }
  if (!malas) ok('cada letra de la sopa sale del vocabulario puesto: no hay textura que leer');

  /* Y que el relleno no sea una sola letra repetida, que sería lo contrario. */
  const s = generar({ palabras: entradas(LISTAS.verbos), dificultad: 'media', azar: azarFijo(3) });
  const distintas = new Set(s.celdas.flat()).size;
  if (distintas >= 8) ok(`${distintas} letras distintas en la cuadrícula: variada de verdad`);
  else fallo(`solo ${distintas} letras distintas: la sopa se ve como un patrón`);
}

console.log('\nse coloca lo que se puede, y lo que no se dice');
{
  for (const lista of Object.values(LISTAS)) {
    const s = generar({ palabras: entradas(lista), dificultad: 'media', azar: azarFijo(9) });
    if (s.colocadas.length + s.fuera.length !== entradas(lista).length) {
      fallo('colocadas + fuera no suman las que se pidieron: alguna se perdió por el camino');
    }
  }
  if (!problemas) ok('ninguna palabra desaparece sin explicación');

  const tasas = Object.values(LISTAS).map(l => {
    const s = generar({ palabras: entradas(l), dificultad: 'media', azar: azarFijo(11) });
    return s.colocadas.length / entradas(l).length;
  });
  if (Math.min(...tasas) === 1) ok('con las cuatro listas de prueba entran TODAS las palabras');
  else fallo(`alguna lista pierde palabras: tasas ${tasas.map(t => Math.round(t * 100) + '%').join(', ')}`);

  /* Una palabra más larga que la cuadrícula no cabe por definición, y tiene que
     salir nombrada en vez de desaparecer.

     ESTE CASO SE PLANTEA A MANO, Y NO ES PEREZA. Antes usaba una palabra de 30
     letras leída con `entradas`, y desde que el lector de listas corta en 15
     —por encima de eso casi siempre es un renglón entero que se pegó junto— esa
     palabra ya no llega hasta aquí: la sonda estaba midiendo el vacío y salía
     verde. Por la puerta de la interfaz el caso ya no puede darse, porque el
     lado máximo de la cuadrícula (20) es mayor que la palabra más larga que el
     lector deja pasar (15).
     La guardia se queda igualmente, y por eso se prueba: `generar` es una
     función pública y no puede confiar en que quien la llame ya haya filtrado.
     Se le entrega la entrada directamente, que es la única forma honesta de
     llegar a ella. */
  const larga = generar({ palabras: [{ palabra: 'X'.repeat(30), original: 'x'.repeat(30), pista: '' }, ...entradas(['sun', 'moon'])], azar: azarFijo(2) });
  if (larga.fuera.some(p => p.motivo === 'larga')) ok('una palabra más larga que la cuadrícula se descarta CON MOTIVO');
  else fallo('una palabra de 30 letras no se reportó como demasiado larga');
}

console.log('\nel tamaño se ajusta a la lista');
{
  const casos = [
    [LISTAS.cortas, 'ocho palabras de dos letras'],
    [LISTAS.verbos, 'doce verbos'],
    [LISTAS.larga, 'una de trece letras'],
  ];
  for (const [lista, que] of casos) {
    const l = ladoPara(entradas(lista));
    const masLarga = Math.max(...entradas(lista).map(p => p.palabra.length));
    if (l < masLarga) fallo(`${que}: lado ${l} y la palabra más larga mide ${masLarga}`);
    else if (l > MAX_LADO) fallo(`${que}: lado ${l}, no cabe en una hoja`);
    else ok(`${que} → cuadrícula de ${l}×${l}`);
  }
  if (ladoPara([]) === 0) ok('sin palabras, sin cuadrícula');
  else fallo('una lista vacía dio una cuadrícula');
}

console.log('\n«otra vez» da otra sopa');
{
  const l = entradas(LISTAS.verbos);
  const firma = (s) => s.celdas.map(f => f.join('')).join('|');
  const distintas = new Set(Array.from({ length: 10 }, (_, i) =>
    firma(generar({ palabras: l, dificultad: 'media', azar: azarFijo(i + 1) }))));
  if (distintas.size === 10) ok('diez tiradas, diez sopas distintas');
  else fallo(`diez tiradas dieron ${distintas.size} distintas`);

  const a = firma(generar({ palabras: l, azar: azarFijo(4) }));
  const b = firma(generar({ palabras: l, azar: azarFijo(4) }));
  if (a === b) ok('con la misma semilla, la misma sopa: reproducible y por eso probable');
  else fallo('el mismo azar dio dos sopas');
}

console.log('\nlos bordes no revientan');
{
  const casos = [
    [{}, 'sin nada'],
    [{ palabras: [] }, 'sin palabras'],
    [{ palabras: entradas(['solo']) }, 'una sola palabra'],
    [{ palabras: entradas(LISTAS.verbos), dificultad: 'inventada' }, 'una dificultad que no existe'],
  ];
  for (const [args, que] of casos) {
    try {
      const s = generar({ ...args, azar: azarFijo(6) });
      const sano = Number.isInteger(s.lado) && Array.isArray(s.celdas) && Array.isArray(s.colocadas) && Array.isArray(s.fuera);
      if (sano) ok(`${que} → ${s.lado}×${s.lado}, ${s.colocadas.length} colocadas`);
      else fallo(`${que} devolvió algo raro`);
    } catch (e) { fallo(`${que} lanzó ${e.message}`); }
  }
  const rara = generar({ palabras: entradas(LISTAS.verbos), dificultad: 'inventada', azar: azarFijo(6) });
  if (rara.colocadas.every(p => NIVELES.media.includes(p.dir))) ok('una dificultad desconocida cae en «media», no en el caos');
  else fallo('una dificultad desconocida usó direcciones de más');
}


console.log('\nSE PUEDE RESOLVER A CLICS, Y TODA PALABRA PUESTA SE PUEDE ENCONTRAR');
{
  /* LA PRUEBA QUE IMPIDE EL PEOR FALLO: una palabra colocada que NO se pueda
     marcar. Proyectando, eso es la clase entera señalando la pantalla mientras
     la herramienta dice que no — y el profesor sin forma de demostrar que la
     palabra está ahí. Se prueba marcando cada palabra por sus dos extremos, en
     los dos sentidos, en todas las dificultades. */
  let malas = 0, marcadas = 0;
  for (const [nombre, lista] of Object.entries(LISTAS)) {
    for (const dif of Object.keys(NIVELES)) {
      for (const sopa of sopas(lista, dif, 15)) {
        for (const p of sopa.colocadas) {
          const cs = casillasDe(p);
          const primera = cs[0], ultima = cs[cs.length - 1];
          const alDerecho = palabraEntre(sopa, primera, ultima);
          const alReves = palabraEntre(sopa, ultima, primera);
          marcadas += 2;
          if (alDerecho?.palabra !== p.palabra || alReves?.palabra !== p.palabra) {
            fallo(`«${nombre}»/${dif}: ${p.palabra} está puesta pero no se puede marcar`);
            malas++; break;
          }
        }
        if (malas) break;
      }
      if (malas) break;
    }
    if (malas) break;
  }
  if (!malas) ok(`${marcadas} marcados en 180 sopas: toda palabra puesta se encuentra, y también al revés`);
}

console.log('\nuna selección que no es una palabra no cuela');
{
  const sopa = generar({ palabras: entradas(LISTAS.verbos), dificultad: "media", azar: azarFijo(5) });
  const puestas = new Set(sopa.colocadas.map(p => clave(casillasDe(p))));

  /* Se recorren MUCHOS pares al azar; los que no son una palabra puesta tienen
     que devolver null, hayan formado o no algo que parezca una palabra. */
  const rnd = azarFijo(77);
  let falsos = 0, probados = 0;
  for (let i = 0; i < 4000; i++) {
    const a = { fila: Math.floor(rnd() * sopa.lado), col: Math.floor(rnd() * sopa.lado) };
    const b = { fila: Math.floor(rnd() * sopa.lado), col: Math.floor(rnd() * sopa.lado) };
    const seg = segmentoEntre(a, b);
    if (!seg) continue;
    probados++;
    const esPuesta = puestas.has(clave(seg)) || puestas.has(clave([...seg].reverse()));
    const dio = palabraEntre(sopa, a, b);
    if (!!dio !== esPuesta) { falsos++; break; }
  }
  if (falsos) fallo("una selección que no es una palabra puesta se dio por buena (o al revés)");
  else ok(`${probados} selecciones al azar: solo aceptan las palabras que están puestas de verdad`);
}

console.log('\nsolo se aceptan selecciones que un lápiz podría trazar');
{
  const casos = [
    [{ fila: 2, col: 2 }, { fila: 2, col: 6 }, 5, "horizontal"],
    [{ fila: 2, col: 2 }, { fila: 6, col: 2 }, 5, "vertical"],
    [{ fila: 2, col: 2 }, { fila: 5, col: 5 }, 4, "diagonal exacta"],
    [{ fila: 5, col: 5 }, { fila: 2, col: 2 }, 4, "diagonal al revés"],
    [{ fila: 2, col: 2 }, { fila: 4, col: 7 }, null, "diagonal torcida"],
    [{ fila: 3, col: 3 }, { fila: 3, col: 3 }, null, "la misma casilla dos veces"],
    [null, { fila: 1, col: 1 }, null, "sin primer clic"],
  ];
  for (const [a, b, largo, que] of casos) {
    const seg = segmentoEntre(a, b);
    const dio = seg ? seg.length : null;
    if (dio === largo) ok(`${que} → ${largo === null ? "no vale" : largo + " casillas"}`);
    else fallo(`${que}: dio ${dio} y se esperaba ${largo}`);
  }

  /* Y que el segmento pase por casillas de verdad, no por medias casillas. */
  const d = segmentoEntre({ fila: 0, col: 0 }, { fila: 3, col: 3 });
  if (d.every((c, i) => c.fila === i && c.col === i)) ok("la diagonal pasa por las casillas enteras, una a una");
  else fallo("la diagonal se salta casillas");
}
console.log('\nDOS PALABRAS EN LÍNEA NO SE TOCAN');
{
  /* EL FALLO QUE ESTO IMPIDE: MELON acabando donde APPLE empieza, en la misma
     fila y en el mismo eje. Las dos están bien puestas y la sopa se resuelve,
     pero al marcarlas se ven como una sola cosa larga y el alumno lee
     MELONAPPLE. Lo reportó el profesor usándola.
     Se prohíbe SOLO en línea: cruzarse o correr en paralelo pegadas es lo
     normal en una sopa y es lo que la hace densa. */
  const ejeDe = (p) => `${Math.abs(p.df)}${Math.abs(p.dc)}${p.df * p.dc > 0 ? "+" : "-"}`;
  let pegadas = 0, revisadas = 0;
  for (const [nombre, lista] of Object.entries(LISTAS)) {
    for (const dif of Object.keys(NIVELES)) {
      for (const sopa of sopas(lista, dif, 25)) {
        for (const a of sopa.colocadas) {
          const ca = casillasDe(a);
          const antes = { fila: a.fila - a.df, col: a.col - a.dc };
          const ultima = ca[ca.length - 1];
          const despues = { fila: ultima.fila + a.df, col: ultima.col + a.dc };
          for (const b of sopa.colocadas) {
            if (a === b || ejeDe(a) !== ejeDe(b)) continue;
            revisadas++;
            const toca = casillasDe(b).some(x =>
              (x.fila === antes.fila && x.col === antes.col) ||
              (x.fila === despues.fila && x.col === despues.col));
            if (toca) {
              fallo(`«${nombre}»/${dif}: ${a.palabra} y ${b.palabra} quedan pegadas en línea — se leen de corrido`);
              pegadas++; break;
            }
          }
          if (pegadas) break;
        }
        if (pegadas) break;
      }
      if (pegadas) break;
    }
    if (pegadas) break;
  }
  if (!pegadas) ok(`${revisadas} pares del mismo eje en 300 sopas, ninguno pegado de punta`);

  /* Y que la regla PROHÍBA SOLO LO SUYO. Prohibir de más sería fácil y saldría
     verde en la prueba de arriba: bastaría con rechazar cualquier casilla
     ocupada en las puntas, y de paso se irían los cruces.
     Los cruces NO son un requisito en una sopa —a diferencia del crucigrama,
     aquí la densidad la da el tamaño de la cuadrícula— pero tienen que seguir
     siendo POSIBLES, o la regla estaría haciendo más de lo que dice. */
  const conCruces = sopas(LISTAS.verbos, "media", 40).filter(sopa => {
    const usadas = new Map();
    for (const p of sopa.colocadas) for (const c of casillasDe(p)) {
      const k = `${c.fila},${c.col}`;
      usadas.set(k, (usadas.get(k) || 0) + 1);
    }
    return [...usadas.values()].some(n => n > 1);
  }).length;
  if (conCruces > 0) ok(`${conCruces} de 40 sopas traen palabras cruzadas: la regla no se llevó los cruces por delante`);
  else fallo("ninguna sopa tiene cruces: la regla prohíbe más de lo que dice");
}
console.log(problemas ? `\n✗ ${problemas} problema(s)` : '\nSOPA DE LETRAS OK');
process.exit(problemas ? 1 : 0);
