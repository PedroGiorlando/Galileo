# Animación "polea sobre mesa"

Fecha: 2026-10-15
Estado: Aprobado en el chat, pendiente de revisión de este documento

## Contexto

Los ejercicios aceptan dos tipos de medio: `imagen` y `video` (`MedioSchema` en
`src/lib/schemas.ts`). El profesor quiere animar el dibujo clásico de una caja
sobre una mesa unida por una cuerda, que pasa por una polea, a una bola que
cuelga: la bola cae y arrastra la caja.

Una animación no es ni imagen ni video, así que se agrega un tercer tipo de
medio. Se guardan **datos** (masas, rozamiento), no la animación: el componente
dibuja y calcula a partir de ellos.

## Decisiones tomadas

| Pregunta | Elección |
|---|---|
| Alcance | Reutilizable: el profesor carga los números de cada ejercicio |
| Rozamiento | Estático y cinético, opcionales |
| Valores numéricos | Opcionales, el profesor decide en cada uso |
| Técnica | SVG + animación CSS (sin bucle de JavaScript) |

## Datos

Nuevo miembro de la unión `MedioSchema`:

```json
{ "tipo": "polea-mesa", "m1": 50, "m2": 20, "muEstatico": 0.3, "muCinetico": 0.2, "gravedad": 9.8, "mostrarValores": false }
```

| Campo | Regla |
|---|---|
| `m1`, `m2` | Obligatorias, > 0, ≤ 1000 (kg) |
| `muEstatico`, `muCinetico` | Opcionales, entre 0 y 2. Si están los dos: `muCinetico ≤ muEstatico` (si no, error con `path: ['muCinetico']`) |
| `gravedad` | Opcional, entre 1 y 20. Ausente = 9,8 |
| `mostrarValores` | Opcional. Ausente = no se muestran |

Va donde ya van los medios (teoría, enunciado, pregunta de evaluación y
devoluciones), con el mismo tope de 6 por bloque. `publico.ts` no cambia: los
medios del enunciado ya viajan tal cual, y los de la devolución ya se quitan y
vuelven del servidor después de corregir.

## Física — `src/lib/polea.ts`

Función pura, sin nada de dibujo, para poder testearla sola.

- **Un solo μ vale para los dos.** Si falta uno, toma el valor del otro; si
  faltan los dos, no hay rozamiento. Es la convención de los ejercicios de
  ingreso ("coeficiente de rozamiento 0,2").
- **¿Arranca?** `m2 > μe · m1 · (1 + 10⁻⁹)`. La `g` se cancela. La tolerancia
  es para el caso límite exacto: con m1 = 3, m2 = 2,1 y μ = 0,7 la compu
  calcula 0,7 · 3 = 2,0999999999999996, y sin tolerancia el sistema "arrancaba"
  con a ≈ 10⁻¹⁶ (una animación de 118 millones de segundos). En el límite
  exacto queda en reposo, como en la cuenta a mano.
- **Si arranca:** `a = g · (m2 − μc · m1) / (m1 + m2)` y `T = m2 · (g − a)`.
  Como `μc ≤ μe`, si arranca `a` es siempre positiva.
- **Si no arranca:** `a = 0` y `T = m2 · g`.
- **Duración:** el recorrido en pantalla representa siempre 1,5 m y se ve
  siempre en cámara lenta ×2: `duración = 2 · √(2 · 1,5 / a)`. Escala fija →
  comparar entre ejercicios es honesto (más rozamiento se ve más lento). Este
  ejercicio dura ≈ 2,1 s.

Caso de referencia (m1 = 50, m2 = 20, sin rozamiento, g = 9,8):
a = 2,8 m/s², T = 140 N.

## Componente — `src/components/AnimacionPolea.tsx`

Client Component (tiene estado: si ya se reprodujo).

- **Dibujo:** SVG que replica la escena de la imagen original: mesa gris, polea
  con su soporte en la esquina, cuerda, caja azul, bola verde. La polea tiene
  rayos para que se note el giro. Etiquetas "*m*₁ = 50 kg" y "*m*₂ = 20 kg"
  armadas con los datos, en la tipografía del sitio.
- **Movimiento:** una sola curva para todo, `cubic-bezier(1/3, 0, 2/3, 1/3)`,
  que es exactamente `progreso = t²` (movimiento uniformemente acelerado desde
  el reposo). Caja (traslación), bola (traslación), cuerda horizontal (se
  acorta), cuerda vertical (se alarga) y polea (gira) usan la misma curva y la
  misma duración, así que van sincronizadas por construcción. La duración llega
  como variable CSS.
- **Fin:** la caja frena antes de la polea y la bola antes del borde del
  dibujo; quedan en la posición final (`animation-fill-mode: forwards`).
- **Controles:** botón "Reproducir", que después pasa a "Reiniciar"
  (reiniciar = volver a montar la escena). Nunca arranca sola.
- **Sin movimiento:** si no arranca, al apretar el botón no se mueve nada y
  aparece "El sistema queda en reposo".
- **Valores:** con `mostrarValores`, siempre visibles al lado del botón:
  "a = 2,8 m/s² · T = 140 N" (coma decimal, hasta 2 decimales). Si no
  arranca: "a = 0 m/s² · T = 196 N".
- **Accesibilidad:** el SVG lleva `role="img"` y una descripción armada con los
  datos (masas y rozamiento; nunca a ni T si `mostrarValores` está apagado). El
  resultado ("queda en reposo", valores) se anuncia en una región `aria-live`.
  La animación se reproduce aunque el sistema tenga "reducir movimiento"
  activado: es el contenido del ejercicio (como un video), nunca arranca sola
  y la pide el alumno (WCAG 2.3.3 exceptúa la animación esencial). Cambiado
  durante la implementación: la primera versión saltaba al final, y en una
  compu con los efectos de animación de Windows apagados parecía rota.
- `Medios.tsx` suma la tercera rama y ocupa el mismo ancho que una imagen.

## Panel — `EditorMedios.tsx`

- Tercer botón **"Agregar animación"** junto a "Subir imagen" y "Agregar video".
- Campos: m₁, m₂, μe, μc, g y la casilla "Mostrar valores (a y T)".
- **Los decimales aceptan coma o punto.** El borrador guarda texto; al guardar
  se convierte (`"0,3"` → `0.3`, vacío → campo ausente). Un
  `<input type="number">` puede rechazar en silencio "0,3" según el idioma de
  la compu.
- **Vista previa en vivo** debajo de los campos: el mismo componente que ve el
  alumno. Con datos incompletos muestra "Completá m₁ y m₂ para ver la
  animación".
- Errores en línea, como la descripción de una imagen: "Falta m₁",
  "μc no puede ser mayor que μe".

`src/lib/borrador.ts`: nuevo `MedioBorrador` con los números como texto, y su
ida y vuelta en `medioABorrador` / `medioAGuardar`.

## Documentación

`docs/plantilla-clase.md`: cómo cargar la animación y el aviso de que, si la
pregunta es "¿se mueve el sistema?", va en la devolución y no en el enunciado
(apretar Reproducir ya da la respuesta).

## Pruebas

- `src/lib/polea.test.ts`: caso de referencia (2,8 / 140), límite μ = 0,4 en
  reposo, un solo μ vale para los dos, g = 10 (a ≈ 2,86), duración.
- Schema: rechaza `muCinetico > muEstatico`, rechaza masas ≤ 0, acepta μ
  ausentes.
- `borrador.test.ts`: ida y vuelta panel → guardado → panel sin perder datos;
  coma y punto dan el mismo número; vacío → ausente.
- `npm run build` y `npm test` completos; revisión en el navegador de una clase
  con la animación.

## Fuera de alcance

Otras escenas (plano inclinado, Atwood), contador de tiempo o velocidad en
vivo, pausa a mitad de camino, polea o cuerda con masa, choque con el piso.
