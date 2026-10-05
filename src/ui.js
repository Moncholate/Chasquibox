/* ============================================================================
   LOS BOTONES DE LAS HERRAMIENTAS DE CLASE
   ----------------------------------------------------------------------------
   Estaban todos iguales: mismo tamaño, mismo color, mismo borde. Daba igual si
   el botón elegía la herramienta, encendía una opción o era LA acción — y
   cuando todo pesa lo mismo, nada destaca y hay que leerlo todo para encontrar
   el que se busca. En clase, de pie, eso es justo lo que no se puede pedir.

   Cuatro pesos, y cada cosa usa el suyo:

     ACCIÓN     una por herramienta y solo una: Lanzar, Girar, Repartir,
                Empezar. Sólida, ancha y alta. Es la que se toca sin mirar.
     PESTAÑA    qué herramienta se ve. Van dentro de una cápsula gris —el mismo
                objeto que el conmutador ES/EN de la suite—, así que se leen
                como «una de estas cuatro» y no como cuatro botones sueltos.
     OPCIÓN     lo que se enciende y se apaga dentro de una herramienta (las
                caras del dado, el modo de reparto, los minutos). Encendida va
                en TINTE índigo, no en índigo sólido: el sólido es de la acción,
                y si las opciones también lo usaran volveríamos al principio.
     APAGADO    lo secundario: reiniciar, cambiar lista, salir. Sin relleno.

   Vive en un solo archivo porque cuatro herramientas escribiendo sus propias
   clases es como se desvían: la quinta copiaría las de la última que se tocó.
   ========================================================================== */

/** La acción principal de una herramienta. Una por pantalla. */
/* `disabled:text-slate-600` y no el blanco heredado: apagado, el botón queda
   blanco sobre slate-300 y eso da 1,9:1 — el rótulo desaparece y el botón no
   parece deshabilitado, parece roto. Y ahora se ve mucho: las cinco
   herramientas del cierre abren con su acción apagada, esperando que el docente
   escriba. Lo cazó la sonda de contraste renderizado el día que hubo por fin una
   pantalla que medir con el botón apagado. */
export const ACCION =
  'w-full py-3.5 rounded-xl font-bold text-base bg-indigo-600 hover:bg-indigo-700 ' +
  'active:bg-indigo-800 disabled:bg-slate-300 disabled:text-slate-600 text-white ' +
  'shadow-sm hover:shadow transition-all touch-manipulation';

/** La cápsula que envuelve a las pestañas. */
/* `flex-wrap`: la cápsula nunca puede empujar la página a lo ancho. Lo que
   manda no es el ancho de la pantalla sino CUÁNTOS controles hay y cuánto mide
   cada rótulo traducido — y eso cambia solo. */
export const CAPSULA = 'inline-flex flex-wrap bg-slate-100 border border-slate-200 rounded-xl p-1 gap-0.5 max-w-full';

/** Una pestaña dentro de la cápsula. */
export const pestana = (activa) =>
  'px-3 py-1.5 rounded-lg text-sm font-bold transition-all touch-manipulation ' +
  (activa ? 'bg-white shadow-sm text-indigo-700' : 'text-slate-600 hover:text-slate-900');

/** Una opción que se enciende y se apaga. */
export const opcion = (activa) =>
  'px-3 py-1.5 rounded-lg text-sm font-semibold border transition-colors touch-manipulation ' +
  (activa
    ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300');

/** Lo secundario: no compite con la acción. */
export const APAGADO =
  'px-3 py-2 rounded-lg text-sm font-semibold border border-slate-300 bg-white ' +
  'text-slate-700 hover:border-slate-400 transition-colors touch-manipulation';

/** Un enlace de texto, para lo que casi no se toca. */
export const ENLACE = 'text-xs font-medium text-slate-600 underline underline-offset-2 hover:text-slate-900';

/** Los campos numéricos de las herramientas, todos del mismo ancho. */
export const NUMERO =
  'w-16 px-2 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none';
