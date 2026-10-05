/* ============================================================================
   LA LISTA DEL CURSO, DESDE EL HISTÓRICO DE ASISTENCIA
   ----------------------------------------------------------------------------
   El sistema exporta el histórico de asistencia a Excel. Se copia, se pega, y
   de ahí sale quién está HOY en la sala. El profesor no escribe ni un nombre y,
   sobre todo, no apaga a mano a los que faltaron: vienen apagados.

   POR QUÉ EXCEL Y NO EL PDF, que el sistema también ofrece. En el PDF los
   apellidos y el nombre son un solo bloque de texto y hay que adivinar dónde
   cortan; con «RAMÍREZ CANALES JOSÉ» la regla «los dos primeros son apellidos»
   acierta, y con «DE LA FUENTE SOTO ANA» se equivoca sin que nadie lo note. En
   Excel cada uno es su propia columna y el problema no existe.

   SE LEE POR ENCABEZADO, NO POR POSICIÓN. Las etiquetas de la cabecera viven en
   celdas combinadas, así que cuántas columnas vacías quedan a su izquierda es
   cosa de la plantilla y podría cambiar sin avisar. Lo que no cambia es que hay
   una fila con «Apellido Paterno» y otra con «Fecha Clase». De la primera salen
   TODAS las posiciones, incluida en qué columna empiezan las clases.

   DÓNDE ACABA LO REGISTRADO — la trampa de este archivo. Las clases que aún no
   han pasado no vienen vacías: vienen como `S/R`, exactamente igual que una
   inasistencia sin registrar. Por el valor no se distinguen, así que preguntar
   por la última columna con algo devolvería la clase 54 de diciembre y diría
   que no vino nadie. El corte lo da la fila «Fecha Registro de Asistencia»,
   que solo llega hasta la última lista tomada.

   EL RUT NO ENTRA. Se lee su columna para saltarla y nada más: para llamar a
   alguien en clase no hace falta su cédula. Tampoco entra el porcentaje de
   asistencia acumulada — es del expediente del alumno, no de esta clase.

   Y NADA SE GUARDA, que es la regla de las herramientas: lo pegado vive
   mientras la pestaña esté abierta. Por eso ningún fixture de las pruebas lleva
   nombres ni ruts reales.

   Este archivo es PURO —ni React ni DOM— para poder probarlo:
   `tools/check-lista-curso.mjs`.
   ========================================================================== */

/** Sin tildes, sin mayúsculas y sin espacios de sobra: así se comparan rótulos
    que el día de mañana pueden venir escritos de otra manera. */
const norm = (s) => String(s == null ? '' : s).toLowerCase()
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .replace(/\s+/g, ' ').trim();

/**
 * Qué significa cada marca, y si la persona está o no en la sala.
 *
 * `J` es una ausencia con papel, pero ausencia: justificado o no, no está para
 * que le toque hablar. `S/R` y `CS` no dicen nada SOBRE LA PERSONA —una es un
 * olvido de registro y la otra una clase que no se hizo—, así que entra en la
 * sala y se avisa: dejar a alguien fuera del sorteo por un dato que falta es
 * peor que incluirlo de más.
 */
export const ESTADOS = {
  'si':  { presente: true,  nota: null },
  'no':  { presente: false, nota: 'ausente' },
  'j':   { presente: false, nota: 'justificado' },
  's/r': { presente: true,  nota: 'sin registro' },
  'cs':  { presente: true,  nota: 'clase suspendida' },
};

/** Los motivos por los que esto puede no salir. Cada uno se dice en pantalla
    con sus palabras: «no pude leerlo» no ayuda a arreglar nada. */
export const ERRORES = {
  sinCabecera: 'sinCabecera',           // no es un histórico
  sinFechas: 'sinFechas',               // le faltan las filas de fechas
  sinListasTomadas: 'sinListasTomadas', // el curso no tiene ninguna lista pasada
  sinAlumnos: 'sinAlumnos',             // cabecera sí, filas no
  fechaSinClase: 'fechaSinClase',       // ese día no hay clase
  fechaSinLista: 'fechaSinLista',       // hay clase, pero aún no se pasó lista
};

const enFilas = (texto) => String(texto == null ? '' : texto)
  .split(/\r?\n/).map(l => l.split('\t'));

/** El mismo dato viene rotulado «Fecha Clase» en el Excel y «Fecha de Clase» en
    el PDF, así que el «de» se ignora: la diferencia está EN MEDIO del rótulo y
    comparar por prefijo no la salva. Ya comparado así, el prefijo basta: ni
    «fecha clase» ni «fecha registro asistencia» es prefijo de la otra. */
const sinDe = (s) => norm(s).replace(/\bde\b/g, '').replace(/\s+/g, ' ').trim();

/** La fila cuyo primer texto no vacío empieza por `rotulo`. */
const filaRotulada = (filas, rotulo) => {
  const r = sinDe(rotulo);
  for (const f of filas) {
    const i = f.findIndex(c => norm(c));
    if (i >= 0 && sinDe(f[i]).startsWith(r)) return f;
  }
  return null;
};

/**
 * Lee el histórico pegado y devuelve el curso de UNA clase.
 *
 * `fecha` en el formato del archivo (`31-08-26`). Sin ella se toma la última
 * clase con lista pasada, que es la que el profesor quiere el 99 % de las
 * veces — y NO la fecha de exportación: se puede exportar un día sin clase, o
 * antes de pasar lista.
 */
export const leerHistorico = (texto, { fecha = null } = {}) => {
  const filas = enFilas(texto);

  /* El título trae el código del curso. Sirve para rotular lo cargado y para
     que se vea a tiempo cuando el histórico pegado es el de otra sección. */
  const titulo = filas.flat().find(c => /\|\s*\d{2}-\d{2}-\d{4}/.test(String(c))) || '';
  const curso = (String(titulo).match(/:\s*([A-Za-z]{2,}\d+\s*-\s*\S+)/) || [])[1] || null;

  const cab = filas.find(f => f.some(c => norm(c) === 'apellido paterno'));
  if (!cab) return { error: ERRORES.sinCabecera };

  const columnaDe = (rotulo) => cab.findIndex(c => norm(c) === norm(rotulo));
  const cPaterno = columnaDe('apellido paterno');
  const cMaterno = columnaDe('apellido materno');
  const cNombre  = columnaDe('nombre');
  const cPct     = columnaDe('asistencia');
  /* El número de orden, también por cabecera: si la plantilla mete una columna
     antes, la fila del alumno deja de empezar en la posición 0 y un filtro
     anclado ahí se comería el curso entero. */
  const cNumero  = columnaDe('#');
  if (cNombre < 0 || cPct < 0) return { error: ERRORES.sinCabecera };
  /* Las clases empiezan justo después de «Asistencia»: es la última columna de
     datos del alumno y la única frontera que el archivo declara. */
  const c0 = cPct + 1;

  const fClases  = filaRotulada(filas, 'Fecha Clase');
  const fTomadas = filaRotulada(filas, 'Fecha Registro de Asistencia');
  if (!fClases || !fTomadas) return { error: ERRORES.sinFechas };

  const clases  = fClases.slice(c0).map(c => String(c).trim());
  /* POR POSICIÓN, CON HUECOS. Una clase en la que no se pasó lista deja su
     celda de registro vacía, y las siguientes sí traen fecha. Compactar los
     vacíos corría todo una columna: se leía la clase anterior y el curso salía
     con presentes y ausentes cambiados. Cada celda se queda en su columna. */
  const registro = fTomadas.slice(c0).map(c => String(c == null ? '' : c).trim());
  const conLista = clases.map((_, k) => k).filter(k => registro[k]);
  if (!conLista.length) return { error: ERRORES.sinListasTomadas };

  let i = conLista[conLista.length - 1];
  if (fecha) {
    const j = clases.indexOf(String(fecha).trim());
    if (j < 0) return { error: ERRORES.fechaSinClase, fecha };
    if (!registro[j]) return { error: ERRORES.fechaSinLista, fecha };
    i = j;
  }

  const alumnos = [];
  for (const f of filas) {
    /* Una fila de alumno lleva su número de orden. Con esto la leyenda de
       colores y las filas de cabecera se quedan fuera solas. */
    const orden = cNumero >= 0 ? f[cNumero] : f.find(c => String(c == null ? '' : c).trim());
    if (!/^\d+$/.test(String(orden == null ? '' : orden).trim())) continue;
    const paterno = String(f[cPaterno] == null ? '' : f[cPaterno]).trim();
    const nombre  = String(f[cNombre] == null ? '' : f[cNombre]).trim();
    if (!paterno || !nombre) continue;

    const marca = norm(f[c0 + i]);
    const e = ESTADOS[marca] || { presente: true, nota: 'desconocido' };
    alumnos.push({
      nombre,
      paterno,
      materno: String(f[cMaterno] == null ? '' : f[cMaterno]).trim(),
      /* Lo que se proyecta y lo que se dice en voz alta. El apellido NO sobra:
         un curso de 25 trae dos Ibarra y dos Duarte, y «Ibarra» a secas hace que
         se miren entre ellos. El segundo nombre sí sobra. */
      corto: `${nombre.split(/\s+/)[0]} ${paterno}`,
      presente: e.presente,
      nota: e.nota,
    });
  }
  if (!alumnos.length) return { error: ERRORES.sinAlumnos };

  return {
    curso,
    fecha: clases[i],
    clase: i + 1,
    /* Para poder avisar «estás mirando el viernes pasado»: si el profesor pidió
       una fecha anterior, esta dice cuál es la última que hay. */
    ultimaTomada: clases[conLista[conLista.length - 1]],
    /* Las fechas con lista pasada, por si se quiere ofrecer elegir otra. */
    fechasTomadas: conLista.map(k => clases[k]),
    alumnos,
    presentes: alumnos.filter(a => a.presente),
    ausentes: alumnos.filter(a => !a.presente),
  };
};

/** ¿Esto que pegaron es un histórico, o es la lista de nombres de siempre?
    Barato a propósito: se llama en cada tecla del textarea. */
export const pareceHistorico = (texto) => {
  const t = String(texto == null ? '' : texto);
  if (!t.includes('\t')) return false;
  return /apellido\s+paterno/i.test(t.normalize('NFD').replace(/[\u0300-\u036f]/g, ''));
};
