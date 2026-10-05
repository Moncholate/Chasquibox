/* ============================================================================
   APUESTA · tercera herramienta de CIERRE
   ----------------------------------------------------------------------------
   El movimiento que más enseña de los cuatro, y el único que no se puede hacer
   sin una herramienta que imponga el orden.

   PREDECIR Y DESPUÉS COMPROBAR. El alumno escribe cinco oraciones, APUESTA
   cuántas cree tener bien, y recién entonces corrige. Lo que enseña no es
   acertar: es descubrir que creías cuatro y tenías dos. Esa distancia —la
   calibración— es literalmente el objeto de la metacognición, y es información
   que ninguna nota entrega, porque la produce el propio alumno sobre sí mismo.

   EL ORDEN NO ES NEGOCIABLE, y por eso son cuatro pantallas y no una. Si la
   apuesta se pide después de ver las respuestas, no es una apuesta: es una
   descripción. La herramienta existe para que ese orden no dependa de la buena
   fe de nadie a las 12:50 de un viernes.

     ESCRIBIR   las cinco consignas y el reloj
     APOSTAR    «¿cuántas crees que tienes bien?» — se escribe y se tapa
     COMPARAR   «aposté ___ · tuve ___» y la pregunta que importa

   NO CORRIGE, y es a propósito. Corregir aquí sería otra app: la suite ya tiene
   tres que lo hacen, y la pestaña Tiempos de Grammaster está a un toque en el
   mismo proyector. Lo que esta herramienta aporta es el momento del compromiso,
   que es lo que ninguna de las otras tiene.

   LAS CONSIGNAS LAS ESCRIBE EL DOCENTE, una por línea, como la lista de la
   ruleta. Venían generadas de tiempo + sujeto + forma, y eso presuponía que la
   clase había sido de gramática: para una unidad de vocabulario —«usa estas
   cinco palabras en una oración»— no había nada que editar. Lo dijo el profesor,
   1-sep-2026.

   Y NO HAY GENERADOR. Lo hubo, plegado y opcional. El profesor lo probó y no
   funcionó: lo que una herramienta ofrece orienta lo que se hace con ella aunque
   esté plegado, y un botón que escribe cinco consignas de tiempos verbales
   insinúa que el cierre va de tiempos verbales. Confunde más de lo que ahorra.
   Fuera, 1-sep-2026.

   LO QUE SÍ SE CONSERVA es la advertencia, porque vale para las consignas que
   escriba el docente: un set sirve si REPARTE. Cinco consignas del mismo tipo o
   las cinco en afirmativa hacen que se acierte o se falle en bloque, y entonces
   la distancia entre lo que se apostó y lo que se tuvo no dice nada.
   ========================================================================== */
import React, { useState, useRef, useEffect } from 'react';
import { parsearLista } from '../lista';
import { formatoReloj, estadoReloj } from '../temporizador';
import { ACCION, APAGADO, opcion } from '../ui';

/* Cuatro minutos para cinco oraciones. Menos deja a media clase sin terminar,
   y una apuesta sobre algo que no se terminó no mide calibración: mide prisa. */
const MINUTOS = [3, 4, 5];

const Apuesta = ({ lang = 'es', grande = false }) => {
  const es = lang === 'es';

  const [fase, setFase] = useState('preparar');
  const [minutos, setMinutos] = useState(4);
  /* UNA POR LÍNEA, como la lista de la ruleta: es el gesto que el docente ya
     conoce de esta sección y no hay que explicarlo. */
  const [texto, setTexto] = useState('');
  const [restante, setRestante] = useState(4 * 60);
  const finRef = useRef(0);
  const tick = useRef(null);

  useEffect(() => () => clearInterval(tick.current), []);

  const consignas = parsearLista(texto);

  const arrancar = () => {
    clearInterval(tick.current);
    setRestante(minutos * 60);
    finRef.current = Date.now() + minutos * 60 * 1000;
    setFase('escribir');
    /* Contra el reloj del sistema y no restando uno por segundo: un intervalo
       que se retrasa acumula el retraso y miente mientras la clase mira. */
    tick.current = setInterval(() => {
      const quedan = Math.max(0, Math.round((finRef.current - Date.now()) / 1000));
      setRestante(quedan);
      if (quedan <= 0) clearInterval(tick.current);
    }, 250);
  };

  const M = {
    consigna: 'min(2.6vw, 5vh)',
    numero:   'min(1.8vw, 3.4vh)',
    reloj:    'min(6vw, 11vh)',
    pregunta: 'min(3.6vw, 7vh)',
    rotulo:   'min(2vw, 3.6vh)',
    hueco:    'min(7vw, 13vh)',
  };

  /* Las consignas, numeradas. Lo que se lee de lejos y lo que se copia en el
     cuaderno, así que el número tiene que ser inequívoco: se apuesta sobre
     «cuántas de estas cinco» y hay que poder señalar cuál falló. */
  const Consignas = () => (
    <ol className={`mx-auto ${grande ? 'max-w-4xl' : 'max-w-lg'} flex flex-col ${grande ? 'gap-2' : 'gap-1.5'}`}>
      {consignas.map((c, i) => (
        <li key={i} className="flex items-baseline gap-3 border-b border-slate-200 pb-1.5 last:border-b-0">
          <span className="font-bold text-muted tabular-nums shrink-0"
                style={{ fontSize: grande ? M.numero : undefined }}>{i + 1}</span>
          <span className={`font-semibold text-slate-900 ${grande ? '' : 'text-base'}`}
                style={{ fontSize: grande ? M.consigna : undefined }}>
            {c}
          </span>
        </li>
      ))}
    </ol>
  );

  const estado = estadoReloj(restante);

  return (
    <section className={grande ? 'w-full' : 'w-full max-w-xl mx-auto'}>
      {!grande && (
        <>
          <h2 className="text-lg font-bold text-slate-900 mb-1">{es ? 'Apuesta' : 'The bet'}</h2>
          <p className="text-sm text-muted mb-4">
            {es ? 'Para cerrar: escriben, apuestan cuántas creen tener bien, y recién entonces corrigen.'
                : 'To close the lesson: they write, bet how many they think are right, and only then check.'}
          </p>
        </>
      )}

      {/* ── PREPARAR ──────────────────────────────────────────────────────── */}
      {fase === 'preparar' && (
        <div className="space-y-4">
          <label className="block">
            <span className="text-xs font-semibold text-slate-600">
              {es ? 'Las consignas' : 'The prompts'}{' '}
              <span className="font-normal text-muted">{es ? '· una por línea' : '· one per line'}</span>
            </span>
            <textarea
              value={texto} rows={6}
              onChange={(e) => { setTexto(e.target.value); }}
              placeholder={es
                ? 'Explica qué hace el núcleo\nResuelve 3x + 5 = 20\nNombra una causa de la Independencia'
                : 'Use “although” in a sentence\nDescribe your weekend\nA question with “how often”'}
              className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </label>

          <p className="text-xs text-muted">
            {es ? 'Que repartan: si las cinco son del mismo tipo, se acierta o se falla en bloque y la apuesta no mide nada.'
                : 'Spread them out: if all five are the same kind, you get them all right or all wrong and the bet measures nothing.'}
          </p>

          <div>
            <p className="text-xs font-semibold text-slate-600 mb-1.5">{es ? 'Para escribirlas' : 'To write them'}</p>
            <div className="flex flex-wrap gap-1.5">
              {MINUTOS.map(m => (
                <button key={m} onClick={() => setMinutos(m)} aria-pressed={minutos === m} className={opcion(minutos === m)}>
                  {formatoReloj(m * 60)}
                </button>
              ))}
            </div>
          </div>

          {consignas.length > 0 && (
            <div className="rounded-xl border border-slate-200 bg-white px-4 py-4">
              <Consignas />
            </div>
          )}

          <button onClick={arrancar} disabled={!consignas.length} className={ACCION}>
            {es ? 'Proyectar y arrancar' : 'Project and start'}
          </button>

        </div>
      )}


      {/* ── ESCRIBIR ──────────────────────────────────────────────────────── */}
      {fase === 'escribir' && (
        <div className="space-y-4">
          <p className="text-center font-bold uppercase tracking-wider" style={{ color: 'var(--marca)', fontSize: grande ? M.rotulo : undefined }}>
            {es ? `Escribe las ${consignas.length}` : `Write the ${consignas.length}`}
          </p>
          <Consignas />
          <p className={`text-center font-extrabold tabular-nums leading-none ${
              estado === 'normal' ? 'text-slate-900' : 'text-red-600'
            } ${grande ? '' : 'text-5xl'}`}
            style={{ fontSize: grande ? M.reloj : undefined }}>
            {formatoReloj(restante)}
          </p>

          <div className={grande ? 'max-w-3xl mx-auto' : ''}>
            <button onClick={() => { clearInterval(tick.current); setFase('apostar'); }} className={ACCION}>
              {es ? 'Ya: a apostar' : 'Time: place the bet'}
            </button>
            <button onClick={() => { clearInterval(tick.current); setFase('preparar'); }} className={`mt-2 w-full ${APAGADO}`}>
              {es ? 'Volver' : 'Back'}
            </button>
          </div>
        </div>
      )}

      {/* ── APOSTAR ───────────────────────────────────────────────────────── */}
      {fase === 'apostar' && (
        <div className="space-y-4">
          {/* Las consignas DESAPARECEN aquí. Con la lista delante, la apuesta se
              convierte en revisarlas una por una, que es corregir sin corregir;
              lo que se quiere es lo que el alumno cree ANTES de mirar. */}
          <p className="text-center font-bold text-slate-900" style={{ fontSize: grande ? M.pregunta : undefined }}>
            <span className={grande ? '' : 'text-2xl'}>
              {es ? `De las ${consignas.length}, ¿cuántas crees que tienes bien?` : `Of the ${consignas.length}, how many do you think are right?`}
            </span>
          </p>
          <p className="text-center font-extrabold text-muted leading-none select-none" aria-hidden="true"
             style={{ fontSize: grande ? M.hueco : undefined }}>
            {grande ? '?' : <span className="text-6xl">?</span>}
          </p>
          <p className="text-center text-muted" style={{ fontSize: grande ? M.rotulo : undefined }}>
            {es ? 'Escribe el número y tápalo. Sin mirar las respuestas.'
                : 'Write the number and cover it. No peeking at the answers.'}
          </p>

          <div className={grande ? 'max-w-3xl mx-auto' : ''}>
            <button onClick={() => setFase('comparar')} className={ACCION}>
              {es ? 'Ahora corrijan' : 'Now check'}
            </button>
          </div>
        </div>
      )}

      {/* ── COMPARAR ──────────────────────────────────────────────────────── */}
      {fase === 'comparar' && (
        <div className="space-y-4">
          <Consignas />
          {/* El marco de la comparación. Los números los pone cada alumno en su
              cuaderno: la herramienta no sabe —ni tiene por qué saber— cuántas
              tuvo nadie. Lo que aporta es la pregunta de abajo. */}
          <div className={`mx-auto flex gap-3 ${grande ? 'max-w-2xl' : 'max-w-sm'}`}>
            {[[es ? 'Aposté' : 'I bet'], [es ? 'Tuve' : 'I got']].map(([rot]) => (
              <div key={rot} className="flex-1 rounded-xl border border-slate-300 bg-white px-3 py-3 text-center">
                <p className="font-bold uppercase tracking-wider text-muted" style={{ fontSize: grande ? M.rotulo : undefined }}>
                  <span className={grande ? '' : 'text-[11px]'}>{rot}</span>
                </p>
                {/* Una RAYA sobre la que escribir, no un guion de texto. El guion
                    iba en slate-300 y daba 1,48:1 sobre el blanco —lo cazó la
                    sonda—, y subirle la tinta lo habría convertido en un signo
                    menos que se lee como parte del dato. Una línea dice «aquí va
                    tu número» sin decir nada más, y en slate-400 pasa el 3:1 que
                    piden los elementos gráficos. */}
                <div aria-hidden="true" className="mt-4 mx-auto border-b-2 border-slate-400"
                     style={{ width: '60%', height: grande ? '3vh' : '1.4rem' }} />
              </div>
            ))}
          </div>
          <p className="text-center font-bold text-slate-900" style={{ fontSize: grande ? M.rotulo : undefined }}>
            {es ? '¿En cuál te sobró confianza?' : 'Where were you overconfident?'}
          </p>

          <div className={`flex flex-wrap gap-2 ${grande ? 'max-w-3xl mx-auto' : ''}`}>
            <button onClick={arrancar} className={`flex-1 ${APAGADO}`}>{es ? 'Otra ronda' : 'Another round'}</button>
            <button onClick={() => setFase('preparar')} className={`flex-1 ${APAGADO}`}>{es ? 'Cambiar' : 'Change'}</button>
          </div>
        </div>
      )}
    </section>
  );
};

export default Apuesta;
