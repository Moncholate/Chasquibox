/* ============================================================================
   CARGAR EL CURSO
   ----------------------------------------------------------------------------
   El pegado de la lista, en un solo sitio y usado por todas las herramientas que
   la necesitan. Hoy son dos: Grupos, para repartir, y «La duda», para sortear a
   quién le toca contarla.

   POR QUÉ NO VIVE DENTRO DE GRUPOS, que es donde estaba. Porque atarlo ahí
   significaba que «La duda» solo funcionaba los días en que además se hubieran
   repartido grupos — y con un cierre de cinco minutos se hace UNA actividad por
   clase, así que la mayoría de los días no habría lista. Lo dijo el profesor,
   1-sep-2026, y tenía razón: una herramienta no puede depender de que hoy se
   haya usado otra.

   PERO LA LISTA SIGUE SIENDO UNA SOLA. La alternativa fácil —una lista propia
   por herramienta— cobra el pegado dos veces el día que sí se usan las dos, y
   además deja dos versiones de la misma clase que pueden decir cosas distintas.
   El estado vive arriba, en el panel; esto es solo la puerta, y hay una puerta
   en cada herramienta que la necesita.

   LO PEGADO SE RECONOCE SOLO. Caben dos cosas en la misma caja: la lista de
   nombres de siempre y el histórico de asistencia exportado a Excel. Preguntarle
   antes al profesor qué va a pegar es un paso que no aporta nada, y con el
   histórico hay premio: los que faltaron llegan apagados.

   Y NADA SE GUARDA, como todo en esta sección: lo pegado vive mientras la
   pestaña esté abierta.
   ========================================================================== */
import React, { useState } from 'react';
import { parsearNombres } from '../grupos';
import { leerHistorico, pareceHistorico, ERRORES } from '../listaCurso';
import { ACCION } from '../ui';

/**
 * `onCargar({ nombres, ausentes, origen })` — `ausentes` es un Set con los que
 * el histórico dice que no vinieron, vacío si se pegó una lista a mano.
 * `compacto` para cuando la caja no es la actividad sino un paso previo a ella.
 */
const CargarCurso = ({ lang = 'es', onCargar, compacto = false }) => {
  const es = lang === 'es';
  const [texto, setTexto] = useState('');
  const [aviso, setAviso] = useState(null);

  /* Cuando el histórico no se puede leer, el mensaje dice QUÉ pasó. «No pude
     leerlo» no ayuda a arreglar nada, y lo que hay que arreglar suele ser algo
     concreto: pegaste la lista de nombres, o copiaste sin la cabecera. */
  const PORQUE = {
    [ERRORES.sinListasTomadas]: es
      ? 'Ese curso todavía no tiene ninguna lista pasada.'
      : 'That course has no attendance recorded yet.',
    [ERRORES.sinAlumnos]: es
      ? 'El histórico llegó sin alumnos: revisa que hayas copiado también las filas.'
      : 'The export came with no students: check that you copied the rows too.',
    [ERRORES.sinFechas]: es
      ? 'Faltan las filas de fechas: copia también la cabecera del histórico.'
      : 'The date rows are missing: copy the export header too.',
  };

  const cargar = () => {
    if (pareceHistorico(texto)) {
      const h = leerHistorico(texto);
      if (h.error) {
        setAviso(PORQUE[h.error] || (es
          ? 'Eso no parece el histórico de asistencia. Pega también la cabecera, o escribe los nombres uno por línea.'
          : 'That does not look like the attendance export. Paste the header too, or type one name per line.'));
        return;
      }
      setAviso(null);
      onCargar?.({
        nombres: h.alumnos.map(a => a.corto),
        ausentes: new Set(h.ausentes.map(a => a.corto)),
        origen: { curso: h.curso, fecha: h.fecha, clase: h.clase, ausentes: h.ausentes.length },
      });
      return;
    }
    setAviso(null);
    onCargar?.({ nombres: parsearNombres(texto), ausentes: new Set(), origen: null });
  };

  const listo = pareceHistorico(texto) || parsearNombres(texto).length > 0;

  return (
    <div>
      <textarea
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        rows={compacto ? 4 : 6}
        placeholder={es ? 'Un nombre por línea, o pega el histórico de asistencia' : 'One name per line, or paste the attendance export'}
        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
      />
      {/* Se dice ANTES de tocar el botón, y el botón cambia de rótulo: así no
          hay que apretar para descubrir si lo que pegaste sirve. */}
      {pareceHistorico(texto) && !aviso && (
        <p className="mt-2 text-xs font-semibold text-indigo-700">
          {es ? 'Histórico de asistencia reconocido.' : 'Attendance export recognised.'}
        </p>
      )}
      {aviso && (
        <p role="alert" className="mt-2 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-2.5 py-2">
          {aviso}
        </p>
      )}
      <button onClick={cargar} disabled={!listo} className={`mt-2 ${ACCION}`}>
        {pareceHistorico(texto)
          ? (es ? 'Cargar el curso de ese día' : 'Load that day’s class')
          : (es ? 'Usar esta lista' : 'Use this list')}
      </button>
    </div>
  );
};

export default CargarCurso;
