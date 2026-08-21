import { redirect } from 'next/navigation'

// Una universidad con una sola carrera no merece una pantalla propia: se salta
// directo. Cuando haya varias, esta ruta pasa a listarlas.
export default async function ProgramaPage({
  params,
}: {
  params: Promise<{ programa: string }>
}) {
  const { programa } = await params
  redirect(`/preuniversitario/${programa}/ingenieria`)
}
