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
import { ACCION, opcion, ENLACE, NUMERO } from '../ui';

/* `grande` = proyectando: lo que se mira son los grupos, así que las tarjetas se
   reparten a lo ancho y los nombres crecen. Las fichas de la lista y los
   controles se quedan igual — esos se tocan de cerca, no se leen de lejos. */
/* LA LISTA NO VIVE AQUÍ, vive en el panel. Vivía aquí y era lo lógico —es
   donde se pega— hasta que apareció la segunda herramienta que la necesita:
   «La duda» del cierre. Con una actividad por clase, atarla a Grupos significaba
   que el sorteo de nombres solo funcionaba los días en que además se repartieran
   grupos, o sea casi nunca.
   Grupos sigue mandando sobre lo suyo: el modo, el número y el reparto. */
const Grupos = ({
  lang = 'es', grande = false,
  nombres = [], ausentes = new Set(), origen = null,
  onCargar, onAlternar, onCambiarLista,
}) => {
  const es = lang === 'es';
  const [modo, setModo] = useState('porGrupo');
  const [n, setN] = useState(4);
  const [grupos, setGrupos] = useState(null);

  const presentes = nombres.filter(x => !ausentes.has(x));

  const generar = () => setGrupos(repartir(presentes, { modo, n }));

  return (
    <section className={grande ? 'w-full' : 'w-full max-w-xl mx-auto'}>
      <h2 className="text-lg font-bold text-slate-900 mb-1">{es ? 'Grupos' : 'Groups'}</h2>
      <p className="text-sm text-muted mb-4">
        {es ? 'Pega la lista del curso —o el histórico de asistencia en Excel, y los que faltaron vienen apagados— y reparte.'
            : 'Paste the class list —or the attendance export from Excel, and whoever was absent comes switched off— and split.'}
      </p>

      {!nombres.length ? (
        <CargarCurso lang={lang} onCargar={(c) => { setGrupos(null); onCargar?.(c); }} />
      ) : (
        <>
          {/* — */}
          {/* Las fichas. Apagar a alguien no lo borra: `aria-pressed` dice el
              estado en voz alta, y el tachado lo dice a la vista. */}
          <div className="flex flex-wrap gap-1.5 mb-3">
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

          {/* DE QUÉ DÍA ES ESTA LISTA. Va arriba y no escondida: el histórico
              cae a la última clase con lista pasada, que si hoy aún no la pasas
              es la clase ANTERIOR. Una lista que usa en silencio las ausencias
              del viernes es peor que no tener lista. */}
          {origen && (
            <p className="mb-3 text-xs text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg px-2.5 py-2">
              {es
                ? `${origen.curso || 'Curso'} · clase ${origen.clase} del ${origen.fecha}: ${origen.ausentes} apagados por inasistencia. Si hoy aún no pasas lista, esta es la clase anterior.`
                : `${origen.curso || 'Course'} · class ${origen.clase} on ${origen.fecha}: ${origen.ausentes} switched off for absence. If today’s roll is not taken yet, this is the previous class.`}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mb-3">
            <span className="text-sm text-slate-600">
              {presentes.length} {es ? 'de' : 'of'} {nombres.length} {es ? 'presentes' : 'present'}
            </span>
            <button
              onClick={() => { setGrupos(null); onCambiarLista?.(); }}
              className={ENLACE}
            >
              {es ? 'cambiar lista' : 'change list'}
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 mb-3">
            {[['porGrupo', es ? 'Grupos de' : 'Groups of'], ['cantidad', es ? 'Nº de grupos' : 'No. of groups']].map(([id, rotulo]) => (
              <button
                key={id}
                onClick={() => setModo(id)}
                aria-pressed={modo === id}
                className={opcion(modo === id)}
              >
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

          <button
            onClick={generar}
            disabled={!presentes.length}
            className={ACCION}
          >
            {grupos ? (es ? 'Repartir otra vez' : 'Split again') : (es ? 'Repartir' : 'Split')}
          </button>

          {grupos && (
            /* Los grupos se proyectan: nombres grandes y una tarjeta por grupo.
               `aria-live` para que el reparto también se anuncie. */
            <div aria-live="polite" className={`mt-4 grid gap-3 ${grande ? 'sm:grid-cols-3 lg:grid-cols-4' : 'sm:grid-cols-2'}`}>
              {grupos.map((g, i) => (
                <div key={i} className="rounded-xl border border-slate-200 bg-white p-3">
                  <p className="text-xs font-bold text-indigo-600 mb-1.5">
                    {es ? 'Grupo' : 'Group'} {i + 1} · {g.length}
                  </p>
                  <ul className="space-y-0.5">
                    {g.map(nombre => (
                      <li key={nombre} className={`text-slate-900 ${grande ? 'text-[1.6vw]' : 'text-base'}`}>{nombre}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
};

export default Grupos;
