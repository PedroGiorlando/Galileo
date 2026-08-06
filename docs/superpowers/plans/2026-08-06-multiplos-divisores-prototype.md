# Prototipo "Múltiplos y divisores" — Plan de Implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Página React de un solo tema de matemática ("Múltiplos y divisores") con 5 tabs (Lección, Explicación escrita, Ejemplos resueltos, Ejercicios, Autoevaluación), sidebar de temario, header con breadcrumbs, y progreso persistido en localStorage — sin backend ni login.

**Architecture:** Vite + React + TypeScript + Tailwind CSS v4 + lucide-react. Una sola página (`App.tsx`), sin router. Estado del "tema completado" vive en `App.tsx` y se pasa por props a los 5 tabs (prop drilling, sin Context). Contenido hardcodeado en `src/data/topicData.ts`, separado de los componentes. Progreso de ejercicios y mejor puntaje de quiz persisten en localStorage de forma local a sus propios componentes (nadie más los necesita).

**Tech Stack:** React 18, TypeScript 5, Vite 5, Tailwind CSS v4 (plugin de Vite, sin `tailwind.config.js`), lucide-react.

## Global Constraints

- Todo el texto de cara al usuario va en español (rioplatense, tono neutro tipo plataforma educativa).
- Sin backend, sin fetch, sin autenticación real — el header siempre muestra "Iniciar sesión / Registrate".
- TypeScript en modo `strict`. Cero `any`.
- Sin test framework (no fue pedido). Verificación por tarea: `npm run build` (type-check + bundle) y, cuando aplique, una comprobación concreta del output (grep sobre `dist/`).
- Cada tarea termina con un commit propio.
- Comentarios en el código: solo donde el porqué no sea obvio (decisiones de estado, workarounds). No comentar lo evidente.

---

## Mapa de archivos

```
package.json, tsconfig.json, tsconfig.node.json, vite.config.ts, index.html, .gitignore
src/
  main.tsx
  index.css
  data/topicData.ts
  hooks/useLocalStorage.ts
  components/
    Header.tsx
    Sidebar.tsx
    RightPanel.tsx
    ProgressRing.tsx
    tabs/
      LeccionTab.tsx
      ExplicacionTab.tsx
      EjemplosTab.tsx
      EjerciciosTab.tsx
      AutoevaluacionTab.tsx
  App.tsx
README.md
```

---

### Task 1: Scaffold del proyecto (Vite + React + TS)

**Files:**
- Create: `package.json`, `tsconfig.json`, `tsconfig.node.json`, `vite.config.ts`, `index.html`, `.gitignore`
- Create: `src/main.tsx`, `src/App.tsx`, `src/index.css`

**Interfaces:**
- Produces: comando `npm run build` funcionando (type-check + bundle a `dist/`), que todas las tareas siguientes usan para verificar.

- [ ] **Step 1: Crear package.json base**

```bash
npm init -y
```

- [ ] **Step 2: Editar package.json — nombre, type module, scripts**

Reemplazar el contenido generado por:

```json
{
  "name": "academia-galileo-prototipo",
  "private": true,
  "version": "0.0.1",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview"
  }
}
```

- [ ] **Step 3: Instalar dependencias**

```bash
npm install react react-dom
npm install -D vite @vitejs/plugin-react typescript @types/react @types/react-dom
```

- [ ] **Step 4: Crear tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

- [ ] **Step 5: Crear tsconfig.node.json**

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
```

- [ ] **Step 6: Crear vite.config.ts**

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
```

- [ ] **Step 7: Crear index.html**

```html
<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Academia Galileo — Múltiplos y divisores</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 8: Crear .gitignore**

```
node_modules
dist
*.local
```

- [ ] **Step 9: Crear src/index.css (vacío por ahora, Tailwind lo llena en Task 2)**

```css
/* Tailwind se agrega en la siguiente tarea */
```

- [ ] **Step 10: Crear src/App.tsx (placeholder)**

```tsx
function App() {
  return <div>Academia Galileo</div>
}

export default App
```

- [ ] **Step 11: Crear src/main.tsx**

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

- [ ] **Step 12: Verificar build**

```bash
npm run build
```

Expected: termina sin errores, genera carpeta `dist/`.

- [ ] **Step 13: Commit**

```bash
git add -A
git commit -m "chore: scaffold vite + react + typescript project"
```

---

### Task 2: Tailwind CSS v4

**Files:**
- Modify: `vite.config.ts`, `src/index.css`, `src/App.tsx`

**Interfaces:**
- Consumes: scaffold de Task 1.
- Produces: clases Tailwind disponibles en toda la app (`className="..."` funciona).

- [ ] **Step 1: Instalar Tailwind**

```bash
npm install tailwindcss @tailwindcss/vite
```

- [ ] **Step 2: Agregar el plugin de Tailwind a Vite**

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

- [ ] **Step 3: Importar Tailwind en index.css**

```css
@import "tailwindcss";
```

- [ ] **Step 4: Probar una clase en App.tsx (temporal, se reemplaza en Task 14)**

```tsx
function App() {
  return <div className="bg-green-600 text-white p-4">Academia Galileo</div>
}

export default App
```

- [ ] **Step 5: Verificar que Tailwind generó la clase**

```bash
npm run build
grep -r "bg-green-600" dist/assets/*.css
```

Expected: el grep encuentra la regla CSS (confirma que Tailwind está escaneando `App.tsx` y generando utilidades reales, no solo que el build no rompió).

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore: add tailwind css v4"
```

---

### Task 3: Datos del tema (`topicData.ts`)

**Files:**
- Create: `src/data/topicData.ts`

**Interfaces:**
- Produces (usado por todas las tabs y por Sidebar/RightPanel):
  - `export interface Ejemplo { id: number; titulo: string; enunciado: string; pasos: string[] }`
  - `export type Ejercicio = EjercicioLibre | EjercicioMultiple | EjercicioSiNo` (con sus 3 interfaces)
  - `export interface PreguntaQuiz { id: number; pregunta: string; opciones: string[]; respuestaCorrectaIndex: number; explicacion: string }`
  - `export interface SeccionExplicacion { titulo: string; parrafo: string; caja?: { tipo: 'ejemplo' | 'tip' | 'nota'; contenido: string } }`
  - `export interface TemaSidebarItem { id: number; titulo: string; completado: boolean; actual: boolean }`
  - `export const tema: Tema` (objeto único con todo el contenido)
  - `export const temarioSidebar: TemaSidebarItem[]` (30 items)

- [ ] **Step 1: Escribir src/data/topicData.ts completo**

```ts
export interface Ejemplo {
  id: number
  titulo: string
  enunciado: string
  pasos: string[]
}

export interface EjercicioBase {
  id: number
  enunciado: string
  explicacion: string
  puntos: number
}

export interface EjercicioLibre extends EjercicioBase {
  tipo: 'libre'
  respuestaCorrecta: string
}

export interface EjercicioMultiple extends EjercicioBase {
  tipo: 'multiple'
  opciones: string[]
  respuestaCorrecta: string[]
}

export interface EjercicioSiNo extends EjercicioBase {
  tipo: 'si-no'
  respuestaCorrecta: 'Sí' | 'No'
}

export type Ejercicio = EjercicioLibre | EjercicioMultiple | EjercicioSiNo

export interface PreguntaQuiz {
  id: number
  pregunta: string
  opciones: string[]
  respuestaCorrectaIndex: number
  explicacion: string
}

export interface SeccionExplicacion {
  titulo: string
  parrafo: string
  caja?: {
    tipo: 'ejemplo' | 'tip' | 'nota'
    contenido: string
  }
}

export interface Tema {
  id: number
  titulo: string
  grado: string
  categoria: string
  duracionLabel: string
  objetivos: string[]
  explicacion: SeccionExplicacion[]
  ejemplos: Ejemplo[]
  ejercicios: Ejercicio[]
  quiz: PreguntaQuiz[]
}

export const tema: Tema = {
  id: 7,
  titulo: 'Múltiplos y divisores',
  grado: '4° Grado',
  categoria: 'Números y Operaciones',
  duracionLabel: '10:15',
  objetivos: [
    'Qué son los múltiplos y cómo encontrarlos.',
    'Qué son los divisores y cómo identificarlos.',
    'Relación entre múltiplos y divisores.',
    'Ejercicios prácticos y ejemplos.',
  ],
  explicacion: [
    {
      titulo: '¿Qué son los múltiplos?',
      parrafo:
        'Los múltiplos de un número son todos los resultados que obtenemos al multiplicar ese número por 0, 1, 2, 3, 4, 5, ...',
      caja: {
        tipo: 'ejemplo',
        contenido:
          'Múltiplos de 6:\n6×0=0  6×1=6  6×2=12  6×3=18  6×4=24 ...\nPor lo tanto, los múltiplos de 6 son: 0, 6, 12, 18, 24, 30, 36, 42, 48, ...',
      },
    },
    {
      titulo: '¿Qué son los divisores?',
      parrafo:
        'Los divisores de un número son los números que lo dividen en forma exacta, es decir, sin dejar resto.',
      caja: {
        tipo: 'ejemplo',
        contenido:
          'Divisores de 12:\nLos números que dividen a 12 sin dejar resto son: 1, 2, 3, 4, 6, 12',
      },
    },
    {
      titulo: 'Relación entre múltiplos y divisores',
      parrafo: 'Si un número es múltiplo de otro, entonces ese otro número es divisor del primero.',
      caja: {
        tipo: 'ejemplo',
        contenido: '12 es múltiplo de 3 porque 12 = 3×4.\nPor lo tanto, 3 es divisor de 12.',
      },
    },
  ],
  ejemplos: [
    {
      id: 1,
      titulo: 'Escribir los 10 primeros múltiplos de 8',
      enunciado: 'Escribir los 10 primeros múltiplos de 8.',
      pasos: [
        'Multiplicamos 8 por los números naturales desde 0 hasta 9.',
        '8×0=0  8×1=8  8×2=16  8×3=24  8×4=32  8×5=40  8×6=48  8×7=56  8×8=64  8×9=72',
        'Los 10 primeros múltiplos de 8 son: 0, 8, 16, 24, 32, 40, 48, 56, 64, 72',
      ],
    },
    {
      id: 2,
      titulo: 'Encontrar los divisores de 24',
      enunciado: 'Encontrar los divisores de 24.',
      pasos: [
        'Buscamos los números que dividen a 24 en forma exacta (resto 0).',
        '24÷1=24  24÷2=12  24÷3=8  24÷4=6  24÷6=4  24÷8=3  24÷12=2  24÷24=1',
        'Los divisores de 24 son: 1, 2, 3, 4, 6, 8, 12, 24',
      ],
    },
    {
      id: 3,
      titulo: '¿Es 15 múltiplo de 3? ¿Y 3 divisor de 15?',
      enunciado: '¿Es 15 múltiplo de 3? ¿Y 3 divisor de 15?',
      pasos: [
        'Para saber si 15 es múltiplo de 3: 15÷3=5, resto 0 → como el resto es 0, 15 es múltiplo de 3.',
        'Para saber si 3 es divisor de 15: 15÷3=5, resto 0 → como el resto es 0, 3 es divisor de 15.',
        'Múltiplo y divisor son dos caras de la misma relación: 15 es múltiplo de 3 y, al mismo tiempo, 3 es divisor de 15.',
      ],
    },
  ],
  ejercicios: [
    {
      id: 1,
      tipo: 'libre',
      enunciado: 'Escribí los 8 primeros múltiplos de 7 (empezando en 0).',
      respuestaCorrecta: '0,7,14,21,28,35,42,49',
      explicacion: 'Se multiplica 7 por 0,1,2,3,4,5,6 y 7: 0, 7, 14, 21, 28, 35, 42, 49.',
      puntos: 2,
    },
    {
      id: 2,
      tipo: 'multiple',
      enunciado: '¿Cuáles de estos números son múltiplos de 6? 12 - 18 - 20 - 24 - 33 - 36',
      opciones: ['12', '18', '20', '24', '33', '36'],
      respuestaCorrecta: ['12', '18', '24', '36'],
      explicacion: '12, 18, 24 y 36 son múltiplos de 6 (6×2, 6×3, 6×4, 6×6). 20 y 33 no lo son.',
      puntos: 2,
    },
    {
      id: 3,
      tipo: 'libre',
      enunciado: 'Escribí todos los divisores de 30.',
      respuestaCorrecta: '1,2,3,5,6,10,15,30',
      explicacion: 'Los números que dividen a 30 sin dejar resto son: 1, 2, 3, 5, 6, 10, 15, 30.',
      puntos: 2,
    },
    {
      id: 4,
      tipo: 'si-no',
      enunciado: '¿Es 84 múltiplo de 12?',
      respuestaCorrecta: 'Sí',
      explicacion: '84÷12=7, resto 0. Como el resto es 0, 84 sí es múltiplo de 12.',
      puntos: 1,
    },
    {
      id: 5,
      tipo: 'multiple',
      enunciado: '¿Cuál de estos números NO es divisor de 40? 2 - 4 - 5 - 6 - 8 - 10',
      opciones: ['2', '4', '5', '6', '8', '10'],
      respuestaCorrecta: ['6'],
      explicacion: 'Los divisores de 40 son 1, 2, 4, 5, 8, 10, 20, 40. El 6 no es divisor de 40 (40÷6 no es exacto).',
      puntos: 1,
    },
  ],
  quiz: [
    {
      id: 1,
      pregunta: '¿Cuál de estos números es múltiplo de 8?',
      opciones: ['18', '24', '30', '45'],
      respuestaCorrectaIndex: 1,
      explicacion: '24 es múltiplo de 8 porque 8×3=24.',
    },
    {
      id: 2,
      pregunta: '¿Cuál de estos números NO es múltiplo de 5?',
      opciones: ['25', '40', '52', '60'],
      respuestaCorrectaIndex: 2,
      explicacion: '52 no es múltiplo de 5: no termina en 0 ni en 5.',
    },
    {
      id: 3,
      pregunta: '¿Cuáles son los divisores de 18?',
      opciones: ['1, 2, 3, 6, 9, 18', '1, 2, 4, 6, 9, 18', '1, 3, 6, 9, 12, 18', '1, 2, 3, 6, 9, 12'],
      respuestaCorrectaIndex: 0,
      explicacion: 'Los divisores de 18 son 1, 2, 3, 6, 9 y 18.',
    },
    {
      id: 4,
      pregunta: '¿Es 45 divisor de 135?',
      opciones: ['Sí, es divisor exacto', 'No, sobra resto', 'Depende del contexto', 'No se puede saber'],
      respuestaCorrectaIndex: 0,
      explicacion: '135÷45=3, resto 0. Como el resto es 0, 45 es divisor de 135.',
    },
    {
      id: 5,
      pregunta: '¿Cuál es el primer múltiplo de 9 mayor que 50?',
      opciones: ['45', '54', '60', '63'],
      respuestaCorrectaIndex: 1,
      explicacion: '9×5=45 (no supera 50). 9×6=54, que sí supera 50 y es el primero en hacerlo.',
    },
    {
      id: 6,
      pregunta: '¿Cuántos divisores tiene el número 16?',
      opciones: ['3', '4', '5', '6'],
      respuestaCorrectaIndex: 2,
      explicacion: 'Los divisores de 16 son 1, 2, 4, 8 y 16: en total 5.',
    },
    {
      id: 7,
      pregunta: '¿Cuál de estos números es divisor de 60 y también múltiplo de 4?',
      opciones: ['9', '14', '20', '26'],
      respuestaCorrectaIndex: 2,
      explicacion: '20 divide a 60 exactamente (60÷20=3) y además es múltiplo de 4 (4×5=20).',
    },
    {
      id: 8,
      pregunta: '¿Cuál de estas afirmaciones es correcta?',
      opciones: [
        'Todo número tiene infinitos múltiplos.',
        'Todo número tiene infinitos divisores.',
        'El 1 no es divisor de ningún número.',
        'Los múltiplos de un número son siempre menores que él.',
      ],
      respuestaCorrectaIndex: 0,
      explicacion: 'Todo número tiene infinitos múltiplos (se puede multiplicar por 0,1,2,3... sin parar), pero una cantidad limitada de divisores.',
    },
    {
      id: 9,
      pregunta: '¿Cuál de estos pares tiene una relación correcta de múltiplo-divisor?',
      opciones: ['5 es múltiplo de 20', '20 es múltiplo de 5', '5 es divisor de 3', '20 no tiene divisores'],
      respuestaCorrectaIndex: 1,
      explicacion: '20 es múltiplo de 5 porque 5×4=20.',
    },
    {
      id: 10,
      pregunta: 'Si un número es divisor de 48, ¿cuál de estos NO puede ser?',
      opciones: ['7', '8', '12', '16'],
      respuestaCorrectaIndex: 0,
      explicacion: 'Los divisores de 48 son 1, 2, 3, 4, 6, 8, 12, 16, 24 y 48. El 7 no está en esa lista.',
    },
  ],
}

export interface TemaSidebarItem {
  id: number
  titulo: string
  completado: boolean
  actual: boolean
}

export const temarioSidebar: TemaSidebarItem[] = [
  { id: 1, titulo: 'Números naturales hasta el 100.000', completado: true, actual: false },
  { id: 2, titulo: 'Cálculos mentales y aproximaciones', completado: true, actual: false },
  { id: 3, titulo: 'Suma y resta', completado: true, actual: false },
  { id: 4, titulo: 'Multiplicación', completado: true, actual: false },
  { id: 5, titulo: 'División', completado: true, actual: false },
  { id: 6, titulo: 'Criterios de divisibilidad', completado: true, actual: false },
  { id: 7, titulo: 'Múltiplos y divisores', completado: false, actual: true },
  { id: 8, titulo: 'Situaciones problemáticas', completado: false, actual: false },
  { id: 9, titulo: 'Potencias y raíces', completado: false, actual: false },
  { id: 10, titulo: 'Números romanos', completado: false, actual: false },
]

export const TOTAL_TEMAS_GRADO = 30
```

- [ ] **Step 2: Verificar build**

```bash
npm run build
```

Expected: sin errores de tipos.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add hardcoded topic data for multiplos y divisores"
```

---

### Task 4: Hook useLocalStorage

**Files:**
- Create: `src/hooks/useLocalStorage.ts`

**Interfaces:**
- Produces: `useLocalStorage<T>(key: string, defaultValue: T): [T, (next: T | ((prev: T) => T)) => void]`

- [ ] **Step 1: Escribir el hook**

```ts
import { useState } from 'react'

/**
 * Mismo contrato que useState, pero lee el valor inicial de localStorage
 * y escribe ahí en cada cambio. Si localStorage falla (modo privado, cuota
 * llena) simplemente no persiste — la app sigue funcionando en memoria.
 */
export function useLocalStorage<T>(
  key: string,
  defaultValue: T,
): [T, (next: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = window.localStorage.getItem(key)
      return stored ? (JSON.parse(stored) as T) : defaultValue
    } catch {
      return defaultValue
    }
  })

  const setAndPersist = (next: T | ((prev: T) => T)) => {
    setValue(prev => {
      const resolved = next instanceof Function ? next(prev) : next
      try {
        window.localStorage.setItem(key, JSON.stringify(resolved))
      } catch {
        // localStorage no disponible: seguimos solo en memoria.
      }
      return resolved
    })
  }

  return [value, setAndPersist]
}
```

- [ ] **Step 2: Verificar build**

```bash
npm run build
```

Expected: sin errores.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add useLocalStorage hook"
```

---

### Task 5: ProgressRing

**Files:**
- Create: `src/components/ProgressRing.tsx`

**Interfaces:**
- Produces: `<ProgressRing percent={number} size?={number} />` — SVG circular, verde, con el % como texto centrado.

- [ ] **Step 1: Escribir el componente**

```tsx
interface ProgressRingProps {
  percent: number
  size?: number
}

export function ProgressRing({ percent, size = 96 }: ProgressRingProps) {
  const strokeWidth = 8
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percent / 100) * circumference

  return (
    <svg width={size} height={size} className="shrink-0">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#e5e7eb"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#16a34a"
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        className="fill-slate-800 text-lg font-bold"
      >
        {Math.round(percent)}%
      </text>
    </svg>
  )
}
```

- [ ] **Step 2: Verificar build**

```bash
npm run build
```

Expected: sin errores.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add ProgressRing component"
```

---

### Task 6: Header

**Files:**
- Create: `src/components/Header.tsx`

**Interfaces:**
- Produces: `<Header breadcrumbs={string[]} />` — navbar oscura fija + fila de breadcrumbs debajo.

- [ ] **Step 1: Escribir el componente**

```tsx
import { Search, GraduationCap } from 'lucide-react'

interface HeaderProps {
  breadcrumbs: string[]
}

const NAV_LINKS = ['Inicio', 'Cursos', 'Nosotros', 'Método', 'Preguntas Frecuentes', 'Contacto']

export function Header({ breadcrumbs }: HeaderProps) {
  return (
    <div>
      <header className="flex items-center justify-between bg-slate-900 px-6 py-3 text-white">
        <div className="flex items-center gap-2 font-bold">
          <GraduationCap className="text-green-500" />
          <span>
            ACADEMIA <span className="text-green-500">GALILEO</span>
          </span>
        </div>

        <nav className="hidden gap-6 text-sm md:flex">
          {NAV_LINKS.map(link => (
            <span
              key={link}
              className={link === 'Cursos' ? 'text-green-400' : 'text-slate-200'}
            >
              {link}
            </span>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Search size={18} className="text-slate-300" />
          <button className="rounded-md border border-slate-600 px-3 py-1.5 text-sm">
            Iniciar sesión
          </button>
          <button className="rounded-md bg-green-600 px-3 py-1.5 text-sm font-medium">
            Registrate
          </button>
        </div>
      </header>

      <div className="border-b border-slate-200 bg-white px-6 py-2 text-sm text-slate-500">
        {breadcrumbs.map((crumb, i) => (
          <span key={crumb}>
            {i > 0 && <span className="mx-2">›</span>}
            <span className={i === breadcrumbs.length - 1 ? 'font-medium text-slate-700' : ''}>
              {crumb}
            </span>
          </span>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verificar build**

```bash
npm run build
```

Expected: sin errores.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add Header component"
```

---

### Task 7: Sidebar

**Files:**
- Create: `src/components/Sidebar.tsx`

**Interfaces:**
- Consumes: `temarioSidebar` y `tema` de `src/data/topicData.ts`.
- Produces: `<Sidebar />` — sin props: lee directo de `topicData` porque es contenido fijo del prototipo, nadie más lo necesita pasar.

- [ ] **Step 1: Escribir el componente**

```tsx
import { CheckCircle2, Circle, Lock } from 'lucide-react'
import { temarioSidebar, tema } from '../data/topicData'

export function Sidebar() {
  return (
    <aside className="w-72 shrink-0 rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-xs font-semibold uppercase text-slate-400">{tema.categoria}</p>
      <h2 className="mb-1 text-lg font-bold text-slate-800">Temario del curso</h2>
      <p className="mb-4 text-sm text-slate-500">
        Tema {tema.id} de {temarioSidebar.length}
      </p>

      <ul className="space-y-1">
        {temarioSidebar.map(item => (
          <li
            key={item.id}
            className={`flex items-center gap-2 rounded-md px-2 py-2 text-sm ${
              item.actual ? 'bg-green-50 font-medium text-green-700' : 'text-slate-600'
            }`}
          >
            {item.completado ? (
              <CheckCircle2 size={16} className="shrink-0 text-green-600" />
            ) : item.actual ? (
              <Circle size={16} className="shrink-0 text-green-600" />
            ) : (
              <Lock size={14} className="shrink-0 text-slate-300" />
            )}
            <span>{item.id}. {item.titulo}</span>
          </li>
        ))}
      </ul>

      <button
        type="button"
        disabled
        className="mt-4 w-full cursor-not-allowed rounded-md border border-slate-200 py-2 text-sm text-slate-400"
      >
        Ver todos los temas
      </button>
    </aside>
  )
}
```

- [ ] **Step 2: Verificar build**

```bash
npm run build
```

Expected: sin errores.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add Sidebar component"
```

---

### Task 8: RightPanel

**Files:**
- Create: `src/components/RightPanel.tsx`

**Interfaces:**
- Consumes: `courseProgressPercent: number`, `completedCount: number`, `totalCount: number` (props, calculados en `App.tsx`).
- Produces: `<RightPanel courseProgressPercent={number} completedCount={number} totalCount={number} />`. Mismo panel para las 5 tabs.

- [ ] **Step 1: Escribir el componente**

```tsx
import { FileText, FileSpreadsheet, Printer, MessageCircleQuestion } from 'lucide-react'
import { ProgressRing } from './ProgressRing'

interface RightPanelProps {
  courseProgressPercent: number
  completedCount: number
  totalCount: number
}

const RECURSOS = [
  { icon: FileText, label: 'Resumen del tema', accion: 'Descargar (PDF)' },
  { icon: FileSpreadsheet, label: 'Ficha de ejemplos', accion: 'Descargar (PDF)' },
  { icon: Printer, label: 'Ejercicios imprimibles', accion: 'Descargar (PDF)' },
]

// Los recursos y el soporte son decorativos: no hay archivos ni backend
// detrás, así que un click solo confirma visualmente que "no está conectado".
function avisoDecorativo(label: string) {
  window.alert(`"${label}" es solo una demo visual, no descarga nada todavía.`)
}

export function RightPanel({ courseProgressPercent, completedCount, totalCount }: RightPanelProps) {
  return (
    <aside className="w-72 shrink-0 space-y-4">
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <h3 className="mb-3 text-sm font-semibold text-slate-700">Tu progreso en el curso</h3>
        <div className="flex items-center gap-4">
          <ProgressRing percent={courseProgressPercent} size={80} />
          <p className="text-sm text-slate-600">
            {completedCount} de {totalCount} temas completados
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <h3 className="mb-3 text-sm font-semibold text-slate-700">Recursos del tema</h3>
        <ul className="space-y-3">
          {RECURSOS.map(r => (
            <li key={r.label} className="flex items-center gap-3 text-sm">
              <r.icon size={18} className="text-green-600" />
              <div>
                <p className="text-slate-700">{r.label}</p>
                <button
                  type="button"
                  onClick={() => avisoDecorativo(r.label)}
                  className="text-green-600 hover:underline"
                >
                  {r.accion}
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
          <MessageCircleQuestion size={16} /> ¿Dudas sobre este tema?
        </h3>
        <p className="mb-3 text-sm text-slate-500">Dejanos tu consulta y te respondemos.</p>
        <button
          type="button"
          onClick={() => avisoDecorativo('Hacer una pregunta')}
          className="w-full rounded-md border border-slate-200 py-2 text-sm text-slate-700 hover:bg-slate-50"
        >
          Hacer una pregunta
        </button>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <h3 className="mb-2 text-sm font-semibold text-slate-700">Notas personales</h3>
        <textarea
          className="w-full rounded-md border border-slate-200 p-2 text-sm"
          rows={3}
          placeholder="Escribí aquí tus apuntes..."
        />
        <p className="mt-1 text-xs text-slate-400">Estas notas son privadas y solo visibles para vos.</p>
      </div>
    </aside>
  )
}
```

- [ ] **Step 2: Verificar build**

```bash
npm run build
```

Expected: sin errores.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add RightPanel component"
```

---

### Task 9: LeccionTab

**Files:**
- Create: `src/components/tabs/LeccionTab.tsx`

**Interfaces:**
- Consumes: `tema` de `topicData.ts`; props `completado: boolean`, `onMarcarCompletado: () => void` (vienen de `App.tsx`, compartidas por las 5 tabs).
- Produces: `<LeccionTab completado={boolean} onMarcarCompletado={() => void} />`

- [ ] **Step 1: Escribir el componente**

```tsx
import { useState } from 'react'
import { Play, Pause, CheckCircle2 } from 'lucide-react'
import { tema } from '../../data/topicData'

interface LeccionTabProps {
  completado: boolean
  onMarcarCompletado: () => void
}

// El video es un placeholder: no hay archivo real, solo un botón que
// alterna un ícono play/pausa y una barra fija. Alcanza para probar la
// interacción sin tener que servir un video real en el prototipo.
export function LeccionTab({ completado, onMarcarCompletado }: LeccionTabProps) {
  const [reproduciendo, setReproduciendo] = useState(false)

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-orange-500">TEMA {tema.id}</p>
          <h1 className="text-2xl font-bold text-slate-800">{tema.titulo}</h1>
        </div>
        <button
          type="button"
          onClick={onMarcarCompletado}
          className={`flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-medium ${
            completado
              ? 'border-green-600 bg-green-50 text-green-700'
              : 'border-slate-300 text-slate-600'
          }`}
        >
          <CheckCircle2 size={16} />
          {completado ? 'Completado' : 'Marcar como completado'}
        </button>
      </div>

      <div className="rounded-lg border border-slate-200 bg-slate-900 p-8 text-center text-white">
        <button
          type="button"
          onClick={() => setReproduciendo(r => !r)}
          className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-600"
        >
          {reproduciendo ? <Pause size={24} /> : <Play size={24} />}
        </button>
        <div className="h-1.5 w-full rounded-full bg-slate-700">
          <div className="h-1.5 w-1/3 rounded-full bg-green-500" />
        </div>
        <p className="mt-2 text-xs text-slate-400">03:42 / {tema.duracionLabel}</p>
      </div>

      <div className="rounded-lg border border-green-200 bg-green-50 p-4">
        <p className="mb-2 text-sm font-semibold text-green-800">En esta lección aprenderás:</p>
        <ul className="space-y-1 text-sm text-green-700">
          {tema.objetivos.map(obj => (
            <li key={obj} className="flex items-start gap-2">
              <CheckCircle2 size={14} className="mt-0.5 shrink-0" />
              {obj}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verificar build**

```bash
npm run build
```

Expected: sin errores.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add LeccionTab"
```

---

### Task 10: ExplicacionTab

**Files:**
- Create: `src/components/tabs/ExplicacionTab.tsx`

**Interfaces:**
- Consumes: `tema.explicacion` de `topicData.ts`; mismas props `completado`/`onMarcarCompletado` que Task 9.
- Produces: `<ExplicacionTab completado={boolean} onMarcarCompletado={() => void} />`

- [ ] **Step 1: Escribir el componente**

```tsx
import { CheckCircle2, Lightbulb } from 'lucide-react'
import { tema } from '../../data/topicData'

interface ExplicacionTabProps {
  completado: boolean
  onMarcarCompletado: () => void
}

export function ExplicacionTab({ completado, onMarcarCompletado }: ExplicacionTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <h1 className="text-2xl font-bold text-slate-800">{tema.titulo}</h1>
        <button
          type="button"
          onClick={onMarcarCompletado}
          className={`flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-medium ${
            completado
              ? 'border-green-600 bg-green-50 text-green-700'
              : 'border-slate-300 text-slate-600'
          }`}
        >
          <CheckCircle2 size={16} />
          {completado ? 'Completado' : 'Marcar como completado'}
        </button>
      </div>

      {tema.explicacion.map(seccion => (
        <section key={seccion.titulo}>
          <h2 className="mb-2 text-lg font-bold text-slate-800">{seccion.titulo}</h2>
          <p className="mb-3 text-slate-600">{seccion.parrafo}</p>
          {seccion.caja && (
            <div
              className={`rounded-lg border p-4 text-sm ${
                seccion.caja.tipo === 'tip'
                  ? 'border-amber-200 bg-amber-50 text-amber-800'
                  : 'border-green-200 bg-green-50 text-green-800'
              }`}
            >
              {seccion.caja.tipo === 'tip' && <Lightbulb size={16} className="mb-1" />}
              <pre className="whitespace-pre-wrap font-sans">{seccion.caja.contenido}</pre>
            </div>
          )}
        </section>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Verificar build**

```bash
npm run build
```

Expected: sin errores.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add ExplicacionTab"
```

---

### Task 11: EjemplosTab

**Files:**
- Create: `src/components/tabs/EjemplosTab.tsx`

**Interfaces:**
- Consumes: `tema.ejemplos` de `topicData.ts`; props `completado`/`onMarcarCompletado`.
- Produces: `<EjemplosTab completado={boolean} onMarcarCompletado={() => void} />`
- Estado interno: índice del ejemplo actual (`useState`, no se persiste — no hace falta recordar en qué ejemplo se quedó entre sesiones).

- [ ] **Step 1: Escribir el componente**

```tsx
import { useState } from 'react'
import { CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react'
import { tema } from '../../data/topicData'

interface EjemplosTabProps {
  completado: boolean
  onMarcarCompletado: () => void
}

export function EjemplosTab({ completado, onMarcarCompletado }: EjemplosTabProps) {
  const [indice, setIndice] = useState(0)
  const ejemplo = tema.ejemplos[indice]
  const esPrimero = indice === 0
  const esUltimo = indice === tema.ejemplos.length - 1

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <h1 className="text-2xl font-bold text-slate-800">{tema.titulo}</h1>
        <button
          type="button"
          onClick={onMarcarCompletado}
          className={`flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-medium ${
            completado
              ? 'border-green-600 bg-green-50 text-green-700'
              : 'border-slate-300 text-slate-600'
          }`}
        >
          <CheckCircle2 size={16} />
          {completado ? 'Completado' : 'Marcar como completado'}
        </button>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <p className="mb-1 text-xs font-semibold text-green-600">
          EJEMPLO {indice + 1} DE {tema.ejemplos.length}
        </p>
        <h2 className="mb-4 text-lg font-bold text-slate-800">{ejemplo.enunciado}</h2>

        <p className="mb-2 text-sm font-semibold text-slate-500">Solución:</p>
        <ol className="space-y-2">
          {ejemplo.pasos.map((paso, i) => (
            <li key={i} className="rounded-md bg-slate-50 p-3 text-sm text-slate-700">
              {paso}
            </li>
          ))}
        </ol>
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          disabled={esPrimero}
          onClick={() => setIndice(i => i - 1)}
          className="flex items-center gap-1 rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft size={16} /> Ejemplo anterior
        </button>
        <button
          type="button"
          disabled={esUltimo}
          onClick={() => setIndice(i => i + 1)}
          className="flex items-center gap-1 rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Siguiente ejemplo <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verificar build**

```bash
npm run build
```

Expected: sin errores.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add EjemplosTab"
```

---

### Task 12: EjerciciosTab

**Files:**
- Create: `src/components/tabs/EjerciciosTab.tsx`

**Interfaces:**
- Consumes: `tema.ejercicios` de `topicData.ts`, `useLocalStorage` de Task 4; props `completado`/`onMarcarCompletado`.
- Produces: `<EjerciciosTab completado={boolean} onMarcarCompletado={() => void} />`
- Estado persistido (local a este componente, localStorage key `galileo:ejercicios-tema-7`): `Record<number, { respuesta: string | string[]; correcto: boolean }>`.

- [ ] **Step 1: Escribir el componente**

```tsx
import { useState } from 'react'
import { CheckCircle2, XCircle } from 'lucide-react'
import { tema, type Ejercicio } from '../../data/topicData'
import { useLocalStorage } from '../../hooks/useLocalStorage'

interface EjerciciosTabProps {
  completado: boolean
  onMarcarCompletado: () => void
}

type Respuesta = string | string[]
type Resultado = { respuesta: Respuesta; correcto: boolean }
type Resultados = Record<number, Resultado>

const SUBTABS = ['Ejercicios', 'Mis respuestas', 'Resueltos'] as const
type Subtab = (typeof SUBTABS)[number]

function normalizarLista(valor: string): string[] {
  return valor
    .split(',')
    .map(v => v.trim())
    .filter(Boolean)
    .sort()
}

function esCorrecta(ejercicio: Ejercicio, respuesta: Respuesta): boolean {
  if (ejercicio.tipo === 'libre') {
    return normalizarLista(respuesta as string).join(',') === normalizarLista(ejercicio.respuestaCorrecta).join(',')
  }
  if (ejercicio.tipo === 'multiple') {
    const dadas = [...(respuesta as string[])].sort()
    const correctas = [...ejercicio.respuestaCorrecta].sort()
    return dadas.length === correctas.length && dadas.every((v, i) => v === correctas[i])
  }
  return respuesta === ejercicio.respuestaCorrecta
}

export function EjerciciosTab({ completado, onMarcarCompletado }: EjerciciosTabProps) {
  const [subtab, setSubtab] = useState<Subtab>('Ejercicios')
  const [respuestasBorrador, setRespuestasBorrador] = useState<Record<number, Respuesta>>({})
  const [resultados, setResultados] = useLocalStorage<Resultados>('galileo:ejercicios-tema-7', {})

  function verificar(ejercicio: Ejercicio) {
    const respuesta = respuestasBorrador[ejercicio.id] ?? (ejercicio.tipo === 'multiple' ? [] : '')
    const correcto = esCorrecta(ejercicio, respuesta)
    setResultados(prev => ({ ...prev, [ejercicio.id]: { respuesta, correcto } }))
  }

  const totalCorrectas = Object.values(resultados).filter(r => r.correcto).length

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <h1 className="text-2xl font-bold text-slate-800">{tema.titulo}</h1>
        <button
          type="button"
          onClick={onMarcarCompletado}
          className={`flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-medium ${
            completado
              ? 'border-green-600 bg-green-50 text-green-700'
              : 'border-slate-300 text-slate-600'
          }`}
        >
          <CheckCircle2 size={16} />
          {completado ? 'Completado' : 'Marcar como completado'}
        </button>
      </div>

      <div className="flex gap-2 border-b border-slate-200">
        {SUBTABS.map(s => (
          <button
            key={s}
            type="button"
            onClick={() => setSubtab(s)}
            className={`px-3 py-2 text-sm font-medium ${
              subtab === s ? 'border-b-2 border-green-600 text-green-700' : 'text-slate-500'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {subtab === 'Ejercicios' && (
        <div className="space-y-4">
          {tema.ejercicios.map(ej => (
            <div key={ej.id} className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="mb-2 flex items-start justify-between">
                <p className="font-medium text-slate-800">
                  {ej.id}. {ej.enunciado}
                </p>
                <span className="shrink-0 text-xs text-slate-400">{ej.puntos} puntos</span>
              </div>

              {ej.tipo === 'libre' && (
                <input
                  type="text"
                  placeholder="Escribí aquí tu respuesta..."
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  value={(respuestasBorrador[ej.id] as string) ?? ''}
                  onChange={e =>
                    setRespuestasBorrador(prev => ({ ...prev, [ej.id]: e.target.value }))
                  }
                />
              )}

              {ej.tipo === 'multiple' && (
                <div className="flex flex-wrap gap-3">
                  {ej.opciones.map(opcion => {
                    const seleccionadas = (respuestasBorrador[ej.id] as string[]) ?? []
                    const marcada = seleccionadas.includes(opcion)
                    return (
                      <label key={opcion} className="flex items-center gap-1.5 text-sm">
                        <input
                          type="checkbox"
                          checked={marcada}
                          onChange={() =>
                            setRespuestasBorrador(prev => {
                              const actuales = (prev[ej.id] as string[]) ?? []
                              const siguientes = marcada
                                ? actuales.filter(o => o !== opcion)
                                : [...actuales, opcion]
                              return { ...prev, [ej.id]: siguientes }
                            })
                          }
                        />
                        {opcion}
                      </label>
                    )
                  })}
                </div>
              )}

              {ej.tipo === 'si-no' && (
                <div className="flex gap-4">
                  {(['Sí', 'No'] as const).map(opcion => (
                    <label key={opcion} className="flex items-center gap-1.5 text-sm">
                      <input
                        type="radio"
                        name={`ejercicio-${ej.id}`}
                        checked={respuestasBorrador[ej.id] === opcion}
                        onChange={() =>
                          setRespuestasBorrador(prev => ({ ...prev, [ej.id]: opcion }))
                        }
                      />
                      {opcion}
                    </label>
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={() => verificar(ej)}
                className="mt-3 rounded-md border border-green-600 px-3 py-1.5 text-sm font-medium text-green-700 hover:bg-green-50"
              >
                Verificar respuesta
              </button>

              {resultados[ej.id] && (
                <p
                  className={`mt-2 text-sm ${
                    resultados[ej.id].correcto ? 'text-green-700' : 'text-red-600'
                  }`}
                >
                  {resultados[ej.id].correcto ? 'Correcta.' : `Incorrecta. ${ej.explicacion}`}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {subtab === 'Mis respuestas' && (
        <div className="space-y-3">
          <p className="text-sm text-slate-500">
            Llevás {totalCorrectas} ejercicios correctos de {tema.ejercicios.length}.
          </p>
          {tema.ejercicios.map(ej => {
            const resultado = resultados[ej.id]
            return (
              <div key={ej.id} className="rounded-lg border border-slate-200 bg-white p-4">
                <div className="mb-1 flex items-center justify-between">
                  <p className="font-medium text-slate-800">{ej.enunciado}</p>
                  {resultado ? (
                    resultado.correcto ? (
                      <span className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">
                        <CheckCircle2 size={14} /> Correcta
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700">
                        <XCircle size={14} /> Incorrecta
                      </span>
                    )
                  ) : (
                    <span className="text-xs text-slate-400">Sin responder</span>
                  )}
                </div>
                {resultado && (
                  <p className="text-sm text-slate-500">
                    Tu respuesta:{' '}
                    {Array.isArray(resultado.respuesta) ? resultado.respuesta.join(', ') : resultado.respuesta}
                  </p>
                )}
                {resultado && !resultado.correcto && (
                  <p className="mt-1 text-sm text-red-600">{ej.explicacion}</p>
                )}
              </div>
            )
          })}
        </div>
      )}

      {subtab === 'Resueltos' && (
        <div className="space-y-3">
          {tema.ejercicios.map(ej => (
            <div key={ej.id} className="rounded-lg border border-slate-200 bg-white p-4">
              <p className="mb-1 font-medium text-slate-800">{ej.enunciado}</p>
              <p className="text-sm text-slate-600">
                Respuesta correcta:{' '}
                {ej.tipo === 'multiple' ? ej.respuestaCorrecta.join(', ') : ej.respuestaCorrecta}
              </p>
              <p className="mt-1 text-sm text-slate-500">{ej.explicacion}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Verificar build**

```bash
npm run build
```

Expected: sin errores.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add EjerciciosTab with verify/review sub-tabs"
```

---

### Task 13: AutoevaluacionTab

**Files:**
- Create: `src/components/tabs/AutoevaluacionTab.tsx`

**Interfaces:**
- Consumes: `tema.quiz` de `topicData.ts`, `useLocalStorage` de Task 4; props `completado`/`onMarcarCompletado`.
- Produces: `<AutoevaluacionTab completado={boolean} onMarcarCompletado={() => void} />`
- Estado persistido (localStorage key `galileo:quiz-mejor-puntaje-tema-7`): `number` (mejor puntaje sobre 10).
- Estado local del intento actual (`useState`, no persiste): índice de pregunta, respuestas seleccionadas, si terminó.

- [ ] **Step 1: Escribir el componente**

```tsx
import { useState } from 'react'
import { CheckCircle2, XCircle } from 'lucide-react'
import { tema } from '../../data/topicData'
import { useLocalStorage } from '../../hooks/useLocalStorage'

interface AutoevaluacionTabProps {
  completado: boolean
  onMarcarCompletado: () => void
}

const TOTAL_PREGUNTAS = tema.quiz.length
const PORCENTAJE_APROBACION = 70

export function AutoevaluacionTab({ completado, onMarcarCompletado }: AutoevaluacionTabProps) {
  const [indice, setIndice] = useState(0)
  const [respuestas, setRespuestas] = useState<Record<number, number>>({})
  const [terminado, setTerminado] = useState(false)
  const [mejorPuntaje, setMejorPuntaje] = useLocalStorage('galileo:quiz-mejor-puntaje-tema-7', 0)

  const pregunta = tema.quiz[indice]
  const seleccionActual = respuestas[pregunta.id]
  const yaRespondida = seleccionActual !== undefined
  const esUltima = indice === TOTAL_PREGUNTAS - 1

  const puntaje = Object.entries(respuestas).reduce((total, [id, opcionElegida]) => {
    const p = tema.quiz.find(q => q.id === Number(id))
    return p && p.respuestaCorrectaIndex === opcionElegida ? total + 1 : total
  }, 0)

  function elegirOpcion(opcionIndex: number) {
    if (yaRespondida) return
    setRespuestas(prev => ({ ...prev, [pregunta.id]: opcionIndex }))
  }

  function siguiente() {
    if (esUltima) {
      setMejorPuntaje(prev => Math.max(prev, puntaje))
      setTerminado(true)
    } else {
      setIndice(i => i + 1)
    }
  }

  function reintentar() {
    setIndice(0)
    setRespuestas({})
    setTerminado(false)
  }

  if (terminado) {
    const porcentaje = Math.round((puntaje / TOTAL_PREGUNTAS) * 100)
    const aprobado = porcentaje >= PORCENTAJE_APROBACION
    return (
      <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-8 text-center">
        <h1 className="text-2xl font-bold text-slate-800">Resultado de la autoevaluación</h1>
        <p className={`text-4xl font-bold ${aprobado ? 'text-green-600' : 'text-red-500'}`}>
          {puntaje} / {TOTAL_PREGUNTAS}
        </p>
        <p className="text-slate-600">
          {aprobado
            ? `¡Aprobaste con ${porcentaje}%!`
            : `Sacaste ${porcentaje}%. Necesitás ${PORCENTAJE_APROBACION}% para aprobar.`}
        </p>
        <p className="text-sm text-slate-400">Tu mejor puntaje guardado: {mejorPuntaje} / {TOTAL_PREGUNTAS}</p>
        <button
          type="button"
          onClick={reintentar}
          className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white"
        >
          Reintentar
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <h1 className="text-2xl font-bold text-slate-800">{tema.titulo}</h1>
        <button
          type="button"
          onClick={onMarcarCompletado}
          className={`flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-medium ${
            completado
              ? 'border-green-600 bg-green-50 text-green-700'
              : 'border-slate-300 text-slate-600'
          }`}
        >
          <CheckCircle2 size={16} />
          {completado ? 'Completado' : 'Marcar como completado'}
        </button>
      </div>

      <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-500">
        <span>Pregunta {indice + 1} / {TOTAL_PREGUNTAS}</span>
        <span>Puntaje: {puntaje} / {TOTAL_PREGUNTAS}</span>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="mb-4 text-lg font-bold text-slate-800">{pregunta.pregunta}</h2>
        <div className="space-y-2">
          {pregunta.opciones.map((opcion, i) => {
            const esCorrecta = i === pregunta.respuestaCorrectaIndex
            const esElegida = seleccionActual === i
            let estilos = 'border-slate-200'
            if (yaRespondida && esCorrecta) estilos = 'border-green-500 bg-green-50'
            else if (yaRespondida && esElegida && !esCorrecta) estilos = 'border-red-400 bg-red-50'

            return (
              <button
                key={opcion}
                type="button"
                onClick={() => elegirOpcion(i)}
                disabled={yaRespondida}
                className={`flex w-full items-center justify-between rounded-md border px-3 py-2 text-left text-sm ${estilos}`}
              >
                {opcion}
                {yaRespondida && esCorrecta && <CheckCircle2 size={16} className="text-green-600" />}
                {yaRespondida && esElegida && !esCorrecta && <XCircle size={16} className="text-red-500" />}
              </button>
            )
          })}
        </div>

        {yaRespondida && (
          <p className="mt-3 text-sm text-slate-500">{pregunta.explicacion}</p>
        )}
      </div>

      <button
        type="button"
        disabled={!yaRespondida}
        onClick={siguiente}
        className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
      >
        {esUltima ? 'Finalizar autoevaluación' : 'Siguiente pregunta'}
      </button>
    </div>
  )
}
```

- [ ] **Step 2: Verificar build**

```bash
npm run build
```

Expected: sin errores.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add AutoevaluacionTab with scoring and best-score persistence"
```

---

### Task 14: App.tsx — layout y wiring final

**Files:**
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: todos los componentes de Tasks 5-13, `tema`/`TOTAL_TEMAS_GRADO` de `topicData.ts`, `useLocalStorage` de Task 4.
- Produces: la app completa. Ningún otro archivo depende de `App.tsx`.

- [ ] **Step 1: Reescribir src/App.tsx completo**

```tsx
import { useState } from 'react'
import { PlayCircle, FileText, PencilLine, ClipboardCheck, MapPin } from 'lucide-react'
import { tema, TOTAL_TEMAS_GRADO } from './data/topicData'
import { useLocalStorage } from './hooks/useLocalStorage'
import { Header } from './components/Header'
import { Sidebar } from './components/Sidebar'
import { RightPanel } from './components/RightPanel'
import { LeccionTab } from './components/tabs/LeccionTab'
import { ExplicacionTab } from './components/tabs/ExplicacionTab'
import { EjemplosTab } from './components/tabs/EjemplosTab'
import { EjerciciosTab } from './components/tabs/EjerciciosTab'
import { AutoevaluacionTab } from './components/tabs/AutoevaluacionTab'

const TABS = [
  { id: 'leccion', label: 'Lección', icon: PlayCircle },
  { id: 'explicacion', label: 'Explicación escrita', icon: FileText },
  { id: 'ejemplos', label: 'Ejemplos resueltos', icon: PencilLine },
  { id: 'ejercicios', label: 'Ejercicios', icon: ClipboardCheck },
  { id: 'autoevaluacion', label: 'Autoevaluación', icon: MapPin },
] as const

type TabId = (typeof TABS)[number]['id']

// Temas 1-6 ya están "completados" como base fija (matching el mockup);
// el tema 7 es el único real, así que su check depende del estado de abajo.
const TEMAS_COMPLETADOS_BASE = 6

function App() {
  const [tabActivo, setTabActivo] = useState<TabId>('leccion')
  const [completado, setCompletado] = useLocalStorage('galileo:tema-7-completado', false)

  const completedCount = TEMAS_COMPLETADOS_BASE + (completado ? 1 : 0)
  const courseProgressPercent = (completedCount / TOTAL_TEMAS_GRADO) * 100

  const tabProps = {
    completado,
    onMarcarCompletado: () => setCompletado(prev => !prev),
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header breadcrumbs={['Inicio', 'Primaria', tema.grado, tema.categoria, tema.titulo]} />

      <main className="mx-auto flex max-w-7xl gap-6 p-6">
        <Sidebar />

        <div className="min-w-0 flex-1 space-y-4">
          <div className="flex gap-1 overflow-x-auto rounded-lg border border-slate-200 bg-white p-1">
            {TABS.map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setTabActivo(tab.id)}
                className={`flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium whitespace-nowrap ${
                  tabActivo === tab.id ? 'bg-green-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-6">
            {tabActivo === 'leccion' && <LeccionTab {...tabProps} />}
            {tabActivo === 'explicacion' && <ExplicacionTab {...tabProps} />}
            {tabActivo === 'ejemplos' && <EjemplosTab {...tabProps} />}
            {tabActivo === 'ejercicios' && <EjerciciosTab {...tabProps} />}
            {tabActivo === 'autoevaluacion' && <AutoevaluacionTab {...tabProps} />}
          </div>
        </div>

        <RightPanel
          courseProgressPercent={courseProgressPercent}
          completedCount={completedCount}
          totalCount={TOTAL_TEMAS_GRADO}
        />
      </main>
    </div>
  )
}

export default App
```

- [ ] **Step 2: Verificar build**

```bash
npm run build
```

Expected: sin errores. Si TypeScript marca `completado`/`setCompletado` con tipo `boolean` inferido correcto desde `useLocalStorage('galileo:tema-7-completado', false)`, quiere decir que los genéricos del hook (Task 4) están funcionando bien.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: wire App.tsx with tabs, sidebar, right panel and progress state"
```

---

### Task 15: Verificación manual final + README

**Files:**
- Create: `README.md`

**Interfaces:**
- N/A — última tarea, no produce interfaz para nadie.

- [ ] **Step 1: Escribir README.md**

```markdown
# Academia Galileo — Prototipo "Múltiplos y divisores"

Prototipo de un solo tema de matemática (4° grado, Números y Operaciones) para
validar diseño e interacción antes de escalar a los 150+ temas reales.
Sin backend, sin login — todo el contenido vive en `src/data/topicData.ts`.

## Correr el proyecto

\`\`\`bash
npm install
npm run dev
\`\`\`

Abrí la URL que imprime Vite (por defecto `http://localhost:5173`).

## Decisiones de estructura (para referencia rápida)

- **Sin Context/Redux:** el estado de "tema completado" vive en `App.tsx` y
  baja por props a las 5 tabs. Con un solo nivel de anidamiento, Context
  agrega indirección sin necesidad real.
- **Datos separados de la UI:** todo el contenido hardcodeado está en
  `src/data/topicData.ts`. El día que haya una API real, se cambia ese
  archivo por un fetch y los componentes no se tocan.
- **localStorage por feature, no global:** el hook `useLocalStorage` se usa
  de forma independiente en `EjerciciosTab`, `AutoevaluacionTab` y `App.tsx`
  — cada uno persiste solo lo que le importa a él, nadie comparte ese
  estado con nadie más.

## Qué probar

- Navegar las 5 tabs.
- Responder los 5 ejercicios, verificar cada uno, revisar "Mis respuestas" y "Resueltos".
- Completar el quiz de 10 preguntas, ver el resultado final, reintentar.
- Marcar el tema como completado y ver que el contador de "temas completados" del panel derecho pase de 6/30 a 7/30.
- Refrescar la página (F5) y confirmar que el progreso no se perdió.
```

- [ ] **Step 2: Correr el servidor de desarrollo y probar manualmente**

```bash
npm run dev
```

Checklist a probar en el navegador (según lo que definimos en el spec):
- Las 5 tabs cambian el contenido correctamente.
- `LeccionTab`: el botón play/pausa cambia de ícono.
- `ExplicacionTab`: las 3 secciones y sus cajas se ven bien.
- `EjemplosTab`: anterior/siguiente navega entre los 3 ejemplos, se deshabilita en los extremos.
- `EjerciciosTab`: verificar cada uno de los 5 ejercicios da el feedback correcto (correcto/incorrecto + explicación), y las sub-tabs "Mis respuestas"/"Resueltos" muestran lo esperado.
- `AutoevaluacionTab`: las 10 preguntas navegan, el puntaje se actualiza, la pantalla final calcula bien el % y "Reintentar" resetea.
- "Marcar como completado" en cualquier tab actualiza el check del tema 7 en el Sidebar y el contador en RightPanel (6/30 → 7/30).
- F5: todo lo persistido (completado, respuestas de ejercicios, mejor puntaje del quiz) sigue ahí.

- [ ] **Step 3: Commit final**

```bash
git add -A
git commit -m "docs: add README with run instructions and manual verification checklist"
```

---

## Self-Review (hecho por quien escribió el plan)

- **Cobertura del spec:** las 5 tabs (Tasks 9-13), sidebar (Task 7), header/breadcrumbs (Task 6), panel de progreso + decorativo (Task 8), persistencia (Task 4 + usos en Tasks 12-14), sin login (Task 6 hardcodea el estado deslogueado) — todo cubierto.
- **Placeholders:** ninguno — cada tarea tiene código completo y real, sin "TODO" ni "similar a la tarea anterior".
- **Consistencia de tipos:** `Ejercicio`/`Ejemplo`/`PreguntaQuiz`/`TemaSidebarItem` se definen una sola vez en Task 3 y se importan igual en el resto de las tareas; `completado`/`onMarcarCompletado` tienen la misma forma en las 5 tabs (Tasks 9-13) y en `App.tsx` (Task 14).
