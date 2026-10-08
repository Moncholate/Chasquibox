/* ============================================================================
   SEMÁFORO · la primera herramienta de CIERRE
   ----------------------------------------------------------------------------
   Las otras cuatro sirven para empezar la clase y repartir. Esta es para los
   últimos cinco minutos: el curso mira lo que acaba de hacer y dice dónde está.

   TRES FASES, UNA ACCIÓN CADA UNA, que es la regla de la sección:
     PREPARAR  elegir el objetivo del día (dos toques)   → «Proyectar»
     CONTAR    manos alzadas, sin que se vea el resultado → «Mostrar el semáforo»
     MOSTRAR   el semáforo encendido                      → «Contar otra vez»

   EL CONTEO NO SE VE MIENTRAS SE CUENTA, y es la decisión que más cambia lo que
   pasa en la sala. La autoevaluación pública tiene un problema viejo: si el
   verde ya se ve lleno, el que dudaba levanta la mano en verde. Mientras se
   cuenta solo se proyecta cuántas manos van —que el profesor necesita para no
   perder la cuenta— y no CÓMO van repartidas. El semáforo aparece de golpe al
   final, que además le da su momento.

   EL OBJETIVO LO ESCRIBE EL DOCENTE, y no hay nada puesto. Se componía de un
   tiempo del curso más una de las tres formas, y eso presuponía que la clase
   había sido de gramática: en una unidad de vocabulario no había nada que
   editar, había que salirse de la herramienta.

   Y NO HAY SUGERENCIAS TAMPOCO. Hubo, plegadas y opcionales, con la idea de no
   perder los cinco segundos los días de gramática. El profesor las probó y no
   funcionó: lo que ofrece una herramienta orienta lo que se hace con ella
   —aunque esté plegado— y una lista de tiempos verbales insinúa que el cierre
   va de tiempos verbales. Confunde más de lo que ahorra. Fuera, 1-sep-2026.

   EL IDIOMA VA PARTIDO A PROPÓSITO: el objetivo en inglés y los tres niveles en
   español. No es un descuido ni una traducción a medias. El objetivo es
   contenido de la clase y se dice en el idioma que se enseña; la reflexión
   sobre el propio aprendizaje es pensamiento fino, y en Básico I no existe el
   vocabulario para hacerla en inglés — pedirla así devuelve el silencio o una
   copia del ejemplo. Decisión del profesor, 31-ago-2026. Si algún día la suite
   atiende a alguien que no hable español, esta es la línea que hay que tocar.

   La aritmética de las luces está en `../semaforo.js`, con pruebas
   (`tools/check-semaforo.mjs`): un mapeo mal calibrado no da error, da una
   pantalla creíble que dice otra cosa.
   ========================================================================== */
import React, { useState } from 'react';
import { lectura, sumar, VACIO } from '../semaforo';
import { APAGADO, ENLACE } from '../ui';
import { Panel, Escenario, Accion, Cabeza } from '../zonas';
import BotonCelulares from './BotonCelulares';

/* Colores de LÁMPARA, no de interfaz: verde, ámbar y rojo de semáforo de calle.
   Van fijos en los dos temas porque la carcasa también es fija — es un objeto
   oscuro, como el propio semáforo, y no una tarjeta de la página. Por eso
   tampoco pasan por la capa de modo oscuro: nada que invertir. */
const LAMPARA = {
  verde: '#22c55e',
  ambar: '#f59e0b',
  rojo:  '#ef4444',
};

/* LA TINTA NO ES LA LÁMPARA. El número de cada nivel va en su color para atarlo
   a su luz, pero el rojo de lámpara sobre la carcasa da 4,4:1 y el texto tiene
   un suelo que un gráfico no tiene: una lámpara puede ser todo lo tenue que
   haga falta —eso ES el dato— y un número, no. Se sube un escalón cada uno.
   Los tres pasan holgados sobre la carcasa; el rojo es el que lo necesitaba. */
const TINTA = {
  verde: '#4ade80',   /* 10.6:1 sobre la carcasa */
  ambar: '#fbbf24',   /* 10.5:1 */
  rojo:  '#fca5a5',   /*  8.7:1 · era 4.4:1 con el rojo de lámpara */
};
const CARCASA = '#12172a';
const CARCASA_INT = '#080b16';

/* Los tres niveles, en español y por orden de dominio.

   SON CRITERIOS, y esa es la regla que no se puede aflojar al reescribirlos:
   cada uno se comprueba solo. «Lo entendí» no vale —no hay forma de saber si
   es verdad hasta que lo intentas—, y «me gustó» tampoco. Los tres hablan de
   HACER, que es lo único observable desde dentro.

   Y ESTÁN EN CHILENO, no en español de manual. Decían «me sale» y «no me sale
   solo», que es de España: el profesor lo cazó a la primera. Un criterio que
   suena a traducción se lee dos veces, y estos se leen proyectados y de lejos.
   Verbo «poder hacer» en los tres, con el clítico delante —«lo puedo hacer» y
   no «puedo hacerlo»—, que es como se dice acá. */
const NIVELES = [
  { id: 'verde', texto: 'Se lo puedo explicar a alguien' },
  { id: 'ambar', texto: 'Lo puedo hacer, pero mirando el ejemplo' },
  { id: 'rojo',  texto: 'Todavía no lo puedo hacer solo' },
];

const Semaforo = ({ lang = 'es' }) => {
  const es = lang === 'es';

  const [fase, setFase] = useState('preparar');
  /* EL OBJETIVO ES UN TEXTO, y empieza vacío. Antes era la composición de un
     tiempo y una forma, y eso decidía por el docente de qué había sido la clase. */
  const [objetivo, setObjetivo] = useState('');
  const [rotulo, setRotulo] = useState('');     // el nombre del tiempo, si vino de una sugerencia
  const [conteo, setConteo] = useState(VACIO);

  const r = lectura(conteo);
  const frase = objetivo.trim();
  const titulo = rotulo || null;


  const empezar = () => { setConteo(VACIO); setFase('contar'); };

  /* Lo que se lee de lejos va al escenario y crece con él; los controles van
     al panel.

     Y las medidas van atadas al ALTO además de al ancho. Aquí hay carcasa, tres
     niveles y la lectura de abajo, y con el ancho solo, un proyector de
     1280×720 —el más chico que se encuentra en una sala— dejaba la frase final
     fuera de la pantalla. `min()` deja que mande la dimensión que escasee.
     Contra el ESCENARIO (cqw/cqh), no la ventana. Va en `style` y no en
     clases: son fórmulas, no una escala. */
  const M = {
    rotulo:  'max(0.75rem, min(2cqw, 3.6cqh))',
    frase:   'max(1.1rem, min(3.8cqw, 7cqh))',
    lampara: 'max(2.5rem, min(11.5cqh, 8cqw))',
    nivel:   'max(0.85rem, min(1.9cqw, 3.6cqh))',
    numero:  'max(0.75rem, min(1.5cqw, 2.8cqh))',
    lectura: 'max(0.95rem, min(2.2cqw, 4cqh))',
  };
  const Objetivo = () => (
    <div className="text-center">
      {/* `--marca`, no `text-indigo-600`. El rótulo del tiempo va sobre el fondo
          de la PÁGINA, no sobre una tarjeta blanca, y ahí la capa oscura no
          tiene nada que invertir: el índigo-600 daba 3,07:1 y lo cazó la sonda.
          La variable es justo lo que los tokens ofrecen para «el acento de
          interfaz», con un valor por tema: 6,1:1 en los dos. */}
      {titulo && (
        <p className="font-bold uppercase tracking-wider"
           style={{ color: 'var(--marca)', fontSize: M.rotulo }}>
          {titulo}
        </p>
      )}
      <p className="font-bold text-slate-900 leading-tight mt-2" style={{ fontSize: M.frase }}>
        {frase}
      </p>
    </div>
  );

  /* La carcasa con las tres lámparas. El hueco de cada lámpara mide siempre lo
     máximo aunque la luz esté chica: si el hueco encogiera, las tres se moverían
     de sitio en cada conteo y el semáforo dejaría de ser un objeto quieto. */
  const maxLampara = M.lampara;
  const Luz = ({ id, brillo, tamano, votos, texto, encendido }) => (
    <div className="flex items-center gap-[2cqw]">
      <div
        className="relative shrink-0 flex items-center justify-center"
        style={{ width: maxLampara, height: maxLampara }}
      >
        {/* El cristal: se ve siempre, esté la luz encendida o no. */}
        <span
          aria-hidden="true"
          className="absolute rounded-full"
          style={{ width: '100%', height: '100%', background: CARCASA_INT, border: '1px solid rgba(255,255,255,.07)' }}
        />
        <span
          aria-hidden="true"
          className="relative rounded-full transition-all duration-500"
          style={{
            width: `calc(${maxLampara} * ${encendido ? tamano : 0.45} * 0.86)`,
            height: `calc(${maxLampara} * ${encendido ? tamano : 0.45} * 0.86)`,
            background: LAMPARA[id],
            opacity: encendido ? brillo : 0.12,
            /* El halo crece con el brillo: es lo que hace que una luz encendida
               se lea como encendida y no como un círculo de color. */
            boxShadow: encendido && brillo > 0.3
              ? `0 0 ${Math.round(brillo * 60)}px ${LAMPARA[id]}`
              : 'none',
          }}
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-white leading-snug" style={{ fontSize: M.nivel }}>
          {texto}
        </p>
        {encendido && (
          <p className="font-bold tabular-nums" style={{ color: TINTA[id], fontSize: M.numero }}>
            {votos}
          </p>
        )}
      </div>
    </div>
  );

  const Carcasa = ({ encendido }) => (
    <div className="mx-auto rounded-3xl px-[3cqw] py-[3cqh]" style={{ background: CARCASA, maxWidth: '54rem' }}>
      <div className="flex flex-col gap-[2cqh]">
        {NIVELES.map(n => {
          const l = r.luces.find(x => x.id === n.id);
          return <Luz key={n.id} id={n.id} texto={n.texto} encendido={encendido}
                      brillo={l.brillo} tamano={l.tamano} votos={l.votos} />;
        })}
      </div>
    </div>
  );

  const manos = `${r.total} ${es ? (r.total === 1 ? 'mano contada' : 'manos contadas') : (r.total === 1 ? 'hand counted' : 'hands counted')}`;

  return (
    <>
      <Escenario>
        {/* ── PREPARAR: el objetivo como lo verá el curso ─────────────────── */}
        {fase === 'preparar' && (
          frase ? <div className="w-full"><Objetivo /></div> : (
            <p className="text-muted text-center max-w-sm">
              {es ? 'Escribe el objetivo de hoy en el panel de la derecha: aquí se ve como lo verá el curso.'
                  : 'Write today’s objective in the panel on the right: here it shows as the class will see it.'}
            </p>
          )
        )}

        {/* ── CONTAR: los tres niveles SIN luces. El curso tiene que poder
            leerlos para levantar la mano, pero no ver cómo va el reparto. ── */}
        {fase === 'contar' && (
          <div className="w-full space-y-[3cqh]">
            <Objetivo />
            <Carcasa encendido={false} />
            {/* Cuántas van, NO cómo van repartidas: el profesor necesita lo
                primero para no perder la cuenta y lo segundo es justo lo que no
                puede verse todavía. */}
            <p className="text-center text-muted tabular-nums" style={{ fontSize: M.numero }}>{manos}</p>
          </div>
        )}

        {/* ── MOSTRAR ─────────────────────────────────────────────────────── */}
        {fase === 'mostrar' && (
          <div className="w-full space-y-[3cqh]" aria-live="polite">
            <Objetivo />
            <Carcasa encendido />
            {/* La lectura en una frase, que es lo que se dice en voz alta. Con
                empate no se canta ninguna: elegir por ellos sería inventar. */}
            <p className="text-center font-bold text-slate-900" style={{ fontSize: M.lectura }}>
              {r.dominante
                ? (es ? `El curso está en ${{ verde: 'verde', ambar: 'ámbar', rojo: 'rojo' }[r.dominante]}.`
                      : `The class is on ${{ verde: 'green', ambar: 'amber', rojo: 'red' }[r.dominante]}.`)
                : (es ? 'El curso está repartido.' : 'The class is split.')}
            </p>
          </div>
        )}
      </Escenario>

      <Panel>
        <Cabeza titulo={es ? 'Semáforo' : 'Traffic light'}>
          {es ? 'Para cerrar: el curso se autoevalúa contra un criterio y se ve dónde está.'
              : 'To close the lesson: the class self-assesses against a criterion and sees where it stands.'}
        </Cabeza>

        {fase === 'preparar' && (
          <div className="space-y-4">
            <label className="block">
              <span className="text-xs font-semibold text-slate-600">
                {es ? 'El objetivo de hoy' : 'Today’s objective'}{' '}
                <span className="font-normal text-muted">
                  {es ? '· en inglés, como se lo dirías al curso' : '· in English, as you would say it to the class'}
                </span>
              </span>
              <input
                type="text" value={objetivo}
                onChange={(e) => { setObjetivo(e.target.value); }}
                placeholder={es ? 'Puedo explicar la fotosíntesis con mis palabras.' : 'I can order food in a restaurant.'}
                className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </label>

            {/* Un rótulo opcional encima del objetivo: el tema de la clase.
                Sirve para poner «Food», «Unit 4» o lo que sea que se trabajó. */}
            <label className="block">
              <span className="text-xs font-semibold text-slate-600">
                {es ? 'Tema' : 'Topic'}{' '}
                <span className="font-normal text-muted">{es ? '· opcional, va encima' : '· optional, sits above'}</span>
              </span>
              <input
                type="text" value={rotulo} onChange={(e) => setRotulo(e.target.value)}
                placeholder={es ? 'Unidad 3 · La célula' : 'Food · Unit 4 · Present Perfect'}
                className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </label>
            <BotonCelulares lang={lang} disabled={!frase} actividad={{ tipo: 'semaforo', pregunta: frase }} />
          </div>
        )}

        {fase === 'contar' && (
          <div>
            <p className="text-xs font-semibold text-slate-600 mb-1.5">
              {es ? 'Cuenta las manos' : 'Count the hands'}
            </p>
            <div className="grid grid-cols-3 gap-2">
              {NIVELES.map(n => (
                <button
                  key={n.id}
                  onClick={() => setConteo(c => sumar(c, n.id))}
                  aria-label={`+1 · ${n.texto}`}
                  className="flex flex-col items-center gap-1 py-3 rounded-xl border border-slate-300 bg-white hover:border-slate-400 transition-colors touch-manipulation"
                >
                  <span aria-hidden="true" className="w-5 h-5 rounded-full" style={{ background: LAMPARA[n.id] }} />
                  <span className="text-xs font-bold text-slate-700">+1</span>
                </button>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
              <span className="text-sm text-slate-600 tabular-nums">{manos}</span>
              <button onClick={() => setConteo(VACIO)} disabled={!r.total} className={ENLACE}>
                {es ? 'empezar la cuenta de nuevo' : 'start the count again'}
              </button>
            </div>
            <button onClick={() => setFase('preparar')} className={`mt-4 w-full ${APAGADO}`}>
              {es ? 'Cambiar el objetivo' : 'Change the objective'}
            </button>
          </div>
        )}

        {fase === 'mostrar' && (
          <div className="grid grid-cols-2 gap-2">
            <button onClick={empezar} className={APAGADO}>
              {es ? 'Contar otra vez' : 'Count again'}
            </button>
            <button onClick={() => setFase('preparar')} className={APAGADO}>
              {es ? 'Otro objetivo' : 'Another objective'}
            </button>
          </div>
        )}
      </Panel>

      {fase === 'preparar' && (
        <Accion onClick={empezar} disabled={!frase}>
          {es ? 'Proyectar' : 'Project it'}
        </Accion>
      )}
      {fase === 'contar' && (
        <Accion onClick={() => setFase('mostrar')} disabled={!r.total}>
          {es ? 'Mostrar el semáforo' : 'Show the traffic light'}
        </Accion>
      )}
    </>
  );
};

export default Semaforo;
