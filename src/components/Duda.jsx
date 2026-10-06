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
import OrigenLista from './OrigenLista';
import { APAGADO, opcion, ENLACE } from '../ui';
import { Panel, Escenario, Accion, Cabeza } from '../zonas';

/* Minuto y medio por defecto. Menos no alcanza para releer lo que se hizo y
   más se convierte en tiempo muerto: se nota en la sala cuando sobra. */
const SEGUNDOS = [60, 90, 120];
const CUANTOS = 3;

const Duda = ({ lang = 'es', curso = [], origen = null, onCargar, onCambiarLista, onCambiarFecha }) => {
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

  /* Las medidas, atadas al alto además de al ancho: el molde es una frase larga
     y el reloj es alto, y con el ancho solo, en 1280×720 el conjunto se salía.
     Mismo criterio que el semáforo. Contra el ESCENARIO (cqw/cqh). */
  const M = {
    molde:  'max(1.1rem, min(4.2cqw, 8.5cqh))',
    reloj:  'max(2.5rem, min(10cqw, 18cqh))',
    nombre: 'max(1.2rem, min(3.6cqw, 6.5cqh))',
    rotulo: 'max(0.8rem, min(2cqw, 3.6cqh))',
  };

  const estado = estadoReloj(restante);

  /* El molde, que es lo que se lee de lejos. Los huecos van apagados: en la
     misma tinta que las palabras compiten con ellas, y lo que hay que leer es
     la frase. */
  const Molde = () => (
    <p className="text-center font-bold text-slate-900 leading-tight" style={{ fontSize: M.molde }}>
      {partirEnHuecos(texto).map((t, i) =>
        t.tipo === 'hueco'
          ? <span key={i} className="text-muted">{t.valor}</span>
          : <React.Fragment key={i}>{t.valor}</React.Fragment>
      )}
    </p>
  );

  /* La puerta a la lista del curso. Va plegada: sin lista la herramienta
     funciona igual, así que quien no la quiera no tropieza con ella. */
  const PuertaLista = () => (
    <details className="rounded-xl border border-slate-200 bg-white px-4 py-3">
      <summary className="text-sm font-semibold text-slate-700 cursor-pointer">
        {curso.length
          ? (es ? `Lista del curso${origen ? ` del ${origen.fecha}` : ''} · ${curso.length} presentes` : `Class list${origen ? ` from ${origen.fecha}` : ''} · ${curso.length} present`)
          : (es ? 'Cargar la lista del curso, para sortear a quién le toca' : 'Load the class list, to draw whose turn it is')}
      </summary>
      <div className="mt-3">
        {curso.length ? (
          <>
            <OrigenLista lang={lang} origen={origen}
                         fuera={es ? 'no entran en el sorteo' : 'out of the draw'}
                         onCambiarFecha={onCambiarFecha} />
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
    <>
      <Escenario>
        {/* ── PREPARAR: el molde como lo verá el curso ────────────────────── */}
        {fase === 'preparar' && (
          tieneTexto(texto) ? <div className="w-full"><Molde /></div> : (
            <p className="text-muted text-center max-w-sm">
              {es ? 'Escribe el molde en el panel de la derecha: aquí se ve como lo verá el curso.'
                  : 'Write the frame in the panel on the right: here it shows as the class will see it.'}
            </p>
          )
        )}

        {/* ── ESCRIBIR ─────────────────────────────────────────────────────── */}
        {fase === 'escribir' && (
          <div className="w-full space-y-[3cqh]">
            <Molde />
            <p className="text-center text-muted" style={{ fontSize: M.rotulo }}>
              {es ? 'En silencio. Vale decir «casi todo»: eso también es un lugar.'
                  : 'In silence. “Almost everything” is a valid answer: that is a place too.'}
            </p>
            <p className={`text-center font-extrabold tabular-nums leading-none ${
                estado === 'normal' ? 'text-slate-900' : 'text-red-600'
              }`}
              style={{ fontSize: M.reloj }}>
              {formatoReloj(restante)}
            </p>
          </div>
        )}

        {/* ── LEER ─────────────────────────────────────────────────────────── */}
        {fase === 'leer' && (
          <div className="w-full space-y-[3cqh]">
            <Molde />
            <div aria-live="polite" className="text-center">
              <p className="font-bold uppercase tracking-wider" style={{ color: 'var(--marca)', fontSize: M.rotulo }}>
                {es ? 'Y ahora cuentan' : 'And now they tell us'}
              </p>
              {elegidos.length ? (
                <ul className="mt-2 flex flex-wrap justify-center gap-x-6 gap-y-1 font-bold text-slate-900"
                    style={{ fontSize: M.nombre }}>
                  {elegidos.map(n => <li key={n}>{n}</li>)}
                </ul>
              ) : (
                <p className="mt-2 font-bold text-slate-900" style={{ fontSize: M.nombre }}>
                  {es ? 'Tres voluntarios' : 'Three volunteers'}
                </p>
              )}
            </div>
          </div>
        )}
      </Escenario>

      <Panel>
        <Cabeza titulo={es ? 'La duda' : 'The doubt'}>
          {es ? 'Para cerrar: cada uno nombra lo que le quedó a medias, con un molde que escribes tú.'
              : 'To close the lesson: everyone names what is still unclear, with a frame you write.'}
        </Cabeza>

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
                value={texto} rows={3}
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

            <PuertaLista />
          </div>
        )}

        {fase === 'escribir' && (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              {curso.length
                ? (es ? `Al terminar, salen tres nombres de los ${curso.length} presentes.` : `When it ends, three names come out of the ${curso.length} present.`)
                : (es ? 'Sin lista del curso: al terminar se piden tres voluntarios.' : 'No class list: when it ends, ask for three volunteers.')}
            </p>
            <button onClick={() => { clearInterval(tick.current); setFase('preparar'); }} className={`w-full ${APAGADO}`}>
              {es ? 'Cambiar el molde' : 'Change the frame'}
            </button>
          </div>
        )}

        {fase === 'leer' && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              {curso.length > CUANTOS && (
                <button onClick={sortear} className={APAGADO}>{es ? 'Otros tres' : 'Another three'}</button>
              )}
              <button onClick={() => setFase('preparar')} className={APAGADO}>
                {es ? 'Otra duda' : 'Another doubt'}
              </button>
            </div>
            {!curso.length && (
              <p className="text-xs text-muted">
                {es ? 'Con la lista del curso cargada, aquí salen tres nombres de quienes vinieron hoy. Se carga al escribir el molde.'
                    : 'With the class list loaded, three names of whoever came today show up here. You load it while writing the frame.'}
              </p>
            )}
          </div>
        )}
      </Panel>

      {fase === 'preparar' && (
        <Accion onClick={arrancar} disabled={!tieneTexto(texto)}>
          {es ? 'Proyectar' : 'Project it'}
        </Accion>
      )}
      {fase === 'escribir' && (
        <Accion onClick={sortear}>
          {curso.length ? (es ? 'A quién le toca' : 'Whose turn') : (es ? 'Se acabó' : 'Time is up')}
        </Accion>
      )}
    </>
  );
};

export default Duda;
