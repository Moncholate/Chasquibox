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
import { APAGADO, opcion } from '../ui';
import { Panel, Escenario, Accion, Cabeza } from '../zonas';
import BotonCelulares from './BotonCelulares';

/* Cuatro minutos para cinco oraciones. Menos deja a media clase sin terminar,
   y una apuesta sobre algo que no se terminó no mide calibración: mide prisa. */
const MINUTOS = [3, 4, 5];

const Apuesta = ({ lang = 'es' }) => {
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

  /* Contra el ESCENARIO (cqw/cqh), no la ventana: crece igual en el PC y a
     pantalla completa, y `min()` deja que mande la dimensión que escasee. */
  const M = {
    consigna: 'max(1rem, min(2.6cqw, 5cqh))',
    numero:   'max(0.85rem, min(1.8cqw, 3.4cqh))',
    reloj:    'max(2.5rem, min(7cqw, 13cqh))',
    pregunta: 'max(1.25rem, min(3.6cqw, 7cqh))',
    rotulo:   'max(0.8rem, min(2cqw, 3.6cqh))',
    hueco:    'max(3rem, min(9cqw, 18cqh))',
  };

  /* Las consignas, numeradas. Lo que se lee de lejos y lo que se copia en el
     cuaderno, así que el número tiene que ser inequívoco: se apuesta sobre
     «cuántas de estas cinco» y hay que poder señalar cuál falló. */
  const Consignas = () => (
    <ol className="mx-auto max-w-4xl flex flex-col gap-[1cqh]">
      {consignas.map((c, i) => (
        <li key={i} className="flex items-baseline gap-3 border-b border-slate-200 pb-1.5 last:border-b-0">
          <span className="font-bold text-muted tabular-nums shrink-0" style={{ fontSize: M.numero }}>{i + 1}</span>
          <span className="font-semibold text-slate-900" style={{ fontSize: M.consigna }}>{c}</span>
        </li>
      ))}
    </ol>
  );

  const estado = estadoReloj(restante);
  const otraRonda = arrancar;

  return (
    <>
      <Escenario>
        {/* ── PREPARAR: las consignas como las verá el curso ──────────────── */}
        {fase === 'preparar' && (
          consignas.length > 0 ? <div className="w-full"><Consignas /></div> : (
            <p className="text-muted text-center max-w-sm">
              {es ? 'Escribe las consignas en el panel de la derecha: aquí se ven como las verá el curso.'
                  : 'Write the prompts in the panel on the right: here they show as the class will see them.'}
            </p>
          )
        )}

        {/* ── ESCRIBIR ─────────────────────────────────────────────────────── */}
        {fase === 'escribir' && (
          <div className="w-full space-y-[3cqh]">
            <p className="text-center font-bold uppercase tracking-wider" style={{ color: 'var(--marca)', fontSize: M.rotulo }}>
              {es ? `Escribe las ${consignas.length}` : `Write the ${consignas.length}`}
            </p>
            <Consignas />
            <p className={`text-center font-extrabold tabular-nums leading-none ${
                estado === 'normal' ? 'text-slate-900' : 'text-red-600'
              }`}
              style={{ fontSize: M.reloj }}>
              {formatoReloj(restante)}
            </p>
          </div>
        )}

        {/* ── APOSTAR: las consignas DESAPARECEN aquí. Con la lista delante, la
            apuesta se convierte en revisarlas una por una, que es corregir sin
            corregir; lo que se quiere es lo que el alumno cree ANTES de mirar. */}
        {fase === 'apostar' && (
          <div className="w-full space-y-[3cqh]">
            <p className="text-center font-bold text-slate-900 leading-tight" style={{ fontSize: M.pregunta }}>
              {es ? `De las ${consignas.length}, ¿cuántas crees que tienes bien?` : `Of the ${consignas.length}, how many do you think are right?`}
            </p>
            <p className="text-center font-extrabold text-muted leading-none select-none" aria-hidden="true"
               style={{ fontSize: M.hueco }}>
              ?
            </p>
            <p className="text-center text-muted" style={{ fontSize: M.rotulo }}>
              {es ? 'Escribe el número y tápalo. Sin mirar las respuestas.'
                  : 'Write the number and cover it. No peeking at the answers.'}
            </p>
          </div>
        )}

        {/* ── COMPARAR ─────────────────────────────────────────────────────── */}
        {fase === 'comparar' && (
          <div className="w-full space-y-[3cqh]">
            <Consignas />
            {/* El marco de la comparación. Los números los pone cada alumno en su
                cuaderno: la herramienta no sabe —ni tiene por qué saber— cuántas
                tuvo nadie. Lo que aporta es la pregunta de abajo. */}
            <div className="mx-auto flex gap-3 max-w-2xl">
              {[[es ? 'Aposté' : 'I bet'], [es ? 'Tuve' : 'I got']].map(([rot]) => (
                <div key={rot} className="flex-1 rounded-xl border border-slate-300 bg-white px-3 py-3 text-center">
                  <p className="font-bold uppercase tracking-wider text-muted" style={{ fontSize: M.rotulo }}>{rot}</p>
                  {/* Una RAYA sobre la que escribir, no un guion de texto. El guion
                      iba en slate-300 y daba 1,48:1 sobre el blanco —lo cazó la
                      sonda—, y subirle la tinta lo habría convertido en un signo
                      menos que se lee como parte del dato. Una línea dice «aquí va
                      tu número» sin decir nada más, y en slate-400 pasa el 3:1 que
                      piden los elementos gráficos. */}
                  <div aria-hidden="true" className="mt-4 mx-auto border-b-2 border-slate-400"
                       style={{ width: '60%', height: 'max(1.4rem, 4cqh)' }} />
                </div>
              ))}
            </div>
            <p className="text-center font-bold text-slate-900" style={{ fontSize: M.rotulo }}>
              {es ? '¿En cuál te sobró confianza?' : 'Where were you overconfident?'}
            </p>
          </div>
        )}
      </Escenario>

      <Panel>
        <Cabeza titulo={es ? 'Apuesta' : 'The bet'}>
          {es ? 'Para cerrar: escriben, apuestan cuántas creen tener bien, y recién entonces corrigen.'
              : 'To close the lesson: they write, bet how many they think are right, and only then check.'}
        </Cabeza>

        {fase === 'preparar' && (
          <div className="space-y-4">
            <label className="block">
              <span className="text-xs font-semibold text-slate-600">
                {es ? 'Las consignas' : 'The prompts'}{' '}
                <span className="font-normal text-muted">{es ? '· una por línea' : '· one per line'}</span>
              </span>
              <textarea
                value={texto} rows={7}
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
            <BotonCelulares lang={lang} disabled={!consignas.length} actividad={{ tipo: 'apuesta', pregunta: '', consignas }} />
          </div>
        )}

        {fase === 'escribir' && (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              {es ? 'Corre el tiempo para escribirlas. Al terminar, a apostar: las consignas se esconden.'
                  : 'The clock is running. When it ends, place the bet: the prompts are hidden.'}
            </p>
            <button onClick={() => { clearInterval(tick.current); setFase('preparar'); }} className={`w-full ${APAGADO}`}>
              {es ? 'Volver' : 'Back'}
            </button>
          </div>
        )}

        {fase === 'apostar' && (
          <p className="text-sm text-slate-600">
            {es ? 'Cuando todos tengan su número tapado, a corregir.'
                : 'When everyone has their number covered, check.'}
          </p>
        )}

        {fase === 'comparar' && (
          <div className="grid grid-cols-2 gap-2">
            <button onClick={otraRonda} className={APAGADO}>{es ? 'Otra ronda' : 'Another round'}</button>
            <button onClick={() => setFase('preparar')} className={APAGADO}>{es ? 'Cambiar' : 'Change'}</button>
          </div>
        )}
      </Panel>

      {fase === 'preparar' && (
        <Accion onClick={arrancar} disabled={!consignas.length}>
          {es ? 'Proyectar y arrancar' : 'Project and start'}
        </Accion>
      )}
      {fase === 'escribir' && (
        <Accion onClick={() => { clearInterval(tick.current); setFase('apostar'); }}>
          {es ? 'Ya: a apostar' : 'Time: place the bet'}
        </Accion>
      )}
      {fase === 'apostar' && (
        <Accion onClick={() => setFase('comparar')}>
          {es ? 'Ahora corrijan' : 'Now check'}
        </Accion>
      )}
    </>
  );
};

export default Apuesta;
