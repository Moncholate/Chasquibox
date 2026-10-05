/* El histórico de asistencia pegado, comprobado.
   ----------------------------------------------------------------------------
   Esto lee un archivo que no controlamos: lo exporta el sistema de la
   institución y puede cambiar de plantilla sin avisar. Las tres formas de que
   falle en silencio —y por eso se prueban aquí— son:

     1. Devolver la clase equivocada. Las clases futuras vienen como `S/R`,
        igual que una inasistencia sin registrar, así que buscar «la última
        columna con algo» daría la clase 54 de diciembre y diría que no vino
        nadie. Un profesor mirando 25 nombres tachados no piensa «se equivocó de
        columna», piensa «se cayó el sistema».
     2. Cortar mal los nombres. En Excel vienen en tres columnas y no hay nada
        que adivinar, pero solo mientras se lean POR ENCABEZADO: si alguien lo
        cambia a posiciones fijas, la primera plantilla con una columna de más
        deja al curso entero con el nombre corrido.
     3. Tragarse un texto que no es un histórico y devolver una lista vacía en
        vez de decir qué pasó.

   NINGÚN NOMBRE NI RUT REAL EN ESTE ARCHIVO, y no es un detalle: los de verdad
   son de personas y la regla de las herramientas de clase es que no queden en
   ningún repositorio. Los de aquí están inventados.

   Correr:  node tools/check-lista-curso.mjs        (desde Grammar HUB/) */
import { leerHistorico, pareceHistorico, ERRORES } from '../src/listaCurso.js';

let problemas = 0;
const fallo = (m) => { console.log('   ✗ ' + m); problemas++; };
const ok = (m) => console.log('   ✓ ' + m);
const igual = (a, b, m) => (JSON.stringify(a) === JSON.stringify(b) ? ok(m) : fallo(`${m} — quedó ${JSON.stringify(a)}`));

/* ── Un histórico de mentira, con la forma del de verdad ─────────────────────
   Rótulos en celdas combinadas (columnas vacías a la izquierda), la leyenda de
   colores arriba, catorce clases y solo diez con lista pasada. */
const T = '\t';
const CLASES = ['10-08-26', '12-08-26', '14-08-26', '17-08-26', '19-08-26', '21-08-26',
                '24-08-26', '26-08-26', '28-08-26', '31-08-26', '02-09-26', '04-09-26',
                '07-09-26', '09-09-26'];
const TOMADAS = 10;

/* Siete alumnos con las cinco marcas que el archivo usa. La última columna
   tomada (la 10) es la que la lectura por defecto tiene que devolver. */
const FILAS = [
  { ap: 'Ramirez',  am: 'Canales', n: 'Ana',           pct: '20%',  e: ['NO', 'NO', 'NO', 'NO', 'SI', 'J', 'SI', 'NO', 'NO', 'NO'] },
  { ap: 'Soto',     am: 'Pinto',   n: 'Bruno Andres',  pct: '0%',   e: ['NO', 'NO', 'NO', 'NO', 'NO', 'NO', 'NO', 'NO', 'NO', 'NO'] },
  { ap: 'Ramirez',  am: 'Vera',    n: 'Carla',         pct: '80%',  e: ['SI', 'SI', 'SI', 'SI', 'NO', 'SI', 'SI', 'SI', 'NO', 'SI'] },
  { ap: 'De La Fuente', am: 'Soto', n: 'Dario',        pct: '60%',  e: ['S/R', 'S/R', 'SI', 'SI', 'NO', 'SI', 'SI', 'NO', 'SI', 'SI'] },
  { ap: 'Nunez',    am: 'Lara',    n: 'Elena',         pct: '80%',  e: ['SI', 'SI', 'SI', 'SI', 'SI', 'SI', 'NO', 'SI', 'SI', 'NO'] },
  { ap: 'Nunez',    am: 'Paz',     n: 'Felipe',        pct: '100%', e: ['SI', 'SI', 'SI', 'SI', 'SI', 'SI', 'SI', 'SI', 'SI', 'SI'] },
  { ap: 'Ortiz',    am: 'Rivas',   n: 'Gabriela',      pct: '60%',  e: ['CS', 'CS', 'S/R', 'NO', 'SI', 'SI', 'SI', 'SI', 'SI', 'S/R'] },
];

const armar = ({ clases = CLASES, tomadas = TOMADAS, filas = FILAS, rotuloFechas = 'Fecha Clase' } = {}) => {
  const sangria = T.repeat(5);
  const L = [
    'Histórico Asistencia Todo : INI5131-002D | 31-08-2026 14:42',
    '',
    T + 'CLASE SUSPENDIDA',
    T + 'CLASE NO REGISTRADA',
    T + 'CLASE NO IMPARTIDA',
    '',
    sangria + 'Número Clase' + T + clases.map((_, i) => i + 1).join(T),
    sangria + 'Modalidad Clase' + T + clases.map(() => 'TE').join(T),
    sangria + 'Tipo' + T + clases.map(() => 'R').join(T),
    sangria + rotuloFechas + T + clases.join(T),
    sangria + 'Fecha Registro de Asistencia' + T + clases.slice(0, tomadas).join(T),
    ['#', 'Rut Alumno', 'Apellido Paterno', 'Apellido Materno', 'Nombre', 'Asistencia'].join(T) + T.repeat(clases.length),
  ];
  filas.forEach((f, i) => {
    /* Las clases que aún no han pasado vienen `S/R`, no vacías. Es el detalle
       que hace que la fila de fechas registradas sea obligatoria. */
    const cola = Array(Math.max(0, clases.length - f.e.length)).fill('S/R');
    L.push([i + 1, '1000000' + i, f.ap, f.am, f.n, f.pct, ...f.e, ...cola].join(T));
  });
  return L.join('\n');
};

const PEGADO = armar();

console.log('\nsin decirle nada, devuelve la última clase con lista pasada');
{
  const r = leerHistorico(PEGADO);
  if (r.error) fallo(`devolvió el error ${r.error}`);
  else {
    igual([r.curso, r.fecha, r.clase], ['INI5131-002D', '31-08-26', 10],
          'curso, fecha y número de clase');
    /* El corazón del asunto: hay 14 clases y 4 son futuras. Si se leyera la
       última columna con contenido, esto diría «clase 14, 09-09-26». */
    if (r.clase === CLASES.length) fallo('se fue a la última COLUMNA en vez de a la última lista tomada');
    else ok('las cuatro clases futuras (`S/R`) no cuentan como lista tomada');
  }
}

console.log('\nquién está en la sala');
{
  const r = leerHistorico(PEGADO);
  igual(r.presentes.map(a => a.corto), ['Carla Ramirez', 'Dario De La Fuente', 'Felipe Nunez', 'Gabriela Ortiz'],
        'presentes de la clase 10');
  igual(r.ausentes.map(a => a.corto), ['Ana Ramirez', 'Bruno Soto', 'Elena Nunez'],
        'ausentes de la clase 10');
  if (r.presentes.length + r.ausentes.length !== r.alumnos.length) fallo('presentes + ausentes no suman el curso');
  else ok('nadie se queda fuera del reparto');

  const g = r.alumnos.find(a => a.nombre === 'Gabriela');
  if (g.presente && g.nota === 'sin registro') ok('`S/R` entra en la sala, pero anotado: un dato que falta no es una ausencia');
  else fallo(`Gabriela quedó ${JSON.stringify(g)}`);
}

console.log('\nlas cinco marcas del archivo significan lo que tienen que significar');
{
  const dia = (f) => leerHistorico(PEGADO, { fecha: f });
  const de = (r, nombre) => r.alumnos.find(a => a.nombre === nombre);

  const j = de(dia('21-08-26'), 'Ana');
  if (!j.presente && j.nota === 'justificado') ok('`J` es ausencia: justificado o no, no está para que le toque hablar');
  else fallo(`«J» dio ${JSON.stringify(j)}`);

  const cs = de(dia('10-08-26'), 'Gabriela');
  if (cs.presente && cs.nota === 'clase suspendida') ok('`CS` no dice nada sobre la persona: entra');
  else fallo(`«CS» dio ${JSON.stringify(cs)}`);

  const sr = de(dia('10-08-26'), 'Dario');
  if (sr.presente && sr.nota === 'sin registro') ok('`S/R` entra');
  else fallo(`«S/R» dio ${JSON.stringify(sr)}`);

  const si = de(dia('10-08-26'), 'Carla');
  const no = de(dia('10-08-26'), 'Ana');
  if (si.presente && si.nota === null && !no.presente && no.nota === 'ausente') ok('`SI` y `NO`, lo evidente');
  else fallo('SI/NO no salieron como se esperaba');
}

console.log('\nlos nombres no se cortan a ojo');
{
  const r = leerHistorico(PEGADO);
  const d = r.alumnos.find(a => a.nombre === 'Dario');
  /* El caso que hace imposible leer el PDF: tres palabras de apellido paterno.
     «los dos primeros son apellidos» lo partiría en «La Fuente Soto Dario». */
  if (d.paterno === 'De La Fuente' && d.corto === 'Dario De La Fuente') ok('un apellido compuesto sigue entero (viene en su propia columna)');
  else fallo(`el apellido compuesto quedó ${JSON.stringify(d)}`);

  const b = r.alumnos.find(a => a.paterno === 'Soto');
  if (b.corto === 'Bruno Soto') ok('del segundo nombre se prescinde: lo que se dice en voz alta es «Bruno Soto»');
  else fallo(`dos nombres dieron ${b.corto}`);

  /* Dos Ramirez y dos Nunez, como el curso real tiene dos Ibarra y dos Duarte. */
  const cortos = r.alumnos.map(a => a.corto);
  if (new Set(cortos).size === cortos.length) ok('con dos apellidos repetidos, el nombre de pila los distingue');
  else fallo('dos personas quedaron con el mismo rótulo');

  if (r.alumnos.every(a => !('rut' in a) && !('pct' in a) && !('asistencia' in a))) ok('el rut y el porcentaje no entran al resultado');
  else fallo('se coló un dato que no hace falta en clase');
}

console.log('\npedir otra fecha');
{
  const r = leerHistorico(PEGADO, { fecha: '17-08-26' });
  igual([r.fecha, r.clase, r.presentes.length], ['17-08-26', 4, 4], 'la clase 4 tiene otros cuatro presentes');
  if (r.ultimaTomada === '31-08-26') ok('dice cuál es la última con lista, para poder avisar que estás mirando atrás');
  else fallo(`ultimaTomada quedó en ${r.ultimaTomada}`);
  if (r.fechasTomadas.length === TOMADAS) ok('ofrece las diez fechas con lista pasada, ni una más');
  else fallo(`fechasTomadas trajo ${r.fechasTomadas.length}`);
}

console.log('\ncuando no se puede, lo dice con nombre y apellido');
{
  const casos = [
    [leerHistorico(PEGADO, { fecha: '04-09-26' }).error, ERRORES.fechaSinLista, 'una clase que existe pero aún no se pasa lista'],
    [leerHistorico(PEGADO, { fecha: '99-99-99' }).error, ERRORES.fechaSinClase, 'un día sin clase'],
    [leerHistorico('Ana Perez\nLuis Soto').error, ERRORES.sinCabecera, 'una lista de nombres pegada por error'],
    [leerHistorico('').error, ERRORES.sinCabecera, 'nada'],
    [leerHistorico(null).error, ERRORES.sinCabecera, 'null'],
    [leerHistorico(armar({ tomadas: 0 })).error, ERRORES.sinListasTomadas, 'un curso que todavía no empieza'],
    [leerHistorico(armar({ filas: [] })).error, ERRORES.sinAlumnos, 'una cabecera sin alumnos'],
  ];
  for (const [dio, esperado, que] of casos) {
    if (dio === esperado) ok(que + ' → ' + esperado);
    else fallo(`${que}: dio ${dio || 'un resultado'} y se esperaba ${esperado}`);
  }
}

console.log('\naguanta que la plantilla cambie un poco');
{
  /* El mismo dato viene rotulado «Fecha Clase» en el Excel y «Fecha de Clase»
     en el PDF. Se compara por prefijo justo por esto. */
  const pdf = leerHistorico(armar({ rotuloFechas: 'Fecha de Clase' }));
  if (pdf.fecha === '31-08-26') ok('«Fecha Clase» y «Fecha de Clase» son el mismo rótulo');
  else fallo('cambiar el rótulo de las fechas lo rompió');

  /* Si mañana la plantilla mete una columna antes, leer por posición se cae y
     leer por encabezado no. */
  const corrido = PEGADO.split('\n').map(l => (l.trim() ? T + l : l)).join('\n');
  const r = leerHistorico(corrido);
  if (!r.error && r.presentes.length === 4) ok('una columna de más a la izquierda no mueve nada');
  else fallo('se leyó por posición: una columna extra lo descuadró');
}

console.log('\nuna clase sin lista en medio no corre las columnas');
{
  /* Lo que pasó en clase: un día sin lista dejó su celda de registro vacía y
     las clases siguientes sí la traían. Compactar los vacíos hacía leer la
     clase anterior, con presentes y ausentes cambiados. Aquí la clase 3 queda
     sin registro y la última leída tiene que seguir siendo la 10. */
  const conHueco = armar().split('\n').map(l => {
    if (!l.includes('Fecha Registro de Asistencia')) return l;
    const c = l.split(T);
    c[c.indexOf(CLASES[2])] = '';
    return c.join(T);
  }).join('\n');
  const r = leerHistorico(conHueco);
  igual(r.fecha, '31-08-26', 'sigue leyendo la última clase con lista, no la anterior');
  igual(r.presentes.map(a => a.nombre), ['Carla', 'Dario', 'Felipe', 'Gabriela'], 'los presentes son los de ese día');
  igual(r.fechasTomadas.length, TOMADAS - 1, 'la clase sin lista no se ofrece como fecha');
  igual(leerHistorico(conHueco, { fecha: CLASES[2] }).error, ERRORES.fechaSinLista, 'pedir la clase sin lista lo dice');
}

console.log('\nse distingue un histórico de la lista de siempre');
{
  if (pareceHistorico(PEGADO)) ok('reconoce el histórico');
  else fallo('no reconoció un histórico');
  if (!pareceHistorico('Ana Perez\nLuis Soto\nMaría López')) ok('una lista de nombres no lo es');
  else fallo('confundió una lista de nombres con un histórico');
  if (!pareceHistorico('')) ok('el textarea vacío no lo es');
  else fallo('el vacío pasó por histórico');
}

console.log(problemas ? `\n✗ ${problemas} problema(s)` : '\nLISTA DE CURSO OK');
process.exit(problemas ? 1 : 0);
