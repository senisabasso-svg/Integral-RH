import { and, asc, eq, gte } from "drizzle-orm";
import { alias } from "drizzle-orm/sqlite-core";
import { AgendaPorDia } from "@/components/citas";
import { EncabezadoPagina } from "@/components/ui";
import { db } from "@/db";
import { citas, usuarios } from "@/db/schema";
import { requireEmpresa } from "@/lib/auth";
import { APP_NAME } from "@/lib/dominio";
import { claveDia, parseFechaHoraLocal } from "@/lib/utils";

export const metadata = { title: "Agenda" };

export default async function AgendaEmpresaPage() {
  const usuario = await requireEmpresa();
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
      candidato: candidato.nombre,
      responsable: responsable.nombre,
    })
    .from(citas)
    .innerJoin(responsable, eq(citas.staffId, responsable.id))
    .leftJoin(candidato, eq(citas.candidatoId, candidato.id))
    .where(and(eq(citas.empresaId, usuario.empresaId), gte(citas.inicio, desde)))
    .orderBy(asc(citas.inicio));

  return (
    <>
      <EncabezadoPagina
        titulo="Agenda"
        descripcion="Entrevistas, exámenes y reuniones coordinadas con tu empresa."
      />
      <AgendaPorDia
        citas={filas.map((fila) => ({
          ...fila,
          detalle: `Con ${fila.responsable} (${APP_NAME})${fila.candidato ? ` · Candidato: ${fila.candidato}` : ""}`,
        }))}
      />
    </>
  );
}
