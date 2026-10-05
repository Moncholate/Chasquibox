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

   Sujeto, forma y tiempo son de INGLÉS y van rotulados así: Chasquibox es
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
import { ACCION, opcion, NUMERO } from '../ui';

const SUJETOS = ['I', 'you', 'he', 'she', 'it', 'we', 'they'];

const azar = (n) => Math.floor(Math.random() * n);
const reducirMovimiento = () =>
  typeof window !== 'undefined' && window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

/* `grande` = proyectando. Crece SOLO el resultado: el número se lee desde el
   fondo de la sala y los controles se quedan como están, que es lo que hace que
   quepan todos arriba. Las medidas van en `vw` para que se ajusten al proyector
   —1024 o 1920 de ancho— en vez de a un tamaño fijo. */
const Dado = ({ lang = 'es', grande = false }) => {
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

  return (
    <section className="w-full max-w-xl mx-auto">
      <h2 className="text-lg font-bold text-slate-900 mb-1">{es ? 'Dado' : 'Dice'}</h2>
      <p className="text-sm text-muted mb-4">
        {es ? 'Para sortear en clase.'
            : 'For classroom draws.'}
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
      </p>

      {/* Qué se tira */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        {DADOS.map(d => (
          <button
            key={d.k}
            onClick={() => alternar(d.k)}
            aria-pressed={activos[d.k]}
            className={opcion(activos[d.k])}
          >
            {d.nombre}
          </button>
        ))}

        <span className="text-[10px] font-bold uppercase tracking-wider text-muted ml-1">{es ? 'Inglés' : 'English'}</span>
        {DADOS_INGLES.map(d => (
          <button
            key={d.k}
            onClick={() => alternar(d.k)}
            aria-pressed={activos[d.k]}
            className={opcion(activos[d.k])}
          >
            {d.nombre}
          </button>
        ))}

        {activos.tiempo && (
          <select
            value={nivel || ''}
            onChange={(e) => setNivel(e.target.value || null)}
            aria-label={es ? 'Curso' : 'Course'}
            className="px-2 py-1.5 border border-slate-300 rounded-lg text-sm bg-white text-slate-700"
          >
            <option value="">{es ? 'Todos los cursos' : 'All courses'}</option>
            {CURSOS_DE_INGLES.map(c => (
              <option key={c} value={c}>{es ? 'Hasta ' : 'Up to '}{nombreDeCurso(c, lang)}</option>
            ))}
          </select>
        )}

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

      {/* El resultado, grande. `aria-live` para que un lector de pantalla lo
          cante; `polite` y no `assertive` porque no interrumpe nada. */}
      <div
        aria-live="polite"
        className={`rounded-2xl border border-slate-200 bg-white text-center transition-transform ${
          grande ? 'px-6 py-10' : 'px-6 py-8'
        } ${tirando ? 'scale-[0.98]' : 'scale-100'}`}
      >
        {!resultado ? (
          <p className="text-muted text-sm">{es ? 'Toca Lanzar' : 'Tap Roll'}</p>
        ) : (
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
            {activos.numero && (
              <span className={`font-extrabold text-slate-900 tabular-nums ${grande ? 'text-[16vw] leading-none' : 'text-6xl'}`}>{resultado.numero}</span>
            )}
            {activos.sujeto && (
              <span className={`font-bold text-blue-600 ${grande ? 'text-[9vw] leading-none' : 'text-4xl'}`}>{resultado.sujeto}</span>
            )}
            {activos.forma && (
              <span className={`font-bold text-slate-700 ${grande ? 'text-[7vw] leading-none' : 'text-3xl'}`}>
                <span className="font-mono mr-1.5">{signoForma(resultado.forma)}</span>
                {etiquetaForma(resultado.forma)}
              </span>
            )}
            {activos.tiempo && resultado.tiempo && (
              <span className={`font-bold text-indigo-700 ${grande ? 'text-[7vw] leading-none' : 'text-3xl'}`}>
                {es ? resultado.tiempo.es : resultado.tiempo.en}
              </span>
            )}
          </div>
        )}
      </div>

      <button
        onClick={lanzar}
        className={`mt-3 ${ACCION}`}
      >
        {es ? 'Lanzar' : 'Roll'}
      </button>

      {historial.length > 1 && (
        <p className="mt-3 text-xs text-muted flex flex-wrap items-center gap-1.5">
          <span>{es ? 'Últimas:' : 'Last:'}</span>
          {historial.slice(1).map((h, i) => (
            <span key={i} className="inline-block bg-slate-100 text-slate-700 rounded px-1.5 py-0.5">
              {[activos.numero && h.numero, activos.sujeto && h.sujeto,
                activos.forma && etiquetaForma(h.forma),
                activos.tiempo && h.tiempo && (es ? h.tiempo.es : h.tiempo.en)].filter(Boolean).join(' · ')}
            </span>
          ))}
        </p>
      )}
    </section>
  );
};

export default Dado;
