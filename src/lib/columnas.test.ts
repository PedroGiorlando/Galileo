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
 * Esto compara lo que la acción escribe contra lo que declara el esquema SQL:
 * es rústico, pero atrapa exactamente esa clase de desfasaje.
 */
describe('las columnas que escribe el panel existen en la base', () => {
  // Se normalizan los finales de línea: en Windows el archivo tiene CRLF y los
  // patrones de búsqueda no coincidirían.
  const accion = fs.readFileSync('src/app/admin/acciones.ts', 'utf8').replace(/\r\n/g, '\n')

  // Columnas de `clases` según schema.sql más las migraciones aplicadas.
  const columnasDeClases = new Set([
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
  ])

  it('el update de una clase solo toca columnas existentes', () => {
    // Las claves del objeto que se le pasa a .update({...}) sobre clases.
    const bloque = accion.slice(
      accion.indexOf(".from('clases')\n    .update({"),
      accion.indexOf('.eq(\'materia_id\', materiaId)'),
    )
    const escritas = [...bloque.matchAll(/^\s{6}([a-z_]+):/gm)].map(m => m[1])

    expect(escritas.length).toBeGreaterThan(0)
    for (const col of escritas) {
      expect(columnasDeClases, `la columna "${col}" no existe en clases`).toContain(col)
    }
  })

  it('los metadatos del panel no declaran campos de columnas borradas', () => {
    // Si alguien reintroduce videoUrl, el formulario volvería a mandarlo.
    expect(Object.keys(TemaMetaSchema.shape)).not.toContain('videoUrl')
  })
})
