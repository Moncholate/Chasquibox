/* ============================================================================
   EL DADO DE CLASE
   ----------------------------------------------------------------------------
   Pedido por el profesor: algo para sortear en clase — a quién le toca, qué
   ejercicio sale— sin salir de la suite ni buscar una página cualquiera.

   Tres dados y se tiran juntos:

     · NÚMERO, con las caras que haga falta (4 grupos, 30 alumnos, 12 preguntas).
       Es el que pidió y el que más se usa de pie frente al curso.
     · SUJETO y FORMA (+ − ?), que son los que un dado genérico no puede tener:
       salen del contenido de la suite —las formas vienen de `forms.generated`,
       o sea de design-tokens— y convierten el sorteo en el ejercicio mismo:
       «he · interrogativa» y a construir.
     · TIEMPO VERBAL, y solo los que el curso YA VIO. Es la cara que justifica
       que el dado viva aquí y no en cualquier página: sale «Presente Perfecto ·
       they · negativa» y la actividad está armada. El curso se elige junto al
       dado (en Grammar HUB venía del hub) y de ahí sale la lista
       (`../tiempos.js`, sobre `curriculum.json`). Sin curso elegido salen todos.

   Sujeto, forma y tiempo son de INGLÉS y van rotulados así: Teacher's Toolbox es
   para cualquier asignatura y el número es el dado de todos.

   DECISIONES QUE NO SON DE ADORNO:

   · No guarda NADA. Ni las caras ni el historial. El profesor pidió que el
     generador de grupos fuera del momento y sin datos; el dado sigue el mismo
     criterio, y así no hay nada que explicar sobre qué queda en el navegador.
   · El resultado se lee de lejos: es para proyectar o mostrar el teléfono
     levantado, no para mirarlo de cerca.
   · Las últimas tiradas se ven al lado. En clase el azar se discute («¡ya
     salió el 3!»), y tenerlas a la vista zanja la discusión sin que el dado
     tenga que hacer trampa para parecer justo.
   · La animación es corta y respeta `prefers-reduced-motion`: sin ella el
     resultado aparece de golpe, que es igual de válido.
   ========================================================================== */
import React, { useState, useRef, useEffect } from 'react';
import { FORM_SIGNS, FORM_ORDER } from '../forms.generated.jsx';
import { tiemposHasta, nombreDeCurso, CURSOS_DE_INGLES } from '../tiempos';
import { opcion, NUMERO } from '../ui';
import { Panel, Escenario, Accion, Cabeza } from '../zonas';

const SUJETOS = ['I', 'you', 'he', 'she', 'it', 'we', 'they'];

const azar = (n) => Math.floor(Math.random() * n);
const reducirMovimiento = () =>
  typeof window !== 'undefined' && window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

/* El resultado va al escenario y los controles al panel (../zonas.jsx). */
const Dado = ({ lang = 'es' }) => {
  const es = lang === 'es';
  /* Como todo aquí, no se guarda: se elige en la clase y vive con la pestaña. */
  const [nivel, setNivel] = useState(null);
  const tiempos = tiemposHasta(nivel);
  const [caras, setCaras] = useState(6);
  const [activos, setActivos] = useState({ numero: true, sujeto: false, forma: false, tiempo: false });
  const [resultado, setResultado] = useState(null);
  const [tirando, setTirando] = useState(false);
  const [historial, setHistorial] = useState([]);
  const timers = useRef([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const unaTirada = () => ({
    numero: 1 + azar(Math.max(2, Math.min(999, caras || 6))),
    sujeto: SUJETOS[azar(SUJETOS.length)],
    forma: FORM_ORDER[azar(FORM_ORDER.length)],
    tiempo: tiempos.length ? tiempos[azar(tiempos.length)] : null,
  });

  const lanzar = () => {
    if (tirando) return;
    const final = unaTirada();
    const cerrar = () => {
      setResultado(final);
      setTirando(false);
      /* El historial solo tiene sentido con lo que está activo: guardar una
         cara que nadie tiró confundiría más que ayudar. */
      setHistorial(h => [final, ...h].slice(0, 5));
    };
    if (reducirMovimiento()) { cerrar(); return; }
    setTirando(true);
    timers.current.forEach(clearTimeout);
    timers.current = [];
    for (let i = 0; i < 6; i++) {
      timers.current.push(setTimeout(() => setResultado(unaTirada()), i * 70));
    }
    timers.current.push(setTimeout(cerrar, 6 * 70));
  };

  const alternar = (k) => setActivos(a => {
    const siguiente = { ...a, [k]: !a[k] };
    // Al menos uno activo: un dado sin caras no es un dado.
    return Object.values(siguiente).some(Boolean) ? siguiente : a;
  });

  const etiquetaForma = (id) => (FORM_SIGNS[id]?.label?.[es ? 'es' : 'en']) || id;
  const signoForma = (id) => FORM_SIGNS[id]?.sign || '';

  const DADOS = [
    { k: 'numero', nombre: es ? 'Número' : 'Number' },
  ];
  const DADOS_INGLES = [
    { k: 'sujeto', nombre: es ? 'Sujeto' : 'Subject' },
    { k: 'forma', nombre: es ? 'Forma' : 'Form' },
    { k: 'tiempo', nombre: es ? 'Tiempo' : 'Tense' },
  ];

  /* Los tamaños van contra el ESCENARIO (cqw/cqh): crece el resultado, y solo
     él, tanto en el PC como proyectado. El número manda; el resto acompaña. */
  const talla = { numero: 'min(26cqw, 48cqh)', sujeto: 'min(11cqw, 20cqh)', resto: 'min(7cqw, 13cqh)' };

  return (
    <>
      {/* El resultado, grande. `aria-live` para que un lector de pantalla lo
          cante; `polite` y no `assertive` porque no interrumpe nada. */}
      <Escenario>
        <div aria-live="polite"
          className={`text-center transition-transform ${tirando ? 'scale-[0.98]' : 'scale-100'}`}>
          {!resultado ? (
            <p className="text-muted">{es ? 'Lanza el dado' : 'Roll the dice'}</p>
          ) : (
            <div className="flex flex-wrap items-center justify-center gap-x-[4cqw] gap-y-[2cqh]">
              {activos.numero && (
                <span className="font-extrabold text-slate-900 tabular-nums leading-none" style={{ fontSize: talla.numero }}>{resultado.numero}</span>
              )}
              {activos.sujeto && (
                <span className="font-bold text-blue-600 leading-none" style={{ fontSize: talla.sujeto }}>{resultado.sujeto}</span>
              )}
              {activos.forma && (
                <span className="font-bold text-slate-700 leading-none" style={{ fontSize: talla.resto }}>
                  <span className="font-mono mr-1.5">{signoForma(resultado.forma)}</span>
                  {etiquetaForma(resultado.forma)}
                </span>
              )}
              {activos.tiempo && resultado.tiempo && (
                <span className="font-bold text-indigo-700 leading-none" style={{ fontSize: talla.resto }}>
                  {es ? resultado.tiempo.es : resultado.tiempo.en}
                </span>
              )}
            </div>
          )}
        </div>
      </Escenario>

      <Panel>
        <Cabeza titulo={es ? 'Dado' : 'Dice'}>
          {es ? 'Para sortear en clase.' : 'For classroom draws.'}
          {activos.tiempo && (
            <>
              {' '}
              {nivel
                ? (es ? `Los tiempos son los de ${nombreDeCurso(nivel, lang)}: ${tiempos.length}.`
                      : `Tenses are the ones from ${nombreDeCurso(nivel, lang)}: ${tiempos.length}.`)
                : (es ? `Sin curso elegido salen los ${tiempos.length}.`
                      : `With no course selected, all ${tiempos.length} are in.`)}
            </>
          )}
        </Cabeza>

        {/* Qué se tira */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {DADOS.map(d => (
            <button key={d.k} onClick={() => alternar(d.k)} aria-pressed={activos[d.k]} className={opcion(activos[d.k])}>
              {d.nombre}
            </button>
          ))}
          {activos.numero && (
            <label className="flex items-center gap-1.5 text-sm text-slate-600">
              <span>{es ? 'caras' : 'faces'}</span>
              <input
                type="number" min="2" max="999" value={caras}
                onChange={(e) => setCaras(Math.max(2, Math.min(999, Number(e.target.value) || 2)))}
                className={NUMERO}
              />
            </label>
          )}
        </div>

        <p className="text-[10px] font-bold uppercase tracking-wider text-muted mb-1.5">{es ? 'Inglés' : 'English'}</p>
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {DADOS_INGLES.map(d => (
            <button key={d.k} onClick={() => alternar(d.k)} aria-pressed={activos[d.k]} className={opcion(activos[d.k])}>
              {d.nombre}
            </button>
          ))}
        </div>
        {activos.tiempo && (
          <select
            value={nivel || ''}
            onChange={(e) => setNivel(e.target.value || null)}
            aria-label={es ? 'Curso' : 'Course'}
            className="w-full mb-3 px-2 py-1.5 border border-slate-300 rounded-lg text-sm bg-white text-slate-700"
          >
            <option value="">{es ? 'Todos los cursos' : 'All courses'}</option>
            {CURSOS_DE_INGLES.map(c => (
              <option key={c} value={c}>{es ? 'Hasta ' : 'Up to '}{nombreDeCurso(c, lang)}</option>
            ))}
          </select>
        )}

        {historial.length > 1 && (
          <div className="mt-4">
            <p className="text-xs font-semibold text-slate-600 mb-1.5">{es ? 'Últimas tiradas' : 'Last rolls'}</p>
            <ul className="space-y-1">
              {historial.slice(1).map((h, i) => (
                <li key={i} className="text-sm bg-slate-100 text-slate-700 rounded px-2 py-1">
                  {[activos.numero && h.numero, activos.sujeto && h.sujeto,
                    activos.forma && etiquetaForma(h.forma),
                    activos.tiempo && h.tiempo && (es ? h.tiempo.es : h.tiempo.en)].filter(Boolean).join(' · ')}
                </li>
              ))}
            </ul>
          </div>
        )}
      </Panel>

      <Accion onClick={lanzar}>{es ? 'Lanzar' : 'Roll'}</Accion>
    </>
  );
};

export default Dado;
