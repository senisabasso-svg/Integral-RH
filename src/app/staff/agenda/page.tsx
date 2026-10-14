import { and, asc, eq, gte } from "drizzle-orm";
import { alias } from "drizzle-orm/sqlite-core";
import { AgendaPorDia } from "@/components/citas";
import { BotonEnviar } from "@/components/formulario";
import { BotonLink, EncabezadoPagina, Pestanas } from "@/components/ui";
import { db } from "@/db";
import { citas, empresas, usuarios } from "@/db/schema";
import { eliminarCita } from "@/lib/acciones/citas";
import { requireRol } from "@/lib/auth";
import { claveDia, parseFechaHoraLocal } from "@/lib/utils";

export const metadata = { title: "Agenda" };

export default async function AgendaStaffPage({
  searchParams,
}: {
  searchParams: Promise<{ todas?: string }>;
}) {
  const usuario = await requireRol("staff");
  const verTodas = (await searchParams).todas === "1";
  const candidato = alias(usuarios, "candidato");
  const responsable = alias(usuarios, "responsable");
  const desde = parseFechaHoraLocal(`${claveDia(new Date())}T00:00`)!;

  const filas = await db
    .select({
      id: citas.id,
      titulo: citas.titulo,
      tipo: citas.tipo,
      inicio: citas.inicio,
      duracionMin: citas.duracionMin,
      lugar: citas.lugar,
      empresa: empresas.razonSocial,
      candidato: candidato.nombre,
      responsable: responsable.nombre,
    })
    .from(citas)
    .innerJoin(responsable, eq(citas.staffId, responsable.id))
    .leftJoin(empresas, eq(citas.empresaId, empresas.id))
    .leftJoin(candidato, eq(citas.candidatoId, candidato.id))
    .where(and(gte(citas.inicio, desde), verTodas ? undefined : eq(citas.staffId, usuario.id)))
    .orderBy(asc(citas.inicio));

  const agenda = filas.map((fila) => ({
    ...fila,
    detalle: [
      [fila.empresa, fila.candidato].filter(Boolean).join(" · ") || null,
      verTodas ? `Responsable: ${fila.responsable}` : null,
    ]
      .filter(Boolean)
      .join(" — "),
  }));

  return (
    <>
      <EncabezadoPagina
        titulo="Agenda"
        descripcion="Entrevistas, exámenes, sesiones y reuniones desde hoy."
        acciones={<BotonLink href="/staff/agenda/nueva">Nueva cita</BotonLink>}
      />
      <Pestanas
        items={[
          { href: "/staff/agenda", texto: "Mi agenda", activo: !verTodas },
          { href: "/staff/agenda?todas=1", texto: "Todo el equipo", activo: verTodas },
        ]}
      />
      <AgendaPorDia
        citas={agenda}
        acciones={(cita) => (
          <form action={eliminarCita}>
            <input type="hidden" name="id" value={cita.id} />
            <BotonEnviar variante="fantasma" tamano="sm" textoPendiente="…">
              Eliminar
            </BotonEnviar>
          </form>
        )}
      />
    </>
  );
}
