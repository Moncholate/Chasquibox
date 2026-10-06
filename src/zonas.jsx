/* ============================================================================
   LAS ZONAS DE LA PANTALLA
   ----------------------------------------------------------------------------
   En PC la pantalla se parte en dos: el ESCENARIO, grande, con lo que mira el
   curso (la ruleta, el reloj, los grupos), y el PANEL, angosto a la derecha,
   con lo que toca el docente (la lista, las opciones, los minutos). Al
   proyectar queda solo el escenario, con la acción en una barra flotante.

   Venía de Grammar HUB en una sola columna de celular: controles y resultado
   apilados en 580 px al centro, y la pantalla completa se llevaba también las
   opciones. En un PC de sala eso era el 60 % de la pantalla vacío y una ruleta
   que no se leía desde el fondo.

   CÓMO SE USA. Una herramienta no sabe dónde está cada zona: escribe
   <Panel>, <Escenario> y <Accion>, y lo de dentro aparece en su sitio (con un
   portal). Así la estructura puede cambiar sin tocar las herramientas.

   Y SOLO PINTA LA HERRAMIENTA ACTIVA, pero todas siguen MONTADAS: el reloj que
   corre no se detiene al ir a sortear algo, que es el caso normal en clase.

   ESPACIO = LA ACCIÓN de la herramienta activa (girar, lanzar, empezar), salvo
   escribiendo en un campo. Desde el escritorio, sin buscar el botón.
   ========================================================================== */
import React, { createContext, useContext, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ACCION } from './ui';

/** { destinos: { panel, escenario, accion, flotante }, activa, proyectando } */
export const ZonasCtx = createContext({ destinos: {}, activa: false, proyectando: false });

const enZona = (nombre) => function Zona({ children }) {
  const { destinos, activa } = useContext(ZonasCtx);
  const destino = destinos[nombre];
  return activa && destino ? createPortal(children, destino) : null;
};

export const Panel = enZona('panel');
export const Escenario = enZona('escenario');

/* Escribiendo, o dentro de una cuadrícula (la sopa): ahí Espacio elige la
   casilla, y quitárselo rompería resolverla con el teclado. */
const escribiendo = (el) =>
  el && (el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName)
    || !!el.closest?.('[role="grid"]'));

/**
 * LA acción de la herramienta. Va al pie del panel, y al proyectar a la barra
 * flotante: el mismo botón, nunca dos. Espacio la dispara.
 */
export function Accion({ children, onClick, disabled = false }) {
  const { destinos, activa, proyectando } = useContext(ZonasCtx);
  const hacer = useRef(onClick);
  hacer.current = disabled ? null : onClick;

  useEffect(() => {
    if (!activa) return undefined;
    const alTeclear = (e) => {
      if (e.code !== 'Space' || e.repeat || escribiendo(e.target)) return;
      /* Se le gana al botón enfocado: tras tocar una herramienta en el menú, el
         foco queda en ella y Espacio la volvería a elegir en vez de girar. */
      e.preventDefault();
      hacer.current?.();
    };
    addEventListener('keydown', alTeclear);
    return () => removeEventListener('keydown', alTeclear);
  }, [activa]);

  const destino = destinos[proyectando ? 'flotante' : 'accion'];
  if (!activa || !destino) return null;
  const boton = (
    <button onClick={onClick} disabled={disabled}
      className={proyectando ? `${ACCION} !w-auto px-8 shadow-lg` : ACCION}>
      {children}
    </button>
  );
  /* El atajo se anuncia junto al botón y solo cuando HAY botón: en las fases
     sin acción (el muro mientras se anota) prometería algo que no pasa. */
  return createPortal(proyectando ? boton : (
    <>
      {boton}
      <p className="hidden md:block mt-2 text-center text-xs text-muted">
        Atajo: <kbd className="px-1.5 py-0.5 rounded border border-slate-300 font-sans font-semibold text-slate-700">Espacio</kbd>
      </p>
    </>
  ), destino);
}

/** El título y la explicación de la herramienta, arriba del panel. */
export function Cabeza({ titulo, children }) {
  return (
    <div className="mb-4">
      <h2 className="text-lg font-bold text-slate-900">{titulo}</h2>
      {children && <p className="mt-1 text-sm text-muted">{children}</p>}
    </div>
  );
}
