/* ============================================================================
   LA CALCULADORA DE NOTAS
   ----------------------------------------------------------------------------
   La primera herramienta que no es para la sala sino para DESPUÉS: el docente
   con la pila de pruebas, que tiene el puntaje de cada una y necesita la nota.

   LA ESCALA ES LA CHILENA POR DEFECTO —1,0 a 7,0, aprobación con 4,0, exigencia
   del 60 %— porque es la de la institución. Pero todo se puede cambiar: la
   exigencia la decide cada prueba (una de diagnóstico a 50 %, una final a 70 %),
   y fijarla en el código sería decidir por el docente.

   LA FÓRMULA SON DOS RECTAS, no una, y ahí está lo que se suele hacer mal a
   mano. El puntaje de corte (exigencia × máximo) vale la nota de aprobación;
   por debajo se reparte de la mínima a la de aprobación, y por encima de la de
   aprobación a la máxima. Con una sola recta de 1 a 7 el 4,0 caería en el 50 %
   y la exigencia no significaría nada.

   SE REDONDEA A UNA DECIMAL, hacia arriba desde la centésima 5 (3,95 → 4,0),
   que es como se registran las notas. Y se redondea al FINAL, sobre el valor
   exacto: redondear pasos intermedios desplaza notas en el borde del 4,0, que
   es justo donde un error cuesta un ramo.

   Este archivo es PURO —ni React ni DOM— para poder probarlo:
   `tools/check-notas.mjs`. La pantalla vive en `components/Notas.jsx`.
   ========================================================================== */

/** Escala chilena: la que usa la institución. */
export const ESCALA_CHILE = { min: 1, max: 7, aprobacion: 4, exigencia: 0.6 };

/* `Number.EPSILON` porque 3.95 en coma flotante es 3.9499999…, y sin él la
   nota que más importa —la del borde— se redondearía hacia abajo. */
export const redondear = (n) => Math.round((n + Number.EPSILON) * 10) / 10;

/** ¿La configuración tiene sentido? Devuelve el problema, o null si está bien. */
export function problemaEscala({ min, max, aprobacion, exigencia }, maximo) {
  if (!(maximo > 0)) return 'maximo';
  if (!(min < aprobacion && aprobacion < max)) return 'escala';
  if (!(exigencia > 0 && exigencia < 1)) return 'exigencia';
  return null;
}

/** Nota exacta, sin redondear. El puntaje se acota entre 0 y el máximo. */
export function notaExacta(puntaje, maximo, escala = ESCALA_CHILE) {
  const { min, max, aprobacion, exigencia } = escala;
  const p = Math.min(Math.max(puntaje, 0), maximo);
  const corte = exigencia * maximo;
  if (p < corte) return min + (aprobacion - min) * (p / corte);
  return aprobacion + (max - aprobacion) * ((p - corte) / (maximo - corte));
}

/** La nota como se registra: una decimal. null si la escala no sirve. */
export function nota(puntaje, maximo, escala = ESCALA_CHILE) {
  if (problemaEscala(escala, maximo) || !Number.isFinite(puntaje)) return null;
  return redondear(notaExacta(puntaje, maximo, escala));
}

/** Todos los puntajes de 0 al máximo, de `paso` en `paso`, con su nota. */
export function tabla(maximo, escala = ESCALA_CHILE, paso = 1) {
  if (problemaEscala(escala, maximo) || !(paso > 0)) return [];
  const filas = [];
  /* Se cuenta en pasos enteros y se multiplica, en vez de ir sumando 0,5: la
     suma acumula error y el último puntaje dejaría de ser exactamente el máximo. */
  const n = Math.floor(maximo / paso + 1e-9);
  for (let i = 0; i <= n; i++) {
    const p = Math.round(i * paso * 100) / 100;
    filas.push({ puntaje: p, nota: nota(p, maximo, escala) });
  }
  if (filas[filas.length - 1].puntaje !== maximo) filas.push({ puntaje: maximo, nota: nota(maximo, maximo, escala) });
  return filas;
}

/** El menor puntaje de la tabla que ya aprueba, contando el redondeo. */
export function puntajeParaAprobar(maximo, escala = ESCALA_CHILE, paso = 1) {
  const fila = tabla(maximo, escala, paso).find(f => f.nota >= escala.aprobacion);
  return fila ? fila.puntaje : null;
}

/** «4,0» en español, «4.0» en inglés. Siempre con su decimal. */
export const formatoNota = (n, lang = 'es') =>
  n == null ? '—' : (lang === 'es' ? n.toFixed(1).replace('.', ',') : n.toFixed(1));

/** Puntajes con coma en español: «12,5». */
export const formatoPuntaje = (p, lang = 'es') =>
  lang === 'es' ? String(p).replace('.', ',') : String(p);

/** Lee un número escrito con coma o con punto. NaN si no es número. */
export const leerNumero = (texto) => {
  const t = String(texto ?? '').trim().replace(',', '.');
  return t === '' ? NaN : Number(t);
};
