/* ============================================================================
   DE QUÉ DÍA ES LA LISTA
   ----------------------------------------------------------------------------
   El histórico cae solo a la última clase con lista pasada. Si hoy todavía no
   la pasas, esa es la clase ANTERIOR, con las ausencias de ese día: en clase
   salieron presentes los que faltaban y apagados los que estaban. Antes esto
   se decía en una línea de letra chica, y no se leyó. Por eso:

     · la fecha va en grande, arriba de la lista;
     · si no es la de hoy, se avisa en ámbar y se dice qué hacer;
     · se puede elegir otro día sin volver a pegar: lo pegado sigue en memoria
       (`origen.texto`) y se relee con la fecha elegida.

   Lo usan Grupos, La duda y Antes / Ahora, que son las que cargan el curso:
   una sola versión del aviso, para que las tres digan lo mismo.
   ========================================================================== */
import React from 'react';
import { fechaDeHoy } from '../listaCurso';

/* `fuera` dice qué les pasa a los ausentes en ESTA herramienta: en Grupos se
   apagan, en las de cierre no entran al sorteo. */
const OrigenLista = ({ lang = 'es', origen, onCambiarFecha, fuera }) => {
  if (!origen) return null;
  const es = lang === 'es';
  const hoy = fechaDeHoy();
  const esLaUltima = origen.fecha === origen.ultimaTomada;
  const fechas = [...(origen.fechasTomadas || [])].reverse();

  return (
    <div className="mb-3 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2.5">
      <p className="text-base font-bold text-slate-900">
        {es ? 'Lista del ' : 'List from '}{origen.fecha}
        {origen.fecha === hoy && <span className="ml-1.5 text-sm font-semibold text-indigo-700">· {es ? 'hoy' : 'today'}</span>}
      </p>
      <p className="text-xs text-slate-600">
        {origen.curso || (es ? 'Curso' : 'Course')} · {es ? 'clase' : 'class'} {origen.clase} · {origen.ausentes} {es ? (origen.ausentes === 1 ? 'ausente' : 'ausentes') : 'absent'}{fuera ? `, ${fuera}` : ''}
      </p>

      {origen.fecha !== hoy && (
        <p role="status" className="mt-2 text-sm text-amber-900 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-2">
          {esLaUltima
            ? (es
              ? `Hoy (${hoy}) todavía no hay lista pasada en el histórico: estas ausencias son de la clase del ${origen.fecha}. Si ya pasaste lista, exporta el histórico de nuevo y pégalo.`
              : `Today (${hoy}) has no roll in the export yet: these absences are from the class on ${origen.fecha}. If you already took the roll, export again and paste it.`)
            : (es
              ? `Estás mirando una clase anterior. La última con lista es la del ${origen.ultimaTomada}.`
              : `You are looking at an earlier class. The latest with a roll is ${origen.ultimaTomada}.`)}
        </p>
      )}

      {fechas.length > 1 && onCambiarFecha && (
        <label className="mt-2 flex items-center gap-2 text-xs text-slate-600">
          <span>{es ? 'Otro día:' : 'Another day:'}</span>
          <select
            value={origen.fecha}
            onChange={(e) => onCambiarFecha(e.target.value)}
            className="px-2 py-1 border border-slate-300 rounded-lg text-sm bg-white text-slate-700"
          >
            {fechas.map(f => (
              <option key={f} value={f}>{f}{f === origen.ultimaTomada ? (es ? ' · la última' : ' · latest') : ''}</option>
            ))}
          </select>
        </label>
      )}
    </div>
  );
};

export default OrigenLista;
