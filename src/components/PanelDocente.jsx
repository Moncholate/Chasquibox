/* ============================================================================
   HERRAMIENTAS DE CLASE
   ----------------------------------------------------------------------------
   Para quien enseña, de pie frente al curso: se usa en cinco segundos, a veces
   proyectado. Nació como una vista de Grammar HUB y se mudó a Teacher's Utility Belt el
   5-oct-2026, porque sirve a docentes de cualquier asignatura y no solo de
   inglés.

   POR QUÉ PESTAÑAS Y NO UNA LISTA. Con cuatro herramientas apiladas volvería a
   pasar lo de la Guía: para llegar a la última hay que barrer tres. Cada una
   ocupa la pantalla cuando le toca.

   Y se montan TODAS aunque solo se vea una —se ocultan con CSS, no se
   desmontan—: si el temporizador se desmontara al cambiar de pestaña, la cuenta
   se perdería justo cuando el profesor va a sortear algo mientras corre el
   tiempo. Ese es el caso normal, no el raro.

   PANTALLA COMPLETA, para proyectar. Se pide sobre el contenedor de las
   herramientas y no sobre la página entera: así la cabecera de la app se queda
   fuera sola, sin tener que esconderla a mano.

   Dos cosas que no son obvias:
     · el navegador puede negarla —iPhone no la da nunca fuera de un vídeo—, así
       que si falla se queda el modo «a lo ancho» (fijo sobre la página), que es
       casi todo lo que se gana y no depende de nadie.
     · las herramientas reciben `grande` y deciden ELLAS qué crece: el resultado,
       no los controles. Un dado con el número gigante y los botones normales es
       lo que se ve desde el fondo de la sala; escalarlo todo por igual deja los
       controles ocupando media pantalla.

   NADA SE GUARDA. Es la regla de esta sección, dicha por el profesor para el
   generador de grupos y aplicada a todo: lo que se escribe aquí vive mientras
   la pestaña está abierta. Así no hay nombres de alumnos en ningún repositorio
   ni en ningún despliegue, y no hay nada que explicar sobre qué queda guardado.
   ========================================================================== */
import React, { useState, useRef, useEffect } from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';
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
import { CAPSULA, pestana } from '../ui';
import { cargaDesdeHistorico } from '../listaCurso';

const PanelDocente = ({ lang = 'es' }) => {
  const es = lang === 'es';
  const [vista, setVista] = useState('dado');
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
  const [presentando, setPresentando] = useState(false);
  const caja = useRef(null);

  /* El estado lo manda el navegador, no el botón: si el profesor sale con Esc
     —que es como se sale— la pantalla volvería a su sitio pero el botón seguiría
     diciendo «salir». */
  useEffect(() => {
    /* Solo interesa SALIR: entrar lo hace el botón. Y hay que escucharlo porque
       de la pantalla completa se sale con Esc, no con el botón. */
    const alSalir = () => { if (!document.fullscreenElement) setPresentando(false); };
    /* Esc también cierra el modo «a lo ancho» cuando el navegador negó la
       pantalla completa (iPhone): ahí no hay evento de fullscreen que escuchar. */
    const alTeclear = (e) => { if (e.key === 'Escape' && !document.fullscreenElement) setPresentando(false); };
    document.addEventListener('fullscreenchange', alSalir);
    document.addEventListener('keydown', alTeclear);
    return () => {
      document.removeEventListener('fullscreenchange', alSalir);
      document.removeEventListener('keydown', alTeclear);
    };
  }, []);

  const alternarPantalla = async () => {
    if (presentando) {
      try { if (document.fullscreenElement) await document.exitFullscreen(); } catch { /* ya estaba fuera */ }
      setPresentando(false);
      return;
    }
    setPresentando(true);
    try { await caja.current?.requestFullscreen?.(); }
    catch { /* sin API o denegada: queda el modo a lo ancho, que ya sirve */ }
  };

  /* DOS GRUPOS Y NO UNA LISTA DE SIETE. Con las de cierre la cápsula se parte en
     dos filas, y dos filas de botones iguales vuelven a ser la lista que las
     pestañas evitaban. Rotuladas, el corte deja de ser un accidente del ancho y
     pasa a decir algo: para qué momento de la clase es cada cosa.
     Y el orden de los grupos es el de la clase: primero lo de empezar y
     repartir, después lo de cerrar. */
  const GRUPOS = [
    {
      id: 'durante',
      rotulo: es ? 'Durante' : 'During',
      items: [
        { id: 'dado', rotulo: es ? 'Dado' : 'Dice' },
        { id: 'ruleta', rotulo: es ? 'Ruleta' : 'Wheel' },
        { id: 'grupos', rotulo: es ? 'Grupos' : 'Groups' },
        /* «Reloj» y no «Temporizador»: con la palabra larga la cápsula medía
           347px y se salía de una pantalla de 360. La herramienta se sigue
           titulando «Temporizador» dentro; esto es solo la pestaña. */
        { id: 'tiempo', rotulo: es ? 'Reloj' : 'Timer' },
        { id: 'sopa', rotulo: es ? 'Sopa de letras' : 'Word search' },
        { id: 'crucigrama', rotulo: es ? 'Crucigrama' : 'Crossword' },
      ],
    },
    {
      id: 'cierre',
      rotulo: es ? 'Cierre' : 'Closing',
      items: [
        { id: 'muro', rotulo: es ? 'El muro' : 'The wall' },
        { id: 'semaforo', rotulo: es ? 'Semáforo' : 'Traffic light' },
        { id: 'apuesta', rotulo: es ? 'Apuesta' : 'The bet' },
        { id: 'duda', rotulo: es ? 'La duda' : 'The doubt' },
        { id: 'antes', rotulo: es ? 'Antes / Ahora' : 'Then / Now' },
      ],
    },
    /* El tercer momento no es de la clase: es DESPUÉS, con la pila de pruebas.
       Va último por eso, y aparte para que no se lea como una actividad más. */
    {
      id: 'corregir',
      rotulo: es ? 'Corregir' : 'Marking',
      items: [
        { id: 'notas', rotulo: es ? 'Notas' : 'Grades' },
      ],
    },
  ];

  return (
    <div className="w-full min-h-full flex flex-col">

      <div ref={caja} className={presentando ? 'fixed inset-0 z-50 bg-white overflow-auto flex flex-col' : 'contents'}>
      <div className="px-4 pt-3 flex flex-wrap items-end gap-x-4 gap-y-2">
        {/* Cada grupo en su cápsula: así se leen como «una de estas» y no como
            siete botones sueltos con el mismo peso que todo lo demás. */}
        {GRUPOS.map(g => (
          <div key={g.id} className="flex flex-col gap-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted">{g.rotulo}</span>
            <div className={CAPSULA} role="tablist" aria-label={g.rotulo}>
              {g.items.map(h => (
                <button
                  key={h.id}
                  onClick={() => setVista(h.id)}
                  aria-pressed={vista === h.id}
                  className={pestana(vista === h.id)}
                >
                  {h.rotulo}
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* LA TABLA DE TIEMPOS YA NO ESTÁ AQUÍ. Estuvo como enlace a Grammaster
            y luego embebida, y las dos veces por lo mismo: no había forma
            cómoda de llegar a ella. Ahora tiene pestaña propia en Grammaster,
            entre la Guía y la Práctica, y esa es la única puerta. Traerla
            también aquí era ofrecer el mismo material en dos sitios, y el
            segundo siempre es el que se queda desactualizado. */}

        {/* Para proyectar. Se queda DENTRO del contenedor que va a pantalla
            completa: si viviera en el encabezado, proyectando no habría botón
            para salir —solo Esc—. Apagado, porque no compite con la acción. */}
        <button
          onClick={alternarPantalla}
          className="ml-auto flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
        >
          {presentando ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          <span className="hidden sm:inline">
            {presentando ? (es ? 'Salir' : 'Exit') : (es ? 'Pantalla completa' : 'Full screen')}
          </span>
        </button>
      </div>

      <div className={`flex-1 px-5 py-6 ${presentando ? 'flex flex-col justify-center' : ''}`}>
        <div className={vista === 'dado' ? '' : 'hidden'}><Dado lang={lang} grande={presentando} /></div>
        <div className={vista === 'ruleta' ? '' : 'hidden'}><Ruleta lang={lang} grande={presentando} /></div>
        <div className={vista === 'grupos' ? '' : 'hidden'}><Grupos lang={lang} grande={presentando}
                    nombres={nombres} ausentes={ausentes} origen={origen}
                    onCargar={cargarCurso} onAlternar={alternarAusente} onCambiarLista={cambiarLista} onCambiarFecha={cambiarFecha} /></div>
        <div className={vista === 'tiempo' ? '' : 'hidden'}><Temporizador lang={lang} grande={presentando} /></div>
        <div className={vista === 'sopa' ? '' : 'hidden'}><Sopa lang={lang} grande={presentando} /></div>
        <div className={vista === 'crucigrama' ? '' : 'hidden'}><Crucigrama lang={lang} grande={presentando} /></div>
        <div className={vista === 'muro' ? '' : 'hidden'}><Muro lang={lang} grande={presentando} /></div>
        <div className={vista === 'semaforo' ? '' : 'hidden'}><Semaforo lang={lang} grande={presentando} /></div>
        <div className={vista === 'apuesta' ? '' : 'hidden'}><Apuesta lang={lang} grande={presentando} /></div>
        <div className={vista === 'duda' ? '' : 'hidden'}><Duda lang={lang} grande={presentando}
                    curso={presentes} origen={origen} onCargar={cargarCurso} onCambiarLista={cambiarLista} onCambiarFecha={cambiarFecha} /></div>
        <div className={vista === 'antes' ? '' : 'hidden'}><AntesAhora lang={lang} grande={presentando}
                    curso={presentes} origen={origen} onCargar={cargarCurso} onCambiarLista={cambiarLista} onCambiarFecha={cambiarFecha} /></div>
        <div className={vista === 'notas' ? '' : 'hidden'}><Notas lang={lang} grande={presentando} /></div>

      </div>
      </div>
    </div>
  );
};

export default PanelDocente;
