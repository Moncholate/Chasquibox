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
import OrigenLista from './OrigenLista';
import { APAGADO, opcion, ENLACE } from '../ui';
import { Panel, Escenario, Accion, Cabeza } from '../zonas';

/* Dos minutos. Es más que «La duda» porque aquí se escriben dos frases y una
   razón, y menos que la apuesta porque no hay que producir gramática nueva. */
const SEGUNDOS = [90, 120, 180];
const CUANTOS = 3;

const AntesAhora = ({ lang = 'es', curso = [], origen = null, onCargar, onCambiarLista, onCambiarFecha }) => {
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

  /* Contra el ESCENARIO (cqw/cqh): crece igual en el PC y a pantalla completa. */
  const M = {
    rotulo: 'max(0.7rem, min(1.8cqw, 3.2cqh))',
    frase:  'max(1.05rem, min(3cqw, 5.5cqh))',
    cola:   'max(0.85rem, min(1.9cqw, 3.4cqh))',
    reloj:  'max(2.5rem, min(7cqw, 13cqh))',
    nombre: 'max(1.2rem, min(3.4cqw, 6cqh))',
  };

  const estado = estadoReloj(restante);

  /* Los dos lados. El de la izquierda va apagado y tachado —es lo que YA NO se
     piensa— y el de la derecha en tinta plena. Que se vean distintos es la mitad
     del mensaje: uno quedó atrás.
     Vacío no se tacha: una raya sobre nada es ruido.
     Se llama `Lado` y no `Panel`: Panel es la zona de controles (../zonas.jsx). */
  const Lado = ({ rotulo, frase, cola, viejo }) => (
    <div className={`flex-1 rounded-xl border px-[2cqw] py-[2.5cqh] ${viejo ? 'border-slate-200 bg-slate-50' : 'border-slate-300 bg-white'}`}>
      <p className="font-bold uppercase tracking-wider text-muted" style={{ fontSize: M.rotulo }}>{rotulo}</p>
      <p className={`mt-2 font-bold leading-tight ${
            !frase ? 'text-muted' : viejo ? 'text-slate-600 line-through decoration-2' : 'text-slate-900'}`}
         style={{ fontSize: M.frase }}>
        {frase || '______'}
      </p>
      <p className="mt-3 text-muted" style={{ fontSize: M.cola }}>{cola}</p>
    </div>
  );

  const Marco = () => (
    <div className="mx-auto flex flex-col sm:flex-row gap-3 max-w-6xl">
      <Lado viejo rotulo={es ? 'Antes pensaba' : 'I used to think'} frase={antes.trim()}
            cola={es ? '…que estaba bien.' : '…that it was fine.'} />
      <Lado rotulo={es ? 'Ahora pienso' : 'Now I think'} frase={ahora.trim()}
            cola={es ? '…porque ______' : '…because ______'} />
    </div>
  );

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
        <div className="w-full space-y-[3cqh]">
          {/* El marco se ve en las tres fases: escribiendo los lados en el panel,
              se ve aquí como lo verá el curso. */}
          <Marco />

          {fase === 'escribir' && (
            <>
              <p className="text-center font-bold text-slate-900" style={{ fontSize: M.cola }}>
                {es ? 'La mitad que vale es el porqué.' : 'The half that counts is the why.'}
              </p>
              <p className={`text-center font-extrabold tabular-nums leading-none ${
                  estado === 'normal' ? 'text-slate-900' : 'text-red-600'
                }`}
                style={{ fontSize: M.reloj }}>
                {formatoReloj(restante)}
              </p>
            </>
          )}

          {fase === 'leer' && (
            <div aria-live="polite" className="text-center">
              <p className="font-bold uppercase tracking-wider" style={{ color: 'var(--marca)', fontSize: M.rotulo }}>
                {es ? 'Y ahora cuentan el porqué' : 'And now they tell us the why'}
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
          )}
        </div>
      </Escenario>

      <Panel>
        <Cabeza titulo={es ? 'Antes / Ahora' : 'Then / Now'}>
          {es ? 'Para cerrar: qué creía al empezar la clase que ya no creo, y por qué. Los dos lados los escribes tú, o se dejan en blanco.'
              : 'To close the lesson: what I believed when the class started that I no longer believe, and why. You write both sides, or leave them blank.'}
        </Cabeza>

        {fase === 'preparar' && (
          <div className="space-y-4">
            {/* Los dos campos, y los dos pueden quedarse vacíos: en blanco cada uno
                pone el suyo, que es la versión que más pide y la que mejor material
                da cuando el curso ya tiene el hábito. */}
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
              {es ? 'Cambiar' : 'Change'}
            </button>
          </div>
        )}

        {fase === 'leer' && (
          <div className="grid grid-cols-2 gap-2">
            {curso.length > CUANTOS && (
              <button onClick={sortear} className={APAGADO}>{es ? 'Otros tres' : 'Another three'}</button>
            )}
            <button onClick={() => setFase('preparar')} className={APAGADO}>
              {es ? 'Otro' : 'Another one'}
            </button>
          </div>
        )}
      </Panel>

      {fase === 'preparar' && (
        <Accion onClick={arrancar}>{es ? 'Proyectar' : 'Project it'}</Accion>
      )}
      {fase === 'escribir' && (
        <Accion onClick={sortear}>
          {curso.length ? (es ? 'A quién le toca' : 'Whose turn') : (es ? 'Se acabó' : 'Time is up')}
        </Accion>
      )}
    </>
  );
};

export default AntesAhora;
