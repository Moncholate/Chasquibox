/* El enlace a Liveboard, comprobado.
   ----------------------------------------------------------------------------
   «Hacer con celulares» lleva lo que el docente escribió DENTRO del enlace. Si
   se codifica mal, Liveboard abre la sala con un aviso de error delante del
   curso: no hay pantalla en blanco que delate el fallo antes.

   Si la carpeta de Liveboard está al lado (../Liveboard), además se lee el
   enlace con SU lector: así un cambio de formato en un lado y no en el otro
   se caza aquí.

   Correr:  node tools/check-celulares.mjs        (desde Teachers Utility Belt/) */
import { existsSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { codificar, enlaceLiveboard, VERSION } from '../src/celulares.js';

let problemas = 0;
const fallo = (m) => { console.log('   ✗ ' + m); problemas++; };
const ok = (m) => console.log('   ✓ ' + m);

const decodificar = (s) => {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(b64 + '='.repeat((4 - (b64.length % 4)) % 4));
  return JSON.parse(new TextDecoder().decode(Uint8Array.from(bin, c => c.charCodeAt(0))));
};

const CASOS = [
  { tipo: 'semaforo', pregunta: 'Puedo explicar la fotosíntesis con mis palabras.' },
  { tipo: 'duda', pregunta: 'No me queda claro cuándo se usa ____ en vez de ____.' },
  { tipo: 'apuesta', pregunta: '', consignas: ['Usa “although” en una oración', 'Resuelve 3x + 5 = 20', 'ñandú, «comillas»'] },
  { tipo: 'antesahora', pregunta: '', antes: 'he go', ahora: 'he goes' },
  { tipo: 'muro', pregunta: 'Hoy pude ______.' },
];

console.log('\nel enlace lleva lo escrito, entero');
{
  const rotos = CASOS.filter(a => {
    const url = enlaceLiveboard(a, 'https://x/');
    const cargar = new URLSearchParams(url.split('?')[1]).get('cargar');
    const vuelta = decodificar(cargar);
    return vuelta.v !== VERSION || JSON.stringify(vuelta.actividad) !== JSON.stringify(a);
  });
  if (rotos.length) fallo(`no vuelven iguales: ${rotos.map(a => a.tipo).join(', ')}`);
  else ok('los cinco cierres, con tildes, comillas y ñ, vuelven idénticos');
}

console.log('\nsin caracteres que un enlace cambie');
{
  const malos = CASOS.map(a => codificar({ v: VERSION, actividad: a })).filter(s => /[+/=]/.test(s));
  if (malos.length) fallo('quedan + / = en el enlace');
  else ok('base64url: sin + / =');
}

console.log('\nLiveboard lo entiende');
{
  const ruta = fileURLToPath(new URL('../../Liveboard/src/live/traida.js', import.meta.url));
  if (!existsSync(ruta)) {
    console.log('   · no está ../Liveboard al lado: se salta');
  } else {
    const { leerTraida } = await import(pathToFileURL(ruta).href);
    const rotos = CASOS.filter(a => {
      const r = leerTraida('#/host?' + enlaceLiveboard(a, 'https://x/').split('?')[1]);
      return !r?.actividad || r.actividad.tipo !== a.tipo;
    });
    if (rotos.length) fallo(`Liveboard rechaza: ${rotos.map(a => a.tipo).join(', ')}`);
    else ok('el lector de Liveboard acepta los cinco');
  }
}

console.log(problemas ? `\n${problemas} problema(s)\n` : '\ntodo bien\n');
process.exit(problemas ? 1 : 0);
