import { Portal } from "@/components/portal";
import { requireRol } from "@/lib/auth";

const ITEMS = [
  { href: "/candidato", texto: "Inicio", exacto: true },
  { href: "/candidato/perfil", texto: "Mi perfil" },
  { href: "/candidato/postulaciones", texto: "Postulaciones" },
  { href: "/candidato/evaluaciones", texto: "Evaluaciones" },
  { href: "/empleos", texto: "Buscar empleos" },
];

export default async function CandidatoLayout({ children }: { children: React.ReactNode }) {
  const usuario = await requireRol("candidato");
  return (
    <Portal usuario={usuario} subtitulo="Candidato" items={ITEMS}>
      {children}
    </Portal>
  );
}
