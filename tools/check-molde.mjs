/* Los huecos de un molde, comprobados.
   ----------------------------------------------------------------------------
   Lo que parte esta función se PROYECTA, así que fallar significa una frase
   partida en medio de una palabra o un hueco pintado como texto delante de la
   clase. Y son fallos que no dan error: la pantalla se ve, solo se ve mal.

   Correr:  node tools/check-molde.mjs        (desde Grammar HUB/) */
import { partirEnHuecos, tieneTexto, HUECO } from '../src/molde.js';

let problemas = 0;
const fallo = (m) => { console.log('   ✗ ' + m); problemas++; };
const ok = (m) => console.log('   ✓ ' + m);
const junto = (t) => partirEnHuecos(t).map(x => x.valor).join('');
const tipos = (t) => partirEnHuecos(t).map(x => x.tipo).join('+');

console.log('\nno se pierde ni una letra');
{
  const frases = [
    'No me queda claro cuándo se usa ____ en vez de ____.',
    'Hoy pude ______ y hace un mes no.',
    '______',
    'Sin ningún hueco.',
    '____ empieza con hueco',
    'termina con hueco ____',
    '',
    'ñandú, tildes áéíóú y «comillas»',
  ];
  const rotas = frases.filter(f => junto(f) !== f);
  if (rotas.length) fallo(`se pierde texto en: ${JSON.stringify(rotas)}`);
  else ok('ocho frases parten y se vuelven a juntar idénticas');
}

console.log('\nlos huecos se reconocen y el texto no');
{
  const casos = [
    ['a ____ b', 'texto+hueco+texto', 'hueco en medio'],
    ['____ b', 'hueco+texto', 'hueco al principio'],
    ['a ____', 'texto+hueco', 'hueco al final'],
    ['____', 'hueco', 'solo hueco'],
    ['a b', 'texto', 'sin huecos'],
    ['', '', 'vacío'],
    ['a ____ b ____ c', 'texto+hueco+texto+hueco+texto', 'dos huecos'],
  ];
  for (const [t, esperado, que] of casos) {
    if (tipos(t) === esperado) ok(`${que} → ${esperado || '(nada)'}`);
    else fallo(`${que}: dio ${tipos(t)} y se esperaba ${esperado}`);
  }
}

console.log('\ntres o más: dos guiones bajos no son una raya');
{
  if (tipos('archivo__viejo') === 'texto') ok('«archivo__viejo» no se parte: dos no bastan');
  else fallo('dos guiones bajos se tomaron por hueco');
  if (tipos('a ___ b') === 'texto+hueco+texto') ok('tres sí');
  else fallo('tres guiones bajos no se reconocieron');

  /* El largo se conserva: en un molde, una raya larga insinúa cuánto cabe. */
  const l = partirEnHuecos('a ' + '_'.repeat(20) + ' b').find(x => x.tipo === 'hueco');
  if (l.valor.length === 20) ok('una raya de veinte sigue midiendo veinte');
  else fallo(`la raya larga quedó en ${l.valor.length}`);

  if (tipos('a ____' + '____ b') === 'texto+hueco+texto') ok('dos rayas pegadas son una sola');
  else fallo('dos rayas pegadas se partieron en dos');
}

console.log('\n¿hay algo que proyectar?');
{
  const casos = [
    ['Hoy pude ______', true, 'una frase con hueco'],
    ['______', false, 'solo un hueco'],
    ['____ ____ ____', false, 'puros huecos'],
    ['   ', false, 'espacios'],
    ['', false, 'vacío'],
    [null, false, 'null'],
    [undefined, false, 'sin nada'],
    ['a', true, 'una letra'],
  ];
  for (const [t, esperado, que] of casos) {
    if (tieneTexto(t) === esperado) ok(`${que} → ${esperado ? 'sí' : 'no'}`);
    else fallo(`${que}: dio ${tieneTexto(t)}`);
  }
}

console.log('\nel hueco que pone la herramienta es un hueco');
{
  if (tipos(HUECO) === 'hueco') ok(`HUECO ("${HUECO}") se reconoce a sí mismo`);
  else fallo('la constante HUECO no se reconoce como hueco');
}

console.log(problemas ? `\n✗ ${problemas} problema(s)` : '\nMOLDE OK');
process.exit(problemas ? 1 : 0);
