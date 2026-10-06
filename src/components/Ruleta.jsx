/* ============================================================================
   LA RULETA DEL WARM-UP
   ----------------------------------------------------------------------------
   El profesor escribe verbos («que armen una oración con este») o preguntas de
   unidades pasadas, y la rueda saca una. No sortea alumnos: sortea CONTENIDO,
   que es para lo que la usa.

   Eso decide el dibujo. Una pregunta no cabe en un sector, y con veinte
   tarjetas cada sector mide 18°, así que:

     · dentro de la rueda hay siempre un NÚMERO, y además la palabra cuando de
       verdad cabe (hasta doce tarjetas, y recortada). Con más, antes la rueda
       era solo colores girando: sin una sola marca, no parecía una decisión
       sino una avería, y así lo reportó el profesor. El número cabe siempre y
       dice en cuál cayó.
     · el resultado se lee ABAJO, en grande, con su número delante. La rueda es
       la expectativa; el cartel es la información.

   La geometría y el sorteo están en `../ruleta.js`, con pruebas
   (`tools/check-ruleta.mjs`): el ángulo es lo que se rompe en silencio.
   ========================================================================== */
import React, { useState, useRef, useEffect } from 'react';
import { parsearLista } from '../lista';
import { siguienteIndice, deltaHasta, ordenInicial, centroDelSector, queRotular } from '../ruleta';
import { ACCION, ENLACE } from '../ui';
import { Panel, Escenario, Accion, Cabeza } from '../zonas';

const TINTES = ['#e0e7ff', '#c7d2fe'];   // indigo-100 / indigo-200: la rueda no compite con el resultado
const GIRO_MS = 3000;
/* El lado de la rueda lo pone index.css (.ruleta-escena, variable --rueda),
   según la FORMA del escenario: alto, la rueda arriba y el cartel debajo;
   apaisado (pantalla completa), la rueda a la izquierda ocupando casi todo el
   alto y el cartel a su derecha. El puntero crece con ella. */
const RUEDA = 'var(--rueda)';

const reducirMovimiento = () =>
  typeof window !== 'undefined' && window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

/* Un sector como path SVG, con la rueda centrada en (100,100) y radio 96. */
const sector = (indice, total) => {
  const paso = 360 / total;
  const a0 = (indice * paso - 90) * Math.PI / 180;
  const a1 = ((indice + 1) * paso - 90) * Math.PI / 180;
  const [x0, y0] = [100 + 96 * Math.cos(a0), 100 + 96 * Math.sin(a0)];
  const [x1, y1] = [100 + 96 * Math.cos(a1), 100 + 96 * Math.sin(a1)];
  return `M100,100 L${x0.toFixed(2)},${y0.toFixed(2)} A96,96 0 ${paso > 180 ? 1 : 0},1 ${x1.toFixed(2)},${y1.toFixed(2)} Z`;
};

/* La rueda y el cartel van al escenario y se miden contra él (cqw/cqh), así
   crecen solos al proyectar. El cartel es el que se lee; la rueda es el gancho. */
const Ruleta = ({ lang = 'es' }) => {
  const es = lang === 'es';
  const [texto, setTexto] = useState('');
  const [items, setItems] = useState([]);
  const [rotacion, setRotacion] = useState(0);
  const [girando, setGirando] = useState(false);
  const [usados, setUsados] = useState([]);
  const [elegido, setElegido] = useState(null);
  const [sinRepetir, setSinRepetir] = useState(true);
  const [vueltaNueva, setVueltaNueva] = useState(false);
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  const usarLista = () => {
    const lista = parsearLista(texto);
    if (!lista.length) return;
    /* Se baraja UNA vez, al cargar: si la rueda se reordenara en cada tirada,
       el alumno no vería girar nada — vería otra rueda. */
    setItems(ordenInicial(lista));
    setUsados([]);
    setElegido(null);
    setRotacion(0);
  };

  const girar = () => {
    if (girando || !items.length) return;
    const tirada = siguienteIndice({ total: items.length, usados, sinRepetir });
    if (!tirada) return;
    const { indice, reinicia } = tirada;
    const nuevosUsados = reinicia ? [indice] : [...usados, indice];

    const cerrar = () => {
      setElegido(indice);
      setUsados(nuevosUsados);
      setVueltaNueva(reinicia);
      setGirando(false);
    };

    setElegido(null);
    setRotacion(r => r + deltaHasta({ indice, total: items.length, rotacionActual: r, vueltas: 4 }));
    if (reducirMovimiento()) { cerrar(); return; }
    setGirando(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(cerrar, GIRO_MS);
  };

  const quedan = items.length - usados.length;
  const rotular = queRotular(items.length);

  /* ── CÓMO SE ORIENTA EL TEXTO DENTRO DE UN SECTOR ────────────────────────
     A LO LARGO DEL RADIO, no cruzándolo. Iba tangencial —perpendicular al
     radio— y ahí el sector es estrechísimo: el ancho disponible es la cuerda,
     que con doce tarjetas mide una uña. Por eso había que recortar a catorce
     caracteres y aun así se veía apretado.

     Un sector es un triángulo isósceles y sus dos lados iguales son los radios.
     Puesto paralelo a ellos, el texto dispone de TODO el radio —96 unidades en
     vez de la cuerda— y cabe entero sin encoger nada.

     LA VUELTA ES UN CUARTO, no 45°: tangencial y radial son perpendiculares.
     El giro exacto depende de dónde caiga el sector, y por eso se calcula.

     Y SE VOLTEA LA MITAD IZQUIERDA. Con el mismo giro para todos, los sectores
     de la izquierda quedan cabeza abajo. Se les da la vuelta para que todos se
     lean de izquierda a derecha; es lo que hace cualquier rueda de papel. */
  const giro = (i) => {
    const centro = centroDelSector(i, items.length);
    /* Entre 0 y 180 el sector mira a la derecha y el texto sale bien con un
       cuarto de vuelta en un sentido; en la otra mitad, en el contrario. */
    return centro < 180 ? centro - 90 : centro + 90;
  };

  return (
    <>
      <Escenario>
        {!items.length ? (
          <p className="text-muted text-center max-w-sm">
            {es ? 'Escribe la lista en el panel de la derecha y la rueda aparece aquí.'
                : 'Type the list in the panel on the right and the wheel shows up here.'}
          </p>
        ) : (
          <div className="ruleta-escena w-full">
            {/* El puntero, arriba. La rueda gira debajo de él. */}
            <div className="relative">
              <div
                aria-hidden="true"
                className="absolute left-1/2 -translate-x-1/2 -top-1 w-0 h-0 z-10"
                style={{
                  borderLeft: `calc(${RUEDA} * 0.03) solid transparent`,
                  borderRight: `calc(${RUEDA} * 0.03) solid transparent`,
                  borderTop: `calc(${RUEDA} * 0.055) solid #4338ca`,
                }}
              />
              <svg
                viewBox="0 0 200 200"
                role="img"
                aria-label={es ? `Ruleta con ${items.length} tarjetas` : `Wheel with ${items.length} cards`}
                style={{
                  width: RUEDA, height: RUEDA,
                  transform: `rotate(${rotacion}deg)`,
                  transition: girando ? `transform ${GIRO_MS}ms cubic-bezier(.15,.9,.2,1)` : 'none',
                }}
              >
                {items.map((item, i) => (
                  <path key={i} d={sector(i, items.length)} fill={TINTES[i % 2]} stroke="#fff" strokeWidth="0.8" />
                ))}
                {/* UNA SOLA ETIQUETA POR SECTOR: el número y la palabra en el
                    mismo texto, con el número en un tspan para poder darle más
                    peso. Separados no se podía: el número iba anclado al borde y
                    la palabra un poco más adentro, y en la mitad izquierda —donde
                    el texto crece en sentido contrario— un número de dos cifras
                    se comía la primera letra («12ravel»). Juntos los coloca el
                    navegador y no hay nada que cuadrar a mano.

                    Anclada al BORDE y creciendo hacia el centro: es donde el
                    sector es ancho, así que todas arrancan alineadas y las largas
                    se meten hacia dentro en vez de salirse de la rueda. */}
                {rotular.numero && items.map((item, i) => {
                  const derecha = centroDelSector(i, items.length) < 180;
                  const palabra = rotular.palabra
                    ? (item.length > 20 ? item.slice(0, 19) + '…' : item)
                    : '';
                  const numero = <tspan style={{ fontWeight: 700 }}>{i + 1}</tspan>;
                  return (
                    <text
                      key={i}
                      x="100" y="100"
                      transform={`rotate(${giro(i)} 100 100) translate(${derecha ? 86 : -86} 0)`}
                      textAnchor={derecha ? 'end' : 'start'}
                      dominantBaseline="central"
                      className="fill-slate-700"
                      style={{ fontSize: '8px', fontWeight: 600 }}
                    >
                      {/* En la mitad derecha el borde queda al final de la línea y
                          en la izquierda al principio, así que el número cambia de
                          sitio para quedar siempre pegado al borde. */}
                      {derecha
                        ? <>{numero}{palabra ? ' ' + palabra : ''}</>
                        : <>{palabra ? palabra + ' ' : ''}{numero}</>}
                    </text>
                  );
                })}
                <circle cx="100" cy="100" r="10" fill="#fff" stroke="#c7d2fe" strokeWidth="2" />
              </svg>
            </div>

            {/* El resultado, que es lo que de verdad se lee. */}
            <div aria-live="polite" className="ruleta-cartel">
              {elegido == null ? (
                <p className="text-muted">{girando ? '…' : (es ? 'Gira la rueda' : 'Spin the wheel')}</p>
              ) : (
                <p className="font-bold text-slate-900 leading-tight" style={{ fontSize: 'var(--cartel)' }}>
                  {/* El número delante para poder casar el cartel con el sector en
                      el que se paró la rueda, que es lo que la clase mira. */}
                  <span className="text-muted tabular-nums mr-2">{elegido + 1}</span>
                  {items[elegido]}
                </p>
              )}
            </div>
          </div>
        )}
      </Escenario>

      <Panel>
        <Cabeza titulo={es ? 'Ruleta' : 'Wheel'}>
          {es ? 'Para el inicio de la clase: pon nombres, temas o preguntas, uno por línea, y gira.'
              : 'For warm-ups: add the verbs or questions, one per line, and spin.'}
        </Cabeza>

        {!items.length ? (
          <>
            <textarea
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              rows={10}
              placeholder={es ? 'Un nombre, tema o pregunta por línea' : 'One verb or question per line'}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <button
              onClick={usarLista}
              disabled={!parsearLista(texto).length}
              className={`mt-2 ${ACCION}`}
            >
              {es ? 'Usar esta lista' : 'Use this list'}
            </button>
          </>
        ) : (
          <>
            <p className="text-sm text-slate-600 mb-2">
              {items.length} {es ? 'tarjetas' : 'cards'}
              {sinRepetir && (
                <> · {vueltaNueva
                  ? (es ? 'salieron todas, vuelta nueva' : 'all came out, new round')
                  : `${quedan} ${es ? 'por salir' : 'left'}`}</>
              )}
            </p>
            {/* Lo que ya salió queda tachado: en clase se discute («¡ese ya
                salió!»), y tenerlo a la vista zanja la discusión. */}
            <ol className="mb-4 space-y-0.5 text-sm">
              {items.map((item, i) => (
                <li key={i} className={`flex gap-2 ${usados.includes(i) && sinRepetir ? 'text-slate-500 line-through' : 'text-slate-700'}`}>
                  <span className="tabular-nums font-bold w-6 text-right shrink-0">{i + 1}</span>
                  <span className="min-w-0 break-words">{item}</span>
                </li>
              ))}
            </ol>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <label className="flex items-center gap-1.5 text-sm text-slate-600 cursor-pointer">
                <input type="checkbox" checked={sinRepetir} onChange={(e) => { setSinRepetir(e.target.checked); setUsados([]); setVueltaNueva(false); }} />
                {es ? 'sin repetir' : 'no repeats'}
              </label>
              <button
                onClick={() => { setItems([]); setElegido(null); setUsados([]); }}
                className={ENLACE}
              >
                {es ? 'cambiar lista' : 'change list'}
              </button>
            </div>
          </>
        )}
      </Panel>

      {items.length > 0 && (
        <Accion onClick={girar} disabled={girando}>
          {girando ? (es ? 'Girando…' : 'Spinning…') : (es ? 'Girar' : 'Spin')}
        </Accion>
      )}
    </>
  );
};

export default Ruleta;
