import { asc, inArray, ne } from "drizzle-orm";
import { EncabezadoPagina, Tarjeta } from "@/components/ui";
import { db } from "@/db";
import { procesos, solicitudes } from "@/db/schema";
import { requireRol } from "@/lib/auth";
import { opcionesCandidatos, opcionesEmpresas, opcionesStaff } from "@/lib/consultas";
import { claveDia } from "@/lib/utils";
import { FormCita } from "./form-cita";

export const metadata = { title: "Nueva cita" };

export default async function NuevaCitaPage({
  searchParams,
}: {
  searchParams: Promise<{ empresa?: string; candidato?: string; proceso?: string; solicitud?: string }>;
}) {
  const usuario = await requireRol("staff");
  const parametros = await searchParams;

  const procesosAbiertos = await db
    .select({ id: procesos.id, nombre: procesos.titulo })
    .from(procesos)
    .where(ne(procesos.estado, "cerrado"))
    .orderBy(asc(procesos.titulo));
  const solicitudesAbiertas = await db
    .select({ id: solicitudes.id, nombre: solicitudes.asunto })
    .from(solicitudes)
    .where(inArray(solicitudes.estado, ["nueva", "en_curso"]))
    .orderBy(asc(solicitudes.asunto));
  const manana = claveDia(Date.now() + 24 * 60 * 60 * 1000);

  return (
    <>
      <EncabezadoPagina titulo="Nueva cita" volver={{ href: "/staff/agenda", texto: "Agenda" }} />
      <Tarjeta className="max-w-3xl">
        <FormCita
          staff={await opcionesStaff()}
          empresas={await opcionesEmpresas()}
          candidatos={await opcionesCandidatos()}
          procesos={procesosAbiertos}
          solicitudes={solicitudesAbiertas}
          inicial={{
            staffId: String(usuario.id),
            inicio: `${manana}T10:00`,
            empresaId: parametros.empresa ?? "",
            candidatoId: parametros.candidato ?? "",
            procesoId: parametros.proceso ?? "",
            solicitudId: parametros.solicitud ?? "",
          }}
        />
      </Tarjeta>
    </>
  );
}
