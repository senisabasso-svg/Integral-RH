import { Portal } from "@/components/portal";
import { requireRol } from "@/lib/auth";
import { ESPECIALIDAD_LABEL } from "@/lib/dominio";

export default async function StaffLayout({ children }: { children: React.ReactNode }) {
  const usuario = await requireRol("staff");
  const items = [
    { href: "/staff", texto: "Inicio", exacto: true },
    { href: "/staff/procesos", texto: "Procesos" },
    { href: "/staff/candidatos", texto: "Candidatos" },
    { href: "/staff/empresas", texto: "Empresas" },
    { href: "/staff/solicitudes", texto: "Solicitudes" },
    { href: "/staff/agenda", texto: "Agenda" },
    ...(usuario.esAdmin ? [{ href: "/staff/equipo", texto: "Equipo" }] : []),
  ];
  const subtitulo = usuario.especialidad ? ESPECIALIDAD_LABEL[usuario.especialidad] : "Staff";

  return (
    <Portal usuario={usuario} subtitulo={subtitulo} items={items}>
      {children}
    </Portal>
  );
}
