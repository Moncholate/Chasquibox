/* ============================================================================
   NOTAS · la herramienta para corregir
   ----------------------------------------------------------------------------
   No es para la sala: es para la pila de pruebas. El docente tiene el puntaje
   de cada una y necesita la nota, y lo que pide la tarea es ir rápido y no
   equivocarse en el borde del 4,0.

   DOS FORMAS DE USARLA, porque corregir tiene dos ritmos:
     · UNA PRUEBA: se escribe el puntaje y sale la nota, grande. Es lo de ir
       prueba por prueba.
     · LA TABLA ENTERA: todos los puntajes con su nota, de una vez. Es lo que se
       deja abierto al lado de la pila, o lo que se revisa antes de devolver las
       pruebas para ver dónde cae el corte.

   LA ESCALA SE PLIEGA. Mínima, máxima y aprobación casi nunca cambian —son las
   de la institución—, así que esconderlas deja a la vista solo lo que cambia
   prueba a prueba: el puntaje máximo y la exigencia.

   APROBADA EN AZUL Y REPROBADA EN ROJO, como se anotan a mano en Chile. Y nunca
   solo por color: la tabla separa las dos zonas con una línea y un rótulo.

   NADA SE GUARDA, la regla de toda esta sección: ni puntajes ni notas quedan en
   ningún lado. La lógica es pura y está probada en `tools/check-notas.mjs`.
   ========================================================================== */
import React, { useState } from 'react';
import { ESCALA_CHILE, nota, tabla, puntajeParaAprobar, problemaEscala,
         formatoNota, formatoPuntaje, leerNumero } from '../notas';
import { NUMERO, opcion, ENLACE } from '../ui';

const APROBADA = 'text-blue-700';
const REPROBADA = 'text-red-700';

const Campo = ({ rotulo, valor, onCambio, sufijo, ancho }) => (
  <label className="flex flex-col gap-1">
    <span className="text-xs font-semibold text-slate-600">{rotulo}</span>
    <span className="flex items-center gap-1.5">
      <input
        type="text" inputMode="decimal" value={valor}
        onChange={(e) => onCambio(e.target.value)}
        className={ancho || NUMERO}
      />
      {sufijo && <span className="text-sm text-slate-600">{sufijo}</span>}
    </span>
  </label>
);

const Notas = ({ lang = 'es', grande = false }) => {
  const es = lang === 'es';
  /* Como texto y no como número: así se puede escribir «12,» camino de «12,5»
     sin que el campo se corrija solo a mitad de la escritura. */
  const [maximoTxt, setMaximoTxt] = useState('60');
  const [exigenciaTxt, setExigenciaTxt] = useState(String(ESCALA_CHILE.exigencia * 100));
  const [minTxt, setMinTxt] = useState('1,0');
  const [aprobTxt, setAprobTxt] = useState('4,0');
  const [maxTxt, setMaxTxt] = useState('7,0');
  const [medios, setMedios] = useState(false);
  const [puntajeTxt, setPuntajeTxt] = useState('');

  const maximo = leerNumero(maximoTxt);
  const escala = {
    min: leerNumero(minTxt),
    max: leerNumero(maxTxt),
    aprobacion: leerNumero(aprobTxt),
    exigencia: leerNumero(exigenciaTxt) / 100,
  };
  const paso = medios ? 0.5 : 1;
  const problema = problemaEscala(escala, maximo);
  /* Una tabla de mil filas no se lee, y es casi seguro un error de tipeo. */
  const demasiadas = !problema && maximo / paso > 400;

  const puntaje = leerNumero(puntajeTxt);
  const hayPuntaje = Number.isFinite(puntaje);
  const fueraDeRango = hayPuntaje && !problema && (puntaje < 0 || puntaje > maximo);
  const laNota = hayPuntaje && !problema ? nota(puntaje, maximo, escala) : null;
  const aprueba = laNota != null && laNota >= escala.aprobacion;

  const filas = problema || demasiadas ? [] : tabla(maximo, escala, paso);
  const corte = problema || demasiadas ? null : puntajeParaAprobar(maximo, escala, paso);

  const AVISOS = {
    maximo: es ? 'El puntaje máximo tiene que ser mayor que 0.' : 'The maximum score must be greater than 0.',
    escala: es ? 'La escala no cuadra: tiene que ser mínima < aprobación < máxima.' : 'The scale does not add up: it must be minimum < pass < maximum.',
    exigencia: es ? 'La exigencia tiene que estar entre 1 y 99 %.' : 'The pass requirement must be between 1 and 99%.',
  };

  return (
    <section className={grande ? 'w-full max-w-4xl mx-auto' : 'w-full max-w-xl mx-auto'}>
      {!grande && (
        <>
          <h2 className="text-lg font-bold text-slate-900 mb-1">{es ? 'Notas' : 'Grades'}</h2>
          <p className="text-sm text-muted mb-4">
            {es ? 'Para corregir: el puntaje de cada prueba y su nota, o la tabla completa.'
                : 'For marking: the grade for each score, or the whole table.'}
          </p>
        </>
      )}

      {/* ── LA PRUEBA ─────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-end gap-x-5 gap-y-3">
        <Campo rotulo={es ? 'Puntaje máximo' : 'Maximum score'} valor={maximoTxt} onCambio={setMaximoTxt} />
        <Campo rotulo={es ? 'Exigencia' : 'Pass requirement'} valor={exigenciaTxt} onCambio={setExigenciaTxt} sufijo="%" />
        <button onClick={() => setMedios(m => !m)} aria-pressed={medios} className={opcion(medios)}>
          {es ? 'Medios puntos' : 'Half points'}
        </button>
      </div>

      <details className="mt-3">
        <summary className={`${ENLACE} cursor-pointer w-fit`}>
          {es ? 'Escala' : 'Scale'}: {minTxt} – {maxTxt} · {es ? 'aprueba con' : 'pass'} {aprobTxt}
        </summary>
        <div className="mt-2 flex flex-wrap gap-x-5 gap-y-3">
          <Campo rotulo={es ? 'Nota mínima' : 'Minimum grade'} valor={minTxt} onCambio={setMinTxt} />
          <Campo rotulo={es ? 'Aprobación' : 'Pass grade'} valor={aprobTxt} onCambio={setAprobTxt} />
          <Campo rotulo={es ? 'Nota máxima' : 'Maximum grade'} valor={maxTxt} onCambio={setMaxTxt} />
        </div>
      </details>

      {problema && (
        <p role="alert" className="mt-4 text-sm font-semibold text-red-700">{AVISOS[problema]}</p>
      )}

      {/* ── UNA PRUEBA ────────────────────────────────────────────────────── */}
      {!problema && (
        <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3 border-y border-slate-200 py-4">
          <Campo rotulo={es ? 'Puntaje obtenido' : 'Score'} valor={puntajeTxt} onCambio={setPuntajeTxt}
                 ancho="w-24 px-3 py-2 border border-slate-300 rounded-lg text-xl font-bold focus:ring-2 focus:ring-indigo-500 outline-none" />
          <div aria-live="polite" className="flex items-baseline gap-3">
            <span className={`font-black tabular-nums leading-none ${laNota == null ? 'text-slate-400' : aprueba ? APROBADA : REPROBADA}`}
                  style={{ fontSize: grande ? 'min(14vw, 24vh)' : '3.5rem' }}>
              {formatoNota(laNota, lang)}
            </span>
            {laNota != null && (
              <span className={`text-sm font-bold ${aprueba ? APROBADA : REPROBADA}`}>
                {aprueba ? (es ? 'aprobada' : 'pass') : (es ? 'reprobada' : 'fail')}
              </span>
            )}
          </div>
          {fueraDeRango && (
            <p className="w-full text-xs text-slate-600">
              {es ? `Fuera de 0 a ${formatoPuntaje(maximo, lang)}: se calcula con el extremo.`
                  : `Outside 0 to ${formatoPuntaje(maximo, lang)}: the nearest end is used.`}
            </p>
          )}
        </div>
      )}

      {/* ── LA TABLA ──────────────────────────────────────────────────────── */}
      {demasiadas && (
        <p className="mt-4 text-sm text-slate-600">
          {es ? 'Con ese máximo la tabla tendría demasiadas filas. ¿Está bien escrito?'
              : 'With that maximum the table would be too long. Is it typed right?'}
        </p>
      )}
      {filas.length > 0 && (
        <div className="mt-5">
          {corte != null && (
            <p className="text-sm text-slate-700 mb-3">
              {es ? 'Se aprueba desde ' : 'Pass from '}
              <b className={APROBADA}>{formatoPuntaje(corte, lang)} {es ? 'puntos' : 'points'}</b>
              {corte < escala.exigencia * maximo && (
                <span className="text-slate-600">
                  {es ? ` (el ${exigenciaTxt} % exacto son ${formatoPuntaje(Math.round(escala.exigencia * maximo * 100) / 100, lang)}; el redondeo a una decimal sube la nota al ${aprobTxt}).`
                      : ` (exactly ${exigenciaTxt}% is ${formatoPuntaje(Math.round(escala.exigencia * maximo * 100) / 100, lang)}; rounding to one decimal brings it up to ${aprobTxt}).`}
                </span>
              )}
            </p>
          )}
          {[
            { id: 'rep', rotulo: es ? 'Reprobadas' : 'Fail', color: REPROBADA, filas: filas.filter(f => f.nota < escala.aprobacion) },
            { id: 'apr', rotulo: es ? 'Aprobadas' : 'Pass', color: APROBADA, filas: filas.filter(f => f.nota >= escala.aprobacion) },
          ].filter(z => z.filas.length).map(z => (
            <div key={z.id} className="mb-4">
              <h3 className={`text-xs font-bold uppercase tracking-wider mb-1 ${z.color}`}>{z.rotulo}</h3>
              <ol className="grid grid-cols-3 sm:grid-cols-4 gap-x-4 text-sm tabular-nums">
                {z.filas.map(f => {
                  const actual = hayPuntaje && f.puntaje === puntaje;
                  return (
                    <li key={f.puntaje}
                        className={`flex justify-between gap-2 px-2 py-0.5 rounded border-b border-slate-100 ${actual ? 'bg-indigo-50 ring-1 ring-indigo-300' : ''}`}>
                      <span className="text-slate-600">{formatoPuntaje(f.puntaje, lang)}</span>
                      <span className={`font-bold ${z.color}`}>{formatoNota(f.nota, lang)}</span>
                    </li>
                  );
                })}
              </ol>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default Notas;
