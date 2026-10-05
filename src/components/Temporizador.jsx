/* ============================================================================
   EL TEMPORIZADOR
   ----------------------------------------------------------------------------
   «Tres minutos para esto». Se proyecta, así que el número es lo único grande
   de la pantalla y los últimos diez segundos se ponen en rojo: el aviso tiene
   que significar «ya», no «pronto».

   DOS COSAS QUE NO SON OBVIAS:

   · La cuenta va contra el RELOJ del sistema (una hora de fin), no restando uno
     cada segundo. Un intervalo que se retrasa —pestaña de fondo, teléfono que
     se duerme— acumularía el retraso y el reloj mentiría justo cuando la clase
     lo está mirando.
   · El pitido se crea con WebAudio en el momento, sin archivo. Se enciende con
     el gesto de arrancar, que es lo que piden los navegadores para dejar sonar
     algo, y se puede apagar: en una sala con otro curso al lado, un pitido no
     siempre se agradece.

   El formato y el estado están en `../temporizador.js`, con pruebas.
   ========================================================================== */
import React, { useState, useRef, useEffect } from 'react';
import { formatoReloj, estadoReloj, PRESETS } from '../temporizador';
import { ACCION, APAGADO, opcion, NUMERO } from '../ui';

/* `grande` = proyectando. El reloj es lo único que importa a diez metros, así
   que se lleva casi toda la pantalla. */
const Temporizador = ({ lang = 'es', grande = false }) => {
  const es = lang === 'es';
  const [total, setTotal] = useState(180);        // lo que se puso, en segundos
  const [restante, setRestante] = useState(180);
  const [corriendo, setCorriendo] = useState(false);
  const [suena, setSuena] = useState(true);
  const finRef = useRef(0);
  const tick = useRef(null);
  const yaSono = useRef(false);

  useEffect(() => () => clearInterval(tick.current), []);

  const pitar = () => {
    if (!suena) return;
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      const ctx = new Ctx();
      const osc = ctx.createOscillator();
      const vol = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = 880;
      vol.gain.value = 0.15;
      osc.connect(vol); vol.connect(ctx.destination);
      osc.start();
      /* Dos toques cortos: uno solo se confunde con cualquier notificación. */
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.18);
      vol.gain.setValueAtTime(0, ctx.currentTime + 0.18);
      vol.gain.setValueAtTime(0.15, ctx.currentTime + 0.3);
      osc.stop(ctx.currentTime + 0.5);
      setTimeout(() => { try { ctx.close(); } catch { /* ya cerrado */ } }, 900);
    } catch { /* sin audio disponible: el reloj sigue funcionando igual */ }
  };

  const arrancar = () => {
    if (corriendo || restante <= 0) return;
    yaSono.current = false;
    finRef.current = Date.now() + restante * 1000;
    setCorriendo(true);
    clearInterval(tick.current);
    tick.current = setInterval(() => {
      const quedan = Math.max(0, Math.round((finRef.current - Date.now()) / 1000));
      setRestante(quedan);
      if (quedan === 0) {
        clearInterval(tick.current);
        setCorriendo(false);
        if (!yaSono.current) { yaSono.current = true; pitar(); }
      }
    }, 250);
  };

  const pausar = () => { clearInterval(tick.current); setCorriendo(false); };
  const reiniciar = () => { clearInterval(tick.current); setCorriendo(false); setRestante(total); };

  /* EL RELOJ SIEMPRE GUARDÓ SEGUNDOS POR DENTRO — `total` ya estaba en
     segundos, `poner(minutos)` solo multiplicaba por 60 antes de guardarlos.
     Lo que faltaba no era soporte a segundos, era una FORMA de pedirlos: el
     único campo libre era «otro ___ min», con piso de 1 minuto. El profesor
     probó 30 segundos en clase y el piso se lo impedía: no había ningún
     control que bajara de 60. */
  const aplicar = (segundos) => {
    clearInterval(tick.current);
    setCorriendo(false);
    const s = Math.max(1, Math.min(5400, Math.round(segundos)));   // 1 s a 90 min
    setTotal(s);
    setRestante(s);
  };
  const minRef = useRef(null);
  const segRef = useRef(null);
  const aplicarOtro = () => {
    const m = Number(minRef.current?.value) || 0;
    const s = Number(segRef.current?.value) || 0;
    aplicar(m * 60 + s);
  };

  const estado = estadoReloj(restante);
  const color = estado === 'normal' ? 'text-slate-900' : 'text-red-700';

  return (
    <section className="w-full max-w-xl mx-auto">
      <h2 className="text-lg font-bold text-slate-900 mb-1">{es ? 'Temporizador' : 'Timer'}</h2>
      <p className="text-sm text-muted mb-4">
        {es ? 'Para las actividades con tiempo. Los últimos diez segundos se ponen en rojo.'
            : 'For timed activities. The last ten seconds turn red.'}
      </p>

      <div className="flex flex-wrap items-center gap-2 mb-3">
        {PRESETS.map(m => (
          <button
            key={m}
            onClick={() => aplicar(m * 60)}
            aria-pressed={total === m * 60}
            className={opcion(total === m * 60)}
          >
            {m} min
          </button>
        ))}
        {/* «OTRO» EN DOS CAMPOS, NO UNO. Con un solo campo en minutos, 30
            segundos no tenía forma de escribirse: el piso era 1 minuto. Min y
            seg se leen juntos en `aplicarOtro` y se combinan en un solo total,
            así que dejar el de minutos en blanco y poner «30» en segundos
            alcanza exactamente lo que se pidió en clase. */}
        <div className="flex items-center gap-1 text-sm text-slate-600">
          <span>{es ? 'otro' : 'other'}</span>
          <input
            ref={minRef}
            type="number" min="0" max="90" placeholder="0"
            onChange={aplicarOtro}
            aria-label={es ? 'minutos' : 'minutes'}
            className={NUMERO}
          />
          <span>{es ? 'min' : 'min'}</span>
          <input
            ref={segRef}
            type="number" min="0" max="59" placeholder="0"
            onChange={aplicarOtro}
            aria-label={es ? 'segundos' : 'seconds'}
            className={NUMERO}
          />
          <span>{es ? 'seg' : 'sec'}</span>
        </div>
      </div>

      {/* El número, que es todo lo que hay que ver desde el fondo de la sala. */}
      <div
        aria-live="polite"
        className="rounded-2xl border border-slate-200 bg-white px-6 py-8 text-center"
      >
        <p className={`font-extrabold tabular-nums ${color} ${grande ? 'text-[20vw] leading-none' : 'text-6xl sm:text-7xl'}`}>{formatoReloj(restante)}</p>
        {estado === 'fin' && (
          <p className={`mt-1 font-bold text-red-700 ${grande ? 'text-[4vw]' : 'text-base'}`}>{es ? '¡Se acabó el tiempo!' : "Time's up!"}</p>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          onClick={corriendo ? pausar : arrancar}
          disabled={!corriendo && restante <= 0}
          className={`flex-1 ${ACCION}`}
        >
          {corriendo ? (es ? 'Pausar' : 'Pause') : (es ? 'Empezar' : 'Start')}
        </button>
        <button
          onClick={reiniciar}
          className={`shrink-0 ${APAGADO}`}
        >
          {es ? 'Reiniciar' : 'Reset'}
        </button>
      </div>

      <label className="mt-3 flex items-center gap-1.5 text-sm text-slate-600 cursor-pointer">
        <input type="checkbox" checked={suena} onChange={(e) => setSuena(e.target.checked)} />
        {es ? 'pitar al terminar' : 'beep when done'}
      </label>
    </section>
  );
};

export default Temporizador;
