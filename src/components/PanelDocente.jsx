/* ============================================================================
   HERRAMIENTAS DE CLASE
   ----------------------------------------------------------------------------
   Para quien enseña desde el PC de la sala, a veces proyectado. Nació como una
   vista de Grammar HUB y se mudó a Teacher's Utility Belt el 5-oct-2026, porque
   sirve a docentes de cualquier asignatura y no solo de inglés.

   LA PANTALLA ES DE PC (6-oct-2026). Heredó de Grammar HUB un diseño de
   celular: pestañas arriba y una columna de 580 px al centro, con controles y
   resultado apilados. Ahora:
     · MENÚ a la izquierda, con las herramientas por momento de la clase. Se
       pliega a íconos. Crece hacia abajo, que es como va a crecer el bundle.
     · ESCENARIO al centro, lo que mira el curso, y PANEL a la derecha, lo que
       toca el docente (ver ../zonas.jsx). Las doce herramientas están
       partidas así; ninguna dibuja su propia columna.
     · PANTALLA COMPLETA deja solo el escenario, con la acción en una
       barra flotante. Espacio dispara la acción; Esc sale. No se llama
       «Proyectar»: El muro y el Semáforo ya tienen un paso con ese nombre, y
       con dos botones iguales en pantalla se tocaba el equivocado.

   Y se montan TODAS aunque solo se vea una: si el temporizador se desmontara al
   cambiar de herramienta, la cuenta se perdería justo cuando el profesor va a
   sortear algo mientras corre el tiempo. Ese es el caso normal, no el raro.

   PANTALLA COMPLETA. Se pide sobre el área de trabajo y no sobre la página, así
   el menú se queda fuera solo. El navegador puede negarla —iPhone no la da
   fuera de un vídeo—, y entonces queda el modo «a lo ancho» (fijo sobre la
   página), que es casi todo lo que se gana.

   NADA SE GUARDA. Es la regla de esta sección, dicha por el profesor para el
   generador de grupos y aplicada a todo: lo que se escribe aquí vive mientras
   la pestaña está abierta. Así no hay nombres de alumnos en ningún repositorio
   ni en ningún despliegue, y no hay nada que explicar sobre qué queda guardado.
   ========================================================================== */
import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Dices, Disc3, Users, Timer, Grid3x3, LayoutGrid, BrickWall, TrafficCone, Coins,
  CircleHelp, ArrowLeftRight, Calculator, PanelLeftClose, PanelLeftOpen, Maximize2, X,
} from 'lucide-react';
import Dado from './Dado';
import Ruleta from './Ruleta';
import Grupos from './Grupos';
import Temporizador from './Temporizador';
import Crucigrama from './Crucigrama';
import Sopa from './Sopa';
import Semaforo from './Semaforo';
import Duda from './Duda';
import Apuesta from './Apuesta';
import AntesAhora from './AntesAhora';
import Muro from './Muro';
import Notas from './Notas';
import { ZonasCtx } from '../zonas';
import { cargaDesdeHistorico } from '../listaCurso';

const ZONAS = ['panel', 'escenario', 'accion', 'flotante'];

const PanelDocente = ({ lang = 'es', marca = null }) => {
  const es = lang === 'es';
  const [vista, setVista] = useState('dado');
  const [plegado, setPlegado] = useState(false);
  /* LA LISTA DEL CURSO VIVE AQUÍ, y no dentro de la herramienta que la pide.
     Vivía en Grupos, que es donde se pega y parecía lo lógico, hasta que
     apareció la segunda que la necesita: «La duda» del cierre. Con un cierre de
     cinco minutos se hace UNA actividad por clase, así que atarla a Grupos
     significaba que el sorteo de nombres solo funcionaba los días en que además
     se hubieran repartido grupos. Lo dijo el profesor y tenía razón: una
     herramienta no puede depender de que hoy se haya usado otra.

     PERO SIGUE SIENDO UNA SOLA LISTA. Lo fácil habría sido darle una a cada
     herramienta, y eso cobra el pegado dos veces el día que se usan las dos —
     y deja dos versiones de la misma clase que pueden decir cosas distintas.
     Se carga desde cualquiera de las dos puertas y queda disponible en ambas.

     Y «ausentes» es de la lista y no de Grupos: quien faltó, faltó para todas.
     Nada de esto se guarda: vive mientras la pestaña esté abierta. */
  const [nombres, setNombres] = useState([]);
  const [ausentes, setAusentes] = useState(() => new Set());
  const [origen, setOrigen] = useState(null);
  const presentes = nombres.filter(x => !ausentes.has(x));

  const cargarCurso = ({ nombres: ns, ausentes: aus, origen: o }) => {
    setNombres(ns);
    setAusentes(aus);
    setOrigen(o);
  };
  const alternarAusente = (nombre) => setAusentes(a => {
    const s = new Set(a);
    if (s.has(nombre)) s.delete(nombre); else s.add(nombre);
    return s;
  });
  const cambiarLista = () => { setNombres([]); setAusentes(new Set()); setOrigen(null); };
  /* Otro día del mismo histórico: se relee lo pegado con esa fecha. Lo que el
     profesor apagó a mano se pierde, a propósito: era sobre la otra clase. */
  const cambiarFecha = (fecha) => {
    if (!origen?.texto) return;
    const c = cargaDesdeHistorico(origen.texto, { fecha });
    if (!c.error) cargarCurso(c);
  };
  const curso = { nombres, ausentes, origen, onCargar: cargarCurso, onAlternar: alternarAusente, onCambiarLista: cambiarLista, onCambiarFecha: cambiarFecha };
  const cursoCierre = { curso: presentes, origen, onCargar: cargarCurso, onCambiarLista: cambiarLista, onCambiarFecha: cambiarFecha };

  /* Los destinos de las zonas: los nodos donde cada herramienta pinta lo suyo. */
  const [destinos, setDestinos] = useState({});
  const refs = useMemo(() => Object.fromEntries(ZONAS.map(k =>
    [k, (el) => setDestinos(d => (d[k] === el ? d : { ...d, [k]: el }))])), []);

  const [proyectando, setProyectando] = useState(false);
  const caja = useRef(null);

  /* El estado lo manda el navegador, no el botón: si el profesor sale con Esc
     —que es como se sale— la pantalla volvería a su sitio pero el botón seguiría
     diciendo «salir». */
  useEffect(() => {
    const alSalir = () => { if (!document.fullscreenElement) setProyectando(false); };
    /* Esc también cierra el modo «a lo ancho» cuando el navegador negó la
       pantalla completa: ahí no hay evento de fullscreen que escuchar. */
    const alTeclear = (e) => { if (e.key === 'Escape' && !document.fullscreenElement) setProyectando(false); };
    document.addEventListener('fullscreenchange', alSalir);
    document.addEventListener('keydown', alTeclear);
    return () => {
      document.removeEventListener('fullscreenchange', alSalir);
      document.removeEventListener('keydown', alTeclear);
    };
  }, []);

  const proyectar = async () => {
    setProyectando(true);
    try { await caja.current?.requestFullscreen?.(); }
    catch { /* sin API o denegada: queda el modo a lo ancho, que ya sirve */ }
  };
  const salir = async () => {
    try { if (document.fullscreenElement) await document.exitFullscreen(); } catch { /* ya estaba fuera */ }
    setProyectando(false);
  };

  /* POR MOMENTO DE LA CLASE, y en ese orden: primero lo de empezar y repartir,
     después lo de cerrar, y aparte lo de DESPUÉS, con la pila de pruebas. */
  const GRUPOS = [
    {
      id: 'durante',
      rotulo: es ? 'Durante' : 'During',
      items: [
        { id: 'dado', rotulo: es ? 'Dado' : 'Dice', Icono: Dices },
        { id: 'ruleta', rotulo: es ? 'Ruleta' : 'Wheel', Icono: Disc3 },
        { id: 'grupos', rotulo: es ? 'Grupos' : 'Groups', Icono: Users },
        { id: 'tiempo', rotulo: es ? 'Reloj' : 'Timer', Icono: Timer },
        { id: 'sopa', rotulo: es ? 'Sopa de letras' : 'Word search', Icono: Grid3x3 },
        { id: 'crucigrama', rotulo: es ? 'Crucigrama' : 'Crossword', Icono: LayoutGrid },
      ],
    },
    {
      id: 'cierre',
      rotulo: es ? 'Cierre' : 'Closing',
      items: [
        { id: 'muro', rotulo: es ? 'El muro' : 'The wall', Icono: BrickWall },
        { id: 'semaforo', rotulo: es ? 'Semáforo' : 'Traffic light', Icono: TrafficCone },
        { id: 'apuesta', rotulo: es ? 'Apuesta' : 'The bet', Icono: Coins },
        { id: 'duda', rotulo: es ? 'La duda' : 'The doubt', Icono: CircleHelp },
        { id: 'antes', rotulo: es ? 'Antes / Ahora' : 'Then / Now', Icono: ArrowLeftRight },
      ],
    },
    {
      id: 'corregir',
      rotulo: es ? 'Corregir' : 'Marking',
      items: [
        { id: 'notas', rotulo: es ? 'Notas' : 'Grades', Icono: Calculator },
      ],
    },
  ];
  /* Cada herramienta con su contexto: activa o no, y si se está proyectando. */
  const zona = (id) => ({ destinos, activa: vista === id, proyectando });
  const BotonProyectar = (
    <button onClick={proyectar}
      className="absolute top-3 right-3 z-10 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 transition-colors">
      <Maximize2 size={15} aria-hidden="true" />
      {es ? 'Pantalla completa' : 'Full screen'}
    </button>
  );

  return (
    <div className="gh-libre h-screen flex flex-col md:flex-row overflow-hidden bg-[#f5f6fb]">

      {/* ── EL MENÚ ─────────────────────────────────────────────────────── */}
      <aside className={`shrink-0 bg-white border-b md:border-b-0 md:border-r border-slate-200 flex flex-col ${plegado ? 'md:w-16' : 'md:w-56'}`}>
        {marca && marca({ plegado })}
        <nav aria-label={es ? 'Herramientas' : 'Tools'}
          className="flex md:flex-col gap-3 md:gap-4 px-2 pb-2 md:pb-4 md:pt-1 overflow-x-auto md:overflow-x-visible md:overflow-y-auto md:flex-1">
          {GRUPOS.map(g => (
            <div key={g.id} className="flex md:flex-col gap-0.5 shrink-0">
              <span className={`hidden ${plegado ? '' : 'md:block'} px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-muted`}>{g.rotulo}</span>
              {g.items.map(h => (
                <button
                  key={h.id}
                  onClick={() => setVista(h.id)}
                  aria-pressed={vista === h.id}
                  title={plegado ? h.rotulo : undefined}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors ${
                    plegado ? 'md:justify-center md:px-0' : ''} ${
                    vista === h.id ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
                >
                  <h.Icono size={18} aria-hidden="true" className="shrink-0" />
                  <span className={plegado ? 'md:sr-only' : ''}>{h.rotulo}</span>
                </button>
              ))}
            </div>
          ))}
        </nav>
        <button onClick={() => setPlegado(p => !p)}
          aria-label={plegado ? (es ? 'Mostrar el menú' : 'Expand menu') : (es ? 'Plegar el menú' : 'Collapse menu')}
          title={plegado ? (es ? 'Mostrar el menú' : 'Expand menu') : (es ? 'Plegar el menú' : 'Collapse menu')}
          className="hidden md:flex items-center justify-center m-2 p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors">
          {plegado ? <PanelLeftOpen size={18} aria-hidden="true" /> : <PanelLeftClose size={18} aria-hidden="true" />}
        </button>
      </aside>

      {/* ── EL ÁREA DE TRABAJO, que es lo que va a pantalla completa ──────── */}
      <div ref={caja}
        className={`gh-libre ${proyectando ? 'fixed inset-0 z-50' : 'relative flex-1 min-w-0 min-h-0'} flex flex-col bg-[#f5f6fb]`}>

        {/* Escenario + panel: los destinos de los portales de las herramientas. */}
        <div className={`gh-libre flex-1 min-h-0 ${proyectando ? 'flex' : 'flex flex-col md:grid md:grid-cols-[minmax(0,1fr)_22rem] overflow-auto md:overflow-hidden'}`}>
          <section aria-label={es ? 'Escenario' : 'Stage'} className="gh-libre relative flex-1 min-w-0 min-h-[60vh] md:min-h-0 flex">
            <div ref={refs.escenario} style={{ containerType: 'size' }}
              className="gh-libre flex-1 min-w-0 flex flex-col items-center justify-center p-6 md:p-10" />
            {!proyectando && BotonProyectar}
          </section>
          {!proyectando && (
            <aside aria-label={es ? 'Controles' : 'Controls'}
              className="bg-white border-t md:border-t-0 md:border-l border-slate-200 flex flex-col min-h-0">
              <div ref={refs.panel} className="flex-1 md:overflow-y-auto p-5" />
              {/* La acción, al pie. `empty:hidden`: en las fases sin acción la
                  franja desaparece en vez de quedar como un pie vacío. */}
              <div ref={refs.accion} className="p-4 border-t border-slate-200 empty:hidden" />
            </aside>
          )}
        </div>

        {/* Las herramientas no pintan aquí: pintan en sus zonas, por portal. */}
        <ZonasCtx.Provider value={zona('dado')}><Dado lang={lang} /></ZonasCtx.Provider>
        <ZonasCtx.Provider value={zona('ruleta')}><Ruleta lang={lang} /></ZonasCtx.Provider>
        <ZonasCtx.Provider value={zona('grupos')}><Grupos lang={lang} {...curso} /></ZonasCtx.Provider>
        <ZonasCtx.Provider value={zona('tiempo')}><Temporizador lang={lang} /></ZonasCtx.Provider>
        <ZonasCtx.Provider value={zona('sopa')}><Sopa lang={lang} /></ZonasCtx.Provider>
        <ZonasCtx.Provider value={zona('crucigrama')}><Crucigrama lang={lang} /></ZonasCtx.Provider>
        <ZonasCtx.Provider value={zona('muro')}><Muro lang={lang} /></ZonasCtx.Provider>
        <ZonasCtx.Provider value={zona('semaforo')}><Semaforo lang={lang} /></ZonasCtx.Provider>
        <ZonasCtx.Provider value={zona('apuesta')}><Apuesta lang={lang} /></ZonasCtx.Provider>
        <ZonasCtx.Provider value={zona('duda')}><Duda lang={lang} {...cursoCierre} /></ZonasCtx.Provider>
        <ZonasCtx.Provider value={zona('antes')}><AntesAhora lang={lang} {...cursoCierre} /></ZonasCtx.Provider>
        <ZonasCtx.Provider value={zona('notas')}><Notas lang={lang} /></ZonasCtx.Provider>

        {/* Proyectando: la acción y la salida, flotando abajo a la derecha. */}
        {proyectando && (
          <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2">
            <div ref={refs.flotante} />
            <button onClick={salir}
              className="flex items-center gap-1.5 px-3 py-3.5 rounded-xl text-sm font-semibold text-slate-700 bg-white border border-slate-300 shadow-lg hover:bg-slate-100 transition-colors">
              <X size={16} aria-hidden="true" />
              {es ? 'Salir' : 'Exit'} <kbd className="font-sans text-xs text-muted">Esc</kbd>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PanelDocente;
