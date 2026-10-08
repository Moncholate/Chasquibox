/* ============================================================================
   HACER CON CELULARES
   ----------------------------------------------------------------------------
   Las herramientas del cierre funcionan aquí sin internet y sin servidor: el
   docente cuenta manos, escribe lo que le dicen, y nada se guarda. Eso no
   cambia. Lo que se suma (8-oct-2026) es una puerta: abrir lo mismo en
   Liveboard, donde el curso responde desde el celular y el proyector lo junta
   sin nombres.

   POR QUÉ UN ENLACE Y NO UNA BASE DE DATOS. Lo que el docente escribió —el
   objetivo, el molde, las consignas— viaja DENTRO del enlace, así que esta app
   sigue sin servidor: no guarda nada, solo abre una pestaña. Liveboard lo lee
   y crea la sala (src/live/traida.js allá). Son las preguntas del docente,
   nunca datos de estudiantes.

     <Liveboard>#/host?cargar=<JSON en base64url>    { v: 1, actividad: { tipo, … } }

   El formato tiene su copia en Liveboard: si cambia, se cambian las dos y se
   sube `v`.

   Este archivo es PURO para poder probarlo: `tools/check-celulares.mjs`.
   ========================================================================== */

/** Dónde vive Liveboard. Para probar con un Liveboard local, VITE_LIVEBOARD_URL. */
export const LIVEBOARD = (import.meta.env && import.meta.env.VITE_LIVEBOARD_URL) || 'https://moncholate.github.io/liveboard/';

export const VERSION = 1;

/** JSON → base64url, en UTF-8 (las tildes no caben en btoa a secas). */
export const codificar = (obj) => {
  const bytes = new TextEncoder().encode(JSON.stringify(obj));
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

/** El enlace que abre Liveboard con esta actividad ya cargada. */
export const enlaceLiveboard = (actividad, base = LIVEBOARD) =>
  `${base}#/host?cargar=${codificar({ v: VERSION, actividad })}`;
