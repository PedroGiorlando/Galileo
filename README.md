# Academia Galileo

Plataforma de preparación para el ingreso universitario en Mendoza: UNCuyo y
UTN FRM, Ingeniería.

- **[Hoja de ruta](docs/hoja-de-ruta.md)** — qué es, cómo está armado, qué falta
- **[Plantilla de clase](docs/plantilla-clase.md)** — para escribir contenido sin el panel

## Correr el proyecto

```bash
npm install
npm run dev
```

Necesita `.env.local` con las claves de Supabase. Copiá `.env.example` y
completalo; las claves salen de Supabase → Project Settings → API Keys.

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind v4 · Supabase (Postgres + Auth)
· Bunny Stream para video · Zod para validar contenido.

## Estructura

```
src/
  app/
    preuniversitario/[programa]/[carrera]/[materia]/   temario de una materia
    clase/[materia]/[clase]/                           la clase, con sus solapas
    admin/[materia]/[clase]/                           panel de carga
    ingresar, registrarse, mi-cuenta, auth/callback    cuentas
  components/
    SubtemaVista.tsx      dueño del estado de la clase (solapa activa, progreso)
    tabs/                 Lección, Explicación, Ejemplos, Prácticos, Evaluaciones
    admin/                formulario de carga y gestión de módulos
    curso/                temario y panel de avance
  lib/
    contenido.ts          la única capa que sabe que existe una base
    schemas.ts            Zod: fuente de verdad de la forma del contenido
    correccion.ts         corrección de ejercicios
    progreso.ts           avance del alumno y permisos de admin
supabase/
  schema.sql              instalación desde cero (BORRA TODO — solo para eso)
  migraciones/            cambios sobre una base con datos, en orden
  curriculum.mjs          el currículum como dato editable
```

## Base de datos

**Nunca corras `schema.sql` sobre la base real:** empieza con `drop table`. Está
para instalar desde cero. Cualquier cambio sobre una base con usuarios va como
migración nueva en `supabase/migraciones/`, numerada y sin borrar nada.

Para aplicar una migración: abrir el archivo en el editor, copiar todo, pegar en
Supabase → SQL Editor → New query → Run.

> **No la copies con `Get-Content archivo | Set-Clipboard`.** Windows PowerShell
> lo lee en la codificación ANSI del sistema y las tildes llegan corruptas
> (`Física` termina como `FÃ­sica`). Copiá desde el editor, o usá
> `Get-Content archivo -Raw -Encoding UTF8 | Set-Clipboard`.

## Decisiones que conviene conocer antes de tocar el código

**El contenido pertenece a la materia, no al curso.** Un curso es una selección
de módulos. Cinemática se escribe una vez y aparece en Física-UNCuyo y en
Física-UTN.

**PostgREST solo anida por claves foráneas simples.** `clases.materia_id` existe
como columna, pero la clave foránea es compuesta contra `modulos(id, materia_id)`.
Pedir `clases → materias` hace fallar la consulta entera. Dos consultas y un Map.

**Leer cookies en un componente compartido saca de estático todo el sitio.** La
sesión se resuelve en el navegador por eso, no por comodidad.

**`'use client'` no significa "no se renderiza en el servidor".** Next igual
genera el HTML y después lo hidrata: el texto de la clase viaja en el HTML
inicial, que es lo que indexa Google. La directiva marca el **límite**, y todo
lo que ese componente importa lo hereda.

**Proteger la página no protege la acción.** Una Server Action es un endpoint
HTTP. El permiso se verifica en los dos lugares.

**La ausencia de error no es evidencia de éxito.** `?? []` y `catch {}`
convierten una falla en un resultado vacío. Si el dato importa, el error también.

## Tests

```bash
npm test
```

Cubren lo que se puede romper en silencio: la corrección de ejercicios (orden y
espacios indistintos, conjunto exacto), la validación del contenido, y que
cargar una clase en el panel y guardarla sin tocar nada devuelva exactamente lo
mismo.

## Qué probar

- Recorrer `/preuniversitario` → programa → carrera → materia → clase.
- Resolver un ejercicio de un TP y verificarlo. Probá desordenado y con
  espacios: `50.0, 86.6` tiene que dar correcto.
- Hacer una evaluación entera y ver el puntaje.
- Marcar una clase como completada, entrar desde otro dispositivo con la misma
  cuenta y confirmar que el progreso está.
- Completar una clase sin sesión, después iniciar sesión: ese progreso se
  rescata.
- `npm run build` y confirmar que el temario y las clases aparecen como `● SSG`.

## Limitaciones conocidas

**Las respuestas correctas viajan al navegador.** Con las herramientas del
navegador se pueden leer. Es aceptable mientras el contenido sea gratuito; hay
que corregir del lado del servidor antes de cobrar.

**Las URLs de video no están firmadas.** Quien copie el enlace del reproductor
puede compartirlo. Bunny permite URLs con token que vencen en minutos; falta
activarlo.
