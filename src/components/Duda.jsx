/* ============================================================================
   LA DUDA · segunda herramienta de CIERRE
   ----------------------------------------------------------------------------
   «¿Alguna duda?» produce silencio, y no porque no las haya. Nombrar el propio
   hueco desde cero es la parte difícil de tener una duda: hay que saber ya
   bastante para poder decir QUÉ es lo que no sabes. Un molde a medio hacer se
   completa; una pregunta en blanco, no.

   EL MOLDE LO ESCRIBE EL DOCENTE, y la herramienta abre en blanco. Venía
   compuesto de dos tiempos verbales, y eso presuponía que la clase había sido de
   gramática: en una unidad de vocabulario no había nada que editar, había que
   salirse de la herramienta. Lo dijo el profesor, 1-sep-2026.

   Los huecos se escriben como se escriben en el pizarrón —una fila de guiones
   bajos— y se pintan apagados para que no compitan con las palabras. Qué es
   hueco y qué no lo decide `../molde.js`, con sus pruebas.

   Y NO HAY MOLDES SUGERIDOS. Los hubo, plegados y opcionales. El profesor los
   probó y no funcionó: lo que una herramienta ofrece orienta lo que se hace con
   ella aunque esté plegado, y una lista de pares de tiempos verbales insinúa que
   el cierre va de gramática. Confunde más de lo que ahorra. Fuera, 1-sep-2026.
   El molde se escribe entero, y el hueco es lo único que la herramienta pone.

   TRES FASES, UNA ACCIÓN CADA UNA:
     PREPARAR  qué molde y cuánto tiempo   → «Proyectar»
     ESCRIBIR  el molde grande, el reloj corriendo
     LEER      a quién le toca contarla

   EL RELOJ VA CONTRA EL RELOJ DEL SISTEMA, no restando uno por segundo. Es lo
   mismo que aprendió el temporizador: un intervalo que se retrasa —pestaña de
   fondo, teléfono que se duerme— acumula el retraso y el reloj miente justo
   cuando la clase lo está mirando.

   SE ESCRIBE EN SILENCIO Y DESPUÉS SE LEE. El minuto y medio a solas no es
   relleno: sin él contesta el mismo de siempre, y el que necesita pensarlo se
   queda sin decir nada. Lo que se lee en voz alta es una frase que ya está
   escrita, no una confesión improvisada.

   LOS NOMBRES SALEN DE LA LISTA DEL CURSO, y solo de quien vino hoy: llamar a
   alguien que no está es el fallo clásico de sortear nombres. La lista se puede
   cargar DESDE AQUÍ —no solo desde Grupos—: con un cierre de cinco minutos se
   hace una actividad por clase, así que la mayoría de los días Grupos ni se
   abre. Es la misma lista, no una copia. Y si nadie la ha cargado, la
   herramienta sigue sirviendo: se piden tres voluntarios.

   Nada se guarda, aquí tampoco: ni el molde escrito ni la lista.
   ========================================================================== */
import React, { useState, useRef, useEffect } from 'react';
import { barajar } from '../lista';
import { partirEnHuecos, tieneTexto, HUECO } from '../molde';
import { formatoReloj, estadoReloj } from '../temporizador';
import CargarCurso from './CargarCurso';
import { ACCION, APAGADO, opcion, ENLACE } from '../ui';

/* Minuto y medio por defecto. Menos no alcanza para releer lo que se hizo y
   más se convierte en tiempo muerto: se nota en la sala cuando sobra. */
const SEGUNDOS = [60, 90, 120];
const CUANTOS = 3;

const Duda = ({ lang = 'es', curso = [], origen = null, onCargar, onCambiarLista, grande = false }) => {
  const es = lang === 'es';

  const [fase, setFase] = useState('preparar');
  const [texto, setTexto] = useState('');
  const [total, setTotal] = useState(90);
  const [restante, setRestante] = useState(90);
  const [elegidos, setElegidos] = useState([]);
  const finRef = useRef(0);
  const tick = useRef(null);

  useEffect(() => () => clearInterval(tick.current), []);

  const arrancar = () => {
    clearInterval(tick.current);
    setRestante(total);
    finRef.current = Date.now() + total * 1000;
    setFase('escribir');
    tick.current = setInterval(() => {
      const quedan = Math.max(0, Math.round((finRef.current - Date.now()) / 1000));
      setRestante(quedan);
      if (quedan <= 0) clearInterval(tick.current);
    }, 250);
  };

  const sortear = () => {
    clearInterval(tick.current);
    setElegidos(barajar(curso).slice(0, CUANTOS));
    setFase('leer');
  };

  /* Las medidas de proyección, atadas al alto además de al ancho: el molde es
     una frase larga y el reloj es alto, y con `vw` solo, en 1280×720 el
     conjunto se salía. Mismo criterio que el semáforo. */
  const M = {
    molde:  'min(4vw, 8vh)',
    reloj:  'min(9vw, 16vh)',
    nombre: 'min(3.4vw, 6vh)',
    rotulo: 'min(2vw, 3.6vh)',
  };

  const estado = estadoReloj(restante);

  /* El molde, que es lo que se lee de lejos. Los huecos van apagados: en la
     misma tinta que las palabras compiten con ellas, y lo que hay que leer es
     la frase. */
  const Molde = () => (
    <p
      className={`text-center font-bold text-slate-900 ${grande ? 'leading-tight' : 'text-xl sm:text-2xl'}`}
      style={{ fontSize: grande ? M.molde : undefined }}
    >
      {partirEnHuecos(texto).map((t, i) =>
        t.tipo === 'hueco'
          ? <span key={i} className="text-muted">{t.valor}</span>
          : <React.Fragment key={i}>{t.valor}</React.Fragment>
      )}
    </p>
  );

  /* La puerta a la lista del curso. Va plegada y DESPUÉS de la acción: sin
     lista la herramienta funciona igual, así que quien no la quiera no
     tropieza con ella. */
  const PuertaLista = () => (
    <details className="rounded-xl border border-slate-200 bg-white px-4 py-3">
      <summary className="text-sm font-semibold text-slate-700 cursor-pointer">
        {curso.length
          ? (es ? `Lista del curso · ${curso.length} presentes` : `Class list · ${curso.length} present`)
          : (es ? 'Cargar la lista del curso, para sortear a quién le toca' : 'Load the class list, to draw whose turn it is')}
      </summary>
      <div className="mt-3">
        {curso.length ? (
          <>
            {origen && (
              <p className="mb-3 text-xs text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg px-2.5 py-2">
                {es
                  ? `${origen.curso || 'Curso'} · clase ${origen.clase} del ${origen.fecha}: ${origen.ausentes} no vinieron y no entran en el sorteo.`
                  : `${origen.curso || 'Course'} · class ${origen.clase} on ${origen.fecha}: ${origen.ausentes} were absent and are out of the draw.`}
              </p>
            )}
            <p className="text-xs text-muted mb-2">{curso.join(' · ')}</p>
            <button onClick={() => onCambiarLista?.()} className={ENLACE}>
              {es ? 'cambiar lista' : 'change list'}
            </button>
          </>
        ) : (
          <CargarCurso lang={lang} onCargar={onCargar} compacto />
        )}
      </div>
    </details>
  );

  return (
    <section className={grande ? 'w-full' : 'w-full max-w-xl mx-auto'}>
      {!grande && (
        <>
          <h2 className="text-lg font-bold text-slate-900 mb-1">{es ? 'La duda' : 'The doubt'}</h2>
          <p className="text-sm text-muted mb-4">
            {es ? 'Para cerrar: cada uno nombra lo que le quedó a medias, con un molde que escribes tú.'
                : 'To close the lesson: everyone names what is still unclear, with a frame you write.'}
          </p>
        </>
      )}

      {/* ── PREPARAR ──────────────────────────────────────────────────────── */}
      {fase === 'preparar' && (
        <div className="space-y-4">
          <label className="block">
            <span className="text-xs font-semibold text-slate-600">
              {es ? 'El molde' : 'The frame'}{' '}
              <span className="font-normal text-muted">
                {es ? '· los huecos se escriben con guiones bajos: ______'
                    : '· write the blanks with underscores: ______'}
              </span>
            </span>
            <textarea
              value={texto} rows={2}
              onChange={(e) => { setTexto(e.target.value); }}
              placeholder={es ? `De lo de hoy, todavía no me sale ${HUECO}.` : `From today, I still cannot ${HUECO}.`}
              className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </label>

          <div>
            <p className="text-xs font-semibold text-slate-600 mb-1.5">{es ? 'Para escribirla' : 'To write it'}</p>
            <div className="flex flex-wrap gap-1.5">
              {SEGUNDOS.map(sg => (
                <button key={sg} onClick={() => { setTotal(sg); setRestante(sg); }} aria-pressed={total === sg}
                        className={opcion(total === sg)}>
                  {formatoReloj(sg)}
                </button>
              ))}
            </div>
          </div>

          {tieneTexto(texto) && (
            <div className="rounded-xl border border-slate-200 bg-white px-4 py-4">
              <Molde />
            </div>
          )}

          <button onClick={arrancar} disabled={!tieneTexto(texto)} className={ACCION}>
            {es ? 'Proyectar' : 'Project it'}
          </button>

          <PuertaLista />
        </div>
      )}

      {/* ── ESCRIBIR ──────────────────────────────────────────────────────── */}
      {fase === 'escribir' && (
        <div className="space-y-4">
          <Molde />
          <p className="text-center text-muted" style={{ fontSize: grande ? M.rotulo : undefined }}>
            {es ? 'En silencio. Vale decir «casi todo»: eso también es un lugar.'
                : 'In silence. “Almost everything” is a valid answer: that is a place too.'}
          </p>
          <p
            className={`text-center font-extrabold tabular-nums leading-none ${
              estado === 'normal' ? 'text-slate-900' : 'text-red-600'
            } ${grande ? '' : 'text-6xl'}`}
            style={{ fontSize: grande ? M.reloj : undefined }}
          >
            {formatoReloj(restante)}
          </p>

          <div className={grande ? 'max-w-3xl mx-auto' : ''}>
            <button onClick={sortear} className={ACCION}>
              {curso.length ? (es ? 'A quién le toca' : 'Whose turn') : (es ? 'Se acabó' : 'Time is up')}
            </button>
            <button onClick={() => { clearInterval(tick.current); setFase('preparar'); }} className={`mt-2 w-full ${APAGADO}`}>
              {es ? 'Cambiar el molde' : 'Change the frame'}
            </button>
          </div>
        </div>
      )}

      {/* ── LEER ──────────────────────────────────────────────────────────── */}
      {fase === 'leer' && (
        <div className="space-y-4">
          <Molde />
          <div aria-live="polite" className="text-center">
            <p className="font-bold uppercase tracking-wider" style={{ color: 'var(--marca)', fontSize: grande ? M.rotulo : undefined }}>
              {es ? 'Y ahora cuentan' : 'And now they tell us'}
            </p>
            {elegidos.length ? (
              <ul className={`mt-2 flex flex-wrap justify-center gap-x-6 gap-y-1 font-bold text-slate-900 ${grande ? '' : 'text-2xl'}`}
                  style={{ fontSize: grande ? M.nombre : undefined }}>
                {elegidos.map(n => <li key={n}>{n}</li>)}
              </ul>
            ) : (
              <p className={`mt-2 font-bold text-slate-900 ${grande ? '' : 'text-2xl'}`}
                 style={{ fontSize: grande ? M.nombre : undefined }}>
                {es ? 'Tres voluntarios' : 'Three volunteers'}
              </p>
            )}
          </div>

          <div className={`flex flex-wrap gap-2 ${grande ? 'max-w-3xl mx-auto' : ''}`}>
            {curso.length > CUANTOS && (
              <button onClick={sortear} className={`flex-1 ${APAGADO}`}>{es ? 'Otros tres' : 'Another three'}</button>
            )}
            <button onClick={() => setFase('preparar')} className={`flex-1 ${APAGADO}`}>
              {es ? 'Otra duda' : 'Another doubt'}
            </button>
          </div>

          {!curso.length && (
            <p className="text-xs text-muted text-center">
              {es ? 'Con la lista del curso cargada, aquí salen tres nombres de quienes vinieron hoy. Se carga al escribir el molde.'
                  : 'With the class list loaded, three names of whoever came today show up here. You load it while writing the frame.'}
            </p>
          )}
        </div>
      )}
    </section>
  );
};

export default Duda;
