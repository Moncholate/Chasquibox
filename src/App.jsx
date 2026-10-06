/* ============================================================================
   TEACHER'S UTILITY BELT
   ----------------------------------------------------------------------------
   La caja de herramientas de clase, ya fuera de Grammar HUB. Allá vivía como
   una vista del hub de inglés; aquí es una app propia porque sirve a docentes
   de cualquier asignatura, y es la primera pieza del bundle.

   El panel es el mismo: las herramientas, la lista del curso compartida y la
   pantalla completa para proyectar. Esto solo pone el encabezado.

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
      className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
    >
      {tema === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
};

const App = () => (
  <div className="min-h-screen bg-[#f5f6fb] flex flex-col">
    <header className="bg-white border-b border-slate-200 px-4 py-2.5 flex items-center gap-2.5">
      <img src={`${import.meta.env.BASE_URL}favicon.svg`} alt="" className="w-7 h-7" />
      <h1 className="text-base font-extrabold text-slate-900">Teacher's Utility Belt</h1>
      <span className="hidden sm:inline text-sm text-muted">· herramientas de clase</span>
      <div className="ml-auto"><ThemeToggle /></div>
    </header>
    <main className="flex-1 w-full flex flex-col">
      <PanelDocente lang="es" />
    </main>
  </div>
);

export default App;
