/**
 * Convierte supabase/curriculum.mjs en supabase/seed-primaria.sql.
 *
 *   node supabase/generar-seed.mjs
 *
 * Genera el SQL en vez de escribirlo a mano por dos razones: los slugs se
 * calculan igual siempre (sin tildes, sin choques), y volver a generar después
 * de editar el currículum es un comando, no revisar 200 líneas.
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { GRADOS, TEMAS, SUBTEMA_CON_CONTENIDO } from './curriculum.mjs'

const aquí = path.dirname(fileURLToPath(import.meta.url))

/** 'Múltiplos y divisores' → 'multiplos-y-divisores' */
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
const lineas = []

lineas.push(
  '-- GENERADO por supabase/generar-seed.mjs — no editar a mano.',
  '-- Editar supabase/curriculum.mjs y volver a correr el generador.',
  '--',
  '-- Se corre DESPUÉS de schema.sql. Es idempotente: los insert hacen',
  '-- "on conflict do update", así que volver a correrlo actualiza títulos y',
  '-- orden sin tocar el contenido ya cargado.',
  '',
)

for (const [iGrado, grado] of GRADOS.entries()) {
  lineas.push(
    `-- ${'='.repeat(72)}`,
    `-- ${grado.nombre}`,
    `-- ${'='.repeat(72)}`,
    '',
    'insert into cursos (materia_id, nivel, grado_slug, grado_nombre, titulo, descripcion, orden, publicado)',
    `select m.id, 'primaria', ${sql(grado.slug)}, ${sql(grado.nombre)}, ${sql(`Matemática ${grado.nombre}`)},`,
    `       ${sql(grado.descripcion)}, ${iGrado + 1}, true`,
    "from materias m where m.slug = 'matematica'",
    '  on conflict (nivel, grado_slug, materia_id) do update set',
    '    grado_nombre = excluded.grado_nombre, titulo = excluded.titulo,',
    '    descripcion = excluded.descripcion, orden = excluded.orden;',
    '',
  )

  const slugsUsados = new Set()

  for (const [iTema, tema] of TEMAS.entries()) {
    const subtemas = grado.subtemas[tema.slug] ?? []
    if (subtemas.length === 0) continue

    lineas.push(
      `-- ${grado.nombre} · ${tema.nombre}`,
      'insert into temas (curso_id, orden, slug, nombre)',
      `select c.id, ${iTema + 1}, ${sql(tema.slug)}, ${sql(tema.nombre)}`,
      `from cursos c where c.nivel = 'primaria' and c.grado_slug = ${sql(grado.slug)}`,
      '  on conflict (curso_id, slug) do update set',
      '    nombre = excluded.nombre, orden = excluded.orden;',
      '',
    )

    for (const [iSub, titulo] of subtemas.entries()) {
      const slug = aSlug(titulo)

      if (slugsUsados.has(slug)) {
        problemas.push(`${grado.nombre}: dos subtemas comparten el slug "${slug}" (${titulo})`)
      }
      slugsUsados.add(slug)

      // El único subtema con contenido escrito se deja gratis para que sirva de
      // muestra pública; el resto arranca sin contenido y se ve "Próximamente".
      const esElQueTieneContenido =
        grado.slug === SUBTEMA_CON_CONTENIDO.grado && slug === SUBTEMA_CON_CONTENIDO.slug

      lineas.push(
        'insert into subtemas (curso_id, tema_id, orden, slug, titulo, gratis, publicado)',
        `select t.curso_id, t.id, ${iSub + 1}, ${sql(slug)}, ${sql(titulo)}, ${esElQueTieneContenido}, true`,
        `from temas t join cursos c on c.id = t.curso_id`,
        `where c.nivel = 'primaria' and c.grado_slug = ${sql(grado.slug)} and t.slug = ${sql(tema.slug)}`,
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

const destino = path.join(aquí, 'seed-primaria.sql')
fs.writeFileSync(destino, lineas.join('\n') + '\n', 'utf8')

const totalSubtemas = GRADOS.reduce(
  (n, g) => n + Object.values(g.subtemas).flat().length,
  0,
)
console.log(`seed-primaria.sql generado`)
console.log(`  ${GRADOS.length} grados · ${TEMAS.length} áreas · ${totalSubtemas} subtemas`)
for (const g of GRADOS) {
  console.log(`  ${g.nombre}: ${Object.values(g.subtemas).flat().length} subtemas`)
}
