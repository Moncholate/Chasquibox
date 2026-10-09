/* ============================================================================
   CRUCIGRAMA
   ----------------------------------------------------------------------------
   El docente pega las palabras de la clase y sale un crucigrama. «Otra vez» y
   sale otro distinto con las mismas.

   NADA PRECARGADO, como el resto de la sección: las palabras son las de hoy.
   Las pistas son opcionales —`palabra = pista` por línea— porque hay dos formas
   legítimas de usarlo, y las dos se dan: con la pista escrita, y con el docente
   dictándola mientras el curso mira la cuadrícula.

   DOS SALIDAS, PORQUE HAY DOS USOS:

     · PROYECTADO se resuelve entre todos: sale la cuadrícula vacía, se leen las
       pistas y el curso va cantando palabras. SE DESTAPAN DE UNA EN UNA —un
       toque en el número de la cuadrícula, o en la pista— porque enseñarlas
       todas de golpe mata el ejercicio: el curso propone, se comprueba esa y se
       sigue; con todo a la vista ya no hay nada que proponer. Lo pidió el
       profesor usándolo. «Ver las respuestas» sigue estando para el final.
     · IMPRESO se reparte. Un crucigrama que no se puede repartir es medio
       crucigrama, así que hay una hoja de verdad: cuadrícula vacía, pistas
       debajo, y NADA de la interfaz. La hoja del alumno nunca lleva respuestas
       —eso lo decide `@media print` en index.css, no un botón que se puede
       olvidar apagado.

   LAS CASILLAS SE MIDEN SOLAS. Una cuadrícula de 8 columnas y una de 25 no
   pueden usar la misma casilla: la segunda se sale de la pantalla y del papel.
   El lado sale del ancho disponible dividido por las columnas, con un tope para
   que un crucigrama de tres palabras no salga con casillas de diez centímetros,
   y con un SUELO para que una de veinte columnas no salga con casillas de
   dieciséis píxeles en un teléfono. Lo que no quepa se desplaza, que es
   preferible a una cuadrícula que se ve entera y no se puede leer.

   ────────────────────────────────────────────────────────────────────────────
   DUA: LO QUE AQUÍ NO ES OPCIONAL
   ────────────────────────────────────────────────────────────────────────────
   1. LA CUADRÍCULA NO SE LE LEE A NADIE, y es una decisión, no un olvido. Son
      cientos de casillas sueltas; un lector de pantalla las recorrería en orden
      de documento y diría «C, H, A, vacío, vacío, I…», que no es el crucigrama
      sino su ruido. Va silenciada con una frase que dice su tamaño, y todo lo
      que se puede usar de verdad está debajo: las dos listas de pistas, que son
      listas numeradas de verdad, con el largo de cada palabra y su respuesta.

   2. EL LARGO DE CADA PALABRA, ESCRITO. Es lo que hace cualquier crucigrama de
      periódico, y aquí evita además tener que contar casillas en una proyección
      desde el fondo de la sala, o con poca visión.

   3. LA RESPUESTA NO SE DISTINGUE SOLO POR EL COLOR. Lleva negrita y una flecha
      delante: proyectado, el acento se lava hasta casi el gris del texto.

   4. EL NÚMERO TIENE SUELO PROPIO. Es el texto más pequeño de toda la suite y
      estaba atado al 30% de la casilla; sin el suyo, con el suelo de la casilla
      todavía se quedaba en ocho píxeles.

   5. LO QUE CAMBIA SIN AVISAR, SE DICE. «Ver las respuestas» rellena la
      cuadrícula silenciada: al oído no pasaba nada. Hay un aviso que lo cuenta.

   LO QUE NO ENTRA SE DICE Y NO SE ESCONDE. Una palabra sin letras en común con
   las demás no se puede colocar; el docente pidió diez y tiene que saber que
   salieron ocho, o repartirá una hoja a la que le faltan dos.

   El motor y sus pruebas están en `../crucigrama.js`: un crucigrama mal armado
   no da error, da una cuadrícula que se ve perfecta y no se puede resolver.
   ========================================================================== */
import React, { useState } from 'react';
import { parsearPalabras, generar, pistas, MAX_PALABRAS } from '../crucigrama';
import { APAGADO, ENLACE } from '../ui';
import { Panel, Escenario, Accion, Cabeza } from '../zonas';
import BotonCelulares from './BotonCelulares';

/* LA CUADRÍCULA ES PAPEL, y va fija en los dos temas — igual que la carcasa del
   semáforo es un objeto oscuro en los dos. Un crucigrama es una hoja: blanco con
   tinta negra es lo que la mano espera al ir a escribir, y en modo oscuro unas
   casillas gris marengo con letras índigo no se leen ni se imprimen.
   Va en estilos y no en clases para que la capa de modo oscuro no lo toque: no
   hay nada que invertir en una hoja de papel. */
const PAPEL = '#ffffff';
const TRAZO = '#334155';   /* el borde de la casilla */
const NUMERO = '#475569';  /* 7,4:1 sobre el papel, y es el texto más chico */
const TINTA = '#4338ca';   /* la letra de la solución: 8,1:1 sobre el papel */

const Crucigrama = ({ lang = 'es' }) => {
  const es = lang === 'es';
  const [texto, setTexto] = useState('');
  const [cruci, setCruci] = useState(null);
  const [descartes, setDescartes] = useState([]);
  const [respuestas, setRespuestas] = useState(false);
  /* LAS QUE SE HAN DESTAPADO DE UNA EN UNA. Enseñarlas todas de golpe mata el
     ejercicio: el curso propone, se comprueba esa y se sigue. Con todo a la
     vista ya no hay nada que proponer. La clave es número + dirección porque una
     misma casilla puede empezar dos palabras, una horizontal y otra vertical. */
  const [reveladas, setReveladas] = useState(() => new Set());
  const clave = (x) => `${x.numero}${x.dir}`;
  const estaALaVista = (x) => respuestas || reveladas.has(clave(x));

  /* Destapar es acumulativo y no hay «volver a tapar» una sola: en clase se va
     hacia adelante, y un botón para deshacer palabra por palabra sería un
     control más que explicar a cambio de nada. Se tapa todo de una vez. */
  const revelar = (x) => setReveladas(v => new Set([...v, clave(x)]));
  const taparTodo = () => { setRespuestas(false); setReveladas(new Set()); };
  const algoALaVista = respuestas || reveladas.size > 0;

  const { lista, fuera } = parsearPalabras(texto);

  const armar = () => {
    const c = generar({ palabras: lista });
    setCruci(c);
    setDescartes(fuera);
    setRespuestas(false);
    setReveladas(new Set());
  };

  /* EL LADO DE LA CASILLA, en unidades del ESCENARIO (cqw/cqh) y nunca en
     porcentaje. Un % en el ancho se mide contra el ancho del contenedor y en el
     alto contra su alto, así que la misma cadena servía para `width` y no para
     `height`: las casillas salían aplastadas. cqw/cqh miden lo mismo en los dos.
     En PC la cuadrícula comparte el ancho con las pistas (van al lado), así que
     se reparte poco más de la mitad del escenario; a lo alto, casi todo.
     El tope evita que tres palabras salgan con casillas de diez centímetros; el
     reparto por columnas evita que veinte se salgan del teléfono. Lo que no
     quepa lo resuelve el scroll horizontal del contenedor, que es de la
     cuadrícula y no de la página. */
  const lado = cruci
    ? `max(28px, min(calc(55cqw / ${cruci.ancho}), calc(86cqh / ${cruci.alto}), 4.5rem))`
    : '2rem';

  /* EL NÚMERO NECESITA SU PROPIO SUELO. Es el texto más pequeño de toda la suite
     y estaba atado a la casilla al 30%: en una cuadrícula de veinte columnas, en
     un teléfono, salía a menos de cinco píxeles. Con el suelo de la casilla en
     28 sigue quedándose en ocho, que tampoco se lee. Se le pone el suyo, y si en
     una casilla apretada el número ocupa más de la cuenta, que ocupe: un número
     que no se lee no sirve de nada, y sin él no se sabe qué pista va dónde. */
  const numeroTam = `max(10px, calc(${lado} * 0.3))`;

  const { horizontales, verticales } = cruci ? pistas(cruci) : { horizontales: [], verticales: [] };

  const numeroEn = (f, c) => cruci.numeros.find(n => n.fila === f && n.col === c)?.numero;

  /* Las casillas de las palabras que están a la vista. Se calcula una vez por
     render y no por casilla: si no, cada una recorrería la lista entera. */
  const casillasALaVista = new Set();
  if (cruci) {
    for (const w of cruci.colocadas) {
      if (!estaALaVista(w)) continue;
      const df = w.dir === 'v' ? 1 : 0, dc = w.dir === 'h' ? 1 : 0;
      for (let i = 0; i < w.palabra.length; i++) casillasALaVista.add(`${w.fila + df * i},${w.col + dc * i}`);
    }
  }

  /* Las que EMPIEZAN en esta casilla: casi siempre una, a veces dos —la
     horizontal y la vertical comparten número y casilla de arranque—. Se
     destapan las dos, que es lo que el docente quiere decir al señalarla. */
  const empiezanEn = (f, c) => (cruci ? cruci.colocadas.filter(w => w.fila === f && w.col === c) : []);

  const Lista = ({ titulo, items }) => (
    items.length === 0 ? null : (
      <div className="min-w-0 flex-1">
        <h3 className="text-sm font-bold uppercase tracking-wider text-muted mb-2">{titulo}</h3>
        {/* LAS PISTAS SE LEEN DESDE LEJOS. Iban a 12px, que es tamaño de nota al
            pie: proyectadas desde el fondo de la sala no se leen, y son el
            contenido de la actividad, no su letra pequeña.

            UN TAMAÑO FIJO MÁS GRANDE NO BASTA: 20px en un computador
            proyectado sigue siendo nada. Crece con el ESCENARIO (cqw), con un
            piso para que no encoja de más y un techo para que no desborde la
            columna de las pistas. Mismo truco que el lado de la casilla. */}
        <ol className="space-y-1.5" style={{ fontSize: 'clamp(0.95rem, 1.45cqw, 2rem)' }}>
          {items.map(p => (
            /* CADA PISTA ES UN BOTÓN, y es el camino accesible de lo mismo que
               hace el número en la cuadrícula: destapar ESA palabra. La
               cuadrícula está silenciada para el lector de pantalla, así que si
               esto no existiera, destapar de una en una sería un gesto que solo
               tiene quien ve y usa ratón. */
            <li key={p.numero + p.dir} className="text-slate-800">
              <button
                type="button"
                onClick={() => revelar(p)}
                aria-expanded={estaALaVista(p)}
                className="w-full text-left flex gap-2 rounded px-1 -mx-1 py-0.5 hover:bg-slate-100"
              >
              <span className="font-bold tabular-nums shrink-0">{p.numero}.</span>
              <span className="min-w-0">
                {/* Sin pista escrita se deja el sitio marcado: el docente la dicta,
                    y una línea vacía dice «aquí va algo» mejor que la nada. */}
                {p.pista || <span className="text-muted">{'_'.repeat(10)}</span>}
                {/* EL LARGO, ESCRITO. Es lo que hace cualquier crucigrama de
                    periódico, y aquí además evita tener que contar casillas en
                    una proyección desde el fondo de la sala o con poca visión.
                    Va entre paréntesis, que es como se lee en el papel. */}
                <span className="ml-1.5 tabular-nums text-muted">
                  {/* Los paréntesis son para el ojo; al oído sobran y se leen
                      como signos sueltos. Dos versiones de lo mismo. */}
                  <span aria-hidden="true">({p.palabra.length})</span>
                  <span className="sr-only">{p.palabra.length} {es ? 'letras' : 'letters'}</span>
                </span>
                {/* LA RESPUESTA NO SE DISTINGUE SOLO POR EL COLOR. Va en negrita
                    y con una flecha delante: el color es la lectura rápida, pero
                    proyectado se lava, y quien no lo distinga tiene el peso y la
                    forma. Para quien la escucha, la flecha no dice nada, así que
                    ahí va la palabra «Respuesta».
                    El color va sobre el fondo de la PÁGINA, no sobre el papel: el
                    indigo-700 daba 2,44:1 en oscuro y lo cazó la sonda. `--marca`
                    es lo que los tokens ofrecen para el acento de interfaz, con un
                    valor por tema. */}
                {estaALaVista(p) && (
                  <b className="gh-solucion ml-2" style={{ color: 'var(--marca)' }}>
                    <span aria-hidden="true">→ </span>
                    <span className="sr-only">{es ? 'Respuesta: ' : 'Answer: '}</span>
                    {p.original}
                  </b>
                )}
              </span>
              </button>
            </li>
          ))}
        </ol>
      </div>
    )
  );

  return (
    <>
      <Escenario>
        {!cruci ? (
          <p className="text-muted text-center max-w-sm">
            {es ? 'Pega las palabras en el panel de la derecha y arma el crucigrama: aparece aquí.'
                : 'Paste the words in the panel on the right and build the crossword: it shows up here.'}
          </p>
        ) : (
          <div className="w-full max-h-full overflow-auto">
            {/* LA HOJA. Es lo único que se imprime: todo lo demás va al panel o
                lleva `gh-no-print`. En PC, la cuadrícula a la izquierda y las
                pistas a la derecha, como en el periódico: así cabe entero en una
                pantalla apaisada. Impreso (hoja angosta), una debajo de la otra. */}
            <div className="gh-hoja flex flex-col lg:flex-row lg:items-start gap-x-[3cqw] gap-y-4">
              {/* LA CUADRÍCULA NO SE LE LEE A NADIE, y esto es deliberado. Son
                  cientos de casillas sueltas: un lector de pantalla las recorrería
                  en el orden del documento y diría «C, H, A, vacío, vacío, I…»,
                  que no es el crucigrama sino su ruido. Lo que ESTÁ dicho es lo
                  que se puede usar: cuántas casillas hay, y al lado las dos listas
                  de pistas, que sí son listas de verdad, numeradas, con el largo
                  de cada palabra y con la respuesta cuando se piden. */}
              <p className="sr-only">
                {es ? `Cuadrícula de ${cruci.alto} filas por ${cruci.ancho} columnas con ${cruci.colocadas.length} palabras cruzadas. Las palabras, su número y su largo están en las listas de pistas.`
                    : `Grid of ${cruci.alto} rows by ${cruci.ancho} columns with ${cruci.colocadas.length} interlocking words. The words, their numbers and their lengths are in the clue lists.`}
              </p>
              <div className="overflow-x-auto shrink-0 mx-auto lg:mx-0">
                <div
                  aria-hidden="true"
                  className="grid w-max"
                  style={{ gridTemplateColumns: `repeat(${cruci.ancho}, ${lado})` }}
                >
                  {cruci.celdas.map((fila, f) => fila.map((letra, c) => {
                    const num = letra ? numeroEn(f, c) : null;
                    const arrancan = num ? empiezanEn(f, c) : [];
                    /* SE TOCA LA CASILLA ENTERA, NO EL NÚMERO. El número mide diez
                       píxeles en el peor caso y ahí no acierta nadie con el dedo;
                       su casilla mide veintiocho como mínimo. Es el mismo gesto
                       —señalar el número— con un blanco que existe de verdad. */
                    const Casilla = arrancan.length ? 'button' : 'div';
                    return (
                      <Casilla
                        key={`${f},${c}`}
                        {...(arrancan.length ? {
                          type: 'button',
                          onClick: () => arrancan.forEach(revelar),
                          /* FUERA DEL TABULADOR, a propósito. La cuadrícula está
                             silenciada para el lector de pantalla —son cientos de
                             casillas sueltas— y meter botones enfocables dentro de
                             algo silenciado es una trampa: el foco entra donde no
                             se anuncia nada. El camino accesible es la lista de
                             pistas, donde cada pista es un botón que hace esto
                             mismo y sí se anuncia. */
                          tabIndex: -1,
                        } : {})}
                        className={letra ? `relative ${arrancan.length ? 'cursor-pointer' : ''}` : ''}
                        style={{
                          width: lado, height: lado, padding: 0,
                          ...(letra ? { background: PAPEL, border: `1px solid ${TRAZO}` } : null),
                        }}
                      >
                        {num && (
                          <span className="absolute top-0 left-0.5 font-bold leading-none tabular-nums"
                                style={{ color: NUMERO, fontSize: numeroTam }}>
                            {num}
                          </span>
                        )}
                        {letra && casillasALaVista.has(`${f},${c}`) && (
                          <span className="gh-solucion absolute inset-0 flex items-center justify-center font-bold"
                                style={{ color: TINTA, fontSize: `calc(${lado} * 0.55)` }}>
                            {letra}
                          </span>
                        )}
                      </Casilla>
                    );
                  }))}
                </div>
              </div>

              <div className="min-w-0 flex-1 flex flex-col gap-y-5">
                <Lista titulo={es ? 'Horizontales' : 'Across'} items={horizontales} />
                <Lista titulo={es ? 'Verticales' : 'Down'} items={verticales} />
              </div>
            </div>

            {/* «VER LAS RESPUESTAS» CAMBIA LA PANTALLA ENTERA y no dice nada al
                oído: las letras aparecen dentro de una cuadrícula que está
                silenciada a propósito. Aquí se cuenta lo que pasó. */}
            <p role="status" aria-live="polite" className="sr-only">
              {respuestas
                ? (es ? 'Todas las respuestas a la vista, en la cuadrícula y en cada pista.' : 'All answers shown, in the grid and next to each clue.')
                : reveladas.size > 0
                  ? (es ? `${reveladas.size} ${reveladas.size === 1 ? 'palabra destapada' : 'palabras destapadas'}.` : `${reveladas.size} ${reveladas.size === 1 ? 'word revealed' : 'words revealed'}.`)
                  : (es ? 'Respuestas ocultas.' : 'Answers hidden.')}
            </p>
          </div>
        )}
      </Escenario>

      <Panel>
        <Cabeza titulo={es ? 'Crucigrama' : 'Crossword'}>
          {es ? 'Pega las palabras de la clase, una por línea, y sale un crucigrama. Se proyecta o se imprime.'
              : 'Paste the words from today’s lesson, one per line, and out comes a crossword. Project it or print it.'}
        </Cabeza>

        {!cruci ? (
          <div className="space-y-4">
            <label className="block">
              <span className="text-xs font-semibold text-slate-600">
                {es ? 'Las palabras' : 'The words'}{' '}
                <span className="font-normal text-muted">
                  {es ? '· una por línea, o varias separadas por comas; la pista, opcional, detrás de «=», «:» o entre paréntesis'
                      : '· one per line, or several separated by commas; the clue, optional, after “=”, “:” or in brackets'}
                </span>
              </span>
              <textarea
                value={texto} rows={10}
                onChange={(e) => setTexto(e.target.value)}
                placeholder={es
                  ? 'célula\nnúcleo = controla la célula\nmembrana = la rodea y la protege'
                  : 'apple\nbanana = it is yellow and long\ncherry = a small red fruit'}
                className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </label>

            <p className="text-xs text-muted">
              {es ? `${lista.length} ${lista.length === 1 ? 'palabra' : 'palabras'}. Con menos de cuatro el crucigrama queda pobre; más de ${MAX_PALABRAS} no caben en una hoja.`
                  : `${lista.length} ${lista.length === 1 ? 'word' : 'words'}. Fewer than four makes a thin crossword; more than ${MAX_PALABRAS} will not fit on a sheet.`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* LAS QUE NO ENTRARON. Va en el panel y no en la hoja: es
                información para el docente, no para el alumno. */}
            {(cruci.fuera.length > 0 || descartes.length > 0) && (
              /* DOS MOTIVOS DISTINTOS, Y NO DAN EL MISMO CONSEJO. Una palabra que
                 no cruza puede entrar con «otra vez»; un renglón que se leyó mal
                 no va a entrar nunca por insistir, hay que separarlo. Decirle al
                 docente «prueba otra vez» ante lo segundo es mandarlo a repetir
                 algo que no puede funcionar. */
              <div className="gh-no-print text-xs text-amber-900 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-2 space-y-1">
                {cruci.fuera.length > 0 && (
                  <p>
                    {es ? 'No entraron: ' : 'Left out: '}
                    <strong>{cruci.fuera.map(p => p.original).join(', ')}</strong>
                    {'. '}
                    {es ? 'Una palabra sin letras en común con las demás no se puede cruzar. Prueba «otra vez».'
                        : 'A word with no letters in common cannot cross anything. Try “again”.'}
                  </p>
                )}
                {descartes.length > 0 && (
                  <p>
                    {es ? 'No se usaron: ' : 'Not used: '}
                    <strong>{descartes.map(d => d.original).join(', ')}</strong>
                    {'. '}
                    {descartes.some(d => d.motivo === 'larga')
                      ? (es ? 'Alguna quedó demasiado larga: suele pasar cuando un renglón trae varias palabras y el separador no se reconoce. Sepáralas con coma, o pon la pista detrás de «=», «:» o entre paréntesis.'
                            : 'One is too long: that usually means a line held several words. Separate them with commas, or put the clue after “=”, “:” or in brackets.')
                      : (es ? 'Estaban repetidas o eran demasiado cortas.' : 'They were duplicates or too short.')}
                  </p>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              {/* «Ocultar» tapa TODO —lo destapado de una en una también—, que es
                  lo que la palabra promete. Y aparece en cuanto hay algo a la
                  vista, aunque sea una sola palabra: si no, destapar tres a mano
                  dejaría el botón diciendo «ver las respuestas» sin manera de
                  volver atrás. */}
              <button
                onClick={() => (algoALaVista ? taparTodo() : setRespuestas(true))}
                aria-pressed={algoALaVista}
                className={APAGADO}
              >
                {algoALaVista ? (es ? 'Ocultar respuestas' : 'Hide answers') : (es ? 'Ver las respuestas' : 'Show answers')}
              </button>
              <button onClick={() => window.print()} className={APAGADO}>
                {es ? 'Imprimir' : 'Print'}
              </button>
              <button onClick={armar} className={APAGADO}>{es ? 'Otra vez' : 'Again'}</button>
            </div>

            {/* Que se pueda destapar de a una no se ve mirando: hay que decirlo. */}
            <p className="text-xs text-muted">
              {es ? 'Toca el número de una palabra en la cuadrícula —o su pista— para destapar solo esa.'
                  : 'Tap a word’s number in the grid — or its clue — to reveal just that one.'}
            </p>
            <p className="text-xs text-muted">
              {es ? 'Lo impreso es siempre la hoja del alumno: cuadrícula vacía y pistas, sin respuestas aunque estén a la vista aquí.'
                  : 'What prints is always the student sheet: empty grid and clues, with no answers even if they are showing here.'}
            </p>

            <button onClick={() => { setCruci(null); taparTodo(); }} className={ENLACE}>
              {es ? 'cambiar las palabras' : 'change the words'}
            </button>

            {/* CON CELULARES va ESTE crucigrama, el que está en pantalla, y no
                otro armado de nuevo: cada uno lo resuelve en su teléfono y en la
                pantalla una palabra se destapa cuando la tiene la mitad del
                curso (así el que sabe mucho no lo llena solo). */}
            <BotonCelulares lang={lang} actividad={{
              tipo: 'crucigrama', pregunta: '', ancho: cruci.ancho, alto: cruci.alto, destapar: 'mitad',
              palabras: cruci.colocadas.map(({ palabra, original, pista, fila, col, dir, numero }) =>
                ({ palabra, original, ...(pista ? { pista } : {}), fila, col, dir, numero })),
            }} />
          </div>
        )}
      </Panel>

      {!cruci && (
        <Accion onClick={armar} disabled={lista.length < 2}>
          {es ? 'Armar el crucigrama' : 'Build the crossword'}
        </Accion>
      )}
    </>
  );
};

export default Crucigrama;
