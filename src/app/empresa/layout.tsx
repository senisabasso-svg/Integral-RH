import { eq } from "drizzle-orm";
import { Portal } from "@/components/portal";
import { db } from "@/db";
import { empresas } from "@/db/schema";
import { requireEmpresa } from "@/lib/auth";

const ITEMS = [
  { href: "/empresa", texto: "Inicio", exacto: true },
  { href: "/empresa/busquedas", texto: "Búsquedas" },
  { href: "/empresa/solicitudes", texto: "Solicitudes" },
  { href: "/empresa/agenda", texto: "Agenda" },
];

export default async function EmpresaLayout({ children }: { children: React.ReactNode }) {
  const usuario = await requireEmpresa();
  const [empresa] = await db
    .select({ razonSocial: empresas.razonSocial })
    .from(empresas)
    .where(eq(empresas.id, usuario.empresaId));

  return (
    <Portal usuario={usuario} subtitulo={empresa?.razonSocial ?? "Empresa"} items={ITEMS}>
      {children}
    </Portal>
  );
}
