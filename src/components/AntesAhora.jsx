/* ============================================================================
   ANTES / AHORA · cuarta herramienta de CIERRE
   ----------------------------------------------------------------------------
   La única de las cinco que pide evidencia de CAMBIO.

       Antes pensaba que ____ estaba bien · Ahora pienso ____ porque ____

   «Sí, entendí» se puede fingir sin darse cuenta —el alumno lo cree cuando lo
   dice—; «antes creía X y ahora creo Y porque Z» no. Hay que haber movido algo
   para poder contarlo, y si la razón que da está equivocada, eso es exactamente
   lo que había que ver: la herramienta NO juzga la respuesta.

   LOS DOS LADOS LOS ESCRIBE EL DOCENTE, y abren en blanco. Venían con un error
   de gramática puesto, y eso presuponía de qué había sido la clase: en una
   unidad de vocabulario no había nada que editar. Ahora se escriben, y en
   blanco también funciona — cada alumno pone el suyo, que es la versión que más
   pide y la que mejor material da cuando el curso ya tiene el hábito.

   LA MITAD QUE VALE ES LA SEGUNDA. Voltear la frase es fácil y se copia del
   pizarrón; el «porque» no. La herramienta no lo pide en pantalla más que con
   los puntos suspensivos: si el porqué apareciera escrito, la rutina se
   convertiría en copiarlo.

   Y NO HAY ERRORES SUGERIDOS. Hubo doce, plegados y opcionales. El profesor los
   probó y no funcionó: lo que una herramienta ofrece orienta lo que se hace con
   ella aunque esté plegado, y una lista de errores de gramática insinúa que el
   cierre va de gramática. Confunde más de lo que ahorra. Fuera, 1-sep-2026.

   EL ERROR TIENE QUE HABER PARECIDO BIEN, o no hay nada que voltear — pero eso
   lo sabe quien dio la clase, no un archivo de datos.

   Tres fases, una acción cada una, como el resto del cierre.
   ========================================================================== */
import React, { useState, useRef, useEffect } from 'react';
import { barajar } from '../lista';
import { formatoReloj, estadoReloj } from '../temporizador';
import CargarCurso from './CargarCurso';
import { ACCION, APAGADO, opcion, ENLACE } from '../ui';

/* Dos minutos. Es más que «La duda» porque aquí se escriben dos frases y una
   razón, y menos que la apuesta porque no hay que producir gramática nueva. */
const SEGUNDOS = [90, 120, 180];
const CUANTOS = 3;

const AntesAhora = ({ lang = 'es', curso = [], origen = null, onCargar, onCambiarLista, grande = false }) => {
  const es = lang === 'es';

  const [fase, setFase] = useState('preparar');
  const [antes, setAntes] = useState('');
  const [ahora, setAhora] = useState('');
  const [total, setTotal] = useState(120);
  const [restante, setRestante] = useState(120);
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

  const M = {
    rotulo: 'min(1.8vw, 3.2vh)',
    frase:  'min(3vw, 5.5vh)',
    cola:   'min(1.9vw, 3.4vh)',
    reloj:  'min(6vw, 11vh)',
    nombre: 'min(3.2vw, 5.6vh)',
  };

  const estado = estadoReloj(restante);

  /* Los dos paneles. El de la izquierda va apagado y tachado —es lo que YA NO se
     piensa— y el de la derecha en tinta plena. Que se vean distintos es la mitad
     del mensaje: uno quedó atrás.
     Vacío no se tacha: una raya sobre nada es ruido. */
  const Panel = ({ rotulo, frase, cola, viejo }) => (
    <div className={`flex-1 rounded-xl border px-4 py-4 ${viejo ? 'border-slate-200 bg-slate-50' : 'border-slate-300 bg-white'}`}>
      <p className="font-bold uppercase tracking-wider text-muted" style={{ fontSize: grande ? M.rotulo : undefined }}>
        <span className={grande ? '' : 'text-[11px]'}>{rotulo}</span>
      </p>
      <p className={`mt-2 font-bold ${grande ? 'leading-tight' : 'text-lg'} ${
            !frase ? 'text-muted' : viejo ? 'text-slate-600 line-through decoration-2' : 'text-slate-900'}`}
         style={{ fontSize: grande ? M.frase : undefined }}>
        {frase || '______'}
      </p>
      <p className="mt-3 text-muted" style={{ fontSize: grande ? M.cola : undefined }}>
        <span className={grande ? '' : 'text-sm'}>{cola}</span>
      </p>
    </div>
  );

  const Marco = () => (
    <div className={`mx-auto flex flex-col sm:flex-row gap-3 ${grande ? 'max-w-6xl' : 'max-w-2xl'}`}>
      <Panel viejo rotulo={es ? 'Antes pensaba' : 'I used to think'} frase={antes.trim()}
             cola={es ? '…que estaba bien.' : '…that it was fine.'} />
      <Panel rotulo={es ? 'Ahora pienso' : 'Now I think'} frase={ahora.trim()}
             cola={es ? '…porque ______' : '…because ______'} />
    </div>
  );

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
          <h2 className="text-lg font-bold text-slate-900 mb-1">{es ? 'Antes / Ahora' : 'Then / Now'}</h2>
          <p className="text-sm text-muted mb-4">
            {es ? 'Para cerrar: qué creía al empezar la clase que ya no creo, y por qué. Los dos lados los escribes tú, o se dejan en blanco.'
                : 'To close the lesson: what I believed when the class started that I no longer believe, and why. You write both sides, or leave them blank.'}
          </p>
        </>
      )}

      {/* ── PREPARAR ──────────────────────────────────────────────────────── */}
      {fase === 'preparar' && (
        <div className="space-y-4">
          {/* Los dos campos, y los dos pueden quedarse vacíos: en blanco cada uno
              pone el suyo, que es la versión que más pide y la que mejor material
              da cuando el curso ya tiene el hábito. */}
          <div className="grid sm:grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs font-semibold text-slate-600">{es ? 'Antes pensaba…' : 'I used to think…'}</span>
              <input
                type="text" value={antes}
                onChange={(e) => { setAntes(e.target.value); }}
                placeholder={es ? 'lo que parecía bien' : 'what seemed fine'}
                className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-slate-600">{es ? 'Ahora pienso…' : 'Now I think…'}</span>
              <input
                type="text" value={ahora}
                onChange={(e) => { setAhora(e.target.value); }}
                placeholder={es ? 'lo que va' : 'what actually goes'}
                className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </label>
          </div>
          <p className="text-xs text-muted">
            {es ? 'Los dos en blanco también sirve: cada uno pone el suyo.'
                : 'Leaving both blank works too: everyone puts their own.'}
          </p>

          <div>
            <p className="text-xs font-semibold text-slate-600 mb-1.5">{es ? 'Para escribirlo' : 'To write it'}</p>
            <div className="flex flex-wrap gap-1.5">
              {SEGUNDOS.map(sg => (
                <button key={sg} onClick={() => { setTotal(sg); setRestante(sg); }} aria-pressed={total === sg} className={opcion(total === sg)}>
                  {formatoReloj(sg)}
                </button>
              ))}
            </div>
          </div>

          <Marco />

          <button onClick={arrancar} className={ACCION}>{es ? 'Proyectar' : 'Project it'}</button>

          <PuertaLista />
        </div>
      )}

      {/* ── ESCRIBIR ──────────────────────────────────────────────────────── */}
      {fase === 'escribir' && (
        <div className="space-y-4">
          <Marco />
          <p className="text-center font-bold text-slate-900" style={{ fontSize: grande ? M.cola : undefined }}>
            {es ? 'La mitad que vale es el porqué.' : 'The half that counts is the why.'}
          </p>
          <p className={`text-center font-extrabold tabular-nums leading-none ${
              estado === 'normal' ? 'text-slate-900' : 'text-red-600'
            } ${grande ? '' : 'text-5xl'}`}
            style={{ fontSize: grande ? M.reloj : undefined }}>
            {formatoReloj(restante)}
          </p>

          <div className={grande ? 'max-w-3xl mx-auto' : ''}>
            <button onClick={sortear} className={ACCION}>
              {curso.length ? (es ? 'A quién le toca' : 'Whose turn') : (es ? 'Se acabó' : 'Time is up')}
            </button>
            <button onClick={() => { clearInterval(tick.current); setFase('preparar'); }} className={`mt-2 w-full ${APAGADO}`}>
              {es ? 'Cambiar' : 'Change'}
            </button>
          </div>
        </div>
      )}

      {/* ── LEER ──────────────────────────────────────────────────────────── */}
      {fase === 'leer' && (
        <div className="space-y-4">
          <Marco />
          <div aria-live="polite" className="text-center">
            <p className="font-bold uppercase tracking-wider" style={{ color: 'var(--marca)', fontSize: grande ? M.rotulo : undefined }}>
              {es ? 'Y ahora cuentan el porqué' : 'And now they tell us the why'}
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
              {es ? 'Otro' : 'Another one'}
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default AntesAhora;
