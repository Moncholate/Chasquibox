/* ============================================================================
   SOPA DE LETRAS
   ----------------------------------------------------------------------------
   El docente pega las palabras de la clase y sale una sopa. «Otra vez» y sale
   otra distinta con las mismas. Nada precargado, como el resto de la sección.

   LA DIFICULTAD SE ELIGE, y es la decisión que de verdad cambia el ejercicio:
   con solo → y ↓ es reconocer una palabra escrita; con las ocho direcciones es
   reconstruirla. La misma lista sirve para Básico I y para Intermedio según
   dónde se ponga esa perilla. El porqué está en `../sopa.js`.

   SE RESUELVE PROYECTADA, A CLICS. Clic en la primera letra y clic en la
   última: la palabra queda marcada y se tacha de la lista. No se arrastra —
   proyectando, el profesor maneja el ratón desde el computador y arrastrar en
   diagonal sobre una cuadrícula es lo que no sale a la primera delante de todo
   el curso—. Dos clics no fallan, y en una pizarra táctil funcionan igual.

   Lo encontrado va en VERDE y la solución del profesor en índigo: son dos cosas
   distintas —lo que el curso ya sacó y lo que falta por sacar— y verlas del
   mismo color al corregir no diría nada.

   CADA PALABRA SE MARCA CON SU PROPIO TRAZO, no pintando casillas. Pintadas, dos
   palabras que se tocan o se cruzan forman un solo bloque de color y el ojo lee
   una palabra larga que nadie escribió — lo reportó el profesor usándola. Un
   trazo redondeado alrededor de cada una es lo que se hace en el papel con un
   lápiz, y dos trazos que se cruzan siguen siendo dos: cada uno conserva su
   principio y su final.

   El trazo va en un SVG DEBAJO de las letras y en unidades de casilla —el
   `viewBox` mide lo que la cuadrícula, así que cada casilla es 1— y así no hay
   que saber cuántos píxeles mide nada. Debajo y no encima porque encima teñiría
   las letras y les bajaría el contraste; debajo, la letra se lee igual que
   siempre y el trazo la rodea.

   DOS SALIDAS, LAS MISMAS QUE EL CRUCIGRAMA:

     · PROYECTADA se busca entre todos y se van cantando; «ver las respuestas»
       marca las palabras de golpe al corregir.
     · IMPRESA se reparte, y la hoja NUNCA lleva la solución aunque esté
       encendida en pantalla. Eso lo decide `@media print`, no un botón que se
       puede olvidar apagado — y es la misma maquinaria (`gh-hoja`,
       `gh-no-print`, `gh-solucion`) que ya estrenó el crucigrama.

   ────────────────────────────────────────────────────────────────────────────
   DUA: TRES COSAS QUE NO SON OPCIONALES
   ────────────────────────────────────────────────────────────────────────────
   1. EL COLOR NO PUEDE SER LA ÚNICA SEÑAL. Verde para lo encontrado e índigo
      para la solución es exactamente el par que no distingue una persona con
      daltonismo rojo-verde, que es la forma más común. Los dos trazos se
      diferencian TAMBIÉN por su forma: continuo lo que el curso encontró,
      discontinuo lo que le queda por encontrar. Sin color, se siguen leyendo.

   2. SE PUEDE RESOLVER SIN RATÓN. Las casillas son botones, pero doscientos
      botones seguidos en el tabulador no son navegables: son una trampa. La
      cuadrícula es UNA parada de tabulación y dentro se mueve con las flechas,
      que es como se navega cualquier tabla. Enter o espacio elige. Sirve para
      quien no usa ratón y también para el profesor que proyecta con el teclado
      a mano.

   3. LA CASILLA SE PUEDE TOCAR. La suite fija «--tap-min: 46px» para sus
      controles; una cuadrícula densa no puede llegar ahí sin volverse ilegible,
      pero sí tiene un suelo: por debajo de 26px, en un teléfono con quince
      columnas, la casilla se vuelve imposible de acertar con el dedo. Antes
      quedaba en 21px. Ahora hay suelo y lo que no quepa se desplaza, que es
      preferible a una cuadrícula que se ve entera y no se puede usar.

   Y LO QUE PASA SE DICE EN VOZ ALTA: al encontrar una palabra se anuncia cuál,
   no solo que el contador subió. Un lector de pantalla no ve el trazo.

   LAS CASILLAS SE MIDEN SOLAS, en unidades del viewport y nunca en porcentaje:
   un % se mide contra el ancho en `width` y contra el alto en `height`, y con la
   misma cadena para las dos las casillas salen aplastadas. Lo aprendió el
   crucigrama.
   ========================================================================== */
import React, { useState, useRef, useEffect } from 'react';
import { parsearPalabras, MAX_PALABRAS } from '../palabras';
import { generar, casillasDe, palabraEntre, NIVELES } from '../sopa';
import { ACCION, APAGADO, opcion, ENLACE } from '../ui';

/* La cuadrícula es PAPEL, y va fija en los dos temas — como la del crucigrama y
   como la carcasa del semáforo va oscura en los dos. Un pasatiempo es una hoja:
   blanco con tinta negra es lo que la mano espera al ir a escribir, y en modo
   oscuro unas casillas gris marengo no se leen ni se imprimen. */
const PAPEL = '#ffffff';
const TRAZO = '#334155';
const LETRA = '#1e293b';
const MARCA = '#818cf8';    /* la solución del profesor, índigo */
const HALLADA = '#10b981';  /* lo que el curso ya encontró, verde */
const ANCLA = '#fde68a';    /* la primera letra elegida, esperando la segunda */
const GROSOR = 0.82;        /* el grueso de la cápsula, en casillas */
const RADIO = GROSOR / 2;
const FILO = 0.09;          /* el grueso del contorno de la cápsula hueca */

/* EL CONTORNO DE LA CÁPSULA, dibujado a mano. Es la forma que se hace en el
   papel al rodear una palabra: dos rectas paralelas al trazo y un semicírculo
   en cada punta. Se dibuja como camino y no como línea gruesa porque una línea
   gruesa solo sabe salir RELLENA, y aquí hace falta poder vaciarla.

   DOS COSAS QUE HAY QUE MIRAR, PORQUE NINGUNA DA ERROR SI SE EQUIVOCAN:

   · LA BANDERA DE BARRIDO DEL ARCO. En svg el eje Y va HACIA ABAJO, así que el
     sentido «positivo» del arco se ve en pantalla como las agujas del reloj, al
     revés de lo que dice la intuición. Con la bandera a 1 los dos semicírculos
     se curvaban HACIA DENTRO: la cápsula se cerraba antes de llegar a la primera
     y a la última letra y las puntas parecían dos paréntesis sueltos. Va a 0.

   · CUÁNTO SE ALARGA. El trazo va de CENTRO a CENTRO de casilla, y el
     semicírculo solo sobresale el radio —0.41 de casilla—, así que se quedaba
     corto de las medias casillas de los extremos: la primera y la última letra
     quedaban pisadas por el borde en vez de dentro. Se alarga lo que falta para
     llegar al borde de la casilla. */
const capsula = (x1, y1, x2, y2, r) => {
  const largo = Math.hypot(x2 - x1, y2 - y1) || 1;
  const dx = (x2 - x1) / largo, dy = (y2 - y1) / largo;
  const sobra = Math.max(0, 0.5 - r);          /* hasta el borde de la casilla */
  const ax = x1 - dx * sobra, ay = y1 - dy * sobra;
  const zx = x2 + dx * sobra, zy = y2 + dy * sobra;
  const px = -dy * r, py = dx * r;             /* perpendicular, de largo r */
  return [
    `M ${ax + px} ${ay + py}`,
    `L ${zx + px} ${zy + py}`,
    `A ${r} ${r} 0 0 0 ${zx - px} ${zy - py}`,
    `L ${ax - px} ${ay - py}`,
    `A ${r} ${r} 0 0 0 ${ax + px} ${ay + py}`,
    'Z',
  ].join(' ');
};

const Sopa = ({ lang = 'es', grande = false }) => {
  const es = lang === 'es';
  const [texto, setTexto] = useState('');
  const [dificultad, setDificultad] = useState('media');
  const [sopa, setSopa] = useState(null);
  const [descartes, setDescartes] = useState([]);
  const [respuestas, setRespuestas] = useState(false);
  /* Lo que el curso ha ido encontrando, y la primera casilla de la selección en
     curso. Nada de esto se guarda: muere con la pestaña, como todo aquí. */
  const [halladas, setHalladas] = useState(() => new Set());
  const [ancla, setAncla] = useState(null);
  const [fallo, setFallo] = useState(false);
  /* La casilla con el foco del teclado. Una sola parada de tabulación para toda
     la cuadrícula: dentro se mueve con las flechas. */
  const [foco, setFoco] = useState({ fila: 0, col: 0 });
  const [ultima, setUltima] = useState(null);   // la última encontrada, para anunciarla

  const { lista, fuera } = parsearPalabras(texto);
  /* Solo se mueve el foco del navegador cuando lo movieron las flechas, no en
     cada render: robárselo al usuario mientras escribe es de las cosas que más
     molestan de una tabla navegable. */
  const haceFoco = useRef(false);
  useEffect(() => { haceFoco.current = true; }, [foco]);

  const armar = (dif = dificultad) => {
    setSopa(generar({ palabras: lista, dificultad: dif }));
    setFoco({ fila: 0, col: 0 });
    setUltima(null);
    setDescartes(fuera);
    setRespuestas(false);
    setHalladas(new Set());
    setAncla(null);
    setFallo(false);
  };

  /* CLIC EN LA PRIMERA LETRA, CLIC EN LA ÚLTIMA. El primero deja el ancla; el
     segundo cierra la selección y se comprueba. Tocar la misma casilla otra vez
     cancela: es lo que hace todo el mundo cuando se equivoca al empezar. */
  const tocar = (fila, col) => {
    setFallo(false);
    if (!ancla) { setAncla({ fila, col }); return; }
    if (ancla.fila === fila && ancla.col === col) { setAncla(null); return; }
    const p = palabraEntre(sopa, ancla, { fila, col });
    setAncla(null);
    if (p) { setHalladas(h => new Set([...h, p.palabra])); setUltima(p.original); }
    else setFallo(true);   // no había palabra ahí, y se dice sin castigar a nadie
  };

  /* Las flechas mueven el foco; Inicio y Fin van a las esquinas de la fila. Se
     corta la propagación para que la página no haga scroll bajo los pies. */
  const teclas = (e) => {
    const salto = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] }[e.key];
    if (salto) {
      e.preventDefault();
      setFoco(({ fila, col }) => ({
        fila: Math.max(0, Math.min(sopa.lado - 1, fila + salto[0])),
        col: Math.max(0, Math.min(sopa.lado - 1, col + salto[1])),
      }));
      return;
    }
    if (e.key === 'Home') { e.preventDefault(); setFoco(f => ({ ...f, col: 0 })); }
    if (e.key === 'End') { e.preventDefault(); setFoco(f => ({ ...f, col: sopa.lado - 1 })); }
    if (e.key === 'Escape' && ancla) { e.preventDefault(); setAncla(null); }
  };

  const NIVEL = [
    { id: 'facil', rotulo: es ? 'Fácil' : 'Easy', nota: es ? 'solo → y ↓' : 'only → and ↓' },
    { id: 'media', rotulo: es ? 'Media' : 'Medium', nota: es ? 'y las diagonales' : 'plus diagonals' },
    { id: 'dificil', rotulo: es ? 'Difícil' : 'Hard', nota: es ? 'y al revés' : 'plus backwards' },
  ];

  /* Con SUELO: por debajo de 26px la casilla no se acierta con el dedo, y con
     quince columnas en un teléfono salían 21. Lo que no quepa se desplaza — el
     contenedor ya tiene scroll horizontal— que es preferible a una cuadrícula
     que se ve entera y no se puede usar. */
  const lado = sopa && sopa.lado
    ? `clamp(26px, calc(88vw / ${sopa.lado}), ${grande ? '6.5vh' : '2rem'})`
    : '1.9rem';

  /* UN TRAZO POR PALABRA, del centro de la primera casilla al de la última. Lo
     que el curso encontró va siempre; la solución del profesor, solo si la pidió
     y esa palabra no está ya encontrada — marcarla dos veces no diría nada. */
  const trazos = !sopa ? [] : sopa.colocadas.flatMap(p => {
    const encontrada = halladas.has(p.palabra);
    if (!encontrada && !respuestas) return [];
    const cs = casillasDe(p);
    const a = cs[0], z = cs[cs.length - 1];
    let x1 = a.col + 0.5, y1 = a.fila + 0.5;
    let x2 = z.col + 0.5, y2 = z.fila + 0.5;

    return [{
      palabra: p.palabra,
      encontrada,
      color: encontrada ? HALLADA : MARCA,
      d: capsula(x1, y1, x2, y2, RADIO),
    }];
  });

  return (
    <section className={grande ? 'w-full' : 'w-full max-w-xl mx-auto'}>
      {!grande && (
        <>
          <h2 className="text-lg font-bold text-slate-900 mb-1 gh-no-print">{es ? 'Sopa de letras' : 'Word search'}</h2>
          <p className="text-sm text-muted mb-4 gh-no-print">
            {es ? 'Pega las palabras de la clase, una por línea. Proyectada se resuelve a clics —primera letra y última—, o se imprime para repartir.'
                : 'Paste the words from today’s lesson, one per line. Projected, it is solved by clicking — first letter, then last — or printed to hand out.'}
          </p>
        </>
      )}

      {!sopa ? (
        <div className="space-y-4">
          <label className="block">
            <span className="text-xs font-semibold text-slate-600">
              {es ? 'Las palabras' : 'The words'}{' '}
              <span className="font-normal text-muted">
                {es ? '· una por línea, o varias separadas por comas' : '· one per line, or several separated by commas'}
              </span>
            </span>
            <textarea
              value={texto} rows={8}
              onChange={(e) => setTexto(e.target.value)}
              placeholder={es ? 'célula\nnúcleo\nmembrana' : 'apple\nbanana\ncherry'}
              className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </label>

          <div>
            <p className="text-xs font-semibold text-slate-600 mb-1.5">
              {es ? 'Dificultad' : 'Difficulty'}{' '}
              <span className="font-normal text-muted">
                {es ? '· lo que cambia el ejercicio no es el tamaño, son las direcciones'
                    : '· what changes the task is the directions, not the size'}
              </span>
            </p>
            <div className="flex flex-wrap gap-1.5">
              {NIVEL.map(n => (
                <button key={n.id} onClick={() => setDificultad(n.id)} aria-pressed={dificultad === n.id}
                        title={n.nota} className={opcion(dificultad === n.id)}>
                  {n.rotulo} <span className="font-normal opacity-70">· {n.nota}</span>
                </button>
              ))}
            </div>
          </div>

          <p className="text-xs text-muted">
            {es ? `${lista.length} ${lista.length === 1 ? 'palabra' : 'palabras'}. Con menos de cinco la sopa queda vacía; más de ${MAX_PALABRAS} no caben.`
                : `${lista.length} ${lista.length === 1 ? 'word' : 'words'}. Fewer than five leaves an empty grid; more than ${MAX_PALABRAS} will not fit.`}
          </p>

          <button onClick={() => armar()} disabled={!lista.length} className={ACCION}>
            {es ? 'Armar la sopa' : 'Build the word search'}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* LA HOJA. Es lo único que se imprime. */}
          <div className="gh-hoja">
            <div className="overflow-x-auto">
              <div className="relative mx-auto w-max" style={{ background: PAPEL }}>
                {/* Los trazos, DEBAJO de las letras. El viewBox mide lo que la
                    cuadrícula en casillas, así que las coordenadas son las de la
                    sopa y no hay que traducir píxeles. `pointer-events: none`
                    para que los clics sigan llegando a las casillas. */}
                <svg
                  viewBox={`0 0 ${sopa.lado} ${sopa.lado}`}
                  aria-hidden="true"
                  className="absolute inset-0 w-full h-full"
                  style={{ pointerEvents: 'none', zIndex: 0 }}
                >
                  {/* RELLENA lo que el curso encontró, HUECA lo que le falta.
                      La misma cápsula y el mismo sitio: lo único que cambia es
                      si está pintada por dentro o solo perfilada.
                      El color no puede ser la única señal —proyectado, el verde
                      y el índigo se lavan hasta casi el mismo gris pálido— y el
                      guion tampoco servía: los cortes caían donde caían respecto
                      a las casillas y se leían como manchas sueltas en vez de
                      como una palabra marcada. Relleno contra contorno se ve
                      entero de una vez, y es lo que se hace en el papel. */}
                  {trazos.map(t => (
                    <path
                      key={t.palabra}
                      d={t.d}
                      fill={t.encontrada ? t.color : 'none'}
                      fillOpacity="0.32"
                      stroke={t.encontrada ? 'none' : t.color}
                      strokeWidth={FILO}
                      strokeOpacity="0.85"
                    />
                  ))}
                </svg>
              <div
                role="grid"
                aria-label={es ? 'Sopa de letras' : 'Word search'}
                onKeyDown={teclas}
                className="relative grid w-max"
                style={{ gridTemplateColumns: `repeat(${sopa.lado}, ${lado})`, zIndex: 1 }}
              >
                {sopa.celdas.map((fila, f) => fila.map((letra, c) => {
                  const esAncla = ancla && ancla.fila === f && ancla.col === c;
                  /* La casilla ya no se pinta: de eso se encargan los trazos de
                     debajo. Solo el ancla lleva fondo, y es una casilla suelta
                     esperando la segunda: no hay nada con lo que pueda fundirse. */
                  return (
                    <button
                      key={`${f},${c}`}
                      onClick={() => { setFoco({ fila: f, col: c }); tocar(f, c); }}
                      /* UNA sola parada de tabulación para toda la cuadrícula:
                         doscientos botones seguidos en el tabulador no son
                         navegables, son una trampa. Dentro se mueve con flechas. */
                      tabIndex={foco.fila === f && foco.col === c ? 0 : -1}
                      ref={(el) => { if (el && foco.fila === f && foco.col === c && haceFoco.current) { el.focus(); haceFoco.current = false; } }}
                      role="gridcell"
                      aria-label={`${letra}, ${es ? 'fila' : 'row'} ${f + 1}, ${es ? 'columna' : 'column'} ${c + 1}`}
                      aria-pressed={!!esAncla}
                      className="gh-celda flex items-center justify-center font-bold"
                      style={{
                        width: lado, height: lado,
                        background: esAncla ? ANCLA : 'transparent',
                        border: `1px solid ${TRAZO}`,
                        color: LETRA,
                        fontSize: `calc(${lado} * 0.55)`,
                      }}
                    >
                      {letra}
                    </button>
                  );
                }))}
              </div>
              </div>
            </div>

            {/* LA LISTA DE PALABRAS A BUSCAR. Va en el original —con sus tildes y
                sus espacios—: nadie quiere leer «ICECREAM» en la lista.

                IBA FIJA EN 14PX EN LOS DOS MODOS: en el teléfono, en la mano,
                se lee bien; proyectada desde el fondo de la sala, no — y es el
                contenido que el curso está buscando, no un pie de página.
                `clamp()` para que crezca con la pantalla de verdad y no solo
                con un número de Tailwind más grande, que en un computador
                sigue siendo chico. Mismo truco que el lado de la casilla. */}
            <ul
              className={`mt-4 flex flex-wrap justify-center gap-x-5 gap-y-1 ${grande ? 'max-w-5xl mx-auto' : ''}`}
              style={{ fontSize: grande ? 'clamp(1.25rem, 2.2vw, 2.5rem)' : undefined }}
            >
              {sopa.colocadas.map(p => (
                <li key={p.palabra}
                    className={`font-semibold ${grande ? '' : 'text-sm'} ${halladas.has(p.palabra)
                      ? 'gh-hallada text-emerald-700 line-through decoration-2'
                      : 'text-slate-800'}`}>
                  {p.original}
                </li>
              ))}
            </ul>
          </div>

          {/* EL MARCADOR, fuera de la hoja: es del momento de resolverla en clase,
              no de la hoja que se reparte. Mismo motivo que la lista de arriba. */}
          <p
            className={`gh-no-print text-center font-bold text-slate-900 ${grande ? '' : 'text-sm'}`}
            style={{ fontSize: grande ? 'clamp(1.1rem, 1.8vw, 2rem)' : undefined }}
            aria-live="polite"
          >
            {halladas.size === sopa.colocadas.length && sopa.colocadas.length > 0
              ? (es ? '¡Están todas!' : 'All of them!')
              : (es ? `${halladas.size} de ${sopa.colocadas.length} encontradas`
                    : `${halladas.size} of ${sopa.colocadas.length} found`)}
            {ultima && <span className="ml-2 font-normal text-emerald-700">{es ? `· ${ultima}` : `· ${ultima}`}</span>}
            {ancla && <span className="ml-2 font-normal text-muted">{es ? '· ahora la última letra' : '· now the last letter'}</span>}
            {fallo && <span className="ml-2 font-normal text-amber-800">{es ? '· ahí no hay ninguna, prueba otra vez' : '· nothing there, try again'}</span>}
          </p>

          {(sopa.fuera.length > 0 || descartes.length > 0) && (
            /* Igual que en el crucigrama: lo que no cupo y lo que no se entendió
               son dos cosas, y la segunda no se arregla insistiendo. */
            <div className="gh-no-print text-xs text-amber-900 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-2 space-y-1">
              {sopa.fuera.length > 0 && (
                <p>
                  {es ? 'No entraron: ' : 'Left out: '}
                  <strong>{sopa.fuera.map(p => p.original).join(', ')}</strong>
                  {'. '}
                  {es ? 'Prueba «otra sopa», o quita alguna palabra larga.' : 'Try “new grid”, or drop one of the long words.'}
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

          <div className="gh-no-print flex flex-wrap gap-2">
            {halladas.size > 0 && (
              <button onClick={() => { setHalladas(new Set()); setAncla(null); setFallo(false); }} className={`flex-1 ${APAGADO}`}>
                {es ? 'Empezar de nuevo' : 'Start over'}
              </button>
            )}
            <button onClick={() => armar()} className={`flex-1 ${APAGADO}`}>{es ? 'Otra sopa' : 'New grid'}</button>
            <button onClick={() => setRespuestas(v => !v)} aria-pressed={respuestas} className={`flex-1 ${APAGADO}`}>
              {respuestas ? (es ? 'Ocultar respuestas' : 'Hide answers') : (es ? 'Ver las respuestas' : 'Show answers')}
            </button>
            <button onClick={() => window.print()} className={`flex-1 ${APAGADO}`}>{es ? 'Imprimir' : 'Print'}</button>
          </div>

          {/* Cambiar la dificultad rearma en el momento: es lo que se toca cuando
              la sopa sale demasiado fácil o demasiado dura para ESTE curso, y
              hacerlo volviendo atrás sería perder las palabras pegadas. */}
          <div className="gh-no-print flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-600 mr-1">{es ? 'Dificultad' : 'Difficulty'}</span>
            {NIVEL.map(n => (
              <button key={n.id} onClick={() => { setDificultad(n.id); armar(n.id); }}
                      aria-pressed={dificultad === n.id} title={n.nota} className={opcion(dificultad === n.id)}>
                {n.rotulo}
              </button>
            ))}
          </div>

          <p className="gh-no-print text-xs text-muted">
            {es ? 'Con el teclado: tabula hasta la sopa, muévete con las flechas y elige con Enter. Escape cancela la letra empezada.'
                : 'With the keyboard: tab to the grid, move with the arrows and pick with Enter. Escape cancels a started word.'}
          </p>

          <p className="gh-no-print text-xs text-muted">
            {es ? 'Lo impreso es siempre la hoja del alumno: la sopa y la lista, sin la solución aunque esté a la vista aquí.'
                : 'What prints is always the student sheet: the grid and the word list, with no solution even if it is showing here.'}
          </p>

          <button onClick={() => { setSopa(null); setRespuestas(false); }} className={`gh-no-print ${ENLACE}`}>
            {es ? 'cambiar las palabras' : 'change the words'}
          </button>
        </div>
      )}
    </section>
  );
};

export default Sopa;
