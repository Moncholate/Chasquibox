/* ============================================================================
   EL CRUCIGRAMA
   ----------------------------------------------------------------------------
   El docente pega una lista de palabras y sale un crucigrama. Otra vez, y sale
   otro distinto con las mismas palabras.

   NADA DE CONTENIDO PUESTO, como el resto de la sección: las palabras son las
   de la clase de hoy, las escribe quien la dio. Las pistas son opcionales
   —`palabra = pista`— porque hay dos formas legítimas de usarlo: con pista
   escrita, y con el docente dictándola mientras el curso mira la cuadrícula.

   ────────────────────────────────────────────────────────────────────────────
   LA REGLA QUE HACE QUE UN CRUCIGRAMA SEA UN CRUCIGRAMA
   ────────────────────────────────────────────────────────────────────────────
   Colocar palabras que se crucen es fácil. Lo difícil es no crear palabras que
   nadie escribió. Si «CAT» va en horizontal y se pega «DOG» justo debajo, la
   cuadrícula contiene también «CD», «AO» y «TG» leídos en vertical, y el alumno
   que los ve no sabe que no cuentan: ve un crucigrama mal hecho.

   Por eso toda colocación tiene que cumplir cuatro cosas, y las cuatro se
   prueban:

     1. CRUZA. Cada palabra nueva comparte al menos una letra con una ya puesta,
        en la posición exacta. Sin cruces esto es una sopa de letras.
     2. RESPIRA POR LAS PUNTAS. La celda anterior al principio y la siguiente al
        final tienen que estar vacías, o la palabra se pegaría a otra y las dos
        se leerían como una sola más larga.
     3. NO ROZA DE LADO. En cada celda NUEVA que ocupa, las dos celdas laterales
        tienen que estar vacías. En la celda del cruce no: ahí la lateral es,
        justamente, la palabra que cruza.
     4. EL CRUCE ES PERPENDICULAR. No se puede pasar por una casilla que ya
        lleva una palabra en la MISMA dirección: eso no es cruzar, es montarse
        encima. Con «CAT» ya puesta, «CATS» cumple 1, 2 y 3 —las puntas libres,
        los lados libres, las tres primeras letras coincidiendo— y se coloca; a
        partir de ahí la pista dice CAT y la cuadrícula dice CATS.

   ────────────────────────────────────────────────────────────────────────────
   CUÁNTAS ENTRAN: DOS COSAS BARATAS QUE VALEN MUCHO
   ────────────────────────────────────────────────────────────────────────────
   Con vocabulario de verdad se quedaba fuera el 11% de las palabras. Con estas
   dos, el 1,6%, y no cambió ninguna regla de calidad:

     · VARIAS PASADAS. Una palabra que no encuentra sitio puede encontrarlo tres
       colocaciones después, cuando la cuadrícula tenga letras que aún no tiene.
       La cuadrícula solo crece, así que reintentar nunca empeora. Antes se
       descartaba en el primer intento.
     · VARIOS ÓRDENES, Y SE QUEDA EL MEJOR. Cuánto entra depende mucho de por
       dónde se empiece: la primera palabra se pone sola y de ella cuelga todo.
       Se prueban doce órdenes y gana el que más coloca.

   EL AZAR ES DEL ORDEN, NO DE LA CUADRÍCULA. Se baraja la lista y después se
   ordena por largo: las palabras largas primero, porque son las que dan cruces
   a las demás, y el barajado decide los empates. Así «otra vez» da un
   crucigrama distinto sin que la calidad dependa de la suerte.

   LO QUE NO ENTRA, SE DICE. Una palabra sin ninguna letra en común con lo ya
   puesto no se puede colocar, y esconderlo sería peor: el docente pidió diez
   palabras y tiene que saber que salieron ocho.

   Este archivo es PURO —ni React ni DOM— para poder probarlo:
   `tools/check-crucigrama.mjs`. El lector de la lista pegada está en
   `palabras.js`, que comparte con la sopa de letras.
   ========================================================================== */

/* El lector de la lista pegada vive en `palabras.js`, compartido con la sopa de
   letras: dos versiones del mismo lector terminan leyendo distinto, y el día que
   una acepte la tabulación y la otra no, nadie entenderá por qué la misma lista
   funciona en una actividad y en la otra no. Es el mismo argumento por el que
   `lista.js` ya vivía aparte. */
export { parsearPalabras, MIN_LARGO, MAX_PALABRAS } from './palabras.js';
import { parsearPalabras, barajar } from './palabras.js';

const k = (f, c) => `${f},${c}`;

/** ¿Cabe `palabra` empezando en (f,c) hacia `dir`, en la cuadrícula `celdas`? */
const cabe = (celdas, ejes, palabra, f, c, dir) => {
  const df = dir === 'v' ? 1 : 0;
  const dc = dir === 'h' ? 1 : 0;
  let cruces = 0;

  /* Las puntas: antes del principio y después del final, vacío. */
  if (celdas.has(k(f - df, c - dc))) return null;
  if (celdas.has(k(f + df * palabra.length, c + dc * palabra.length))) return null;

  for (let i = 0; i < palabra.length; i++) {
    const ff = f + df * i, cc = c + dc * i;
    const hay = celdas.get(k(ff, cc));
    if (hay) {
      if (hay !== palabra[i]) return null;   // choca con otra letra
      /* UN CRUCE ES PERPENDICULAR, POR DEFINICIÓN. Si la casilla ya lleva una
         palabra en ESTA misma dirección, no la estaríamos cruzando: la
         estaríamos montando encima. Con «CAT» ya puesta, «CATS» cumple todo lo
         demás —las puntas libres, los lados libres— y se coloca encima; a
         partir de ahí la pista dice CAT y la cuadrícula dice CATS, con una sola
         numeración para las dos. Salió al reintentar las que no entraban: la
         cuadrícula llega más llena y estos solapes aparecen. */
      if (ejes.get(k(ff, cc))?.has(dir)) return null;
      cruces++;
      continue;                              // en el cruce, los lados son legítimos
    }
    /* Celda nueva: los dos lados tienen que estar vacíos, o crearíamos una
       palabra que nadie escribió. */
    const l1 = dir === 'h' ? k(ff - 1, cc) : k(ff, cc - 1);
    const l2 = dir === 'h' ? k(ff + 1, cc) : k(ff, cc + 1);
    if (celdas.has(l1) || celdas.has(l2)) return null;
  }
  return cruces > 0 ? cruces : null;
};

/** Deja anotado que por esta casilla pasa una palabra en esta dirección. */
const marcar = (ejes, f, c, dir) => {
  const clave = k(f, c);
  if (!ejes.has(clave)) ejes.set(clave, new Set());
  ejes.get(clave).add(dir);
};

/* Un intento completo con UN orden dado. Se separó de `generar` para poder
   probar varios órdenes y quedarse con el mejor: ver más abajo. */
const armarUna = (orden) => {
  const celdas = new Map();
  /* Qué direcciones pasan ya por cada casilla. Con la letra sola no basta: hay
     que saber si la que hay es de una horizontal o de una vertical. */
  const ejes = new Map();
  const puestas = [];
  let pendientes = orden;

  /* VARIAS PASADAS, no una. Una palabra que no encuentra sitio hoy puede
     encontrarlo dentro de tres colocaciones, cuando la cuadrícula tenga letras
     que todavía no tiene: la cuadrícula solo crece, así que reintentar nunca
     empeora. Antes se descartaba en el primer intento y se perdía sin más.
     Se repite mientras la pasada anterior haya colocado algo; cuando una pasada
     entera no coloca nada, lo que queda no entra de ninguna manera. */
  for (;;) {
    const quedan = [];
    for (const entrada of pendientes) {
      if (!colocar(celdas, ejes, puestas, entrada)) quedan.push(entrada);
    }
    if (quedan.length === pendientes.length) return { celdas, puestas, sinSitio: quedan };
    if (!quedan.length) return { celdas, puestas, sinSitio: [] };
    pendientes = quedan;
  }
};

/** Coloca una entrada si puede. Devuelve si lo consiguió. */
const colocar = (celdas, ejes, puestas, entrada) => {
  {
    const { palabra } = entrada;

    if (!puestas.length) {
      for (let i = 0; i < palabra.length; i++) { celdas.set(k(0, i), palabra[i]); marcar(ejes, 0, i, 'h'); }
      puestas.push({ ...entrada, fila: 0, col: 0, dir: 'h' });
      return true;
    }

    /* Todas las colocaciones válidas: por cada letra de la palabra nueva, se
       prueba contra cada celda de la cuadrícula que tenga esa letra. */
    const opciones = [];
    for (let i = 0; i < palabra.length; i++) {
      for (const [clave, letra] of celdas) {
        if (letra !== palabra[i]) continue;
        const [f, c] = clave.split(',').map(Number);
        for (const dir of ['h', 'v']) {
          const inicioF = dir === 'v' ? f - i : f;
          const inicioC = dir === 'h' ? c - i : c;
          const cruces = cabe(celdas, ejes, palabra, inicioF, inicioC, dir);
          if (cruces) opciones.push({ fila: inicioF, col: inicioC, dir, cruces });
        }
      }
    }

    if (!opciones.length) return false;

    /* Se prefiere la que MÁS CRUZA —un crucigrama trabado se resuelve mejor que
       uno que es un árbol— y, a igualdad, la que deja la cuadrícula más
       compacta: una tira de dos metros no cabe en una pizarra. */
    const caja = puestas.reduce((b, p) => ({
      f0: Math.min(b.f0, p.fila), c0: Math.min(b.c0, p.col),
      f1: Math.max(b.f1, p.fila + (p.dir === 'v' ? p.palabra.length - 1 : 0)),
      c1: Math.max(b.c1, p.col + (p.dir === 'h' ? p.palabra.length - 1 : 0)),
    }), { f0: 0, c0: 0, f1: 0, c1: 0 });

    const coste = (o) => {
      const f1 = o.fila + (o.dir === 'v' ? palabra.length - 1 : 0);
      const c1 = o.col + (o.dir === 'h' ? palabra.length - 1 : 0);
      const alto = Math.max(caja.f1, f1) - Math.min(caja.f0, o.fila);
      const ancho = Math.max(caja.c1, c1) - Math.min(caja.c0, o.col);
      /* El lado largo pesa el doble: lo que arruina una cuadrícula es que se
         estire, no que crezca pareja. */
      return Math.max(alto, ancho) * 2 + Math.min(alto, ancho);
    };

    opciones.sort((a, b) => (b.cruces - a.cruces) || (coste(a) - coste(b)));
    const elegida = opciones[0];
    const df = elegida.dir === 'v' ? 1 : 0;
    const dc = elegida.dir === 'h' ? 1 : 0;
    for (let i = 0; i < palabra.length; i++) {
      celdas.set(k(elegida.fila + df * i, elegida.col + dc * i), palabra[i]);
      marcar(ejes, elegida.fila + df * i, elegida.col + dc * i, elegida.dir);
    }
    puestas.push({ ...entrada, fila: elegida.fila, col: elegida.col, dir: elegida.dir });
    return true;
  }
};

/**
 * Arma el crucigrama.
 *
 * Devuelve la cuadrícula ya recortada a su caja mínima, las palabras colocadas
 * con su número y coordenadas, y las que no entraron.
 */
export const generar = ({ palabras = [], azar = Math.random } = {}) => {
  /* VARIOS INTENTOS, Y SE QUEDA EL MEJOR. Cuántas palabras entran depende mucho
     del orden: la primera se pone sola y de ella cuelga todo lo demás, así que
     un mal arranque cuesta dos o tres palabras. Probar unos cuantos órdenes y
     quedarse con el que más coloca es barato —son listas de diez o veinte
     palabras— y es lo que más reduce las que se quedan fuera.
     A igualdad de colocadas gana la cuadrícula más compacta: proyectada, una
     tira larga se lee peor que un bloque.
     Sigue siendo determinista: todo el azar sale del `azar` que se inyecta, así
     que la sonda puede reproducir cualquier crucigrama. */
  let mejor = null;
  for (let intento = 0; intento < 12; intento++) {
    /* Barajar y DESPUÉS ordenar por largo: las largas primero porque son las que
       dan cruces, y el barajado decide entre las del mismo largo. */
    const orden = barajar(palabras, azar)
      .map((p, i) => ({ ...p, i }))
      .sort((a, b) => (b.palabra.length - a.palabra.length) || (a.i - b.i));

    const intentada = armarUna(orden);
    const fs = [...intentada.celdas.keys()].map(x => Number(x.split(',')[0]));
    const cs = [...intentada.celdas.keys()].map(x => Number(x.split(',')[1]));
    const lado = fs.length
      ? Math.max(Math.max(...fs) - Math.min(...fs), Math.max(...cs) - Math.min(...cs))
      : 0;

    if (!mejor
        || intentada.puestas.length > mejor.puestas.length
        || (intentada.puestas.length === mejor.puestas.length && lado < mejor.lado)) {
      mejor = { ...intentada, lado };
    }
    if (!mejor.sinSitio.length) break;   // no se puede hacer mejor que todas
  }

  const { celdas, puestas, sinSitio } = mejor;

  if (!puestas.length) return { ancho: 0, alto: 0, celdas: [], colocadas: [], fuera: sinSitio };

  /* Recortar a la caja mínima: la cuadrícula se construyó alrededor del origen
     y tiene coordenadas negativas. */
  const fs = [...celdas.keys()].map(x => Number(x.split(',')[0]));
  const cs = [...celdas.keys()].map(x => Number(x.split(',')[1]));
  const f0 = Math.min(...fs), c0 = Math.min(...cs);
  const alto = Math.max(...fs) - f0 + 1;
  const ancho = Math.max(...cs) - c0 + 1;

  const rejilla = Array.from({ length: alto }, () => Array(ancho).fill(null));
  for (const [clave, letra] of celdas) {
    const [f, c] = clave.split(',').map(Number);
    rejilla[f - f0][c - c0] = letra;
  }

  const colocadas = puestas.map(p => ({ ...p, fila: p.fila - f0, col: p.col - c0 }));

  /* LA NUMERACIÓN es la del crucigrama de papel: se recorre de izquierda a
     derecha y de arriba abajo, y cada casilla que EMPIEZA una palabra se lleva
     el siguiente número. Una casilla que empieza dos —una horizontal y una
     vertical— lleva un solo número, el mismo para las dos. */
  let n = 0;
  const numeroDe = new Map();
  for (let f = 0; f < alto; f++) {
    for (let c = 0; c < ancho; c++) {
      if (!rejilla[f][c]) continue;
      const empieza = colocadas.some(p => p.fila === f && p.col === c);
      if (empieza) numeroDe.set(k(f, c), ++n);
    }
  }
  for (const p of colocadas) p.numero = numeroDe.get(k(p.fila, p.col));

  return {
    ancho, alto,
    celdas: rejilla,
    numeros: [...numeroDe].map(([clave, num]) => {
      const [f, c] = clave.split(',').map(Number);
      return { fila: f, col: c, numero: num };
    }),
    colocadas: colocadas.sort((a, b) => a.numero - b.numero),
    fuera: sinSitio,
  };
};

/** Las dos listas de pistas, como se imprimen. */
export const pistas = (crucigrama) => ({
  horizontales: crucigrama.colocadas.filter(p => p.dir === 'h'),
  verticales: crucigrama.colocadas.filter(p => p.dir === 'v'),
});
