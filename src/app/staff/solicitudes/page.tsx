import { and, desc, eq, inArray } from "drizzle-orm";
import Link from "next/link";
import { EtiquetaSolicitud } from "@/components/etiquetas";
import { EncabezadoPagina, Pestanas, Vacio } from "@/components/ui";
import { db } from "@/db";
import { empresas, solicitudes, usuarios } from "@/db/schema";
import { requireRol } from "@/lib/auth";
import { ESTADO_SOLICITUD_LABEL, ESTADOS_SOLICITUD, TIPO_SOLICITUD_LABEL, type EstadoSolicitud } from "@/lib/dominio";
import { formatFecha } from "@/lib/utils";

export const metadata = { title: "Solicitudes" };

const FILTROS: { clave: string; texto: string; estados: EstadoSolicitud[] | null }[] = [
  { clave: "abiertas", texto: "Abiertas", estados: ["nueva", "en_curso"] },
  ...ESTADOS_SOLICITUD.map((e) => ({ clave: e, texto: ESTADO_SOLICITUD_LABEL[e], estados: [e] })),
  { clave: "todas", texto: "Todas", estados: null },
];

export default async function SolicitudesStaffPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string; mias?: string }>;
}) {
  const usuario = await requireRol("staff");
  const { estado = "abiertas", mias } = await searchParams;
  const filtro = FILTROS.find((f) => f.clave === estado) ?? FILTROS[0]!;
  const soloMias = mias === "1";

  const lista = await db
    .select({
      id: solicitudes.id,
      asunto: solicitudes.asunto,
      tipo: solicitudes.tipo,
      estado: solicitudes.estado,
      actualizadoEn: solicitudes.actualizadoEn,
      empresa: empresas.razonSocial,
      responsable: usuarios.nombre,
    })
    .from(solicitudes)
    .innerJoin(empresas, eq(solicitudes.empresaId, empresas.id))
    .leftJoin(usuarios, eq(solicitudes.responsableId, usuarios.id))
    .where(
      and(
        filtro.estados ? inArray(solicitudes.estado, filtro.estados) : undefined,
        soloMias ? eq(solicitudes.responsableId, usuario.id) : undefined,
      ),
    )
    .orderBy(desc(solicitudes.actualizadoEn));

  const sufijo = soloMias ? "&mias=1" : "";

  return (
    <>
      <EncabezadoPagina
        titulo="Solicitudes de servicio"
        descripcion="Pedidos de las empresas a todas las áreas."
        acciones={
          <Link
            href={`/staff/solicitudes?estado=${filtro.clave}${soloMias ? "" : "&mias=1"}`}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            {soloMias ? "Ver todas las áreas" : "Solo las asignadas a mí"}
          </Link>
        }
      />
      <Pestanas
        items={FILTROS.map((f) => ({
          href: `/staff/solicitudes?estado=${f.clave}${sufijo}`,
          texto: f.texto,
          activo: f.clave === filtro.clave,
        }))}
      />
      {lista.length === 0 ? (
        <Vacio titulo="No hay solicitudes en esta vista." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500 uppercase">
              <tr>
                <th className="px-4 py-3 font-medium">Asunto</th>
                <th className="px-4 py-3 font-medium">Empresa</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium">Responsable</th>
                <th className="px-4 py-3 font-medium">Actualizada</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {lista.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link href={`/staff/solicitudes/${s.id}`} className="font-medium text-slate-900 hover:text-marca-700">
                      {s.asunto}
                    </Link>
                    <p className="text-xs text-slate-500">{TIPO_SOLICITUD_LABEL[s.tipo]}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{s.empresa}</td>
                  <td className="px-4 py-3">
                    <EtiquetaSolicitud estado={s.estado} />
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {s.responsable ?? <span className="text-amber-700">Sin asignar</span>}
                  </td>
                  <td className="px-4 py-3 text-slate-500">{formatFecha(s.actualizadoEn)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
