# Academia Galileo — hoja de ruta

> Documento vivo. Reemplaza al plan original, que apuntaba a apoyo escolar de
> primaria: el proyecto pivoteó a preuniversitario y esto refleja el estado real.

## Qué es

Plataforma de preparación para el ingreso universitario en Mendoza. La lleva
adelante un preuniversitario que ya existe y funciona: dicta clases, tiene
profesores contratados, y material escrito y exámenes reales de años anteriores.

Eso no es un detalle: la mayoría de los proyectos así se mueren por no tener
contenido o por no tener a quién venderle. Acá las dos cosas están resueltas
antes de empezar.

| Decisión | Valor |
|---|---|
| Programas | UNCuyo y UTN FRM |
| Carreras | Ingeniería (por ahora, la única) |
| Materias | Física (activa), Matemática (pendiente), Química (apagada) |
| Monetización | Pago único por materia, con Mercado Pago |
| Diferencial | Ejercicios y evaluaciones que se corrigen solos |
| Canal de adquisición | SEO — por eso todo el contenido se prerenderiza |

**La competencia** (`laacademiavirtual.com.ar`) es WordPress con un plugin de
LMS: cobra $90.000 por 9 meses y entrega videos y PDFs, sin una sola corrección
automática. El hueco está ahí.

## Arquitectura

Una sola app Next.js con el sitio del alumno y el panel adentro.

```
Next.js 16 (App Router)  ──►  Supabase (Postgres + Auth)
                         ──►  YouTube (video, no listado)
                         ──►  Mercado Pago (pendiente)
```

### Modelo de datos

El contenido pertenece a la **materia**, no al curso. Un curso es una selección
de módulos:

```
materias → módulos → clases        el contenido, escrito UNA vez
    ↑
curso_modulos                      qué módulos incluye cada curso
    ↓
programas → carreras → cursos      lo que se compra
```

Cinemática se escribe una vez y aparece en Física-UNCuyo y en Física-UTN.
Termodinámica existe igual pero solo está asignada a UNCuyo.

Dentro de una clase, el `contenido jsonb` tiene: objetivos, **videos**,
explicación, **ejemplos** (que pueden apuntar a un video y a un minuto exacto),
**trabajos prácticos** y **evaluaciones**.

### Rutas

```
/preuniversitario                                  programas
/preuniversitario/[programa]/[carrera]             materias de esa carrera
/preuniversitario/[programa]/[carrera]/[materia]   temario
/clase/[materia]/[clase]                           la clase
/admin, /admin/[materia], /admin/[materia]/[clase] panel
/ingresar, /registrarse, /mi-cuenta                cuentas
```

La clase tiene **una sola dirección**, por materia, aunque aparezca en varias
carreras: publicarla dos veces le daría a Google dos páginas idénticas
compitiendo entre sí.

## Estado

### Hecho

- **Fase 0** — Next.js, SEO, prerenderizado
- **Fase 1** — Supabase, panel de contenido, validación con Zod
- **Diseño** — sistema visual propio, tres páginas, navegación completa
- **Fase 2** — cuentas, progreso en la base, panel protegido
- **Modelo compartido** — programas, carreras, contenido reutilizable
- **Contenido** — videos, TPs y evaluaciones

### Falta

| Fase | Qué |
|---|---|
| **Video** | Decidir si el video se protege o se regala (ver Limitaciones) |
| **Fase 3** | Mercado Pago y muro de pago |
| **Fase 4** | Landing (y volver a poner `/` en el sitemap), analytics, textos legales |
| Panel | Reordenar módulos y clases sin SQL |
| Contenido | Los textos de Nosotros, Método, FAQ y el WhatsApp de Contacto |

### El cuello de botella real

**No es el código.** Física tiene 39 clases y una sola escrita. A 2 clases por
semana son 5 meses; a 4, dos meses y medio. Esa diferencia decide si llegan a la
ventana de diciembre-febrero, que es cuando los chicos buscan preparación.

El panel ya funciona y no depende de nada más. Escribir contenido y programar
son dos carriles independientes: ninguno espera al otro.

## Cómo se trabaja acá

**Las migraciones nunca borran.** `supabase/schema.sql` sirve para una
instalación desde cero. Sobre una base con usuarios va `supabase/migraciones/`,
numeradas y en orden. Esa línea se cruzó cuando apareció el primer usuario.

**La ausencia de error no es evidencia de éxito.** Apareció cuatro veces en un
día: un `update` que RLS filtraba a cero filas sin error, clases de Tailwind que
no generaban CSS, un `insert ... select` que no encontró filas, y una consulta
fallida cuyo error se descartaba con `?? []`. Verificá el efecto: contá filas,
leé el valor, mirá el resultado.

**Que falle fuerte, no en silencio.** Los campos nuevos del contenido no llevan
`.default([])` a propósito: con un default, un contenido viejo pasaría la
validación con las listas vacías, perdiendo todo sin un solo error.

**PostgREST solo anida por claves foráneas simples.** `clases.materia_id` existe
como columna, pero la clave foránea es compuesta contra `modulos(id, materia_id)`.
Anidar `clases → materias` hace fallar la consulta entera. Dos consultas y un Map
son más aburridas y no fallan.

**Leer cookies en un componente compartido saca de estático todo el sitio.** La
cabecera leía la sesión en el servidor y todas las páginas pasaron de `SSG` a
`Dynamic`. Por eso la sesión se resuelve en el navegador.

**Proteger la página no protege la acción.** Una Server Action es un endpoint
HTTP y se puede llamar sin pasar por ninguna pantalla. El permiso se verifica en
los dos lugares.

## Sobre el robo de contenido

Los trabajos prácticos y las evaluaciones son interactivos y no PDF. Un PDF se
descarga y llega a un grupo de WhatsApp en un minuto; transcribir veinte
ejercicios a mano no lo hace nadie. Y de paso se corrige solo.

Para video, la protección real es firmar las URLs para que venzan en minutos.
Está pendiente.

**Contra la grabación de pantalla no hay defensa.** Ni Netflix la tiene resuelta.
Lo que sirve es la marca de agua con el mail del alumno encima: no impide el
robo, pero identifica quién filtró, y eso es lo que frena.

## Costos

Vercel, Supabase y Mercado Pago tienen capa gratuita suficiente para lanzar.
El video está en YouTube, así que no cuesta nada. El dominio `.com.ar`, unos
ARS 5.000 al año.
