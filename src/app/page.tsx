import { redirect } from 'next/navigation'

// ponytail: todavía no hay landing. Con un solo curso, la home manda ahí
// directo en vez de consultar la base para adivinar el destino. Fase 4 la
// reemplaza por la landing real.
export default function Home() {
  redirect('/primaria/4-grado/matematica')
}
