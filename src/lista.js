/* ============================================================================
   LA LISTA PEGADA
   ----------------------------------------------------------------------------
   Lo que el profesor escribe o pega en las herramientas de clase: los nombres
   del curso para repartir grupos, o los verbos y las preguntas que va a poner
   en la ruleta del warm-up. Es la misma operación —una cosa por línea— y por
   eso vive aquí y no dentro de una herramienta: dos versiones del mismo
   limpiador terminan limpiando distinto.

   Se limpia lo justo:
     · espacios de sobra y líneas en blanco,
     · la numeración que arrastran las listas («1. Ana», «2) What did you do?»),
     · repetidos.

   Lo que NO se toca, a propósito:
     · las COMAS: «Morales, Víctor» es una persona y «yesterday, last week» es
       una sola tarjeta. Partir por comas convertiría media lista en trozos.
     · lo que va entre paréntesis: todavía no sabemos qué añade exactamente la
       lista de Blackboard, y quitar a ciegas lo que no se ha visto es inventar
       una regla. Lo pegado se muestra tal cual, así que la basura se ve.
   ========================================================================== */

export const parsearLista = (texto) => {
  const vistos = new Set();
  return String(texto || '')
    .split(/\r?\n/)
    .map(l => l.replace(/^\s*\d+\s*[.)\-]\s*/, '').trim().replace(/\s+/g, ' '))
    .filter(Boolean)
    .filter(x => {
      const k = x.toLowerCase();
      if (vistos.has(k)) return false;
      vistos.add(k);
      return true;
    });
};

/** Baraja una copia (Fisher-Yates). `azar` se inyecta para poder probarlo. */
export const barajar = (lista, azar = Math.random) => {
  const a = [...lista];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(azar() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
