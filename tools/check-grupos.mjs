/* Los grupos al azar, comprobados.
   ----------------------------------------------------------------------------
   Un reparto tiene dos formas de fallar que nadie nota mirando: que alguien
   quede fuera (o dos veces) y que los tamaños se desnivelen. Las dos se ven
   solo cuando ya estás en clase repartiendo, así que se prueban aquí.

   Y la tercera, la que motivó el modo por rondas: «de a cuatro» con nueve
   personas no puede dejar 4+4+1. Un alumno trabajando solo no es un grupo.

   Correr:  node tools/check-grupos.mjs        (desde Grammar HUB/) */
import { repartir } from '../src/grupos.js';
import { parsearLista as parsearNombres, barajar } from '../src/lista.js';

let problemas = 0;
const fallo = (m) => { console.log('   ✗ ' + m); problemas++; };
const ok = (m) => console.log('   ✓ ' + m);

/* Azar reproducible: sin esto, un fallo de reparto aparecería una vez de cada
   diez ejecuciones y nadie sabría por qué. */
const azarFijo = (semilla) => () => {
  semilla = (semilla * 1664525 + 1013904223) % 4294967296;
  return semilla / 4294967296;
};

console.log('\nla lista pegada se limpia, y solo lo que hay que limpiar');
{
  const nombres = parsearNombres(
    '  Ana Pérez \n\n1. Luis Soto\n2) María  López\nAna Pérez\nMorales, Víctor\n   \n'
  );
  const esperado = ['Ana Pérez', 'Luis Soto', 'María López', 'Morales, Víctor'];
  if (JSON.stringify(nombres) !== JSON.stringify(esperado)) {
    fallo(`quedó ${JSON.stringify(nombres)} y se esperaba ${JSON.stringify(esperado)}`);
  } else {
    ok('espacios, líneas vacías, numeración y repetidos fuera');
    ok('la coma NO parte: «Morales, Víctor» sigue siendo una persona');
  }
  if (parsearNombres('').length || parsearNombres(null).length) fallo('una lista vacía debería dar cero nombres');
}

console.log('\nnadie se queda fuera y nadie sale dos veces');
{
  const curso = Array.from({ length: 30 }, (_, i) => `Alumno ${i + 1}`);
  for (const [modo, n] of [['porGrupo', 4], ['porGrupo', 3], ['cantidad', 5], ['cantidad', 7]]) {
    for (let s = 1; s <= 5; s++) {
      const grupos = repartir(curso, { modo, n, azar: azarFijo(s) });
      const todos = grupos.flat();
      const unicos = new Set(todos);
      if (todos.length !== curso.length || unicos.size !== curso.length) {
        fallo(`${modo} ${n} (semilla ${s}): ${todos.length} repartidos, ${unicos.size} distintos, de ${curso.length}`);
      }
    }
  }
  if (!problemas) ok('30 alumnos, cuatro configuraciones, cinco barajadas cada una');
}

console.log('\nlos tamaños no se desnivelan');
{
  let mal = 0;
  for (let total = 2; total <= 30; total++) {
    const curso = Array.from({ length: total }, (_, i) => `A${i}`);
    for (const [modo, n] of [['porGrupo', 2], ['porGrupo', 4], ['porGrupo', 5], ['cantidad', 3], ['cantidad', 6]]) {
      const tam = repartir(curso, { modo, n, azar: azarFijo(total) }).map(g => g.length);
      if (Math.max(...tam) - Math.min(...tam) > 1) {
        fallo(`${total} personas, ${modo} ${n}: tamaños ${tam.join('+')}`);
        mal++;
      }
    }
  }
  if (!mal) ok('de 2 a 30 personas, ningún grupo se diferencia en más de uno');
}

console.log('\nel caso que motivó el reparto por rondas');
{
  const nueve = Array.from({ length: 9 }, (_, i) => `A${i}`);
  const tam = repartir(nueve, { modo: 'porGrupo', n: 4, azar: azarFijo(3) }).map(g => g.length).sort();
  if (tam.join('+') !== '3+3+3') fallo(`nueve «de a cuatro» dio ${tam.join('+')}, y debería dar 3+3+3`);
  else ok('nueve personas «de a cuatro» → 3+3+3, nadie trabaja solo');

  const cinco = repartir(['a', 'b', 'c', 'd', 'e'], { modo: 'porGrupo', n: 4, azar: azarFijo(9) }).map(g => g.length).sort();
  if (cinco.join('+') !== '2+3') fallo(`cinco «de a cuatro» dio ${cinco.join('+')}`);
  else ok('cinco «de a cuatro» → 3+2');
}

console.log('\nlos bordes no revientan');
{
  if (repartir([], { modo: 'porGrupo', n: 4 }).length) fallo('sin nombres debería devolver cero grupos');
  else ok('lista vacía → ningún grupo');

  const tres = repartir(['a', 'b', 'c'], { modo: 'cantidad', n: 10, azar: azarFijo(1) });
  if (tres.length !== 3) fallo(`pedir 10 grupos con 3 personas dio ${tres.length} grupos`);
  else ok('más grupos que personas → un grupo por persona, sin grupos vacíos');

  const uno = repartir(['a', 'b', 'c'], { modo: 'porGrupo', n: 99, azar: azarFijo(1) });
  if (uno.length !== 1 || uno[0].length !== 3) fallo('un grupo más grande que el curso debería dejar a todos juntos');
  else ok('«de a 99» con 3 personas → un solo grupo');

  if (barajar(['a', 'b', 'c']).length !== 3) fallo('barajar no puede perder ni añadir nombres');
}

console.log(problemas ? `\n✗ ${problemas} problema(s)` : '\nGRUPOS OK');
process.exit(problemas ? 1 : 0);
