/* ============================================================================
   EL BOTÓN «HACER CON CELULARES»
   ----------------------------------------------------------------------------
   Va al final del panel de cada herramienta del cierre, mientras se prepara.
   Es APAGADO y no la acción: la acción de la herramienta sigue siendo
   proyectar aquí, que funciona siempre; los celulares son la otra forma, la
   que necesita internet. El porqué del enlace está en `../celulares.js`.

   Sin internet se apaga y lo dice: el profesor no tiene por qué descubrirlo
   con una pestaña en blanco delante del curso.
   ========================================================================== */
import React, { useEffect, useState } from 'react';
import { Smartphone } from 'lucide-react';
import { enlaceLiveboard } from '../celulares';
import { APAGADO } from '../ui';

const enLinea = () => (typeof navigator === 'undefined' ? true : navigator.onLine !== false);

/* `nota`: un aviso propio de la herramienta, debajo (la sopa grande que en el
   celular habrá que deslizar). */
const BotonCelulares = ({ lang = 'es', actividad, disabled = false, nota = null }) => {
  const es = lang === 'es';
  const [conRed, setConRed] = useState(enLinea);
  useEffect(() => {
    const cambio = () => setConRed(enLinea());
    window.addEventListener('online', cambio);
    window.addEventListener('offline', cambio);
    return () => {
      window.removeEventListener('online', cambio);
      window.removeEventListener('offline', cambio);
    };
  }, []);

  const abrir = () => window.open(enlaceLiveboard(actividad), '_blank', 'noopener');

  return (
    <div className="mt-5 pt-4 border-t border-slate-200 space-y-1.5">
      <button onClick={abrir} disabled={disabled || !conRed}
              className={`w-full inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${APAGADO}`}>
        <Smartphone size={16} aria-hidden="true" />
        {es ? 'Hacer con celulares' : 'Do it with phones'}
      </button>
      <p className="text-xs text-muted">
        {!conRed
          ? (es ? 'Sin internet: sigue con la versión de aquí, que funciona igual.'
                : 'No internet: keep using this version, it works the same.')
          : (es ? 'Abre Liveboard con esto ya cargado: cada uno responde desde su celular y la pantalla no muestra nombres.'
                : 'Opens Liveboard with this already loaded: everyone answers on their phone and the screen shows no names.')}
      </p>
      {nota && conRed && <p className="text-xs text-amber-900 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-2">{nota}</p>}
    </div>
  );
};

export default BotonCelulares;
