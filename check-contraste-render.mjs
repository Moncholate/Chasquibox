/* ============================================================================
   CONTRASTE DE LO QUE SE VE · Teacher's Utility Belt
   Uso:  npm run check-contraste
   ----------------------------------------------------------------------------
   El motor vive en design-tokens y llega generado: mide cada elemento con texto
   propio contra el fondo que REALMENTE tiene, componiendo translúcidos y
   subiendo por el árbol hasta el primer opaco. Su cabecera cuenta el porqué.

   El guion nació del de Grammar HUB (las herramientas vinieron de ahí el
   5-oct-2026), sin las pantallas propias del hub y con Notas, que llegó después.
   `ir` tiene que ser IDEMPOTENTE: corre una vez por tema y el segundo pase llega
   con lo que dejó el primero — el arnés no recarga entre temas.

   Necesita Playwright, y a propósito NO está en package.json — el despliegue
   corre `npm ci` y se bajaría los navegadores en cada build:

       npm i --no-save playwright && npx playwright install chromium
   ============================================================================ */
import { correr } from './contraste-render.generated.mjs';

/* ¿SIGUE VIVA LA APP? Todo lo de abajo tolera que un elemento no esté, y esa
   tolerancia hace que una app CAÍDA recorra las pantallas sin medir nada y
   cante verde. Se comprueba antes de cada herramienta. */
const viva = async (page, donde) => {
  if (!(await page.locator('header button').count())) {
    throw new Error(`la app se cayó (${donde}): la cabecera ya no está. Mira la consola del navegador antes de creerle a esta sonda.`);
  }
};

/* Las herramientas se montan todas y se ocultan con CSS: hay que ir a la
   pestaña ANTES de medir, porque lo oculto no se mide. */
const pestana = async (page, es, en) => {
  await viva(page, `antes de ${es}`);
  for (const rotulo of [es, en]) {
    const b = page.getByRole('button', { name: rotulo, exact: true });
    if (await b.count()) { await b.first().click(); await page.waitForTimeout(300); return; }
  }
};

const boton = (page, ...rotulos) =>
  page.locator(rotulos.map(r => `button:visible:has-text("${r}")`).join(', ')).first();

const lista = async (page, nombres) => {
  const caja = page.locator('textarea:visible').first();
  if (await caja.count()) {
    await caja.fill(nombres.join('\n'));
    const usar = boton(page, 'Usar esta lista', 'Use this list');
    if (await usar.count()) { await usar.click(); await page.waitForTimeout(400); }
  }
};

correr({
  nombre: "TEACHER'S UTILITY BELT",
  puerto: 5174,
  ruta: '/teachers-utility-belt/',

  conducir: async (page) => { await viva(page, 'al arrancar'); },

  pantallas: [
    {
      /* El resultado del dado se lee proyectado y en grande. Se tira dos veces
         con Sujeto y Forma encendidos: sin tirar, la caja solo tiene «Toca
         Lanzar» y no se mediría ni el sujeto, ni el tiempo, ni el historial. */
      nombre: 'Dado',
      ir: async (page) => {
        await pestana(page, 'Dado', 'Dice');
        for (const dado of ['Sujeto', 'Subject', 'Forma', 'Form', 'Tiempo', 'Tense']) {
          const b = page.getByRole('button', { name: dado, exact: true });
          if (await b.count() && await b.first().getAttribute('aria-pressed') === 'false') await b.first().click();
        }
        const lanzar = boton(page, 'Lanzar', 'Roll');
        if (await lanzar.count()) {
          await lanzar.click(); await page.waitForTimeout(700);
          await lanzar.click(); await page.waitForTimeout(700);
        }
      },
    },
    {
      nombre: 'Ruleta',
      ir: async (page) => {
        await pestana(page, 'Ruleta', 'Wheel');
        await lista(page, ['work', 'study', 'travel', 'What did you do yesterday?', 'eat']);
        const girar = boton(page, 'Girar', 'Spin');
        if (await girar.count()) { await girar.click(); await page.waitForTimeout(3400); }
      },
    },
    {
      nombre: 'Grupos',
      ir: async (page) => {
        await pestana(page, 'Grupos', 'Groups');
        await lista(page, ['Ana Pérez', 'Luis Soto', 'María López', 'Diego Rojas', 'Camila Díaz', 'Tomás Vera']);
        const ausente = page.locator('button[aria-pressed="true"]:visible:has-text("Luis Soto")').first();
        if (await ausente.count()) { await ausente.click(); await page.waitForTimeout(200); }
        const repartir = boton(page, 'Repartir', 'Split');
        if (await repartir.count()) { await repartir.click(); await page.waitForTimeout(500); }
      },
    },
    {
      /* El aviso de que no se pudo leer: aparece justo cuando algo ya salió mal. */
      nombre: 'Grupos · histórico ilegible',
      ir: async (page) => {
        await pestana(page, 'Grupos', 'Groups');
        const cambiar = boton(page, 'cambiar lista', 'change list');
        if (await cambiar.count()) { await cambiar.click(); await page.waitForTimeout(250); }
        const caja = page.locator('textarea:visible').first();
        if (!await caja.count()) return;
        const T = '\t';
        await caja.fill([
          ['#', 'Rut Alumno', 'Apellido Paterno', 'Apellido Materno', 'Nombre', 'Asistencia'].join(T),
          ['1', '1000000', 'Ramirez', 'Canales', 'Ana', '60%', 'SI'].join(T),
        ].join('\n'));
        await page.waitForTimeout(250);
        const cargar = boton(page, 'Cargar', 'Load');
        if (await cargar.count()) { await cargar.click(); await page.waitForTimeout(400); }
      },
    },
    {
      /* Desde el histórico: el cartel índigo de qué clase salió la lista. El
         histórico es inventado: ni un nombre ni un rut real en el repo. */
      nombre: 'Grupos · desde el histórico',
      ir: async (page) => {
        await pestana(page, 'Grupos', 'Groups');
        const cambiar = boton(page, 'cambiar lista', 'change list');
        if (await cambiar.count()) { await cambiar.click(); await page.waitForTimeout(250); }
        const T = '\t';
        const clases = ['10-08-26', '12-08-26', '14-08-26'];
        const alumnos = [
          ['Ramirez', 'Canales', 'Ana',   '60%',  ['SI', 'NO', 'SI']],
          ['Soto',    'Pinto',   'Bruno', '30%',  ['NO', 'NO', 'SI']],
          ['Nunez',   'Lara',    'Carla', '100%', ['SI', 'SI', 'SI']],
          ['Ortiz',   'Rivas',   'Dario', '60%',  ['SI', 'SI', 'NO']],
        ];
        const historico = [
          'Histórico Asistencia Todo : INI0000-000X | 31-08-2026 14:42',
          T.repeat(5) + 'Fecha Clase' + T + clases.join(T),
          T.repeat(5) + 'Fecha Registro de Asistencia' + T + clases.join(T),
          ['#', 'Rut Alumno', 'Apellido Paterno', 'Apellido Materno', 'Nombre', 'Asistencia'].join(T),
          ...alumnos.map((a, i) => [i + 1, '1000000' + i, a[0], a[1], a[2], a[3], ...a[4]].join(T)),
        ].join('\n');
        const caja = page.locator('textarea:visible').first();
        if (!await caja.count()) return;
        await caja.fill(historico);
        await page.waitForTimeout(250);
        const cargar = boton(page, 'Cargar', 'Load');
        if (await cargar.count()) { await cargar.click(); await page.waitForTimeout(450); }
        const repartir = boton(page, 'Repartir', 'Split');
        if (await repartir.count()) { await repartir.click(); await page.waitForTimeout(400); }
      },
    },
    {
      nombre: 'Reloj',
      ir: async (page) => { await pestana(page, 'Reloj', 'Timer'); },
    },
    {
      /* Con la solución encendida y una palabra hallada a mano no: la cuadrícula
         es papel fijo en los dos temas, se mide que lo de encima se lea. */
      nombre: 'Sopa de letras',
      ir: async (page) => {
        await pestana(page, 'Sopa de letras', 'Word search');
        const cambiar = boton(page, 'cambiar las palabras', 'change the words');
        if (await cambiar.count()) { await cambiar.click(); await page.waitForTimeout(300); }
        const caja = page.locator('textarea:visible').first();
        if (await caja.count()) { await caja.fill('apple\nbanana\ncherry\norange\nlemon\ngrape\nmelon\npeach'); await page.waitForTimeout(250); }
        const armar = boton(page, 'Armar la sopa', 'Build the word search');
        if (await armar.count()) { await armar.click(); await page.waitForTimeout(450); }
        const ver = boton(page, 'Ver las respuestas', 'Show answers');
        if (await ver.count()) { await ver.click(); await page.waitForTimeout(350); }
      },
    },
    {
      nombre: 'Crucigrama',
      ir: async (page) => {
        await pestana(page, 'Crucigrama', 'Crossword');
        const cambiar = boton(page, 'cambiar las palabras', 'change the words');
        if (await cambiar.count()) { await cambiar.click(); await page.waitForTimeout(300); }
        const caja = page.locator('textarea:visible').first();
        if (await caja.count()) {
          await caja.fill('apple = a red fruit\nbanana = yellow and long\ncherry\norange = it is also a colour\nlemon\ngrape\nmelon\npeach = it has fuzzy skin');
          await page.waitForTimeout(250);
        }
        const armar = boton(page, 'Armar el crucigrama', 'Build the crossword');
        if (await armar.count()) { await armar.click(); await page.waitForTimeout(450); }
        const ver = boton(page, 'Ver las respuestas', 'Show answers');
        if (await ver.count()) { await ver.click(); await page.waitForTimeout(350); }
      },
    },
    {
      /* Las cinco del cierre abren vacías: hay que escribir antes de medir. */
      nombre: 'Cierre · el muro',
      ir: async (page) => {
        await pestana(page, 'El muro', 'The wall');
        const volver = boton(page, 'empezar de nuevo', 'start over', 'Cambiar el molde', 'Change the frame');
        if (await volver.count()) { await volver.click(); await page.waitForTimeout(300); }
        const molde = page.locator('textarea:visible').first();
        if (await molde.count()) { await molde.fill('Hoy pude ______, y hace un mes no.'); await page.waitForTimeout(250); }
        const proy = boton(page, 'Proyectar', 'Project it');
        if (await proy.count()) { await proy.click(); await page.waitForTimeout(350); }
        const construir = boton(page, 'A construir el muro', 'Build the wall');
        if (await construir.count()) { await construir.click(); await page.waitForTimeout(300); }
        for (const logro of ['pedir comida', 'entender el audio', 'escribir cinco frases', 'preguntar la hora']) {
          const campo = page.locator('input:visible').first();
          if (!await campo.count()) break;
          await campo.fill(logro);
          const anotar = boton(page, 'Anotar', 'Add');
          if (await anotar.count() && !(await anotar.isDisabled())) { await anotar.click(); await page.waitForTimeout(120); }
        }
        const campo = page.locator('input:visible').first();
        if (await campo.count()) { await campo.fill('pedir comida'); await page.waitForTimeout(250); }
      },
    },
    {
      nombre: 'Cierre · semáforo encendido',
      ir: async (page) => {
        await pestana(page, 'Semáforo', 'Traffic light');
        const otro = boton(page, 'Otro objetivo', 'Another objective', 'Cambiar el objetivo', 'Change the objective');
        if (await otro.count()) { await otro.click(); await page.waitForTimeout(250); }
        const campos = page.locator('input[type="text"]:visible');
        if (await campos.count() >= 2) {
          await campos.nth(0).fill('I can order food in a restaurant.');
          await campos.nth(1).fill('Food · Unit 4');
          await page.waitForTimeout(250);
        }
        const proy = boton(page, 'Proyectar', 'Project it');
        if (await proy.count()) { await proy.click(); await page.waitForTimeout(350); }
        const mas = page.locator('button:visible:has-text("+1")');
        if (await mas.count() === 3) {
          for (let i = 0; i < 4; i++) await mas.nth(0).click();
          for (let i = 0; i < 14; i++) await mas.nth(1).click();
          for (let i = 0; i < 2; i++) await mas.nth(2).click();
        }
        const mostrar = boton(page, 'Mostrar el semáforo', 'Show the traffic light');
        if (await mostrar.count()) { await mostrar.click(); await page.waitForTimeout(600); }
      },
    },
    {
      nombre: 'Cierre · apuesta, apostando',
      ir: async (page) => {
        await pestana(page, 'Apuesta', 'The bet');
        const volver = boton(page, 'Cambiar', 'Change', 'Volver', 'Back');
        if (await volver.count()) { await volver.click(); await page.waitForTimeout(250); }
        const caja = page.locator('textarea:visible').first();
        if (await caja.count()) {
          await caja.fill('Usa «although» en una oración\nDescribe tu fin de semana\nUna pregunta con «how often»\nAlgo que hiciste ayer\nUn plan para el sábado');
          await page.waitForTimeout(250);
        }
        const arrancar = boton(page, 'Proyectar y arrancar', 'Project and start');
        if (await arrancar.count()) { await arrancar.click(); await page.waitForTimeout(350); }
        const apostar = boton(page, 'a apostar', 'place the bet');
        if (await apostar.count()) { await apostar.click(); await page.waitForTimeout(300); }
      },
    },
    {
      nombre: 'Cierre · apuesta, comparando',
      ir: async (page) => {
        await pestana(page, 'Apuesta', 'The bet');
        const corregir = boton(page, 'Ahora corrijan', 'Now check');
        if (await corregir.count()) { await corregir.click(); await page.waitForTimeout(350); }
      },
    },
    {
      nombre: 'Cierre · la duda',
      ir: async (page) => {
        await pestana(page, 'La duda', 'The doubt');
        const otra = boton(page, 'Otra duda', 'Another doubt', 'Cambiar el molde', 'Change the frame');
        if (await otra.count()) { await otra.click(); await page.waitForTimeout(250); }
        const caja = page.locator('textarea:visible').first();
        if (await caja.count()) { await caja.fill('De lo de hoy, todavía no me sale ______.'); await page.waitForTimeout(250); }
        const dets = page.locator('details:visible');
        for (let i = 0; i < await dets.count(); i++) await dets.nth(i).evaluate(d => { d.open = true; });
        await page.waitForTimeout(250);
      },
    },
    {
      nombre: 'Cierre · antes y ahora',
      ir: async (page) => {
        await pestana(page, 'Antes / Ahora', 'Then / Now');
        const otro = boton(page, 'Otro', 'Another one', 'Cambiar', 'Change');
        if (await otro.count()) { await otro.click(); await page.waitForTimeout(250); }
        const campos = page.locator('input[type="text"]:visible');
        if (await campos.count() >= 2) {
          await campos.nth(0).fill('I have seen him yesterday.');
          await campos.nth(1).fill('I saw him yesterday.');
          await page.waitForTimeout(250);
        }
        const dets = page.locator('details:visible');
        for (let i = 0; i < await dets.count(); i++) await dets.nth(i).evaluate(d => { d.open = true; });
        await page.waitForTimeout(250);
      },
    },
    {
      /* NOTAS con un puntaje que reprueba: la nota roja grande es la que se lee
         proyectada, y la escala desplegada para medir sus campos. */
      nombre: 'Notas',
      ir: async (page) => {
        await pestana(page, 'Notas', 'Grades');
        const puntaje = page.locator('label:visible:has-text("Puntaje obtenido") input, label:visible:has-text("Score") input').first();
        if (await puntaje.count()) { await puntaje.fill('20'); await page.waitForTimeout(250); }
        const dets = page.locator('details:visible');
        for (let i = 0; i < await dets.count(); i++) await dets.nth(i).evaluate(d => { d.open = true; });
        await page.waitForTimeout(250);
      },
    },
  ],

  /* Por `aria-label` y comprobando el resultado: si el segundo pase no queda
     en oscuro de verdad, mediría la capa clara dos veces y cantaría verde. */
  cambiarTema: async (page) => {
    const b = page.locator('header button[aria-label="Usar tema oscuro"]').first();
    if (!(await b.count())) throw new Error('no se encontró el conmutador de tema en la cabecera');
    await b.click();
    await page.waitForTimeout(600);
    const tema = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    if (tema !== 'dark') throw new Error(`el segundo pase no quedó en oscuro (data-theme=${tema})`);
  },

  revisados: [],
});
