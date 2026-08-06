# Prototipo Academia Galileo — Tema "Múltiplos y divisores"

Fecha: 2026-08-06
Estado: Aprobado, pendiente de plan de implementación

## Contexto

Prototipo de un solo tema ("Múltiplos y divisores", 4° grado, Números y Operaciones) de la plataforma educativa Academia Galileo. Objetivo: validar interacción y diseño visual de una página de tema con 5 secciones, antes de escalar a los 150+ temas reales. Sin backend, sin login, sin base de datos — todo el contenido está hardcodeado en el frontend.

El usuario es programador junior aprendiendo mientras construye esto. El código debe explicar sus decisiones de estructura y comentar las partes no obvias.

## Alcance

**Incluye:**
- Página única con 5 tabs: Lección, Explicación escrita, Ejemplos resueltos, Ejercicios, Autoevaluación.
- Sidebar con lista de temas del grado (solo el tema 7 tiene contenido real; el resto es visual).
- Header oscuro fijo con logo, nav links, breadcrumbs, y estado de sesión (siempre deslogueado: "Iniciar sesión / Registrate").
- Indicador de progreso general tipo "X de 30 temas" en el panel derecho.
- Panel derecho decorativo (Recursos del tema, Notas personales, Soporte) presente en las 5 vistas, sin lógica real detrás de sus botones.
- Progreso persistido en localStorage (sobrevive un refresh).

**No incluye:**
- Login/autenticación real, backend, base de datos.
- Contenido real para los otros 149 temas.
- Otras materias o grados funcionales.
- Test automatizados (no pedido; verificación manual al final).

## Arquitectura

- **Stack:** Vite + React + TypeScript + Tailwind CSS + lucide-react (iconos).
- **Sin router:** una sola página, no hace falta navegación entre URLs.
- **Estado:** local a `App.tsx` vía `useState`, pasado a los tabs por props (prop drilling). Se descarta Context/Redux: con un solo nivel de anidamiento (App → Tab), Context agrega indirección sin beneficio real, y el prop drilling es más fácil de seguir para alguien aprendiendo React (el dato se ve viajar explícitamente por las props).
- **Persistencia:** hook `useLocalStorage<T>(key, defaultValue)` — mismo contrato que `useState`, pero lee/escribe `localStorage` on change. Se usa para: tema completado (bool), respuestas+resultados de los 5 ejercicios, mejor puntaje del quiz.

## Estructura de archivos

```
src/
  data/topicData.ts        # contenido hardcodeado: lección, teoría, 3 ejemplos, 5 ejercicios, 10 preguntas de quiz
  hooks/useLocalStorage.ts
  components/
    Header.tsx              # navbar oscura + breadcrumbs
    Sidebar.tsx              # lista de temas 1-30, checks fake en 1-6, tema 7 activo
    ProgressRing.tsx         # círculo de progreso reusable (SVG)
    tabs/
      LeccionTab.tsx
      ExplicacionTab.tsx
      EjemplosTab.tsx
      EjerciciosTab.tsx      # sub-tabs internos: Ejercicios / Mis respuestas / Resueltos
      AutoevaluacionTab.tsx
  App.tsx                    # dueño del estado compartido, tab switcher, layout de 3 columnas
```

Cada tab es su propio componente/archivo: se puede entender, editar y (en el futuro) testear de forma aislada, sin tener que leer un archivo gigante.

## Datos (`topicData.ts`)

Un objeto por tema, con esta forma (nombres orientativos, se ajustan en implementación):

```ts
{
  id, titulo, grado, categoria,
  lesson: { videoDurationLabel, objetivos: string[] },
  explicacion: { secciones: [...] },   // teoría + cajas de tip/definición
  ejemplos: [{ enunciado, pasos: string[] }, ...],   // 3 ejemplos
  ejercicios: [{ tipo: 'libre'|'multiple'|'si-no', enunciado, opciones?, respuestaCorrecta, explicacion }, ...],  // 5
  quiz: [{ pregunta, opciones, respuestaCorrecta, explicacion }, ...],  // 10
}
```

Aislar esto en un archivo separado de los componentes es lo que permite, más adelante, reemplazarlo por una llamada a API sin tocar la UI.

## Progreso general — cómo se resuelve

Las capturas de referencia muestran dos cosas que no encajan del todo: un contador "X de 30 temas" (progreso del grado completo) y la instrucción original de que el progreso "se actualice cuando completes ejercicios". Se resuelven así:

- Baseline fake: temas 1-6 del sidebar arrancan marcados como completados (checks verdes fijos, no interactivos).
- El tema 7 (el real) arranca sin check.
- El botón "Marcar como completado" (presente en las 5 sub-vistas del tema, mismo estado compartido vía props) es la única fuente de verdad para: (a) el check del tema 7 en el sidebar, y (b) el contador de curso, que pasa de 6/30 (20%) a 7/30 (23%) al marcarlo.
- El puntaje de ejercicios y quiz es un sistema de feedback separado (no mueve el contador de curso). Mantener estos dos sistemas desacoplados es más simple que intentar derivar "completado" automáticamente del puntaje.

## Ejercicios — comportamiento

`EjerciciosTab` tiene 3 sub-tabs propios:
- **Ejercicios**: los 5 ejercicios (respuesta libre, selección múltiple, sí/no) con botón "Verificar respuesta" por ítem. Al verificar, guarda resultado (correcto/incorrecto) en el estado persistido.
- **Mis respuestas**: muestra lo que respondiste, correcto/incorrecto, y una explicación cuando está mal.
- **Resueltos**: muestra la solución de cada ejercicio, independiente de lo que hayas respondido.

## Autoevaluación — comportamiento

Quiz de 10 preguntas de opción múltiple, navegación entre preguntas, contador de puntaje visible, pantalla de resultado final al terminar. Botón "Reintentar" resetea el intento actual. Solo se persiste el mejor puntaje logrado (no un historial de intentos).

## Panel derecho decorativo

Presente en las 5 vistas: bloques "Recursos del tema" (links de descarga falsos), "Notas personales" (textarea, puede o no persistir — decorativo), "¿Dudas? Hacer una pregunta" / soporte. Sin lógica real: los botones no navegan a ningún lado (o disparan un `alert` simple si hace falta feedback de que "no está conectado a nada").

## Manejo de errores

No aplica backend ni inputs externos reales — no hay superficie de error que manejar más allá de validaciones triviales de UI (ej. no dejar "Verificar respuesta" vacío). No se agrega manejo de errores especulativo.

## Testing / verificación

No se agregan tests automatizados — no fueron pedidos y el prototipo es de validación visual/interacción, no de lógica compleja. Verificación manual al finalizar: `npm run dev`, recorrer las 5 tabs, responder los 5 ejercicios y el quiz completo, confirmar que el feedback (correcto/incorrecto + explicación) se ve bien, y que refrescar la página no borra el progreso.
