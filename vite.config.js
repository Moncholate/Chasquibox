import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { createHash } from 'node:crypto'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

/* El service worker sale de `pwa/sw.js` con la lista de TODO lo publicado:
   lo que arma Vite y lo que se copia de `public/`. La versión es un hash de
   esos archivos, así que cualquier cambio publica un worker nuevo y el viejo
   borra su copia. */
const listarPublic = (dir, base = dir) => readdirSync(dir).flatMap(f => {
  const p = join(dir, f);
  return statSync(p).isDirectory() ? listarPublic(p, base) : [relative(base, p).replace(/\\/g, '/')];
});

const offline = () => ({
  name: 'chasquibox-offline',
  apply: 'build',
  generateBundle(_, bundle) {
    const hash = createHash('sha256');
    const archivos = [];
    for (const [nombre, salida] of Object.entries(bundle)) {
      archivos.push(nombre);
      hash.update(nombre).update(salida.type === 'chunk' ? salida.code : salida.source);
    }
    for (const f of listarPublic('public')) {
      archivos.push(f);
      hash.update(f).update(readFileSync(join('public', f)));
    }
    archivos.sort();
    const fuente = readFileSync('pwa/sw.js', 'utf8')
      .replace("const VERSION = '__VERSION__';", `const VERSION = ${JSON.stringify(hash.digest('hex').slice(0, 12))};`)
      /* index.html no llega a `bundle`: Vite lo escribe después. Su contenido
         solo cambia cuando cambian los nombres con hash, que ya están en la
         versión, así que basta con sumarlo a la lista. */
      .replace('const PRECACHE = __PRECACHE__;', `const PRECACHE = ${JSON.stringify(['', 'index.html', ...archivos.filter(f => f !== 'index.html')])};`);
    if (fuente.includes("= '__VERSION__'") || fuente.includes('= __PRECACHE__')) {
      this.error('pwa/sw.js: no se pudo completar la versión o la lista de archivos');
    }
    this.emitFile({ type: 'asset', fileName: 'sw.js', source: fuente });
  },
});

export default defineConfig({
  base: '/Chasquibox/',  // Para GitHub Pages
  plugins: [react(), offline()],
  server: {
    port: 5174,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom']
        }
      }
    }
  }
})
