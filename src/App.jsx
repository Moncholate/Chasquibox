/* ============================================================================
   TEACHER'S TOOLBOX
   ----------------------------------------------------------------------------
   La caja de herramientas de clase, ya fuera de Grammar HUB. Allá vivía como
   una vista del hub de inglés; aquí es una app propia porque sirve a docentes
   de cualquier asignatura, y es la primera pieza del bundle.

   El panel lo es todo: menú, herramientas, la lista del curso compartida y el
   modo de proyectar. Esto solo le pasa la marca, que va arriba del menú (ya no
   hay barra superior: en PC robaba alto, que es lo que más falta proyectando).

   NADA SE GUARDA, igual que en el hub: lo que se escribe o se pega vive
   mientras la pestaña está abierta. Lo único que queda en el navegador es el
   tema claro u oscuro, que no es de ningún alumno.
   ========================================================================== */
import React, { useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import PanelDocente from './components/PanelDocente';

const ThemeToggle = () => {
  const [tema, setTema] = useState(() =>
    (typeof window !== 'undefined' && window.ghTheme?.effective()) || 'light');
  return (
    <button
      onClick={() => setTema(window.ghTheme?.toggle() || tema)}
      aria-label={tema === 'dark' ? 'Usar tema claro' : 'Usar tema oscuro'}
      title={tema === 'dark' ? 'Usar tema claro' : 'Usar tema oscuro'}
      className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
    >
      {tema === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
};

/* Plegado, el menú mide 64 px: el logo y el tema van uno debajo del otro. */
const marca = ({ plegado }) => (
  <header className={`flex items-center gap-2 px-3 py-3 ${plegado ? 'md:flex-col md:px-0' : ''}`}>
    <img src={`${import.meta.env.BASE_URL}favicon.svg`} alt="" className="w-7 h-7 shrink-0" />
    <h1 className={`text-sm font-extrabold leading-tight text-slate-900 ${plegado ? 'md:sr-only' : ''}`}>
      Teacher's Toolbox
    </h1>
    <div className={plegado ? '' : 'ml-auto'}><ThemeToggle /></div>
  </header>
);

const App = () => <PanelDocente lang="es" marca={marca} />;

export default App;
