/* ============================================================================
   EL MURO · quinta herramienta de CIERRE, y la única que no busca el hueco
   ----------------------------------------------------------------------------
   Las otras cuatro preguntan por lo que falta: qué no puedo hacer, qué me quedó
   a medias, qué tuve mal, qué creía y estaba equivocado. Es un desequilibrio y
   lo cazó el profesor: un cierre que solo saca déficits desmoraliza. Esta pone
   el registro contrario.

   CADA UNO NOMBRA ALGO QUE HOY PUDO, y el muro se llena a la vista de todos. Lo
   que se ve al final no es el logro de nadie en particular: es que veinticinco
   cosas pequeñas juntas son un avance. Eso solo se ve si están TODAS a la vez en
   la pantalla, y por eso es un muro y no una lista que se lee y se olvida.

   «HOY PUDE», NO «ME FUE BIEN». Tiene que ser una cosa concreta y comprobable,
   igual que los tres niveles del semáforo son criterios y no sensaciones: «pedir
   comida» es un logro, «estuve atento» es una impresión. El molde lo escribe el
   docente entero —aquí no hay nada puesto ni sugerido, como en el resto del
   cierre—, así que esa exigencia es suya. La pantalla solo la recuerda.

   LO ESCRIBE EL DOCENTE, no los alumnos. No hay servidor: nada puede viajar del
   teléfono de un alumno a esta pantalla, y forzarlo sería romper las tres reglas
   de la sección de golpe. Así que se dice en voz alta y se escribe. Tiene un
   efecto que no estaba buscado y vale la pena: decirlo en voz alta ANTES de
   verlo escrito es media rutina, y obliga a formularlo entero.

   La aritmética del muro —qué cabe, qué se repite, cuánto encoge— está en
   `../muro.js`, con pruebas: un muro que se sale del proyector o que parpadea en
   cada añadido no da error, solo arruina el momento.
   ========================================================================== */
import React, { useState, useRef, useEffect } from 'react';
import { agregar, cabe, quitarUltimo, forma, TOPE } from '../muro';
import { partirEnHuecos, tieneTexto, HUECO } from '../molde';
import { formatoReloj, estadoReloj } from '../temporizador';
import { ACCION, APAGADO, opcion, ENLACE } from '../ui';

/* Minuto y medio para pensarlo. Es corto a propósito: un logro que cuesta tres
   minutos de encontrar probablemente no es de hoy. */
const SEGUNDOS = [60, 90, 120];

const Muro = ({ lang = 'es', grande = false }) => {
  const es = lang === 'es';

  const [fase, setFase] = useState('preparar');
  const [molde, setMolde] = useState('');
  const [total, setTotal] = useState(90);
  const [restante, setRestante] = useState(90);
  const [muro, setMuro] = useState([]);
  const [entrada, setEntrada] = useState('');
  const campo = useRef(null);
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

  const puede = cabe(muro, entrada);
  const anotar = () => {
    if (!puede.puede) return;
    setMuro(m => agregar(m, entrada));
    setEntrada('');
    /* El foco se queda en el campo: se anotan diez seguidos y salir del campo en
       cada uno sería tocar la pantalla el doble de veces. */
    campo.current?.focus();
  };

  const M = {
    molde:   'min(4vw, 8vh)',
    reloj:   'min(7vw, 13vh)',
    rotulo:  'min(2vw, 3.6vh)',
    tarjeta: 'min(2.4vw, 4.4vh)',
    cuenta:  'min(2vw, 3.6vh)',
  };

  const estado = estadoReloj(restante);
  const f = forma(muro.length);

  const Molde = () => (
    <p className={`text-center font-bold text-slate-900 ${grande ? 'leading-tight' : 'text-xl sm:text-2xl'}`}
       style={{ fontSize: grande ? M.molde : undefined }}>
      {partirEnHuecos(molde).map((t, i) =>
        t.tipo === 'hueco'
          ? <span key={i} className="text-muted">{t.valor}</span>
          : <React.Fragment key={i}>{t.valor}</React.Fragment>
      )}
    </p>
  );

  /* El muro. Las tarjetas encogen en escalones al llenarse para que quepan
     todas: proyectando, hacer scroll es lo mismo que perderlo. */
  const Tarjetas = () => (
    <div
      className="mx-auto grid gap-2 w-full"
      style={{
        gridTemplateColumns: `repeat(${f.columnas}, minmax(0, 1fr))`,
        maxWidth: grande ? '90vw' : '100%',
      }}
    >
      {muro.map((logro, i) => (
        <div
          key={logro}
          className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-900 font-semibold break-words"
          style={{ fontSize: grande ? `calc(${M.tarjeta} * ${f.escala})` : `${0.78 + f.escala * 0.22}rem` }}
        >
          {logro}
        </div>
      ))}
    </div>
  );

  return (
    <section className={grande ? 'w-full' : 'w-full max-w-xl mx-auto'}>
      {!grande && (
        <>
          <h2 className="text-lg font-bold text-slate-900 mb-1">{es ? 'El muro' : 'The wall'}</h2>
          <p className="text-sm text-muted mb-4">
            {es ? 'Para cerrar: cada uno nombra algo que hoy pudo y el muro se llena a la vista de todos.'
                : 'To close the lesson: everyone names something they managed today and the wall fills up for all to see.'}
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
                {es ? '· los huecos van con guiones bajos: ______' : '· write the blanks with underscores: ______'}
              </span>
            </span>
            <textarea
              value={molde} rows={2}
              onChange={(e) => { setMolde(e.target.value); }}
              placeholder={es ? `Hoy pude ${HUECO}.` : `Today I could ${HUECO}.`}
              className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </label>
          <p className="text-xs text-muted">
            {es ? 'Que sea algo concreto: «pedir comida» es un logro, «estuve atento» es una impresión.'
                : 'Keep it concrete: “order food” is an achievement, “I paid attention” is an impression.'}
          </p>

          <div>
            <p className="text-xs font-semibold text-slate-600 mb-1.5">{es ? 'Para pensarlo' : 'To think of one'}</p>
            <div className="flex flex-wrap gap-1.5">
              {SEGUNDOS.map(sg => (
                <button key={sg} onClick={() => { setTotal(sg); setRestante(sg); }} aria-pressed={total === sg} className={opcion(total === sg)}>
                  {formatoReloj(sg)}
                </button>
              ))}
            </div>
          </div>

          {tieneTexto(molde) && (
            <div className="rounded-xl border border-slate-200 bg-white px-4 py-4">
              <Molde />
            </div>
          )}

          <button onClick={arrancar} disabled={!tieneTexto(molde)} className={ACCION}>
            {es ? 'Proyectar' : 'Project it'}
          </button>

        </div>
      )}

      {/* ── ESCRIBIR ──────────────────────────────────────────────────────── */}
      {fase === 'escribir' && (
        <div className="space-y-4">
          <Molde />
          <p className="text-center text-muted" style={{ fontSize: grande ? M.rotulo : undefined }}>
            {es ? 'Uno. Algo que hoy sí pudiste.' : 'One thing. Something you managed today.'}
          </p>
          <p className={`text-center font-extrabold tabular-nums leading-none ${
              estado === 'normal' ? 'text-slate-900' : 'text-red-600'
            } ${grande ? '' : 'text-6xl'}`}
            style={{ fontSize: grande ? M.reloj : undefined }}>
            {formatoReloj(restante)}
          </p>

          <div className={grande ? 'max-w-3xl mx-auto' : ''}>
            <button onClick={() => { clearInterval(tick.current); setFase('muro'); }} className={ACCION}>
              {es ? 'A construir el muro' : 'Build the wall'}
            </button>
            <button onClick={() => { clearInterval(tick.current); setFase('preparar'); }} className={`mt-2 w-full ${APAGADO}`}>
              {es ? 'Cambiar el molde' : 'Change the frame'}
            </button>
          </div>
        </div>
      )}

      {/* ── MURO ──────────────────────────────────────────────────────────── */}
      {fase === 'muro' && (
        <div className="space-y-4">
          <p className="text-center font-bold uppercase tracking-wider" style={{ color: 'var(--marca)', fontSize: grande ? M.rotulo : undefined }}>
            {es ? 'Lo que este curso pudo hoy' : 'What this class managed today'}
          </p>

          <div aria-live="polite">
            {muro.length ? <Tarjetas /> : (
              <p className="text-center text-muted" style={{ fontSize: grande ? M.rotulo : undefined }}>
                {es ? 'Van diciendo y tú vas escribiendo.' : 'They say them, you type them.'}
              </p>
            )}
          </div>

          {muro.length > 0 && (
            <p className="text-center font-bold text-slate-900" style={{ fontSize: grande ? M.cuenta : undefined }}>
              {es ? `${muro.length} ${muro.length === 1 ? 'logro' : 'logros'} en esta clase`
                  : `${muro.length} ${muro.length === 1 ? 'win' : 'wins'} in this lesson`}
            </p>
          )}

          {/* Escribir y anotar. Enter también anota: se escriben diez seguidos y
              buscar el botón cada vez es tocar la pantalla el doble. */}
          <div className={grande ? 'max-w-2xl mx-auto' : ''}>
            <div className="flex gap-2">
              <input
                ref={campo}
                type="text" value={entrada}
                onChange={(e) => setEntrada(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') anotar(); }}
                placeholder={es ? 'lo que acaba de decir' : 'what they just said'}
                className="flex-1 min-w-0 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              <button onClick={anotar} disabled={!puede.puede}
                      className="shrink-0 px-4 py-2 rounded-lg font-bold text-sm bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:bg-slate-300 disabled:text-slate-600 text-white transition-colors touch-manipulation">
                {es ? 'Anotar' : 'Add'}
              </button>
            </div>
            {/* Se dice por qué no entra, y antes de tocar nada. */}
            {entrada.trim() && !puede.puede && (
              <p className="mt-2 text-xs text-slate-600">
                {puede.motivo === 'repetido'
                  ? (es ? 'Ese ya está en el muro. Si dos dijeron lo mismo, vale: ya está representado.'
                        : 'That one is already up. If two said the same thing, fine: it is already there.')
                  : (es ? `El muro está lleno (${TOPE}).` : `The wall is full (${TOPE}).`)}
              </p>
            )}

            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
              {muro.length > 0 && (
                <button onClick={() => setMuro(quitarUltimo)} className={ENLACE}>
                  {es ? 'borrar el último' : 'delete the last one'}
                </button>
              )}
              <button onClick={() => { setMuro([]); setEntrada(''); setFase('preparar'); }} className={ENLACE}>
                {es ? 'empezar de nuevo' : 'start over'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Muro;
