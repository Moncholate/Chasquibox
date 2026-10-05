/* La calculadora de notas, comprobada.
   ----------------------------------------------------------------------------
   Aquí un error no se ve: una nota mal calculada parece una nota. Y el lugar
   donde más cuesta es el borde del 4,0, que es donde se decide si alguien
   aprueba. Por eso las pruebas se concentran ahí.

   Correr:  node tools/check-notas.mjs        (desde Grammar HUB/) */
import { nota, tabla, puntajeParaAprobar, problemaEscala, formatoNota, leerNumero, ESCALA_CHILE } from '../src/notas.js';

let problemas = 0;
const fallo = (m) => { console.log('   ✗ ' + m); problemas++; };
const ok = (m) => console.log('   ✓ ' + m);
const espera = (desc, real, esperado) =>
  real === esperado ? ok(`${desc} → ${real}`) : fallo(`${desc} → ${real}, se esperaba ${esperado}`);

console.log('\nescala chilena, 60 puntos, 60 %');
espera('0 puntos', nota(0, 60), 1);
espera('60 puntos', nota(60, 60), 7);
espera('36 puntos (el corte)', nota(36, 60), 4);
espera('18 puntos (mitad del tramo bajo)', nota(18, 60), 2.5);
espera('48 puntos (mitad del tramo alto)', nota(48, 60), 5.5);

console.log('\nel borde del 4,0: dos rectas, no una');
/* Con una sola recta de 1 a 7, 30 de 60 darían 4,0. Con exigencia 60 % no. */
espera('30 de 60 NO aprueba', nota(30, 60) < 4, true);
espera('35 de 60', nota(35, 60), 3.9);

console.log('\nredondeo: desde la centésima 5, hacia arriba');
/* 79 de 100: 4 + 3·19/40 = 5,425 → 5,4. Y el borde: 59 de 100 da 3,95
   exacto, que en coma flotante es 3,9499… y sin cuidado se registraría 3,9. */
espera('79 de 100', nota(79, 100), 5.4);
espera('59 de 100 (3,95 exacto → 4,0)', nota(59, 100), 4);
espera('58 de 100 (3,9)', nota(58, 100), 3.9);


console.log('\nfuera de rango se acota, no se inventa');
espera('puntaje negativo', nota(-5, 60), 1);
espera('puntaje sobre el máximo', nota(70, 60), 7);

console.log('\nexigencia distinta');
espera('50 %: 30 de 60', nota(30, 60, { ...ESCALA_CHILE, exigencia: 0.5 }), 4);
espera('70 %: 42 de 60', nota(42, 60, { ...ESCALA_CHILE, exigencia: 0.7 }), 4);

console.log('\nconfiguraciones sin sentido devuelven null, no una nota');
espera('máximo 0', nota(0, 0), null);
espera('exigencia 100 %', nota(10, 60, { ...ESCALA_CHILE, exigencia: 1 }), null);
espera('aprobación sobre la máxima', problemaEscala({ ...ESCALA_CHILE, aprobacion: 8 }, 60), 'escala');

console.log('\nla tabla');
{
  const t = tabla(60);
  espera('filas de 0 a 60', t.length, 61);
  espera('primera', t[0].nota, 1);
  espera('última', t[60].nota, 7);
  const medios = tabla(10, ESCALA_CHILE, 0.5);
  espera('con medios puntos, 10 → 21 filas', medios.length, 21);
  espera('último puntaje exacto', medios[20].puntaje, 10);
  let crece = true;
  for (let i = 1; i < t.length; i++) if (t[i].nota < t[i - 1].nota) crece = false;
  espera('nunca baja', crece, true);
}

console.log('\npuntaje para aprobar, con el redondeo incluido');
espera('60 puntos al 60 %', puntajeParaAprobar(60), 36);
/* 100 puntos: 59 ya da 3,95 → 4,0. El redondeo regala un punto y hay que decirlo. */
espera('100 puntos al 60 %', puntajeParaAprobar(100), 59);

console.log('\nformato');
espera('español', formatoNota(4, 'es'), '4,0');
espera('inglés', formatoNota(5.5, 'en'), '5.5');
espera('se lee con coma', leerNumero('12,5'), 12.5);
espera('vacío no es cero', Number.isNaN(leerNumero('')), true);

console.log(problemas ? `\n${problemas} PROBLEMA(S)` : '\nNOTAS OK');
process.exit(problemas ? 1 : 0);
