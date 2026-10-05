# Chasquibox

La caja de herramientas de clase: para docentes de cualquier asignatura, gratis y sin registrarse.

| Momento | Herramientas |
| --- | --- |
| Durante | Dado, Ruleta, Grupos, Reloj, Sopa de letras, Crucigrama |
| Cierre | El muro, Semáforo, Apuesta, La duda, Antes / Ahora |
| Corregir | Notas (escala chilena 1.0–7.0) |

Nació como "Herramientas de clase" dentro de Grammar HUB y se mudó aquí el 5-oct-2026. Es la primera app del bundle docente.

## Reglas

- **Nada se guarda.** La lista del curso y todo lo que se escribe vive mientras la pestaña está abierta. Ningún nombre de estudiante queda en el navegador, el repositorio ni el despliegue.
- **La lista del curso se pega**: un nombre por línea, o el histórico de asistencia exportado a Excel (los ausentes del día llegan apagados).
- **Cualquier asignatura.** Solo las caras Sujeto, Forma y Tiempo del Dado son de inglés, y van rotuladas así.

## Desarrollo

```
npm install
npm run dev      # http://localhost:5174/Chasquibox/
npm run check    # las comprobaciones de las herramientas
npm run build
```

Cada push a `main` corre las comprobaciones y publica en GitHub Pages.

## Archivos que vienen de otro lado

- `src/dua.generated.css`, `src/colores.generated.css`, `src/forms.generated.jsx`: de `design-tokens` (`node sync.mjs` allá).
- `src/data/curriculum.generated.js`: de `Grammar HUB/curriculum.json`, para los tiempos verbales del Dado. Si cambia el temario, se vuelve a copiar.
- `tools/vocabulary.json`: vocabulario real de Grammar HUB, solo para la prueba del crucigrama.
