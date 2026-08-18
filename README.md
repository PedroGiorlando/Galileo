# Academia Galileo

Plataforma de apoyo escolar de primaria. Hoy hay **un solo tema real**
("Múltiplos y divisores", Matemática 4°) usado para validar diseño e
interacción antes de escalar al resto del temario.

Hoja de ruta completa (fases, modelo de datos, decisiones de negocio):
ver el plan de proyecto acordado por separado.

## Correr el proyecto

```bash
npm install
npm run dev
```

Abrí `http://localhost:3000`. La home redirige al único tema publicado.

## Estado actual

- **Next.js 16 (App Router) + TypeScript + Tailwind v4 + lucide-react.**
- Sin backend, sin login, sin pagos. El contenido está hardcodeado en
  `src/data/topicData.ts` y el progreso vive en `localStorage`.
- La página del tema se genera como **HTML estático** en el build
  (`generateStaticParams`), que es lo que permite que Google la indexe.

## Estructura

```
src/
  app/
    layout.tsx                                    metadatos globales + <html>
    page.tsx                                      redirige al tema publicado
    globals.css                                   @import "tailwindcss"
    primaria/[grado]/[materia]/[tema]/page.tsx    Server Component: valida la ruta,
                                                  arma metadatos y renderiza
  components/
    TemaVista.tsx        'use client' — dueño del estado compartido del tema
    Header.tsx           Server Component (solo breadcrumbs, sin estado)
    Sidebar.tsx, RightPanel.tsx, ProgressRing.tsx, CompletarButton.tsx
    tabs/                los 5 tabs
  data/topicData.ts      contenido del tema
  hooks/useLocalStorage.ts
```

## Decisiones de estructura

- **Dónde cae el límite cliente/servidor.** `TemaVista` lleva `'use client'`
  porque es dueño del estado que comparten el Sidebar (el check del tema), el
  RightPanel (el contador) y los tabs (el botón "completado"). Todo lo que
  `TemaVista` importa hereda el lado cliente, así que los 5 tabs **no** llevan
  su propia directiva. `Header` queda del lado servidor: no tiene estado.

- **`'use client'` no significa "no se renderiza en el servidor".** Next igual
  genera el HTML de esos componentes en el build y después los hidrata. El
  texto de la explicación y los ejercicios viajan en el HTML inicial.

- **Sin Context/Redux.** Con un solo nivel de anidamiento (TemaVista → tab), el
  prop drilling se sigue leyendo mejor que la indirección de un Context.

- **Datos separados de la UI.** Todo el contenido está en `topicData.ts`. Ojo:
  varios componentes hacen `import { tema } from '@/data/topicData'` como valor
  fijo, no como prop — el día que el contenido venga de la base va a haber que
  pasar `tema` por props además de cambiar el origen de los datos.

- **`useLocalStorage` lee después de montar, no en el inicializador.** El
  inicializador de `useState` también corre en el servidor, donde `window` no
  existe; leer ahí produce un hydration mismatch. Costo: un parpadeo al volver
  a entrar, que desaparece cuando el progreso venga del servidor.

## Panel de contenido

`/admin` tiene el formulario de carga de temas. Valida contra el mismo schema
Zod que protege la base (`src/lib/schemas.ts`), así que lo que el formulario
rechaza tampoco se habría podido guardar.

Todavía no está conectado a la base: al guardar muestra el JSON validado para
copiar. Cuando Supabase esté configurado, lo único que cambia es la función
`onGuardar` que `EditorTema` le pasa al formulario — `TemaForm` no se toca.

Para conectarlo: copiar `.env.example` a `.env.local`, completar las claves, y
correr `supabase/schema.sql` en el SQL Editor de Supabase.

## Tests

```bash
npm test
```

Cubren lo que se puede romper en silencio: la corrección de ejercicios (orden y
espacios indistintos, conjunto exacto), la validación de contenido, y que cargar
un tema en el panel y guardarlo sin tocarlo devuelva exactamente lo mismo.

## Qué probar

- Navegar las 5 tabs.
- Responder los 5 ejercicios, verificar cada uno, revisar "Mis respuestas" y "Resueltos".
- Completar el quiz de 10 preguntas, ver el resultado final, reintentar.
- Marcar el tema como completado y ver que el contador del panel derecho pase
  de 6/30 (20%) a 7/30 (23%).
- Refrescar (F5) y confirmar que el progreso no se perdió.
- `npm run build` y confirmar que la ruta del tema aparece como `● (SSG)`.

## Limitación conocida

Las respuestas correctas de ejercicios y quiz viajan en el bundle de JavaScript:
con las herramientas del navegador se pueden leer. Es aceptable mientras el
contenido sea gratuito; hay que corregir del lado del servidor antes de cobrar.
