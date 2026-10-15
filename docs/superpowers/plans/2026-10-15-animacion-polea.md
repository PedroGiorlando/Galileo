# Animación "polea sobre mesa" — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Un tercer tipo de medio, `polea-mesa`, que dibuja una caja sobre una mesa unida por una polea a una bola que cuelga, y la anima con la física real a partir de masas y rozamientos que carga el profesor.

**Architecture:** La física vive en una función pura (`src/lib/polea.ts`). El schema Zod suma un miembro a `MedioSchema` y el borrador lo convierte desde y hacia texto (coma decimal). Un Client Component dibuja la escena en SVG y la anima con una sola animación CSS: la curva `cubic-bezier(1/3, 0, 2/3, 1/3)` es exactamente `progreso = t²`. El panel reutiliza el mismo componente como vista previa.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Zod 4, Tailwind v4, Vitest 4, lucide-react. Sin dependencias nuevas.

**Spec:** `docs/superpowers/specs/2026-10-15-animacion-polea-design.md`

## Global Constraints

- Sin dependencias nuevas (`package.json` no cambia).
- Nombres, comentarios y textos en español, con la densidad de comentarios del código vecino (explican el porqué de lo no obvio).
- Tailwind v4: clases completas y literales; nunca armar un nombre de clase concatenando pedazos.
- Nada de `font-mono`: el texto del SVG hereda la tipografía del sitio.
- Números para el alumno: coma decimal, hasta 2 decimales (`toLocaleString('es-AR', { maximumFractionDigits: 2 })`).
- El SVG no usa atributos `id`: puede haber dos animaciones en la misma página.
- Nunca arranca sola. El estado sin animar es la escena completa y quieta.
- Los archivos tienen fin de línea CRLF: editar con la herramienta Edit, no con reemplazos multilínea de `sed`/`perl` (fallan en silencio).
- Cada commit termina con la línea `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- No hacer `git push`: subir a `master` despliega en Vercel, y eso lo decide el usuario.

## Review Focus

1. **Caso límite con redondeo** (m1 = 3, m2 = 2,1, μ = 0,7): tiene que quedar en reposo, no arrancar con a ≈ 10⁻¹⁶. → Task 1, test "el límite no lo decide el redondeo".
2. **Texto que no es número en un campo** ("abc" en μ): tiene que ser un error visible, nunca un 0 ni un campo ausente. → Task 2, tests "un texto que no es número es un error".
3. **Espacios alrededor del número** (" 50 "): tiene que valer 50. → Task 2, test "coma o punto dan el mismo número".
4. **Etiquetas largas** (m₂ = 999,99 kg) tienen que entrar en el dibujo, y la bola no tiene que salirse al final del recorrido. → Task 5, medición en el navegador.
5. **Dos animaciones en la misma página** (enunciado y devolución) no se pisan: sin `id` en el SVG y estado propio. → Task 3, test "no usa id"; Task 5, se prueban tres en una página.

---

### Task 1: La física

**Files:**
- Create: `src/lib/polea.ts`
- Test: `src/lib/polea.test.ts`
- Modify: `docs/superpowers/specs/2026-10-15-animacion-polea-design.md` (ya corregido: tolerancia en el caso límite; solo entra en este commit)

**Interfaces:**
- Consumes: nada.
- Produces:
  - `export const GRAVEDAD = 9.8`
  - `export interface DatosPolea { m1: number; m2: number; muEstatico?: number; muCinetico?: number; gravedad?: number }`
  - `export interface ResultadoPolea { seMueve: boolean; aceleracion: number; tension: number; duracion: number }`
  - `export function resolverPolea(d: DatosPolea): ResultadoPolea`
  - `export const formatear: (n: number) => string`
  - `export function textoValores(r: ResultadoPolea): string`
  - `export function describirPolea(d: DatosPolea): string`

- [ ] **Step 1: Escribir los tests que fallan**

`src/lib/polea.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { describirPolea, resolverPolea, textoValores } from './polea'

describe('polea sobre mesa', () => {
  it('el ejercicio de la imagen: 50 kg y 20 kg sin rozamiento', () => {
    const r = resolverPolea({ m1: 50, m2: 20 })
    expect(r.seMueve).toBe(true)
    expect(r.aceleracion).toBeCloseTo(2.8, 10)
    expect(r.tension).toBeCloseTo(140, 10)
  })

  it('con g = 10 cambia el resultado, y tiene que coincidir con el del profesor', () => {
    expect(resolverPolea({ m1: 50, m2: 20, gravedad: 10 }).aceleracion).toBeCloseTo(2.857, 3)
  })

  it('si el rozamiento estático alcanza justo, queda quieto', () => {
    // 20 > 0,4 · 50  →  20 > 20  →  falso
    const r = resolverPolea({ m1: 50, m2: 20, muEstatico: 0.4 })
    expect(r.seMueve).toBe(false)
    expect(r.aceleracion).toBe(0)
    expect(r.tension).toBeCloseTo(196, 10)
    expect(r.duracion).toBe(0)
  })

  it('el límite no lo decide el redondeo de la compu', () => {
    // 0,7 · 3 da 2,0999999999999996. Sin tolerancia 2,1 "le ganaba", el sistema
    // arrancaba con a ≈ 1e-16 y la animación duraba 118 millones de segundos.
    expect(resolverPolea({ m1: 3, m2: 2.1, muEstatico: 0.7 }).seMueve).toBe(false)
  })

  it('el estático decide si arranca, aunque con el cinético podría moverse', () => {
    // μc · m1 = 10 < 20, pero μe · m1 = 25 > 20: nunca llega a arrancar.
    expect(resolverPolea({ m1: 50, m2: 20, muEstatico: 0.5, muCinetico: 0.2 }).seMueve).toBe(false)
  })

  it('una vez en movimiento, frena el cinético', () => {
    // 9,8 · (20 − 0,2 · 50) / 70
    const r = resolverPolea({ m1: 50, m2: 20, muEstatico: 0.3, muCinetico: 0.2 })
    expect(r.aceleracion).toBeCloseTo(1.4, 10)
  })

  it('un solo coeficiente vale para los dos', () => {
    const ambos = resolverPolea({ m1: 50, m2: 20, muEstatico: 0.2, muCinetico: 0.2 })
    expect(resolverPolea({ m1: 50, m2: 20, muCinetico: 0.2 })).toEqual(ambos)
    expect(resolverPolea({ m1: 50, m2: 20, muEstatico: 0.2 })).toEqual(ambos)
  })

  it('la duración sale de x = ½·a·t², en cámara lenta ×2', () => {
    // 2 · √(2 · 1,5 / 2,8) ≈ 2,07 s
    expect(resolverPolea({ m1: 50, m2: 20 }).duracion).toBeCloseTo(2.07, 2)
  })

  it('con más rozamiento se ve más lento', () => {
    expect(resolverPolea({ m1: 50, m2: 20, muCinetico: 0.2 }).duracion).toBeGreaterThan(
      resolverPolea({ m1: 50, m2: 20 }).duracion,
    )
  })
})

describe('textos de la animación', () => {
  it('los valores van con coma decimal', () => {
    expect(textoValores(resolverPolea({ m1: 50, m2: 20 }))).toBe('a = 2,8 m/s² · T = 140 N')
    expect(textoValores(resolverPolea({ m1: 50, m2: 20, muEstatico: 0.4 }))).toBe(
      'a = 0 m/s² · T = 196 N',
    )
  })

  it('la descripción para lectores de pantalla no da la respuesta', () => {
    const d = describirPolea({ m1: 50, m2: 20, muCinetico: 0.25 })
    expect(d).toBe(
      'Caja de 50 kg sobre una mesa, unida por una cuerda que pasa por una polea a una bola de 20 kg que cuelga. Coeficiente de rozamiento cinético 0,25.',
    )
    expect(d).not.toContain('m/s²')
  })

  it('sin rozamiento lo dice', () => {
    expect(describirPolea({ m1: 50, m2: 20 })).toMatch(/Sin rozamiento\.$/)
  })
})
```

- [ ] **Step 2: Correrlos y ver que fallan**

Run: `npx vitest run src/lib/polea.test.ts`
Expected: FAIL — `Failed to resolve import "./polea"`.

- [ ] **Step 3: Escribir la física**

`src/lib/polea.ts`:

```ts
/**
 * Física de la escena "polea sobre mesa": una caja de masa m1 apoyada en una
 * mesa, unida por una cuerda que pasa por una polea a una bola de masa m2 que
 * cuelga. Cuerda y polea ideales: sin masa y sin rozamiento en el eje.
 *
 * Está separada del dibujo a propósito: la física se testea sola, y el
 * componente solo traduce estos números a movimiento.
 */

export const GRAVEDAD = 9.8

/** Metros que representa el recorrido completo en pantalla. */
const RECORRIDO_M = 1.5

/**
 * Cuántas veces más lento que la realidad se muestra. Es siempre la misma, así
 * que comparar entre ejercicios es honesto: con más rozamiento se ve más lento.
 */
const CAMARA_LENTA = 2

/**
 * ponytail: tolerancia relativa para el caso límite. Con m1 = 3, m2 = 2,1 y
 * μ = 0,7 la cuenta a mano da 2,1 > 2,1 (falso, queda quieto), pero la compu
 * calcula 0,7 · 3 = 2,0999999999999996 y el sistema "arrancaba" con una
 * aceleración de 1e-16. Una parte en mil millones está muy por debajo de
 * cualquier dato de un ejercicio.
 */
const TOLERANCIA = 1e-9

export interface DatosPolea {
  m1: number
  m2: number
  muEstatico?: number
  muCinetico?: number
  gravedad?: number
}

export interface ResultadoPolea {
  seMueve: boolean
  /** m/s² */
  aceleracion: number
  /** N */
  tension: number
  /** Segundos que dura la animación; 0 si no se mueve. */
  duracion: number
}

export function resolverPolea({
  m1,
  m2,
  muEstatico,
  muCinetico,
  gravedad = GRAVEDAD,
}: DatosPolea): ResultadoPolea {
  // Si se cargó un solo coeficiente vale para los dos: así lo dan los
  // ejercicios de ingreso ("coeficiente de rozamiento 0,2").
  const muE = muEstatico ?? muCinetico ?? 0
  const muC = muCinetico ?? muEstatico ?? 0

  // Arranca si el peso de la bola le gana al rozamiento estático máximo:
  // m2·g > μe·m1·g. La g se cancela.
  if (!(m2 > muE * m1 * (1 + TOLERANCIA))) {
    return { seMueve: false, aceleracion: 0, tension: m2 * gravedad, duracion: 0 }
  }

  // Segunda ley de Newton para las dos masas juntas: el peso de la bola menos
  // el rozamiento cinético es lo que las acelera.
  const aceleracion = (gravedad * (m2 - muC * m1)) / (m1 + m2)

  return {
    seMueve: true,
    aceleracion,
    // Para la bola sola: m2·g − T = m2·a
    tension: m2 * (gravedad - aceleracion),
    // x = ½·a·t²  →  t = √(2x/a)
    duracion: CAMARA_LENTA * Math.sqrt((2 * RECORRIDO_M) / aceleracion),
  }
}

/** Coma decimal y hasta dos decimales: 2.857 → "2,86". */
export const formatear = (n: number) => n.toLocaleString('es-AR', { maximumFractionDigits: 2 })

export function textoValores(r: ResultadoPolea): string {
  return `a = ${formatear(r.aceleracion)} m/s² · T = ${formatear(r.tension)} N`
}

/**
 * Lo que lee en voz alta un lector de pantalla. Nunca incluye a ni T: con la
 * animación en el enunciado, eso sería darle la respuesta.
 */
export function describirPolea({ m1, m2, muEstatico, muCinetico }: DatosPolea): string {
  const escena = `Caja de ${formatear(m1)} kg sobre una mesa, unida por una cuerda que pasa por una polea a una bola de ${formatear(m2)} kg que cuelga.`
  if (muEstatico === undefined && muCinetico === undefined) return `${escena} Sin rozamiento.`

  const coeficientes = [
    muEstatico !== undefined ? `estático ${formatear(muEstatico)}` : null,
    muCinetico !== undefined ? `cinético ${formatear(muCinetico)}` : null,
  ].filter(Boolean)

  return `${escena} Coeficiente de rozamiento ${coeficientes.join(' y ')}.`
}
```

- [ ] **Step 4: Correr los tests y ver que pasan**

Run: `npx vitest run src/lib/polea.test.ts`
Expected: PASS, 12 tests.

- [ ] **Step 5: Sabotaje — comprobar que el test del límite muerde**

Con Edit, cambiar `m2 > muE * m1 * (1 + TOLERANCIA)` por `m2 > muE * m1`. Confirmar que el cambio entró: `grep -n "m2 > muE \* m1)" src/lib/polea.ts` tiene que mostrar una línea. Correr `npx vitest run src/lib/polea.test.ts` → tiene que FALLAR "el límite no lo decide el redondeo". Revertir con Edit y volver a correr → PASS.

- [ ] **Step 6: Commit**

```bash
git add src/lib/polea.ts src/lib/polea.test.ts docs/superpowers/specs/2026-10-15-animacion-polea-design.md
git commit -F - <<'EOF'
feat: la fisica de la polea sobre mesa, separada del dibujo

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

### Task 2: El dato: schema y borrador

**Files:**
- Modify: `src/lib/schemas.ts` (comentario y `MedioSchema` cerca de la línea 18-46; tipos al final)
- Modify: `src/lib/borrador.ts` (`MedioBorrador` cerca de la línea 25-36; conversiones cerca de la línea 189-219)
- Test: `src/lib/schemas.test.ts`, `src/lib/borrador.test.ts`

**Interfaces:**
- Consumes: `GRAVEDAD` de `src/lib/polea.ts` (Task 1).
- Produces:
  - En `MedioSchema`, el miembro `{ tipo: 'polea-mesa'; m1: number; m2: number; muEstatico?: number; muCinetico?: number; gravedad?: number; mostrarValores?: boolean }`
  - `export type MedioPolea = Extract<Medio, { tipo: 'polea-mesa' }>` (en `schemas.ts`)
  - En `MedioBorrador`, el miembro `{ tipo: 'polea-mesa'; m1: string; m2: string; muEstatico: string; muCinetico: string; gravedad: string; mostrarValores: boolean }`
  - `export type PoleaBorrador = Extract<MedioBorrador, { tipo: 'polea-mesa' }>` (en `borrador.ts`)
  - `export const poleaVacia: () => MedioBorrador`
  - `export function medioABorrador(m: Medio): MedioBorrador` (hoy existe sin `export`)
  - `export function medioAGuardar(m: MedioBorrador)` (hoy existe sin `export`)

- [ ] **Step 1: Escribir los tests del schema**

Al final de `src/lib/schemas.test.ts`, y sumar `MedioSchema` al import de `./schemas` de la línea 2:

```ts
describe('animación polea sobre mesa', () => {
  const base = { tipo: 'polea-mesa', m1: 50, m2: 20 } as const

  it('alcanza con las dos masas', () => {
    expect(MedioSchema.safeParse(base).success).toBe(true)
  })

  it('acepta los dos rozamientos si el cinético no supera al estático', () => {
    expect(MedioSchema.safeParse({ ...base, muEstatico: 0.3, muCinetico: 0.2 }).success).toBe(true)
  })

  it('rechaza un cinético mayor que el estático, y marca ese campo', () => {
    const r = MedioSchema.safeParse({ ...base, muEstatico: 0.2, muCinetico: 0.3 })
    expect(r.success).toBe(false)
    expect(r.error?.issues[0].path).toEqual(['muCinetico'])
  })

  it('rechaza una masa en cero', () => {
    expect(MedioSchema.safeParse({ ...base, m1: 0 }).success).toBe(false)
  })

  it('un texto que no es número es un error, no un cero', () => {
    // El panel convierte "abc" en NaN. Si pasara como 0, el ejercicio quedaría
    // sin rozamiento sin que nadie se entere.
    const r = MedioSchema.safeParse({ ...base, muEstatico: NaN })
    expect(r.success).toBe(false)
    expect(r.error?.issues[0].path).toEqual(['muEstatico'])
  })
})
```

- [ ] **Step 2: Escribir los tests del borrador**

En `src/lib/borrador.test.ts`, ampliar los imports de arriba:

```ts
import {
  aContenido,
  contenidoDesdeTema,
  ejercicioVacio,
  medioABorrador,
  medioAGuardar,
  poleaVacia,
  seccionVacia,
  type ContenidoBorrador,
  type MedioBorrador,
  type PoleaBorrador,
} from './borrador'
import {
  EvaluacionSchema,
  MedioSchema,
  normalizarContenido,
  TemaContenidoBorradorSchema,
  TemaContenidoSchema,
  TemaMetaBorradorSchema,
  TemaMetaSchema,
  type TemaContenido,
} from './schemas'
```

En el objeto `conTodo` (dentro de `describe('medios y ajustes de la evaluación'`), sumar una animación a los `mediosExplicacion` del primer ejercicio, así la ida y vuelta completa también la cubre:

```ts
            mediosExplicacion: [
              { tipo: 'video', youtubeId: 'dQw4w9WgXcQ', segundo: 90 },
              { tipo: 'imagen', url: 'https://x.test/resolucion.png', alt: 'Resolución' },
              { tipo: 'polea-mesa', m1: 50, m2: 20, mostrarValores: true },
            ],
```

Y al final del archivo:

```ts
describe('animación polea sobre mesa', () => {
  const completa = {
    tipo: 'polea-mesa',
    m1: 50,
    m2: 20,
    muEstatico: 0.3,
    muCinetico: 0.25,
    gravedad: 10,
    mostrarValores: true,
  } as const
  const minima = { tipo: 'polea-mesa', m1: 50, m2: 20 } as const

  it('abrir y guardar sin tocar nada la deja igual, sin agregar campos', () => {
    // toStrictEqual y no toEqual: toEqual da por iguales un campo ausente y uno
    // en undefined, y lo que se quiere ver es que no aparezca nada nuevo.
    expect(medioAGuardar(medioABorrador(completa))).toStrictEqual(completa)
    expect(medioAGuardar(medioABorrador(minima))).toStrictEqual(minima)
  })

  it('en el panel los decimales se ven con coma', () => {
    const b = medioABorrador(completa)
    if (b.tipo !== 'polea-mesa') throw new Error('debería ser una polea')
    expect(b.muEstatico).toBe('0,3')
    expect(b.gravedad).toBe('10')
  })

  it('coma o punto dan el mismo número, y los espacios no molestan', () => {
    const b: MedioBorrador = {
      tipo: 'polea-mesa',
      m1: ' 50 ',
      m2: '12,5',
      muEstatico: '',
      muCinetico: '0.2',
      gravedad: '9,8',
      mostrarValores: false,
    }
    // μe vacío no se escribe, g = 9,8 es el valor por defecto y tampoco, y
    // mostrarValores apagado tampoco.
    expect(medioAGuardar(b)).toStrictEqual({ tipo: 'polea-mesa', m1: 50, m2: 12.5, muCinetico: 0.2 })
  })

  it('un texto que no es número no se guarda como si nada', () => {
    const b: MedioBorrador = { ...(poleaVacia() as PoleaBorrador), m1: '50', m2: '20', muEstatico: 'abc' }
    expect(MedioSchema.safeParse(medioAGuardar(b)).success).toBe(false)
  })

  it('una animación recién agregada, sin masas, no se puede guardar', () => {
    expect(MedioSchema.safeParse(medioAGuardar(poleaVacia())).success).toBe(false)
  })
})
```

- [ ] **Step 3: Correrlos y ver que fallan**

Run: `npx vitest run src/lib/schemas.test.ts src/lib/borrador.test.ts`
Expected: FAIL — `medioABorrador`/`poleaVacia` no se exportan y el schema rechaza `tipo: 'polea-mesa'`.

- [ ] **Step 4: Sumar la animación al schema**

En `src/lib/schemas.ts`, reemplazar el primer párrafo del comentario de `MedioSchema`:

```ts
/**
 * Una imagen o un video que acompaña a un texto.
```

por:

```ts
/**
 * Una imagen, un video o una animación que acompaña a un texto.
```

Justo antes de `export const MedioSchema`, después del cierre `*/` de ese comentario, agregar:

```ts
const masa = z
  .number({ error: 'Falta la masa (un número, en kg)' })
  .positive('Tiene que ser mayor que 0')
  .max(1000, 'Como mucho 1000 kg')

const coeficiente = z
  .number({ error: 'Tiene que ser un número' })
  .min(0, 'No puede ser negativo')
  .max(2, 'Un rozamiento mayor que 2 no aparece en ejercicios')
  .optional()
```

Y sumar el tercer miembro a la unión, después del de `video`:

```ts
  z.object({
    tipo: z.literal('video'),
    youtubeId: z.string().regex(/^[A-Za-z0-9_-]{11}$/, 'No parece un identificador de YouTube'),
    segundo: z.number().int().min(0).optional(),
  }),
  /**
   * Se guardan los datos del ejercicio, no la animación: el componente dibuja
   * y calcula con ellos (ver src/lib/polea.ts). Si se carga un solo μ, vale
   * para los dos.
   */
  z
    .object({
      tipo: z.literal('polea-mesa'),
      m1: masa,
      m2: masa,
      muEstatico: coeficiente,
      muCinetico: coeficiente,
      gravedad: z.number({ error: 'Tiene que ser un número' }).min(1).max(20).optional(),
      mostrarValores: z.boolean().optional(),
    })
    .refine(
      p => p.muEstatico === undefined || p.muCinetico === undefined || p.muCinetico <= p.muEstatico,
      { message: 'μc no puede ser mayor que μe', path: ['muCinetico'] },
    ),
])
```

Al final, junto a `export type Medio = ...`:

```ts
export type Medio = z.infer<typeof MedioSchema>
export type MedioPolea = Extract<Medio, { tipo: 'polea-mesa' }>
```

- [ ] **Step 5: Sumar la animación al borrador**

En `src/lib/borrador.ts`, segunda línea de imports:

```ts
import type { Medio, TemaContenido } from './schemas'
import { GRAVEDAD } from './polea'
import { idDeYouTube } from './video'
```

Reemplazar el bloque de `MedioBorrador` (desde `export type MedioBorrador =` hasta `export const videoMedioVacio = ...`) por:

```ts
export type MedioBorrador =
  | { tipo: 'imagen'; url: string; alt: string }
  | { tipo: 'video'; enlace: string; segundo: number }
  | {
      tipo: 'polea-mesa'
      m1: string
      m2: string
      muEstatico: string
      muCinetico: string
      gravedad: string
      mostrarValores: boolean
    }

export type PoleaBorrador = Extract<MedioBorrador, { tipo: 'polea-mesa' }>

/**
 * Los números de la animación se editan como texto: así "0,3" y "0.3" valen lo
 * mismo. Un <input type="number"> puede rechazar "0,3" en silencio según el
 * idioma de la compu, y el profesor vería desaparecer su dato.
 */
const aTexto = (n: number | undefined) => (n === undefined ? '' : String(n).replace('.', ','))

/** Vacío → ausente. Lo que no sea un número queda NaN, y el schema lo rechaza. */
const aNumero = (s: string) => (s.trim() === '' ? undefined : Number(s.trim().replace(',', '.')))

export const imagenVacia = (url: string): MedioBorrador => ({ tipo: 'imagen', url, alt: '' })
export const videoMedioVacio = (): MedioBorrador => ({ tipo: 'video', enlace: '', segundo: 0 })
export const poleaVacia = (): MedioBorrador => ({
  tipo: 'polea-mesa',
  m1: '',
  m2: '',
  muEstatico: '',
  muCinetico: '',
  gravedad: aTexto(GRAVEDAD),
  mostrarValores: false,
})
```

Reemplazar `function medioABorrador` y `function medioAGuardar` completas por:

```ts
export function medioABorrador(m: Medio): MedioBorrador {
  if (m.tipo === 'imagen') return { tipo: 'imagen', url: m.url, alt: m.alt }
  if (m.tipo === 'video') return { tipo: 'video', enlace: m.youtubeId, segundo: m.segundo ?? 0 }
  return {
    tipo: 'polea-mesa',
    m1: aTexto(m.m1),
    m2: aTexto(m.m2),
    muEstatico: aTexto(m.muEstatico),
    muCinetico: aTexto(m.muCinetico),
    gravedad: aTexto(m.gravedad ?? GRAVEDAD),
    mostrarValores: m.mostrarValores ?? false,
  }
}

export function medioAGuardar(m: MedioBorrador) {
  if (m.tipo === 'imagen') return { tipo: 'imagen', url: m.url, alt: m.alt }
  if (m.tipo === 'video') {
    return {
      tipo: 'video',
      youtubeId: idDeYouTube(m.enlace) ?? m.enlace,
      ...(m.segundo > 0 ? { segundo: m.segundo } : {}),
    }
  }

  const muEstatico = aNumero(m.muEstatico)
  const muCinetico = aNumero(m.muCinetico)
  const gravedad = aNumero(m.gravedad)
  return {
    tipo: 'polea-mesa',
    m1: aNumero(m.m1),
    m2: aNumero(m.m2),
    ...(muEstatico !== undefined ? { muEstatico } : {}),
    ...(muCinetico !== undefined ? { muCinetico } : {}),
    // 9,8 es el valor por defecto: no se escribe, así abrir y guardar una
    // animación no le agrega campos que no tenía.
    ...(gravedad !== undefined && gravedad !== GRAVEDAD ? { gravedad } : {}),
    ...(m.mostrarValores ? { mostrarValores: true } : {}),
  }
}
```

- [ ] **Step 6: Correr los tests y ver que pasan**

Run: `npx vitest run src/lib/schemas.test.ts src/lib/borrador.test.ts`
Expected: PASS, todos (los existentes y los nuevos).

- [ ] **Step 7: Revisar tipos**

Run: `npx tsc --noEmit`
Expected: errores SOLO en `src/components/Medios.tsx` y `src/components/admin/EditorMedios.tsx` (tratan todo lo que no es imagen como video). Se arreglan en las Tasks 3 y 4. Cualquier error en otro archivo hay que arreglarlo ahora.

- [ ] **Step 8: Commit**

```bash
git add src/lib/schemas.ts src/lib/borrador.ts src/lib/schemas.test.ts src/lib/borrador.test.ts
git commit -F - <<'EOF'
feat: la animacion de la polea como tercer tipo de medio

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

### Task 3: El dibujo y la animación

**Files:**
- Create: `src/components/AnimacionPolea.tsx`
- Test: `src/components/AnimacionPolea.test.tsx`
- Modify: `src/components/Medios.tsx` (archivo entero)
- Modify: `src/app/globals.css` (agregar al final)

**Interfaces:**
- Consumes: `MedioPolea` (Task 2); `resolverPolea`, `describirPolea`, `formatear`, `textoValores` (Task 1).
- Produces: `export function AnimacionPolea(datos: MedioPolea): JSX.Element` (Client Component).

- [ ] **Step 1: Escribir el test que falla**

`src/components/AnimacionPolea.test.tsx`:

```tsx
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { AnimacionPolea } from './AnimacionPolea'

describe('AnimacionPolea', () => {
  it('arranca quieta, con las masas del ejercicio y sin dar la respuesta', () => {
    const html = renderToStaticMarkup(<AnimacionPolea tipo="polea-mesa" m1={50} m2={20} />)
    expect(html).toContain('Reproducir')
    expect(html).not.toContain('polea-anda')
    expect(html).toContain('= 20 kg')
    expect(html).not.toContain('m/s²')
  })

  it('con mostrarValores, muestra a y T', () => {
    const html = renderToStaticMarkup(
      <AnimacionPolea tipo="polea-mesa" m1={50} m2={20} mostrarValores />,
    )
    expect(html).toContain('a = 2,8 m/s² · T = 140 N')
  })

  it('no usa id: puede haber dos en la misma página', () => {
    const html = renderToStaticMarkup(<AnimacionPolea tipo="polea-mesa" m1={50} m2={20} />)
    expect(html).not.toMatch(/\sid="/)
  })
})
```

- [ ] **Step 2: Correrlo y ver que falla**

Run: `npx vitest run src/components/AnimacionPolea.test.tsx`
Expected: FAIL — `Failed to resolve import "./AnimacionPolea"`.

- [ ] **Step 3: Escribir el componente**

`src/components/AnimacionPolea.tsx`:

```tsx
'use client'

import { useState } from 'react'
import { Play, RotateCcw } from 'lucide-react'
import type { MedioPolea } from '@/lib/schemas'
import { describirPolea, formatear, resolverPolea, textoValores } from '@/lib/polea'

/*
 * Geometría del dibujo, en unidades del viewBox (480 × 320). Replica la imagen
 * de referencia: mesa a la derecha, polea en la esquina, bola colgando a la
 * izquierda.
 */
const POLEA = { x: 150, y: 80, r: 14 }
const CAJA = { x: 300, y: 40, ancho: 72, alto: 56 }
const BOLA = { x: POLEA.x - POLEA.r, y: 170, r: 18 }
const MESA = { x: 168, y: 96 }

/**
 * Cuánto se corren la caja (a la izquierda) y la bola (hacia abajo). La caja
 * termina a 20 unidades de la polea y la bola dentro del dibujo.
 */
const RECORRIDO = 116

const CUERDA_HORIZONTAL = CAJA.x - POLEA.x
const CUERDA_VERTICAL = BOLA.y - BOLA.r - POLEA.y

/** La cuerda no patina: la polea gira lo que avanza la cuerda (θ = s / r). */
const GIRO_GRADOS = (RECORRIDO / POLEA.r) * (180 / Math.PI)

/** Adónde llega cada pieza. La curva y la duración son las mismas para todas. */
const hasta = (transformacion: string, origen = 'center') =>
  ({ '--hasta': transformacion, transformOrigin: origen }) as React.CSSProperties

/**
 * Caja sobre una mesa, unida por una polea a una bola que cuelga. Al apretar
 * Reproducir, la bola cae y arrastra la caja con la aceleración real.
 *
 * El movimiento lo hace una animación CSS (ver `.polea-anda` en globals.css):
 * acá solo se elige la duración y adónde llega cada pieza.
 */
export function AnimacionPolea(datos: MedioPolea) {
  const r = resolverPolea(datos)
  const [anda, setAnda] = useState(false)

  return (
    <figure className="overflow-hidden rounded-xl border border-linea bg-white">
      <svg
        viewBox="0 0 480 320"
        role="img"
        aria-label={describirPolea(datos)}
        className={`max-h-[28rem] w-full ${anda && r.seMueve ? 'polea-anda' : ''}`}
        style={{ '--duracion': `${r.duracion}s` } as React.CSSProperties}
      >
        {/* Mesa: tablero y pata */}
        <rect x={MESA.x} y={MESA.y} width={480 - MESA.x} height={8} className="fill-slate-200 stroke-slate-500" />
        <rect x={MESA.x} y={MESA.y + 8} width={8} height={320 - MESA.y - 8} className="fill-slate-200 stroke-slate-500" />

        {/* Soporte de la polea, del eje a la esquina de la mesa */}
        <line x1={POLEA.x} y1={POLEA.y} x2={MESA.x + 2} y2={MESA.y + 2} strokeWidth={5} className="stroke-slate-500" />

        {/* Cuerdas. Van antes que la polea para que ella tape dónde empiezan. */}
        <rect
          x={POLEA.x}
          y={POLEA.y - POLEA.r - 1}
          width={CUERDA_HORIZONTAL}
          height={2}
          className="polea-pieza fill-amber-700"
          style={hasta(`scaleX(${(CUERDA_HORIZONTAL - RECORRIDO) / CUERDA_HORIZONTAL})`, 'left center')}
        />
        <rect
          x={BOLA.x - 1}
          y={POLEA.y}
          width={2}
          height={CUERDA_VERTICAL}
          className="polea-pieza fill-amber-700"
          style={hasta(`scaleY(${(CUERDA_VERTICAL + RECORRIDO) / CUERDA_VERTICAL})`, 'center top')}
        />

        {/* Polea, con rayos para que se note el giro */}
        <g className="polea-pieza" style={hasta(`rotate(${-GIRO_GRADOS}deg)`)}>
          <circle cx={POLEA.x} cy={POLEA.y} r={POLEA.r} strokeWidth={2} className="fill-slate-300 stroke-slate-600" />
          <line x1={POLEA.x - POLEA.r} y1={POLEA.y} x2={POLEA.x + POLEA.r} y2={POLEA.y} strokeWidth={1.5} className="stroke-slate-600" />
          <line x1={POLEA.x} y1={POLEA.y - POLEA.r} x2={POLEA.x} y2={POLEA.y + POLEA.r} strokeWidth={1.5} className="stroke-slate-600" />
          <circle cx={POLEA.x} cy={POLEA.y} r={3} className="fill-slate-600" />
        </g>

        {/* Caja, con su etiqueta: se mueven juntas */}
        <g className="polea-pieza" style={hasta(`translateX(-${RECORRIDO}px)`)}>
          <rect x={CAJA.x} y={CAJA.y} width={CAJA.ancho} height={CAJA.alto} rx={2} strokeWidth={1.5} className="fill-sky-400 stroke-sky-700" />
          <Etiqueta x={CAJA.x + CAJA.ancho / 2} y={CAJA.y - 10} indice="1" kg={datos.m1} ancla="middle" />
        </g>

        {/* Bola, con su etiqueta */}
        <g className="polea-pieza" style={hasta(`translateY(${RECORRIDO}px)`)}>
          <circle cx={BOLA.x} cy={BOLA.y} r={BOLA.r} strokeWidth={1.5} className="fill-green-500 stroke-green-700" />
          <Etiqueta x={BOLA.x - BOLA.r - 8} y={BOLA.y + 5} indice="2" kg={datos.m2} ancla="end" />
        </g>
      </svg>

      <figcaption className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-linea px-2 py-1">
        <button
          type="button"
          onClick={() => setAnda(!anda)}
          className="flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-medium text-tinta hover:bg-slate-50"
        >
          {anda ? <RotateCcw size={16} /> : <Play size={16} />}
          {anda ? 'Reiniciar' : 'Reproducir'}
        </button>
        {datos.mostrarValores && <span className="text-sm text-tinta-suave">{textoValores(r)}</span>}
        <p aria-live="polite" className="text-sm font-medium text-tinta">
          {anda && !r.seMueve ? 'El sistema queda en reposo' : ''}
        </p>
      </figcaption>
    </figure>
  )
}

/** "m₁ = 50 kg", con el subíndice armado a mano: no toda fuente tiene ₁ y ₂. */
function Etiqueta({
  x,
  y,
  indice,
  kg,
  ancla,
}: {
  x: number
  y: number
  indice: string
  kg: number
  ancla: 'middle' | 'end'
}) {
  return (
    <text x={x} y={y} textAnchor={ancla} fontSize={15} className="fill-tinta">
      <tspan fontStyle="italic">m</tspan>
      <tspan dy={4} fontSize={10}>
        {indice}
      </tspan>
      <tspan dy={-4}> = {formatear(kg)} kg</tspan>
    </text>
  )
}
```

- [ ] **Step 4: Agregar la animación CSS**

Al final de `src/app/globals.css`:

```css
/*
 * Animación "polea sobre mesa" (src/components/AnimacionPolea.tsx).
 *
 * Una sola curva para todas las piezas: cubic-bezier(1/3, 0, 2/3, 1/3) es
 * exactamente progreso = t², el movimiento uniformemente acelerado desde el
 * reposo. Caja, bola, cuerdas y polea comparten curva y duración, así que van
 * sincronizadas sin un solo cálculo por cuadro. Cada pieza dice adónde llega
 * con --hasta; la duración llega en --duracion.
 *
 * Respeta la regla del temario de más arriba: el estado sin animar es la
 * escena completa y quieta. Si el reloj de animación no avanza, se ve el
 * dibujo original, nunca un hueco. Y con "reducir movimiento" la regla global
 * de arriba lleva la duración a casi cero: salta directo al final.
 */
.polea-pieza {
  transform-box: fill-box;
}
.polea-anda .polea-pieza {
  animation: polea-mover var(--duracion) cubic-bezier(0.33333, 0, 0.66667, 0.33333) forwards;
}
@keyframes polea-mover {
  to {
    transform: var(--hasta);
  }
}
```

- [ ] **Step 5: Usarlo en Medios**

`src/components/Medios.tsx`, archivo entero:

```tsx
import type { Medio } from '@/lib/schemas'
import { urlDeVideo } from '@/lib/video'
import { AnimacionPolea } from './AnimacionPolea'

/**
 * Las imágenes, videos y animaciones que acompañan a un texto.
 *
 * Se usa en la teoría, en el enunciado de un ejercicio, en una pregunta de
 * evaluación y en las devoluciones. Siempre igual: si no hay nada, no ocupa
 * lugar ni deja un hueco.
 *
 * Las imágenes van con `loading="lazy"`: una clase de Física puede tener quince
 * diagramas repartidos en cinco solapas de las que se ve una sola, y bajarlos
 * todos al abrir la página castiga justo al alumno con peor conexión.
 */
export function Medios({ medios, className = '' }: { medios?: Medio[]; className?: string }) {
  if (!medios || medios.length === 0) return null

  return (
    <div className={`space-y-3 ${className}`}>
      {medios.map((m, i) => {
        if (m.tipo === 'imagen') {
          return (
            <figure key={i}>
              <img
                src={m.url}
                alt={m.alt}
                loading="lazy"
                className="max-h-[28rem] w-full rounded-xl border border-linea bg-white object-contain"
              />
            </figure>
          )
        }
        if (m.tipo === 'video') {
          return (
            <div key={i} className="relative aspect-video overflow-hidden rounded-xl bg-slate-900">
              <iframe
                src={urlDeVideo(m.youtubeId, m.segundo)}
                title="Video explicativo"
                loading="lazy"
                allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen"
                allowFullScreen
                className="absolute inset-0 h-full w-full"
              />
            </div>
          )
        }
        return <AnimacionPolea key={i} {...m} />
      })}
    </div>
  )
}
```

- [ ] **Step 6: Correr los tests**

Run: `npx vitest run src/components/AnimacionPolea.test.tsx`
Expected: PASS, 3 tests.

- [ ] **Step 7: Revisar tipos**

Run: `npx tsc --noEmit`
Expected: errores SOLO en `src/components/admin/EditorMedios.tsx` (Task 4).

- [ ] **Step 8: Commit**

```bash
git add src/components/AnimacionPolea.tsx src/components/AnimacionPolea.test.tsx src/components/Medios.tsx src/app/globals.css
git commit -F - <<'EOF'
feat: la animacion de la polea se ve en clases y ejercicios

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

### Task 4: Cargarla desde el panel

**Files:**
- Modify: `src/components/admin/EditorMedios.tsx` (archivo entero)

**Interfaces:**
- Consumes: `poleaVacia`, `medioAGuardar`, `PoleaBorrador`, `MedioBorrador` (Task 2); `MedioSchema` (Task 2); `AnimacionPolea` (Task 3); `Campo`, `Texto`, `Casilla` de `./campos`.
- Produces: nada nuevo hacia afuera; `EditorMedios` mantiene sus props.

- [ ] **Step 1: Reescribir EditorMedios**

`src/components/admin/EditorMedios.tsx`, archivo entero:

```tsx
'use client'

import { useRef, useState, useTransition } from 'react'
import { Clapperboard, ImagePlus, Loader2, Trash2, Video } from 'lucide-react'
import {
  imagenVacia,
  medioAGuardar,
  poleaVacia,
  videoMedioVacio,
  type MedioBorrador,
  type PoleaBorrador,
} from '@/lib/borrador'
import { MedioSchema } from '@/lib/schemas'
import { idDeYouTube } from '@/lib/video'
import { subirImagen } from '@/app/admin/acciones-medios'
import { AnimacionPolea } from '../AnimacionPolea'
import { Campo, Casilla, Texto } from './campos'

/**
 * Imágenes, videos y animaciones que acompañan a un texto.
 *
 * Se usa en cuatro lugares —teoría, enunciado del ejercicio, pregunta de la
 * evaluación y devolución— y en todos hace lo mismo, así que es un componente
 * y no cuatro formularios parecidos.
 *
 * La imagen se sube apenas se elige el archivo, antes de guardar la clase. Es a
 * propósito: subir al guardar significaría que un error de red a los cuarenta
 * minutos de trabajo se lleva puesto todo. Así, cuando aparece la miniatura, el
 * archivo ya está a salvo.
 *
 * ponytail: se usa <img> y no next/image. Es el panel, lo ve una persona, y
 * next/image pediría configurar el dominio de Supabase para optimizar lo que
 * nadie va a mirar dos veces.
 */
export function EditorMedios({
  medios,
  onChange,
  materiaSlug,
  claseSlug,
  etiqueta,
  ayuda,
}: {
  medios: MedioBorrador[]
  onChange: (medios: MedioBorrador[]) => void
  materiaSlug: string
  claseSlug: string
  etiqueta: string
  ayuda?: string
}) {
  const archivoRef = useRef<HTMLInputElement>(null)
  const [subiendo, empezar] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const cambiar = (i: number, cambio: Partial<MedioBorrador>) =>
    onChange(medios.map((m, k) => (k === i ? ({ ...m, ...cambio } as MedioBorrador) : m)))

  const reemplazar = (i: number, nuevo: MedioBorrador) =>
    onChange(medios.map((m, k) => (k === i ? nuevo : m)))

  const quitar = (i: number) => onChange(medios.filter((_, k) => k !== i))

  function elegirArchivo(archivo: File | undefined) {
    if (!archivo) return
    setError(null)

    empezar(async () => {
      const datos = new FormData()
      datos.set('archivo', archivo)
      datos.set('materia', materiaSlug)
      datos.set('clase', claseSlug)

      const r = await subirImagen(datos)
      if (r.ok) onChange([...medios, imagenVacia(r.url)])
      else setError(r.error)
    })

    // Se limpia para que elegir el MISMO archivo otra vez vuelva a disparar el
    // evento. Sin esto, un reintento después de un error no hace nada.
    if (archivoRef.current) archivoRef.current.value = ''
  }

  return (
    <fieldset className="rounded-lg border border-slate-200 p-3">
      <legend className="px-1 text-sm font-medium text-slate-700">{etiqueta}</legend>
      {ayuda && <p className="mb-2 text-xs text-slate-500">{ayuda}</p>}

      {medios.length > 0 && (
        <ul className="mb-3 space-y-3">
          {medios.map((m, i) => (
            <li key={i} className="flex gap-3 rounded-lg bg-slate-50 p-2">
              {m.tipo === 'imagen' ? (
                <img
                  src={m.url}
                  alt=""
                  className="h-20 w-20 shrink-0 rounded-md border border-slate-200 bg-white object-contain"
                />
              ) : (
                <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white">
                  {m.tipo === 'video' ? (
                    <Video size={22} className="text-slate-400" />
                  ) : (
                    <Clapperboard size={22} className="text-slate-400" />
                  )}
                </span>
              )}

              <div className="min-w-0 flex-1 space-y-2">
                {m.tipo === 'imagen' && (
                  <Campo
                    label="Qué se ve en la imagen"
                    ayuda="Obligatorio. Lo lee en voz alta el lector de pantalla de un alumno que no ve el dibujo."
                    error={m.alt.trim() ? undefined : 'Falta describir la imagen'}
                  >
                    <Texto
                      value={m.alt}
                      onChange={v => cambiar(i, { alt: v })}
                      placeholder="Bloque sobre un plano inclinado con tres fuerzas marcadas"
                    />
                  </Campo>
                )}
                {m.tipo === 'video' && (
                  <Campo
                    label="Enlace de YouTube"
                    error={
                      m.enlace.trim() && !idDeYouTube(m.enlace)
                        ? 'No se reconoce como un enlace de YouTube.'
                        : undefined
                    }
                  >
                    <Texto
                      value={m.enlace}
                      onChange={v => cambiar(i, { enlace: v })}
                      placeholder="https://www.youtube.com/watch?v=..."
                    />
                  </Campo>
                )}
                {m.tipo === 'polea-mesa' && (
                  <EditorPolea medio={m} onChange={nuevo => reemplazar(i, nuevo)} />
                )}
              </div>

              <button
                type="button"
                onClick={() => quitar(i)}
                aria-label="Quitar"
                className="flex h-11 w-11 shrink-0 items-center justify-center self-start rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 size={15} />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap gap-2">
        <input
          ref={archivoRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={e => elegirArchivo(e.target.files?.[0])}
        />
        <button
          type="button"
          disabled={subiendo}
          onClick={() => archivoRef.current?.click()}
          className="flex min-h-11 items-center gap-2 rounded-lg border border-slate-300 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          {subiendo ? <Loader2 size={15} className="animate-spin" /> : <ImagePlus size={15} />}
          {subiendo ? 'Subiendo…' : 'Subir imagen'}
        </button>

        <button
          type="button"
          onClick={() => onChange([...medios, videoMedioVacio()])}
          className="flex min-h-11 items-center gap-2 rounded-lg border border-slate-300 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <Video size={15} /> Agregar video
        </button>

        <button
          type="button"
          onClick={() => onChange([...medios, poleaVacia()])}
          className="flex min-h-11 items-center gap-2 rounded-lg border border-slate-300 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <Clapperboard size={15} /> Agregar animación
        </button>
      </div>

      {error && (
        <p role="alert" className="mt-2 text-sm font-medium text-red-600">
          {error}
        </p>
      )}
    </fieldset>
  )
}

type CampoNumerico = 'm1' | 'm2' | 'muEstatico' | 'muCinetico' | 'gravedad'

/**
 * Los datos de la animación y, debajo, la animación misma.
 *
 * Los errores salen del mismo schema que valida al guardar: no hay una segunda
 * copia de las reglas que se pueda desincronizar. Y la vista previa es el
 * mismo componente que ve el alumno, así que lo que se ve acá es lo que se
 * publica.
 */
function EditorPolea({
  medio,
  onChange,
}: {
  medio: PoleaBorrador
  onChange: (nuevo: PoleaBorrador) => void
}) {
  const r = MedioSchema.safeParse(medioAGuardar(medio))
  const error = (campo: CampoNumerico) =>
    r.success ? undefined : r.error.issues.find(i => i.path[0] === campo)?.message

  const numero = (campo: CampoNumerico, label: string, placeholder?: string) => (
    <Campo label={label} error={error(campo)}>
      <Texto
        value={medio[campo]}
        onChange={v => onChange({ ...medio, [campo]: v })}
        placeholder={placeholder}
      />
    </Campo>
  )

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {numero('m1', 'm₁ (kg)', '50')}
        {numero('m2', 'm₂ (kg)', '20')}
        {numero('muEstatico', 'μe', 'opcional')}
        {numero('muCinetico', 'μc', 'opcional')}
        {numero('gravedad', 'g (m/s²)')}
      </div>
      <p className="text-xs text-slate-500">
        Los μ son opcionales: si cargás uno solo, vale para los dos. Coma o punto, da igual.
      </p>
      <Casilla
        label="Mostrar valores (a y T)"
        checked={medio.mostrarValores}
        onChange={v => onChange({ ...medio, mostrarValores: v })}
      />
      <p className="text-xs text-slate-500">
        Prendelo solo en la explicación: en el enunciado le da la respuesta al alumno.
      </p>

      {r.success && r.data.tipo === 'polea-mesa' ? (
        <AnimacionPolea {...r.data} />
      ) : (
        <p className="rounded-md bg-white px-3 py-6 text-center text-sm text-slate-500">
          Completá los datos para ver la animación.
        </p>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Revisar tipos**

Run: `npx tsc --noEmit`
Expected: sin errores.

- [ ] **Step 3: Correr todos los tests**

Run: `npm test`
Expected: PASS, todos.

- [ ] **Step 4: Commit**

```bash
git add src/components/admin/EditorMedios.tsx
git commit -F - <<'EOF'
feat: el panel carga la animacion de la polea, con vista previa

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

### Task 5: Plantilla para el profesor y verificación de punta a punta

**Files:**
- Modify: `docs/plantilla-clase.md` (después de la tabla de "Ojo con dónde ponés cada cosa", antes de `## Teoría`)
- Temporal, NO se commitea: `src/app/prueba-polea/page.tsx`

**Interfaces:**
- Consumes: `Medios` (Task 3).
- Produces: nada.

- [ ] **Step 1: Documentar la animación en la plantilla**

En `docs/plantilla-clase.md`, justo antes de `## Teoría`:

```markdown
### Animación: caja sobre una mesa con polea

Para el dibujo clásico de una caja sobre la mesa unida por una polea a una bola
que cuelga, en vez de subir una imagen podés cargar una **animación**: el
alumno aprieta Reproducir y ve cómo la bola cae y arrastra la caja, con la
aceleración real del ejercicio.

| Dato | Qué poner |
|---|---|
| m₁ | Masa de la caja, en kg (obligatoria) |
| m₂ | Masa de la bola, en kg (obligatoria) |
| μe y μc | Rozamiento estático y cinético entre la caja y la mesa. Opcionales; si el ejercicio da uno solo, cargá ese y vale para los dos |
| g | 9,8 por defecto. Si resolvés con 10, poné 10: si no, los valores no coinciden con los tuyos |
| Mostrar valores | Muestra a y T al lado del botón |

Coma o punto, da igual: 0,3 y 0.3 son lo mismo.

⚠️ **"Mostrar valores" va solo en la explicación.** En el enunciado le da la
respuesta al alumno.

⚠️ **Si la pregunta es "¿se mueve el sistema?", la animación va en la
explicación**, no en el enunciado: apretar Reproducir ya responde la pregunta.
```

- [ ] **Step 2: Build completo**

Run: `npm run build`
Expected: termina sin errores; las páginas de clase siguen saliendo como estáticas (● / SSG) en la tabla final, igual que antes.

- [ ] **Step 3: Página temporal de prueba**

Crear `src/app/prueba-polea/page.tsx` (NO se commitea):

```tsx
import { Medios } from '@/components/Medios'

export default function PruebaPolea() {
  return (
    <main className="mx-auto max-w-2xl space-y-6 p-6">
      <Medios
        medios={[
          { tipo: 'polea-mesa', m1: 50, m2: 20, mostrarValores: true },
          { tipo: 'polea-mesa', m1: 50, m2: 20, muEstatico: 0.4, mostrarValores: true },
          { tipo: 'polea-mesa', m1: 1000, m2: 999.99 },
        ]}
      />
    </main>
  )
}
```

- [ ] **Step 4: Verificar en el navegador**

1. `preview_start` con `name: "galileo"` y navegar a `http://localhost:3000/prueba-polea`.
2. `read_console_messages` con `onlyErrors: true` → sin errores.
3. `find` "Reproducir" → tres botones.
4. Click en el primero y en el segundo. Con `javascript_tool`:
   ```js
   const figs = [...document.querySelectorAll('figure')]
   document.getAnimations().forEach(a => a.finish())
   figs.map(f => {
     const svg = f.querySelector('svg').getBoundingClientRect()
     const [caja, bola] = [...f.querySelectorAll('g.polea-pieza')].slice(1)
     const c = caja.getBoundingClientRect(), b = bola.getBoundingClientRect()
     return {
       anda: f.querySelector('svg').classList.contains('polea-anda'),
       animaciones: f.querySelector('svg').getAnimations({ subtree: true }).length,
       bolaDentro: b.bottom <= svg.bottom && b.left >= svg.left,
       cajaIzq: Math.round(c.left - svg.left),
       texto: f.querySelector('figcaption').innerText,
     }
   })
   ```
   Esperado:
   - Figura 1: `anda: true`, `animaciones: 5`, `bolaDentro: true`, texto con "a = 2,8 m/s² · T = 140 N" y "Reiniciar".
   - Figura 2: `anda: false` (no arranca), texto con "a = 0 m/s² · T = 196 N" y "El sistema queda en reposo".
   - Figura 3 (sin click): `anda: false`; la etiqueta "m₂ = 999,99 kg" entra (`bolaDentro: true` también mide el texto, que está dentro del grupo de la bola).
5. Click en "Reiniciar" de la figura 1 → vuelve a "Reproducir" y `anda: false`.
6. `computer` → `screenshot` como prueba (si el panel está oculto y no sale, alcanza con las mediciones).

- [ ] **Step 5: Borrar la página temporal**

```bash
rm -r src/app/prueba-polea
git status --short
```
Expected: solo aparece `docs/plantilla-clase.md` como modificado.

- [ ] **Step 6: Commit**

```bash
git add docs/plantilla-clase.md
git commit -F - <<'EOF'
docs: como cargar la animacion de la polea en la plantilla

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```
