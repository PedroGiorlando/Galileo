# Academia Galileo — Prototipo "Múltiplos y divisores"

Prototipo de un solo tema de matemática (4° grado, Números y Operaciones) para
validar diseño e interacción antes de escalar a los 150+ temas reales.
Sin backend, sin login — todo el contenido vive en `src/data/topicData.ts`.

## Correr el proyecto

```bash
npm install
npm run dev
```

Abrí la URL que imprime Vite (por defecto `http://localhost:5173`).

## Decisiones de estructura (para referencia rápida)

- **Sin Context/Redux:** el estado de "tema completado" vive en `App.tsx` y
  baja por props a las 5 tabs. Con un solo nivel de anidamiento, Context
  agrega indirección sin necesidad real.
- **Datos separados de la UI:** todo el contenido hardcodeado está en
  `src/data/topicData.ts`. El día que haya una API real, el archivo se
  reemplaza por un fetch, pero hoy varios componentes hacen
  `import { tema } from '../data/topicData'` como valor fijo (no como prop)
  — pasar a datos que llegan async va a requerir además pasar `tema` como
  prop (o Context) a esos componentes, no solo cambiar este archivo.
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
