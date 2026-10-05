/* ============================================================================
   LA SOPA DE LETRAS
   ----------------------------------------------------------------------------
   El docente pega las palabras de la clase y sale una sopa. Otra vez, y sale
   otra distinta con las mismas.

   Nada precargado, como el resto de la sección: las palabras son las de hoy.

   ────────────────────────────────────────────────────────────────────────────
   LA DIFICULTAD ES UNA DECISIÓN DEL DOCENTE, NO UN NÚMERO
   ────────────────────────────────────────────────────────────────────────────
   Lo que hace difícil una sopa no es el tamaño de la cuadrícula: son las
   DIRECCIONES en que pueden ir las palabras. Y eso cambia con el curso, no con
   el contenido — la misma lista de vocabulario es un ejercicio de reconocimiento
   en Básico I y un pasatiempo en Intermedio.

     · FÁCIL     solo → y ↓. Se lee como se lee, y en un curso que todavía está
                 aprendiendo el alfabeto latino en otro idioma eso ya es trabajo.
     · MEDIA     además las dos diagonales hacia abajo. Obliga a mirar la
                 cuadrícula como plano y no como renglones.
     · DIFÍCIL   las ocho, o sea también AL REVÉS. Es otro ejercicio: ya no se
                 reconoce la palabra, se reconstruye.

   ────────────────────────────────────────────────────────────────────────────
   DOS PALABRAS EN LÍNEA NO PUEDEN TOCARSE
   ────────────────────────────────────────────────────────────────────────────
   Si MELON acaba en una casilla y APPLE empieza en la siguiente, en la misma
   fila y en la misma dirección, la cuadrícula contiene MELONAPPLE. Las dos
   palabras están bien puestas y la sopa se puede resolver, pero al marcarlas se
   ven como una sola cosa larga y el alumno lee algo que nadie escribió.

   Se prohíbe SOLO en línea. Que se crucen o que corran en paralelo pegadas no
   molesta —eso es lo normal en una sopa y es lo que la hace densa—; lo que
   confunde es la continuación, porque es la única que el ojo lee de corrido.

   Para saberlo hay que recordar POR DÓNDE PASA CADA DIRECCIÓN, no solo qué
   letra hay: una casilla ocupada por una palabra perpendicular es un cruce
   —bienvenido— y una ocupada por otra en la misma dirección es una
   continuación. Con la cuadrícula sola no se distinguen.

   ────────────────────────────────────────────────────────────────────────────
   EL RELLENO NO ES AZAR PURO, Y ESO IMPORTA
   ────────────────────────────────────────────────────────────────────────────
   Rellenar los huecos con letras uniformes del alfabeto delata las palabras: en
   inglés y en español las K, W, X, Y, Z casi no aparecen en el vocabulario de
   clase, así que una cuadrícula llena de ellas dibuja un mapa donde lo que NO es
   raro es la respuesta. El alumno resuelve la sopa mirando la textura, no
   leyendo.

   Aquí el relleno se saca de las MISMAS LETRAS de las palabras puestas, con su
   frecuencia real. La sopa queda pareja y hay que leerla.

   ────────────────────────────────────────────────────────────────────────────
   Y SE PUEDE RESOLVER PROYECTADA
   ────────────────────────────────────────────────────────────────────────────
   Clic en la primera letra, clic en la última. NO se arrastra: proyectando, el
   profesor maneja el ratón desde el computador y arrastrar en diagonal sobre una
   cuadrícula es justo lo que no sale a la primera delante de todo el curso. Dos
   clics no fallan, y en una pizarra táctil funcionan igual.

   SE COMPRUEBA CONTRA DÓNDE ESTÁ PUESTA LA PALABRA, no contra si las letras
   deletrean algo de la lista. Con veinte palabras y relleno sacado de sus mismas
   letras, tarde o temprano «PLUM» aparece por accidente en otro sitio; darlo por
   bueno dejaría la palabra de verdad sin encontrar y la lista sin tachar.

   Y VALE AL DERECHO Y AL REVÉS: quien ve la palabra empezando por el final la
   marca desde ahí, y no hay ningún motivo para castigarlo.

   ────────────────────────────────────────────────────────────────────────────
   Este archivo es PURO —ni React ni DOM— para poder probarlo:
   `tools/check-sopa.mjs`. El lector de la lista está en `palabras.js`.
   ========================================================================== */
import { barajar } from './palabras.js';

/** Las ocho direcciones, con su nombre para poder decir cuál se usó. */
export const DIRECCIONES = {
  E:  { df: 0,  dc: 1 },   // →
  S:  { df: 1,  dc: 0 },   // ↓
  SE: { df: 1,  dc: 1 },   // ↘
  NE: { df: -1, dc: 1 },   // ↗
  O:  { df: 0,  dc: -1 },  // ←
  N:  { df: -1, dc: 0 },   // ↑
  NO: { df: -1, dc: -1 },  // ↖
  SO: { df: 1,  dc: -1 },  // ↙
};

/** Qué direcciones entran en cada nivel. Es LA perilla de dificultad. */
export const NIVELES = {
  facil:   ['E', 'S'],
  media:   ['E', 'S', 'SE', 'NE'],
  dificil: Object.keys(DIRECCIONES),
};

/** Más de veinte de lado no se lee proyectado ni cabe cómodo en una hoja. */
export const MAX_LADO = 20;
/** Cuántas colocaciones al azar se prueban antes de recorrer la cuadrícula
    entera. Con el azar se reparten bien; el recorrido es la red de seguridad. */
const INTENTOS = 120;

/**
 * El lado de la cuadrícula.
 * Sale de dos cosas: tiene que caber la palabra más larga, y tiene que sobrar
 * sitio para que las palabras no queden apelotonadas —si el relleno es casi
 * nada, se ven a la primera—. La raíz del doble de letras da esa holgura.
 */
export const ladoPara = (palabras) => {
  if (!palabras.length) return 0;
  const masLarga = Math.max(...palabras.map(p => p.palabra.length));
  const letras = palabras.reduce((n, p) => n + p.palabra.length, 0);
  /* El 2,6 sale de mirar sopas hechas: con el doble de casillas que letras,
     las palabras ocupan casi la mitad de la cuadrícula y se ven a la primera —
     apenas hay relleno donde perderse. Alrededor de un tercio es la densidad de
     un pasatiempo de papel, y esa es la que da esta raíz. */
  return Math.min(MAX_LADO, Math.max(masLarga, Math.ceil(Math.sqrt(letras * 2.6)) + 1));
};

/** La dirección de un eje, sin sentido: → y ← son el mismo eje, y una palabra
    puesta al revés continúa a otra igual de bien. */
const eje = (df, dc) => `${Math.abs(df)}${Math.abs(dc)}${df * dc > 0 ? '+' : '-'}`;

/**
 * ¿Cabe `palabra` desde (f,c) hacia (df,dc)?
 *
 * Cruzarse vale si la letra coincide. Lo que NO vale es quedar pegada en línea a
 * otra palabra del mismo eje: ahí las dos se leen de corrido como una sola.
 * `ejes` dice qué ejes ya pasan por cada casilla.
 */
const cabe = (rejilla, ejes, lado, palabra, f, c, df, dc) => {
  const mio = eje(df, dc);
  for (let i = 0; i < palabra.length; i++) {
    const ff = f + df * i, cc = c + dc * i;
    if (ff < 0 || ff >= lado || cc < 0 || cc >= lado) return false;
    const hay = rejilla[ff][cc];
    if (hay && hay !== palabra[i]) return false;
  }
  /* Las puntas: la casilla anterior al principio y la siguiente al final no
     pueden estar ocupadas por una palabra del MISMO eje. Que haya una
     perpendicular cruzando ahí es normal y no se lee de corrido. */
  for (const [ff, cc] of [[f - df, c - dc], [f + df * palabra.length, c + dc * palabra.length]]) {
    if (ff < 0 || ff >= lado || cc < 0 || cc >= lado) continue;
    if (ejes.get(`${ff},${cc}`)?.has(mio)) return false;
  }
  return true;
};

/**
 * Arma la sopa.
 *
 * Devuelve la cuadrícula ya rellena, dónde quedó cada palabra, y las que no
 * cupieron — que se dicen y no se esconden: el docente pidió diez y tiene que
 * saber que salieron ocho antes de repartir la hoja.
 */
export const generar = ({ palabras = [], dificultad = 'media', azar = Math.random } = {}) => {
  const dirs = NIVELES[dificultad] || NIVELES.media;
  const lado = ladoPara(palabras);
  if (!lado) return { lado: 0, celdas: [], colocadas: [], fuera: [], dificultad };

  const rejilla = Array.from({ length: lado }, () => Array(lado).fill(null));
  /* Qué ejes pasan por cada casilla, para poder distinguir un cruce de una
     continuación. La rejilla sola no lo dice: solo guarda letras. */
  const ejes = new Map();
  const colocadas = [];
  const fuera = [];

  /* Las largas primero: son las que menos sitios tienen, y dejarlas para el
     final es como quedarse sin sitio para el sofá por haber puesto las sillas. */
  const orden = barajar(palabras, azar).sort((a, b) => b.palabra.length - a.palabra.length);

  for (const entrada of orden) {
    const { palabra } = entrada;
    if (palabra.length > lado) { fuera.push({ ...entrada, motivo: 'larga' }); continue; }

    let puesta = null;

    /* Primero a lo bruto y al azar, que es lo que reparte bien las palabras por
       toda la cuadrícula. */
    for (let t = 0; t < INTENTOS && !puesta; t++) {
      const dir = dirs[Math.floor(azar() * dirs.length)];
      const { df, dc } = DIRECCIONES[dir];
      const f = Math.floor(azar() * lado);
      const c = Math.floor(azar() * lado);
      if (cabe(rejilla, ejes, lado, palabra, f, c, df, dc)) puesta = { dir, df, dc, fila: f, col: c };
    }

    /* Y si el azar no dio con ninguno, se recorre todo antes de rendirse: una
       palabra que SÍ cabía y se descartó por mala suerte es un fallo que el
       docente vive como «esta app pierde palabras». */
    if (!puesta) {
      for (const dir of barajar(dirs, azar)) {
        const { df, dc } = DIRECCIONES[dir];
        for (let f = 0; f < lado && !puesta; f++) {
          for (let c = 0; c < lado && !puesta; c++) {
            if (cabe(rejilla, ejes, lado, palabra, f, c, df, dc)) puesta = { dir, df, dc, fila: f, col: c };
          }
        }
        if (puesta) break;
      }
    }

    if (!puesta) { fuera.push({ ...entrada, motivo: 'sinsitio' }); continue; }

    const mio = eje(puesta.df, puesta.dc);
    for (let i = 0; i < palabra.length; i++) {
      const ff = puesta.fila + puesta.df * i, cc = puesta.col + puesta.dc * i;
      rejilla[ff][cc] = palabra[i];
      const clave = `${ff},${cc}`;
      if (!ejes.has(clave)) ejes.set(clave, new Set());
      ejes.get(clave).add(mio);
    }
    colocadas.push({ ...entrada, ...puesta });
  }

  /* EL RELLENO, sacado de las letras que ya están puestas y con su frecuencia:
     con letras uniformes del alfabeto, las K y las W del relleno dibujan un mapa
     de dónde NO están las palabras y la sopa se resuelve mirando, sin leer.
     Si no se colocó nada —no debería—, queda el alfabeto como red. */
  const bolsa = colocadas.flatMap(p => p.palabra.split(''));
  const letras = bolsa.length ? bolsa : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  for (let f = 0; f < lado; f++) {
    for (let c = 0; c < lado; c++) {
      if (!rejilla[f][c]) rejilla[f][c] = letras[Math.floor(azar() * letras.length)];
    }
  }

  return {
    lado,
    celdas: rejilla,
    colocadas: colocadas.sort((a, b) => a.original.localeCompare(b.original)),
    fuera,
    dificultad,
  };
};

/** Las casillas que ocupa una palabra colocada, para pintar la solución. */
export const casillasDe = (p) =>
  Array.from({ length: p.palabra.length }, (_, i) => ({
    fila: p.fila + p.df * i,
    col: p.col + p.dc * i,
  }));

/**
 * Las casillas entre dos, si están en línea recta en una de las ocho
 * direcciones. Si no —un salto de caballo, o la misma casilla dos veces—,
 * devuelve `null`: no es una selección posible en una sopa.
 */
export const segmentoEntre = (a, b) => {
  if (!a || !b) return null;
  const df = Math.sign(b.fila - a.fila);
  const dc = Math.sign(b.col - a.col);
  const altoF = Math.abs(b.fila - a.fila);
  const anchoC = Math.abs(b.col - a.col);
  /* Recta solo si es horizontal, vertical, o diagonal EXACTA: una diagonal
     torcida no pasa por casillas enteras y no se puede marcar. */
  if (altoF && anchoC && altoF !== anchoC) return null;
  const largo = Math.max(altoF, anchoC) + 1;
  if (largo < 2) return null;
  return Array.from({ length: largo }, (_, i) => ({ fila: a.fila + df * i, col: a.col + dc * i }));
};

const clave = (casillas) => casillas.map(c => `${c.fila},${c.col}`).join('|');

/**
 * Qué palabra colocada ocupa EXACTAMENTE el segmento entre dos casillas, en
 * cualquiera de los dos sentidos. `null` si ahí no hay ninguna.
 */
export const palabraEntre = (sopa, a, b) => {
  const seg = segmentoEntre(a, b);
  if (!seg || !sopa?.colocadas) return null;
  const k = clave(seg);
  const kAlReves = clave([...seg].reverse());
  return sopa.colocadas.find(p => {
    const suya = clave(casillasDe(p));
    return suya === k || suya === kAlReves;
  }) || null;
};
