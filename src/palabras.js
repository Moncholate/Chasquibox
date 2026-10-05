/* ============================================================================
   LA LISTA DE PALABRAS DE UNA ACTIVIDAD
   ----------------------------------------------------------------------------
   Lo que el docente pega para armar un crucigrama o una sopa de letras: una
   palabra por línea, con su pista detrás si quiere darla.

   Vive aparte por lo mismo que `lista.js` —el limpiador de nombres que comparten
   los grupos y la ruleta—: dos versiones del mismo lector terminan leyendo
   distinto, y el día que una acepte la tabulación y la otra no, nadie va a
   entender por qué la misma lista funciona en una actividad y en la otra no.

   DOS FORMAS DE LA MISMA PALABRA, y las dos hacen falta:

     · `palabra` es lo que ocupa casillas: solo letras, en mayúsculas, sin tildes
       ni espacios ni guiones. «ice cream» son ocho casillas seguidas, que es
       como se resuelve en cualquier pasatiempo de papel.
     · `original` es como se escribió, con sus tildes y sus espacios. Es lo que se
       enseña al corregir y lo que se lee en la lista de la hoja: nadie quiere
       leer «ICECREAM» en la lista de palabras a buscar.

   Este archivo es PURO: `tools/check-palabras.mjs`.
   ========================================================================== */

/** Lo mínimo que vale la pena buscar o cruzar. */
export const MIN_LARGO = 2;
/* Lo máximo que es creíble. «refrigerator» son 12 letras y «responsibility» 14;
   por encima de 15 casi siempre es un renglón que se pegó entero porque no
   reconocimos su separador, y una palabra así no cabe proyectada ni en una hoja.
   Se dice y no se coloca: es preferible que falte a que el curso se ponga a
   resolver un engendro. */
export const MAX_LARGO = 15;
/** Tope: más no cabe en una hoja ni en una pizarra. */
export const MAX_PALABRAS = 40;

/* ────────────────────────────────────────────────────────────────────────────
   LO QUE SE PEGA NO VIENE COMO UNO SE LO IMAGINA
   ────────────────────────────────────────────────────────────────────────────
   Este lector daba por hecho una palabra por renglón y solo tres separadores.
   Todo lo demás lo tomaba como UNA palabra y lo pegaba entero: «apple, orange,
   lemon» acababa siendo APPLEORANGELEMON dentro de la cuadrícula, y «apple:
   manzana» acababa siendo APPLEMANZANA. El docente veía palabras que nadie
   escribió y no tenía de dónde agarrarse para entender por qué. Lo reportó
   usándolo en clase.

   NI EL CRUCIGRAMA NI LA SOPA PODÍAN CAZARLO, y conviene entender por qué antes
   de tocar nada: para ellos APPLEMANZANA es una palabra tan legítima como
   cualquier otra, y sus sondas comprueban que la cuadrícula solo contenga
   palabras DE LA LISTA. Esa lo era. El fallo estaba un paso antes, aquí, y
   ninguna prueba de más abajo podía verlo.

   Ahora se admite lo que la gente escribe de verdad:
     · La pista detrás de tabulación, «=», «:», «/», « - » o entre paréntesis.
     · VARIAS palabras en un renglón, separadas por coma o punto y coma.

   DOS DETALLES QUE PARECEN NIMIOS Y NO LO SON:

   · La coma NO siempre separa. «apple = fruta roja, redonda» es UNA palabra con
     una pista que lleva coma dentro. La regla: si el renglón trae UN separador,
     la coma es parte de la pista; si no trae ninguno, o trae dos o más, la coma
     está separando palabras. Y nunca se parte dentro de un paréntesis.
   · El guion sigue exigiendo espacios a los lados. Sin ellos no hay manera de
     distinguir «apple-manzana» de «e-mail» o «twenty-one», y partir esas dos
     sería peor que no partir la primera.
   ──────────────────────────────────────────────────────────────────────────── */
const SEPARADOR = /\t|\s*[=:]\s*|\s*\/\s*|\s+[–—-]\s+/;
const SEPARADOR_G = new RegExp(SEPARADOR.source, 'g');
/** «apple (manzana)»: el paréntesis del final es la pista. */
const PARENTESIS = /^(.*?)[([]([^)\]]*)[)\]]\s*$/;

/** Parte por coma o punto y coma, pero NUNCA dentro de un paréntesis. */
const partirFuera = (linea) => {
  const trozos = [];
  let actual = '', hondo = 0;
  for (const ch of linea) {
    if (ch === '(' || ch === '[') hondo++;
    else if (ch === ')' || ch === ']') hondo = Math.max(0, hondo - 1);
    if ((ch === ',' || ch === ';') && hondo === 0) { trozos.push(actual); actual = ''; continue; }
    actual += ch;
  }
  trozos.push(actual);
  return trozos;
};

/** Solo letras, y en mayúsculas: una casilla es una letra. */
/* La \u00d1 se queda: es una letra del espa\u00f1ol, no una N con tilde. Quitarla con
   las dem\u00e1s tildes hac\u00eda de \u00aba\u00f1o\u00bb un \u00abANO\u00bb, y en Chasquibox la sopa la usan
   docentes de cualquier asignatura, no solo de ingl\u00e9s. */
export const soloLetras = (s) => String(s == null ? '' : s)
  .normalize('NFC').toUpperCase()
  .replace(/[^\u00d1]/g, ch => ch.normalize('NFD').replace(/[\u0300-\u036f]/g, ''))
  .replace(/[^A-Z\u00d1]/g, '');

/**
 * De lo pegado a la lista de entradas.
 * Devuelve también lo DESCARTADO y por qué: si el docente pegó doce palabras y
 * salen diez, tiene que saber cuáles se cayeron y por qué motivo.
 */
export const parsearPalabras = (texto) => {
  const vistas = new Set();
  const fuera = [];
  const lista = [];
  for (const renglon of String(texto == null ? '' : texto).split(/\r?\n/)) {
    const base = renglon.trim();
    if (!base) continue;

    /* ¿Este renglón trae una palabra o varias? Se cuentan los separadores
       IGNORANDO lo que va entre paréntesis, que ahí dentro es pista y no
       estructura. */
    const cuantos = (base.replace(/[([][^)\]]*[)\]]/g, '').match(SEPARADOR_G) || []).length;
    const trozos = cuantos === 1 ? [base] : partirFuera(base);

    for (const trozo of trozos) {
      const limpia = trozo.replace(/^\s*\d+\s*[.)\-]\s*/, '').trim();
      if (!limpia) continue;

      const corte = limpia.split(SEPARADOR);
      let original, pista;
      if (corte.length > 1) {
        original = corte[0].trim();
        pista = corte.slice(1).join(' ').trim();
      } else {
        const entre = limpia.match(PARENTESIS);
        if (entre && entre[1].trim()) { original = entre[1].trim(); pista = entre[2].trim(); }
        else { original = limpia; pista = ''; }
      }

      const palabra = soloLetras(original);
      if (palabra.length < MIN_LARGO) { fuera.push({ original: limpia, motivo: 'corta' }); continue; }
      if (palabra.length > MAX_LARGO) { fuera.push({ original: limpia, motivo: 'larga' }); continue; }
      if (vistas.has(palabra)) { fuera.push({ original: limpia, motivo: 'repetida' }); continue; }
      vistas.add(palabra);
      if (lista.length >= MAX_PALABRAS) { fuera.push({ original: limpia, motivo: 'sobran' }); continue; }
      lista.push({ palabra, original, pista });
    }
  }
  return { lista, fuera };
};

/** Baraja una copia (Fisher-Yates). `azar` se inyecta para poder probarlo. */
export const barajar = (lista, azar = Math.random) => {
  const a = [...lista];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(azar() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
