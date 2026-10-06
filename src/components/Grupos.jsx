/* ============================================================================
   GRUPOS AL AZAR
   ----------------------------------------------------------------------------
   Se pega la lista del curso una vez y se reparte las veces que haga falta.

   LO QUE COSTÓ DECIDIR: quién faltó. Pegar la lista de Blackboard y borrar a
   mano a los tres que no vinieron es incómodo, y además rompe la lista para la
   siguiente vuelta. Aquí cada nombre es una ficha que se apaga con un toque:
   apagada sigue ahí —se ve, se puede volver a encender— pero no entra en el
   sorteo. Tres ausencias son tres toques, no una edición de texto.

   El reparto va en `../grupos.js`, que es puro y tiene sus pruebas
   (`tools/check-grupos.mjs`). Aquí solo está la pantalla.

   NADA SE GUARDA: ni la lista ni los grupos. Al cerrar la pestaña se va, que es
   lo que pidió el profesor y lo que hace que no haya nombres de alumnos en
   ningún sitio.
   ========================================================================== */
import React, { useState } from 'react';
import { repartir } from '../grupos';
import CargarCurso from './CargarCurso';
import OrigenLista from './OrigenLista';
import { opcion, ENLACE, NUMERO } from '../ui';
import { Panel, Escenario, Accion, Cabeza } from '../zonas';

/* Los grupos van al escenario y crecen con él; las fichas de la lista y los
   controles, al panel — esos se tocan de cerca, no se leen de lejos. */
/* LA LISTA NO VIVE AQUÍ, vive en el panel. Vivía aquí y era lo lógico —es
   donde se pega— hasta que apareció la segunda herramienta que la necesita:
   «La duda» del cierre. Con una actividad por clase, atarla a Grupos significaba
   que el sorteo de nombres solo funcionaba los días en que además se repartieran
   grupos, o sea casi nunca.
   Grupos sigue mandando sobre lo suyo: el modo, el número y el reparto. */
const Grupos = ({
  lang = 'es',
  nombres = [], ausentes = new Set(), origen = null,
  onCargar, onAlternar, onCambiarLista, onCambiarFecha,
}) => {
  const es = lang === 'es';
  const [modo, setModo] = useState('porGrupo');
  const [n, setN] = useState(4);
  const [grupos, setGrupos] = useState(null);

  const presentes = nombres.filter(x => !ausentes.has(x));

  const generar = () => setGrupos(repartir(presentes, { modo, n }));

  return (
    <>
      {/* Los grupos se proyectan: una tarjeta por grupo, tantas columnas como
          quepan, y nombres que crecen con el escenario. `aria-live` para que
          el reparto también se anuncie. */}
      <Escenario>
        {!grupos ? (
          <p className="text-muted text-center max-w-sm">
            {!nombres.length
              ? (es ? 'Pega la lista del curso en el panel de la derecha.' : 'Paste the class list in the panel on the right.')
              : (es ? 'Elige cómo repartir y toca Repartir.' : 'Choose how to split and press Split.')}
          </p>
        ) : (
          <div aria-live="polite" className="w-full max-h-full overflow-auto grid gap-[1.5cqw] content-center"
            style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 15rem), 1fr))' }}>
            {grupos.map((g, i) => (
              <div key={i} className="rounded-xl border border-slate-200 bg-white p-[1.2cqw]">
                <p className="font-bold text-indigo-600 mb-1.5" style={{ fontSize: 'clamp(0.75rem, 1.1cqw, 1.25rem)' }}>
                  {es ? 'Grupo' : 'Group'} {i + 1} · {g.length}
                </p>
                <ul className="space-y-0.5">
                  {g.map(nombre => (
                    <li key={nombre} className="text-slate-900" style={{ fontSize: 'clamp(0.95rem, 1.7cqw, 2rem)' }}>{nombre}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </Escenario>

      <Panel>
        <Cabeza titulo={es ? 'Grupos' : 'Groups'}>
          {es ? 'Pega la lista del curso —o el histórico de asistencia en Excel, y los que faltaron vienen apagados— y reparte.'
              : 'Paste the class list —or the attendance export from Excel, and whoever was absent comes switched off— and split.'}
        </Cabeza>

        {!nombres.length ? (
          <CargarCurso lang={lang} onCargar={(c) => { setGrupos(null); onCargar?.(c); }} />
        ) : (
          <>
            {/* DE QUÉ DÍA ES ESTA LISTA. Va arriba de todo y no escondida: el histórico
                cae a la última clase con lista pasada, que si hoy aún no la pasas
                es la clase ANTERIOR. Una lista que usa en silencio las ausencias
                del viernes es peor que no tener lista. */}
            <OrigenLista lang={lang} origen={origen}
                         fuera={es ? 'apagados' : 'switched off'}
                         onCambiarFecha={(f) => { setGrupos(null); onCambiarFecha?.(f); }} />

            <div className="flex flex-wrap items-center gap-2 mb-2">
              {[['porGrupo', es ? 'Grupos de' : 'Groups of'], ['cantidad', es ? 'Nº de grupos' : 'No. of groups']].map(([id, rotulo]) => (
                <button key={id} onClick={() => setModo(id)} aria-pressed={modo === id} className={opcion(modo === id)}>
                  {rotulo}
                </button>
              ))}
              <input
                type="number" min="1" max="30" value={n}
                onChange={(e) => setN(Math.max(1, Math.min(30, Number(e.target.value) || 1)))}
                aria-label={modo === 'porGrupo' ? (es ? 'personas por grupo' : 'people per group') : (es ? 'cantidad de grupos' : 'number of groups')}
                className={NUMERO}
              />
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mt-4 mb-2">
              <span className="text-sm font-semibold text-slate-700">
                {presentes.length} {es ? 'de' : 'of'} {nombres.length} {es ? 'presentes' : 'present'}
              </span>
              <button onClick={() => { setGrupos(null); onCambiarLista?.(); }} className={ENLACE}>
                {es ? 'cambiar lista' : 'change list'}
              </button>
            </div>
            {/* Las fichas. Apagar a alguien no lo borra: `aria-pressed` dice el
                estado en voz alta, y el tachado lo dice a la vista. */}
            <div className="flex flex-wrap gap-1.5">
              {nombres.map(nombre => {
                const falta = ausentes.has(nombre);
                return (
                  <button
                    key={nombre}
                    onClick={() => onAlternar?.(nombre)}
                    aria-pressed={!falta}
                    className={`px-2.5 py-1 rounded-lg text-sm border transition-colors ${
                      falta
                        /* text-slate-600 y no -500: apagado no es ilegible. El
                           -500 sobre el tinte -100 daba 4,34:1 y lo cazó la sonda
                           de contraste renderizado. Lo que dice «este no juega» es
                           el tachado, no que cueste leerlo. */
                        ? 'bg-slate-100 text-slate-600 border-slate-200 line-through'
                        : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400'
                    }`}
                  >
                    {nombre}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </Panel>

      {nombres.length > 0 && (
        <Accion onClick={generar} disabled={!presentes.length}>
          {grupos ? (es ? 'Repartir otra vez' : 'Split again') : (es ? 'Repartir' : 'Split')}
        </Accion>
      )}
    </>
  );
};

export default Grupos;
