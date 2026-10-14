import { count, desc, eq, sql } from "drizzle-orm";
import Link from "next/link";
import { EtiquetaProceso } from "@/components/etiquetas";
import { BotonLink, EncabezadoPagina, Pestanas, Vacio } from "@/components/ui";
import { db } from "@/db";
import { empresas, postulaciones, procesos, usuarios } from "@/db/schema";
import { requireRol } from "@/lib/auth";
import { ESTADO_PROCESO_LABEL, ESTADOS_PROCESO, MODALIDAD_LABEL, type EstadoProceso } from "@/lib/dominio";
import { formatFecha } from "@/lib/utils";

export const metadata = { title: "Procesos" };

export default async function ProcesosPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string }>;
}) {
  await requireRol("staff");
  const { estado } = await searchParams;
  const filtro = ESTADOS_PROCESO.find((e) => e === estado) as EstadoProceso | undefined;

  const lista = await db
    .select({
      id: procesos.id,
      titulo: procesos.titulo,
      estado: procesos.estado,
      modalidad: procesos.modalidad,
      ubicacion: procesos.ubicacion,
      creadoEn: procesos.creadoEn,
      empresa: empresas.razonSocial,
      responsable: usuarios.nombre,
    })
    .from(procesos)
    .innerJoin(empresas, eq(procesos.empresaId, empresas.id))
    .leftJoin(usuarios, eq(procesos.responsableId, usuarios.id))
    .where(filtro ? eq(procesos.estado, filtro) : undefined)
    .orderBy(desc(procesos.creadoEn));

  const conteos = await db
    .select({
      procesoId: postulaciones.procesoId,
      total: count(),
      sinRevisar: sql<number>`sum(case when ${postulaciones.etapa} = 'postulado' then 1 else 0 end)`,
    })
    .from(postulaciones)
    .groupBy(postulaciones.procesoId);
  const conteoPorProceso = new Map(conteos.map((c) => [c.procesoId, c]));

  return (
    <>
      <EncabezadoPagina
        titulo="Procesos de selección"
        descripcion="Búsquedas activas y su avance."
        acciones={<BotonLink href="/staff/procesos/nuevo">Nuevo proceso</BotonLink>}
      />
      <Pestanas
        items={[
          { href: "/staff/procesos", texto: "Todos", activo: !filtro },
          ...ESTADOS_PROCESO.map((e) => ({
            href: `/staff/procesos?estado=${e}`,
            texto: ESTADO_PROCESO_LABEL[e],
            activo: filtro === e,
          })),
        ]}
      />
      {lista.length === 0 ? (
        <Vacio titulo="No hay procesos en esta vista." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500 uppercase">
              <tr>
                <th className="px-4 py-3 font-medium">Puesto</th>
                <th className="px-4 py-3 font-medium">Empresa</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium">Postulaciones</th>
                <th className="px-4 py-3 font-medium">Responsable</th>
                <th className="px-4 py-3 font-medium">Creado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {lista.map((p) => {
                const conteo = conteoPorProceso.get(p.id);
                return (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <Link href={`/staff/procesos/${p.id}`} className="font-medium text-slate-900 hover:text-marca-700">
                        {p.titulo}
                      </Link>
                      <p className="text-xs text-slate-500">
                        {MODALIDAD_LABEL[p.modalidad]} · {p.ubicacion}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{p.empresa}</td>
                    <td className="px-4 py-3">
                      <EtiquetaProceso estado={p.estado} />
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {conteo?.total ?? 0}
                      {Number(conteo?.sinRevisar ?? 0) > 0 && (
                        <span className="ml-1 text-xs text-amber-700">({conteo!.sinRevisar} sin revisar)</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{p.responsable ?? "Sin asignar"}</td>
                    <td className="px-4 py-3 text-slate-500">{formatFecha(p.creadoEn)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
