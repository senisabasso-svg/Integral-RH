import { eq } from "drizzle-orm";
import { EncabezadoPagina, Tarjeta } from "@/components/ui";
import { db } from "@/db";
import { solicitudes } from "@/db/schema";
import { requireRol } from "@/lib/auth";
import { opcionesEmpresas, opcionesStaff } from "@/lib/consultas";
import { FormProceso } from "../form-proceso";

export const metadata = { title: "Nuevo proceso" };

export default async function NuevoProcesoPage({
  searchParams,
}: {
  searchParams: Promise<{ solicitud?: string; empresa?: string }>;
}) {
  await requireRol("staff");
  const parametros = await searchParams;
  const solicitudId = Number(parametros.solicitud) || undefined;
  const [solicitud] = solicitudId
    ? await db
        .select({
          id: solicitudes.id,
          empresaId: solicitudes.empresaId,
          asunto: solicitudes.asunto,
          descripcion: solicitudes.descripcion,
        })
        .from(solicitudes)
        .where(eq(solicitudes.id, solicitudId))
    : [];
  const empresaId = solicitud?.empresaId ?? (Number(parametros.empresa) || undefined);

  return (
    <>
      <EncabezadoPagina
        titulo="Nuevo proceso de selección"
        descripcion={solicitud ? `A partir de la solicitud «${solicitud.asunto}».` : undefined}
        volver={
          solicitud
            ? { href: `/staff/solicitudes/${solicitud.id}`, texto: "Volver a la solicitud" }
            : { href: "/staff/procesos", texto: "Procesos" }
        }
      />
      <Tarjeta>
        <FormProceso
          empresas={await opcionesEmpresas()}
          staff={await opcionesStaff()}
          solicitudId={solicitud?.id}
          inicial={{ empresaId, descripcion: solicitud?.descripcion }}
        />
      </Tarjeta>
    </>
  );
}
