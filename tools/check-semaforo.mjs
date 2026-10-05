/* El semáforo del cierre, comprobado.
   ----------------------------------------------------------------------------
   Aquí lo que se rompe no es una excepción, es una MENTIRA A LA SALA: el
   semáforo se proyecta y el curso lee su estado en él. Un mapeo mal calibrado
   no da error, da una pantalla creíble que dice otra cosa.

   Las tres formas de mentir, y por eso están probadas:

     1. Que la intensidad se normalice a la luz más votada. Entonces un curso
        80 % en rojo se ve IDÉNTICO a uno 80 % en verde —la luz de turno a tope
        y las otras dos apagadas— y la herramienta deja de decir cómo va la
        clase para decir solo cuál ganó.
     2. Que una luz sin votos desaparezca. «Nadie eligió esto» es información;
        un hueco negro donde había una lámpara no la comunica.
     3. Que se cante un dominante cuando hay empate. Decir «el curso está en
        ámbar» con 10 y 10 es elegir por ellos.

   Correr:  node tools/check-semaforo.mjs        (desde Grammar HUB/) */
import { lectura, sumar, LUCES, PLENO, BRILLO_MIN, TAMANO_MIN, VACIO } from '../src/semaforo.js';

let problemas = 0;
const fallo = (m) => { console.log('   ✗ ' + m); problemas++; };
const ok = (m) => console.log('   ✓ ' + m);
const luz = (r, id) => r.luces.find(l => l.id === id);
const casi = (a, b) => Math.abs(a - b) < 1e-9;

console.log('\nsin votos, el semáforo está apagado pero entero');
{
  const r = lectura(VACIO);
  if (r.total !== 0) fallo(`total ${r.total}`);
  else if (r.dominante !== null || r.empate) fallo('sin votos no puede haber dominante ni empate');
  else if (r.luces.length !== 3) fallo('tienen que seguir siendo tres luces');
  else ok('cero votos, cero dominante, tres lámparas');

  const apagadas = r.luces.every(l => casi(l.brillo, BRILLO_MIN) && casi(l.tamano, TAMANO_MIN));
  if (apagadas) ok('las tres al mínimo, que es visible: una lámpara apagada sigue siendo una lámpara');
  else fallo('alguna luz no quedó en el mínimo');
  if (r.luces.every(l => l.brillo > 0 && l.tamano > 0)) ok('ninguna desaparece');
  else fallo('una luz llegó a cero y desaparecería de la pantalla');
}

console.log('\nla intensidad es respecto al CURSO, no a la luz más votada');
{
  /* El caso que da nombre a todo esto. Los dos cursos tienen la misma FORMA
     —una luz con 16 de 20— y tienen que verse igual de intensos, pero en luces
     distintas. Y sobre todo: un curso repartido NO puede verse como uno
     volcado. */
  const casiTodoVerde = lectura({ verde: 16, ambar: 3, rojo: 1 });
  const casiTodoRojo  = lectura({ verde: 1, ambar: 3, rojo: 16 });
  if (casi(luz(casiTodoVerde, 'verde').brillo, luz(casiTodoRojo, 'rojo').brillo)) {
    ok('16 de 20 brilla igual sea verde o rojo: la escala no depende de qué luz sea');
  } else fallo('la misma proporción dio brillos distintos según el color');

  const repartido = lectura({ verde: 7, ambar: 7, rojo: 6 });
  const volcado   = lectura({ verde: 20, ambar: 0, rojo: 0 });
  if (luz(repartido, 'verde').brillo < luz(volcado, 'verde').brillo) {
    ok('un curso repartido se ve más apagado que uno volcado: es lo que hay que ver');
  } else fallo('repartido y volcado se ven igual de intensos');

  /* La prueba directa contra el error: si se normalizara al máximo, la luz
     mayoritaria estaría SIEMPRE a tope, hubiera 4 votos o 40. */
  const flojo = lectura({ verde: 8, ambar: 7, rojo: 5 });   // mayoría del 40 %
  if (luz(flojo, 'verde').brillo < 1) ok('una mayoría floja (40 %) NO llega al brillo máximo');
  else fallo('la mayoría se normalizó a tope: la escala es relativa y no debería');
}

console.log('\nmedia clase enciende la luz entera, y de ahí no sube');
{
  const mitad = lectura({ verde: 10, ambar: 5, rojo: 5 });     // 50 %
  const casiTodo = lectura({ verde: 19, ambar: 1, rojo: 0 });  // 95 %
  if (casi(luz(mitad, 'verde').brillo, 1) && casi(luz(casiTodo, 'verde').brillo, 1)) {
    ok(`con ${PLENO * 100} % ya está a tope, y por encima no hay más que dar`);
  } else fallo(`la mitad dio ${luz(mitad, 'verde').brillo} y el 95 % dio ${luz(casiTodo, 'verde').brillo}`);

  /* Y el motivo de que el tope no sea 1: sin él, esto se vería a media luz. */
  const mayoria = lectura({ verde: 3, ambar: 14, rojo: 3 });   // 70 %
  if (casi(luz(mayoria, 'ambar').brillo, 1)) ok('una mayoría clara se ve ENCENDIDA, no a media luz');
  else fallo('una mayoría del 70 % no llegó a encenderse del todo');
}

console.log('\nlas dos señales se mueven juntas');
{
  const r = lectura({ verde: 4, ambar: 14, rojo: 2 });
  const orden = (k) => [...r.luces].sort((a, b) => b[k] - a[k]).map(l => l.id).join('>');
  if (orden('brillo') === orden('tamano') && orden('brillo') === 'ambar>verde>rojo') {
    ok('brillo y tamaño ordenan las tres luces igual: la redundancia es redundante de verdad');
  } else fallo(`brillo dio ${orden('brillo')} y tamaño ${orden('tamano')}`);

  if (r.luces.every(l => l.brillo <= 1 && l.tamano <= 1 && l.brillo >= BRILLO_MIN && l.tamano >= TAMANO_MIN)) {
    ok('las dos se quedan dentro de 0…1');
  } else fallo('alguna señal se salió del rango');
}

console.log('\nquién manda, y cuándo nadie manda');
{
  const r = lectura({ verde: 4, ambar: 14, rojo: 2 });
  if (r.dominante === 'ambar' && !r.empate) ok('«el curso está en ámbar»');
  else fallo(`dominante ${r.dominante}`);

  const e = lectura({ verde: 10, ambar: 10, rojo: 0 });
  if (e.dominante === null && e.empate) ok('con 10 y 10 no se canta ninguno: elegir por ellos sería inventar');
  else fallo(`el empate dio dominante ${e.dominante}`);

  const tres = lectura({ verde: 5, ambar: 5, rojo: 5 });
  if (tres.dominante === null && tres.empate) ok('empate a tres, tampoco');
  else fallo('el empate a tres cantó un ganador');

  const uno = lectura({ verde: 0, ambar: 0, rojo: 1 });
  if (uno.dominante === 'rojo') ok('un solo voto ya manda, aunque la luz se vea tenue');
  else fallo('con un voto no hubo dominante');
}

console.log('\ncontar manos de pie se falla, así que se puede deshacer');
{
  let c = { ...VACIO };
  for (let i = 0; i < 3; i++) c = sumar(c, 'ambar');
  if (c.ambar !== 3) fallo(`tres toques dieron ${c.ambar}`);
  else ok('tres toques, tres manos');

  c = sumar(c, 'ambar', -1);
  if (c.ambar === 2) ok('deshacer resta una');
  else fallo(`deshacer dejó ${c.ambar}`);

  c = sumar(sumar(sumar(c, 'ambar', -1), 'ambar', -1), 'ambar', -1);
  if (c.ambar === 0) ok('deshacer de más no baja de cero');
  else fallo(`deshacer de más dejó ${c.ambar}`);

  if (LUCES.every(l => l in sumar(VACIO, 'verde'))) ok('sumar no pierde las otras luces');
  else fallo('sumar se comió alguna luz');
}

console.log('\nlo que llegue, llega: la pantalla no puede reventar');
{
  const casos = [
    [undefined, 'sin conteo'],
    [null, 'null'],
    [{}, 'un objeto vacío'],
    [{ verde: -5, ambar: 'tres', rojo: NaN }, 'basura'],
    [{ verde: 1.7, ambar: 2.2, rojo: 0 }, 'decimales'],
    [{ verde: 3, morado: 9 }, 'una luz que no existe'],
  ];
  for (const [entrada, que] of casos) {
    try {
      const r = lectura(entrada);
      const sano = r.luces.length === 3
        && r.luces.every(l => Number.isFinite(l.brillo) && Number.isFinite(l.tamano) && l.votos >= 0)
        && Number.isFinite(r.total);
      if (sano) ok(`${que} → tres luces sanas`);
      else fallo(`${que} dejó el semáforo en ${JSON.stringify(r)}`);
    } catch (e) {
      fallo(`${que} lanzó ${e.message}`);
    }
  }
  if (lectura({ verde: 1.7, ambar: 2.2, rojo: 0 }).total !== 3) fallo('los decimales no se truncaron a manos enteras');
  else ok('media mano no existe: se trunca');
}

console.log(problemas ? `\n✗ ${problemas} problema(s)` : '\nSEMÁFORO OK');
process.exit(problemas ? 1 : 0);
