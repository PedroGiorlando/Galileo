# Animación "polea sobre mesa" — la parte de programación

Un recorrido por cómo está hecha la animación, en el orden en que conviene
leerla. Cada paso tiene qué mirar, qué idea se lleva y una pregunta para
comprobar que se entendió (la respuesta está plegada debajo).

Lo técnico de la decisión está en el
[diseño](superpowers/specs/2026-10-15-animacion-polea-design.md) y el paso a
paso en el [plan](superpowers/plans/2026-10-15-animacion-polea.md). Esto es la
versión para aprender.

---

## El mapa: por dónde viaja el dato

```
Panel (EditorMedios)          lo que escribe el profesor, como texto: "0,3"
   │  medioAGuardar
   ▼
Schema (MedioSchema)          valida: masas > 0, μc ≤ μe, números de verdad
   │  guardarClase
   ▼
Base de datos (Supabase)      {"tipo":"polea-mesa","m1":50,"m2":20,...}
   │  normalizarContenido
   ▼
Página de la clase (Medios)   elige qué dibujar según el tipo
   │
   ▼
AnimacionPolea                dibuja el SVG y le pide la física a…
   │
   ▼
resolverPolea                 a, T, ¿se mueve?, cuánto dura
```

La idea que ordena todo: **se guardan datos, no la animación.** En la base
solo están las masas y los rozamientos. Si mañana se mejora el dibujo, cambian
a la vez todos los ejercicios que ya lo usan.

---

## Paso 1 — La física, sola: `src/lib/polea.ts`

**Qué mirar:** `resolverPolea` y su test, `polea.test.ts`.

**La idea:** la física está en una función pura. Recibe números y devuelve
números, sin React, sin dibujo y sin base de datos. Por eso se puede testear
sin abrir un navegador: el test de "50 kg y 20 kg da 2,8 m/s²" corre en
milisegundos.

**El bug que no se veía:** en la compu, `0.7 * 3` da `2.0999999999999996`, no
`2.1`. Los decimales se guardan en binario y la mayoría no se puede
representar exacto. En el caso límite eso decidía mal si el sistema arrancaba,
y la animación duraba 118 millones de segundos. El arreglo es una tolerancia:
`m2 > muE * m1 * (1 + 1e-9)`.

**El sabotaje:** después de escribir el test, se rompió el código a propósito
(se sacó la tolerancia) para ver que el test fallara. Un test que nunca viste
fallar no prueba nada: puede estar pasando por casualidad.

<details>
<summary>Pregunta: ¿por qué <code>0.1 + 0.2 === 0.3</code> da <code>false</code> en JavaScript?</summary>

Por lo mismo: 0,1 y 0,2 no tienen representación exacta en binario, y su suma
da `0.30000000000000004`. Nunca compares decimales con `===`: compará con una
tolerancia (`Math.abs(a - b) < 1e-9`) o trabajá con enteros (centavos en vez
de pesos, por ejemplo).
</details>

---

## Paso 2 — El dato: `src/lib/schemas.ts` y `src/lib/borrador.ts`

**Qué mirar:** el tercer miembro de `MedioSchema`, y `medioABorrador` /
`medioAGuardar` en el borrador.

**Unión discriminada.** `MedioSchema` es "una de tres formas", y el campo
`tipo` dice cuál es. TypeScript lo aprovecha: dentro de
`if (m.tipo === 'video')` sabe que `m.youtubeId` existe. Al sumar el tercer
tipo, TypeScript marcó como error **cada lugar** que suponía que solo había
imagen o video. Esa lista fue la lista de lo que había que actualizar, sin
tener que buscarlo a mano.

**`refine` con `path`.** La regla "μc no puede ser mayor que μe" mira dos
campos a la vez, así que va en un `refine` sobre el objeto entero. El
`path: ['muCinetico']` dice en qué campo mostrar el error.

**Borrador ≠ guardado.** En el panel los números son **texto**, por dos
motivos: dejar escribir "0,3" con coma, y que un campo vacío sea vacío y no 0.
Al guardar, `aNumero` convierte: vacío → el campo no se escribe; "abc" → `NaN`,
que el schema rechaza. Así un error de tipeo nunca se guarda en silencio como
"sin rozamiento".

**No escribir los valores por defecto.** Si g es 9,8, no se guarda. Así abrir
una clase y guardarla sin tocar nada la deja **idéntica**: el test usa
`toStrictEqual` justamente para ver que no aparezcan campos nuevos.

<details>
<summary>Pregunta: ¿por qué el test usa <code>toStrictEqual</code> y no <code>toEqual</code>?</summary>

`toEqual` considera iguales `{ a: 1 }` y `{ a: 1, b: undefined }`. Lo que se
quería probar es justamente que no aparezca ningún campo de más, aunque esté
en `undefined`, así que hace falta la versión estricta.
</details>

---

## Paso 3 — El dibujo: `src/components/AnimacionPolea.tsx`

**Qué mirar:** las constantes de geometría arriba de todo y el `<svg>`.

**SVG con `viewBox`.** `viewBox="0 0 480 320"` define un lienzo de 480 × 320
"unidades" que el navegador escala al ancho disponible. Por eso las posiciones
son números fijos (la polea en x = 150) y el dibujo se ve igual en un celular y
en un monitor.

**Sin `id`.** Un `id` tiene que ser único en toda la página, y en una clase
puede haber dos animaciones (una en el enunciado y otra en la explicación). Por
eso el dibujo no usa ninguno, y hay un test que lo controla.

**Subíndices a mano.** "m₁" se arma con `<tspan dy={4}>` (baja el texto 4
unidades) en vez de usar el carácter ₁, que no todas las fuentes tienen.

**Accesibilidad.** `role="img"` y `aria-label` hacen que un lector de pantalla
lea "Caja de 50 kg sobre una mesa…". La descripción nunca incluye a ni T, para
no darle la respuesta a nadie.

<details>
<summary>Pregunta: ¿por qué <code>AnimacionPolea</code> tiene <code>'use client'</code> y <code>Medios</code> no?</summary>

`AnimacionPolea` tiene estado (`useState`: si ya se apretó Reproducir) y
responde a clics, así que tiene que ejecutarse en el navegador. `Medios` solo
elige qué mostrar, así que puede quedarse como Server Component: su HTML se
arma en el servidor y no manda JavaScript. Un Server Component puede incluir a
un Client Component; al revés no.
</details>

---

## Paso 4 — El movimiento: el final de `src/app/globals.css`

**Qué mirar:** `.polea-anda .polea-pieza` y `@keyframes polea-mover`.

**El truco central.** Un cuerpo que parte del reposo con aceleración constante
recorre x = ½·a·t², así que la fracción del camino recorrida es (t/T)². Las
animaciones CSS aceptan una curva de tiempo `cubic-bezier`, y
`cubic-bezier(1/3, 0, 2/3, 1/3)` es **exactamente** progreso = t². Así el
navegador hace la física solo, sin JavaScript corriendo 60 veces por segundo.

**Todo sincronizado gratis.** Caja, bola, las dos cuerdas y el giro de la
polea usan la misma curva y la misma duración. Cada pieza solo dice adónde
llega (`--hasta`): la caja se corre 116 a la izquierda, la cuerda horizontal se
achica a 34/150 de su largo, y así. Como todas avanzan la misma fracción en el
mismo instante, nunca se desfasan. En el navegador se midió a mitad de camino:
la caja corrida 58, la cuerda horizontal en 92 (150 − 58) y la vertical en 130
(72 + 58).

**Reiniciar = sacar la clase.** Sin la clase `polea-anda` no hay animación y
todo vuelve a su lugar. Al ponerla de nuevo, arranca de cero.

**La decisión de "reducir movimiento".** El sitio apaga todas las animaciones
cuando el sistema pide reducir movimiento. Al probar, el navegador de esta
compu lo tenía activado y la animación duraba 0,01 ms: parecía rota. Se la
exceptuó con un `!important`, porque no es decoración sino el contenido del
ejercicio (como un video), y el alumno la pide apretando el botón.

<details>
<summary>Pregunta: ¿qué pasaría si la caja usara <code>ease-in</code> en vez de esa curva?</summary>

Se vería parecido, pero sería mentira: `ease-in` no es exactamente t², así que
la caja estaría en lugares que no corresponden a una aceleración constante. En
una página de Física, que el movimiento se vea "más o menos bien" no alcanza.
</details>

---

## Paso 5 — El panel: `src/components/admin/EditorMedios.tsx`

**Qué mirar:** `EditorPolea`, al final del archivo.

**Una sola copia de las reglas.** Los errores que ve el profesor ("Falta la
masa", "μc no puede ser mayor que μe") salen de pasar el borrador por el
**mismo** `MedioSchema` que valida al guardar. Si las reglas cambian, cambian
en los dos lados a la vez.

**La vista previa es el componente real.** Debajo de los campos se dibuja
`AnimacionPolea`, el mismo que ve el alumno. Lo que el profesor ve es
exactamente lo que se publica.

**Testear sin navegador.** `EditorMedios.test.tsx` dibuja el componente con
`renderToStaticMarkup` (HTML como texto) y busca frases adentro. La acción de
subir imágenes habla con Supabase, así que el test la reemplaza con
`vi.mock(...)`.

<details>
<summary>Pregunta: ¿por qué <code>onChange({ ...medio, [campo]: v })</code> y no <code>medio[campo] = v</code>?</summary>

En React el estado no se modifica: se reemplaza por un objeto nuevo. Si
mutaras `medio`, React no se enteraría del cambio (el objeto sigue siendo "el
mismo") y no volvería a dibujar. `{ ...medio, [campo]: v }` crea una copia con
un solo campo distinto.
</details>

---

## Paso 6 — Lo que encontró la revisión

Al terminar, tres revisores independientes miraron todo el trabajo (uno por
física, otro por datos y otro por dibujo) y un cuarto intentó refutar cada
hallazgo grave antes de arreglar nada. Encontraron dos cosas reales, y las dos
enseñan algo.

**1. La lectura tolerante también tiene que ser tolerante al dibujar.** Una
clase sin publicar se guarda sin validar, a propósito, para poder guardar a
medias. Pero `AnimacionPolea` suponía datos completos: una animación recién
agregada, guardada como borrador sin masas, llegaba sin `m1`, y
`undefined.toLocaleString()` tiraba abajo **toda** la vista previa. El
arreglo va en un solo lugar, `Medios.tsx`, por donde pasan todas las páginas:
valida con `MedioSchema` antes de dibujar, y si falta algo muestra "Animación
incompleta". La lección: si un dato puede llegar sin validar, el que lo usa
tiene que validarlo.

**2. Datos y resultados no se formatean igual.** El mismo `formatear` (2
decimales) se usaba para la aceleración y para las masas. Si el enunciado dice
0,125 kg, el dibujo mostraba 0,13, y 1000 kg aparecía como "1.000". Ahora hay
dos: `formatear` para los resultados, y `formatearDato`, que muestra el número
tal cual. Es la misma función que el panel ya usaba para mostrar los números
en los campos, así que quedó una sola definición.

Cada arreglo empezó con un test que reproducía el problema y fallaba (RED), y
recién después vino el cambio que lo hizo pasar (GREEN).

---

## Para practicar

Ordenados de más fácil a más difícil. Cada uno en una rama propia.

- [ ] **Cambiar un color.** La bola en rojo. (Una clase en `AnimacionPolea`.)
- [ ] **Cambiar la cámara lenta.** Que sea ×3. ¿Qué test se rompe y por qué?
- [ ] **Agregar un test.** Que con m₁ = 10 y m₂ = 30 dé a = 7,35. Primero
      escribilo, mirá que pase, y después rompé la fórmula a propósito para
      ver que falla.
- [ ] **Mostrar la velocidad final.** Con v = a·t, al lado de a y T. ¿Va en
      `polea.ts` o en el componente? ¿Por qué?
- [ ] **Una escena nueva (grande).** La máquina de Atwood: dos bolas colgando de
      una polea. Seguí el mismo camino que esta: la física en una función pura
      con tests, un miembro nuevo en el schema y el borrador, un componente, y
      la rama en `Medios` y en `EditorMedios`. TypeScript te va a marcar los
      lugares que faltan.

## Para verlo andando

```bash
npm run dev
```

Entrá al panel, abrí una clase, y en cualquier lugar con "Imágenes o videos"
apretá **Agregar animación**.
