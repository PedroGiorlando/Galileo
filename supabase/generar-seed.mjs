/**
 * Convierte supabase/curriculum.mjs en supabase/seed-preuniversitario.sql.
 *
 *   node supabase/generar-seed.mjs
 *
 * Genera el SQL en vez de escribirlo a mano por dos razones: los slugs se
 * calculan igual siempre (sin tildes, sin choques), y volver a generar después
 * de editar el currículum es un comando, no revisar cientos de líneas.
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { MATERIAS, PROGRAMA, CLASE_CON_CONTENIDO } from './curriculum.mjs'

const aquí = path.dirname(fileURLToPath(import.meta.url))

/** 'Suma de vectores por componentes' → 'suma-de-vectores-por-componentes' */
function aSlug(texto) {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // saca las tildes, deja la letra base
    .replace(/[°º]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** Comillas simples de SQL: se escapan duplicándolas. */
const sql = valor => (valor == null ? 'null' : `'${String(valor).replace(/'/g, "''")}'`)

const problemas = []
const lineas = [
  '-- GENERADO por supabase/generar-seed.mjs — no editar a mano.',
  '-- Editar supabase/curriculum.mjs y volver a correr el generador.',
  '--',
  '-- Se corre DESPUÉS de schema.sql. Es idempotente: los insert hacen',
  '-- "on conflict do update", así que volver a correrlo actualiza títulos y',
  '-- orden sin tocar el contenido ya cargado.',
  '',
]

for (const [iMateria, materia] of MATERIAS.entries()) {
  lineas.push(
    `-- ${'='.repeat(72)}`,
    `-- ${materia.nombre}`,
    `-- ${'='.repeat(72)}`,
    '',
    'insert into cursos (nivel, slug, nombre, programa, titulo, descripcion, orden, publicado)',
    `values ('preuniversitario', ${sql(materia.slug)}, ${sql(materia.nombre)}, ${sql(PROGRAMA)},`,
    `        ${sql(`${materia.nombre} — ${PROGRAMA}`)}, ${sql(materia.descripcion)},`,
    `        ${iMateria + 1}, ${materia.publicado})`,
    '  on conflict (nivel, slug) do update set',
    '    nombre = excluded.nombre, programa = excluded.programa, titulo = excluded.titulo,',
    '    descripcion = excluded.descripcion, orden = excluded.orden;',
    '',
  )

  const slugsUsados = new Set()

  for (const [iUnidad, [slugUnidad, unidad]] of Object.entries(materia.unidades).entries()) {
    lineas.push(
      `-- ${materia.nombre} · ${unidad.nombre}`,
      'insert into temas (curso_id, orden, slug, nombre)',
      `select c.id, ${iUnidad + 1}, ${sql(slugUnidad)}, ${sql(unidad.nombre)}`,
      `from cursos c where c.nivel = 'preuniversitario' and c.slug = ${sql(materia.slug)}`,
      '  on conflict (curso_id, slug) do update set',
      '    nombre = excluded.nombre, orden = excluded.orden;',
      '',
    )

    for (const [iClase, titulo] of unidad.clases.entries()) {
      const slug = aSlug(titulo)

      if (slugsUsados.has(slug)) {
        problemas.push(`${materia.nombre}: dos clases comparten el slug "${slug}" (${titulo})`)
      }
      slugsUsados.add(slug)

      // La única clase con contenido escrito se deja gratis para que sirva de
      // muestra pública; el resto arranca vacía y se ve "Próximamente".
      const esLaQueTieneContenido =
        materia.slug === CLASE_CON_CONTENIDO.materia && slug === CLASE_CON_CONTENIDO.slug

      lineas.push(
        'insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)',
        `select t.curso_id, t.id, ${iClase + 1}, ${sql(slug)}, ${sql(titulo)}, ${esLaQueTieneContenido}, true`,
        'from temas t join cursos c on c.id = t.curso_id',
        `where c.nivel = 'preuniversitario' and c.slug = ${sql(materia.slug)} and t.slug = ${sql(slugUnidad)}`,
        '  on conflict (curso_id, slug) do update set',
        '    titulo = excluded.titulo, orden = excluded.orden, tema_id = excluded.tema_id;',
      )
    }
    lineas.push('')
  }
}

if (problemas.length > 0) {
  console.error('No se generó nada. Slugs repetidos:\n  ' + problemas.join('\n  '))
  process.exit(1)
}

fs.writeFileSync(path.join(aquí, 'seed-preuniversitario.sql'), lineas.join('\n') + '\n', 'utf8')

const contar = m => Object.values(m.unidades).reduce((n, u) => n + u.clases.length, 0)
console.log('seed-preuniversitario.sql generado')
console.log(`  programa: ${PROGRAMA}`)
for (const m of MATERIAS) {
  const unidades = Object.keys(m.unidades).length
  const estado = m.publicado ? 'publicada' : 'sin publicar'
  console.log(`  ${m.nombre.padEnd(11)} ${unidades} unidades · ${contar(m)} clases · ${estado}`)
}
console.log(`  total: ${MATERIAS.reduce((n, m) => n + contar(m), 0)} clases`)
