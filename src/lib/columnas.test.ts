import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import { TemaMetaSchema } from './schemas'

/**
 * Que el panel no escriba columnas que no existen.
 *
 * El campo `videoUrl` sobrevivió en el schema después de que la migración 004
 * borrara la columna `clases.video_url`. TypeScript no lo detecta —el cliente
 * de Supabase acepta cualquier objeto— y el build pasaba en verde. El error
 * habría aparecido recién al guardar la primera clase desde el panel.
 *
 * Esto compara lo que las acciones escriben contra las columnas reales. Es
 * rústico —lee el código como texto— pero atrapa exactamente ese desfasaje, que
 * es invisible para el compilador y para el build.
 */

/** Columnas reales, tomadas de la base (schema.sql + las migraciones aplicadas). */
const COLUMNAS: Record<string, string[]> = {
  programas: ['id', 'slug', 'nombre', 'orden'],
  carreras: ['id', 'programa_id', 'slug', 'nombre', 'orden'],
  materias: ['id', 'slug', 'nombre', 'orden', 'activa'],
  cursos: [
    'id',
    'carrera_id',
    'materia_id',
    'titulo',
    'descripcion',
    'orden',
    'precio_centavos',
    'publicado',
  ],
  modulos: ['id', 'materia_id', 'slug', 'nombre', 'orden'],
  clases: [
    'id',
    'modulo_id',
    'materia_id',
    'orden',
    'slug',
    'titulo',
    'descripcion',
    'duracion_label',
    'gratis',
    'publicado',
    'contenido',
  ],
  curso_modulos: ['curso_id', 'modulo_id', 'orden'],
  compras: ['id', 'user_id', 'mp_payment_id', 'creada_en', 'vence_en', 'curso_id'],
  progreso: ['user_id', 'clase_id', 'completado', 'mejor_puntaje', 'respuestas', 'actualizado_en'],
  admins: ['user_id'],
}

const ARCHIVOS = [
  'src/app/admin/acciones.ts',
  'src/app/admin/acciones-estructura.ts',
  'src/app/acciones-progreso.ts',
]

/** Devuelve el texto entre la llave de apertura en `desde` y su llave pareja. */
function bloqueDeLlaves(texto: string, desde: number): string | null {
  if (texto[desde] !== '{') return null
  let nivel = 0
  for (let i = desde; i < texto.length; i++) {
    if (texto[i] === '{') nivel++
    else if (texto[i] === '}') {
      nivel--
      if (nivel === 0) return texto.slice(desde + 1, i)
    }
  }
  return null
}

/**
 * Las claves de primer nivel de un objeto, a partir de su cuerpo.
 *
 * LA PRIMERA VERSIÓN DE ESTO MIRABA RENGLÓN POR RENGLÓN con una expresión
 * regular, y pasaba en verde revisando la mitad: no veía las propiedades
 * abreviadas (`slug,` no tiene dos puntos), ni la segunda clave de un renglón
 * con varias, ni los objetos escritos en una sola línea. La columna `slug` de
 * `modulos` y las tablas `programas` y `materias` enteras quedaban sin
 * revisar, y la prueba no se quejaba. Un verificador que dice "todo bien"
 * habiendo mirado la mitad es peor que no tenerlo.
 *
 * Así que se parte en comas de primer nivel, respetando llaves, corchetes,
 * paréntesis y comillas.
 */
function propiedadesDe(cuerpo: string): string[] {
  const piezas: string[] = []
  let profundidad = 0
  let comilla: string | null = null
  let actual = ''

  for (let i = 0; i < cuerpo.length; i++) {
    const ch = cuerpo[i]

    if (comilla) {
      // Una coma dentro de un texto ('curso_id,modulo_id') no separa nada.
      if (ch === comilla && cuerpo[i - 1] !== '\\') comilla = null
      actual += ch
      continue
    }

    if (ch === "'" || ch === '"' || ch === '`') comilla = ch
    else if ('{[('.includes(ch)) profundidad++
    else if ('}])'.includes(ch)) profundidad--
    else if (ch === ',' && profundidad === 0) {
      piezas.push(actual)
      actual = ''
      continue
    }
    actual += ch
  }
  piezas.push(actual)

  return piezas
    .map(p =>
      p
        .replace(/\/\/[^\n]*/g, '')
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .trim(),
    )
    .filter(Boolean)
    // `nombre: x` y el abreviado `nombre` valen igual. Lo que empieza con `...`
    // es un spread y no nombra ninguna columna.
    .map(p => p.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*(?::|$)/)?.[1] ?? null)
    .filter((x): x is string => x !== null)
}

/**
 * Encuentra cada escritura: `.from('tabla')` seguido, más adelante, de
 * `.insert({...})`, `.update({...})` o `.upsert({...})`.
 */
function escriturasDe(codigo: string): { tabla: string; columnas: string[]; op: string }[] {
  const salida: { tabla: string; columnas: string[]; op: string }[] = []
  const desdeTabla = /\.from\('([a-z_]+)'\)/g

  for (const m of codigo.matchAll(desdeTabla)) {
    const tabla = m[1]
    // La escritura viene en la misma cadena de llamadas: se corta en el
    // siguiente `.from(` para no atribuirle a esta tabla lo de la próxima.
    const finCadena = codigo.indexOf(".from('", m.index + 1)
    const tramo = codigo.slice(m.index, finCadena === -1 ? undefined : finCadena)

    for (const op of ['insert', 'update', 'upsert']) {
      const i = tramo.indexOf(`.${op}(`)
      if (i === -1) continue

      // El objeto tiene que ser el PRIMER argumento. Si no, lo que se agarra es
      // el segundo —las opciones— y se toma `onConflict` por una columna.
      //
      // PUNTO CIEGO CONOCIDO: cuando la carga es una variable
      // (`.upsert(filas, ...)`), acá no hay literal que revisar y esa escritura
      // queda sin verificar. Es el caso de importarProgresoLocal.
      const abre = i + `.${op}(`.length + /^\s*/.exec(tramo.slice(i + `.${op}(`.length))![0].length
      if (tramo[abre] !== '{') continue

      const cuerpo = bloqueDeLlaves(tramo, abre)
      if (!cuerpo) continue

      const columnas = propiedadesDe(cuerpo)
      if (columnas.length > 0) salida.push({ tabla, columnas, op })
    }
  }
  return salida
}

describe('las columnas que escribe el panel existen en la base', () => {
  const escrituras = ARCHIVOS.flatMap(archivo => {
    const codigo = fs.readFileSync(archivo, 'utf8').replace(/\r\n/g, '\n')
    return escriturasDe(codigo).map(e => ({ ...e, archivo }))
  })

  it('sigue encontrando todas las escrituras', () => {
    // Hoy son 11. El número está fijo porque este análisis lee el código como
    // texto y se puede romper con un cambio de formato: si eso pasa, el conteo
    // baja y la prueba se queja, en vez de pasar en verde revisando la mitad.
    // Ya ocurrió: una versión anterior no veía las propiedades abreviadas ni
    // los objetos de una sola línea, y dejaba sin revisar `modulos.slug` y las
    // tablas `programas` y `materias` enteras.
    //
    // Si agregás una acción que escribe, subí el número.
    expect(escrituras.length).toBeGreaterThanOrEqual(11)
  })

  it('toda columna escrita existe en su tabla', () => {
    for (const e of escrituras) {
      const conocidas = COLUMNAS[e.tabla]
      expect(conocidas, `tabla desconocida: "${e.tabla}" (${e.archivo})`).toBeDefined()

      for (const col of e.columnas) {
        expect(
          conocidas,
          `${e.archivo}: ${e.op} sobre "${e.tabla}" escribe "${col}", que no existe`,
        ).toContain(col)
      }
    }
  })

  it('los metadatos del panel no declaran campos de columnas borradas', () => {
    // Si alguien reintroduce videoUrl, el formulario volvería a mandarlo.
    expect(Object.keys(TemaMetaSchema.shape)).not.toContain('videoUrl')
  })
})
