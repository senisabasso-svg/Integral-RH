import { asc, count, eq, inArray } from "drizzle-orm";
import Link from "next/link";
import { BotonLink, EncabezadoPagina, Vacio } from "@/components/ui";
import { db } from "@/db";
import { empresas, procesos, solicitudes } from "@/db/schema";
import { requireRol } from "@/lib/auth";
import { formatFecha } from "@/lib/utils";

export const metadata = { title: "Empresas" };

export default async function EmpresasStaffPage() {
  await requireRol("staff");
  const lista = await db.select().from(empresas).orderBy(asc(empresas.razonSocial));

  const activas = await db
    .select({ empresaId: procesos.empresaId, total: count() })
    .from(procesos)
    .where(eq(procesos.estado, "publicado"))
    .groupBy(procesos.empresaId);
  const abiertas = await db
    .select({ empresaId: solicitudes.empresaId, total: count() })
    .from(solicitudes)
    .where(inArray(solicitudes.estado, ["nueva", "en_curso"]))
    .groupBy(solicitudes.empresaId);
  const busquedasPorEmpresa = new Map(activas.map((a) => [a.empresaId, a.total]));
  const solicitudesPorEmpresa = new Map(abiertas.map((a) => [a.empresaId, a.total]));

  return (
    <>
      <EncabezadoPagina
        titulo="Empresas"
        descripcion={`${lista.length} clientes.`}
        acciones={<BotonLink href="/staff/empresas/nueva">Nueva empresa</BotonLink>}
      />
      {lista.length === 0 ? (
        <Vacio titulo="Todavía no hay empresas registradas." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500 uppercase">
              <tr>
                <th className="px-4 py-3 font-medium">Empresa</th>
                <th className="px-4 py-3 font-medium">RUT</th>
                <th className="px-4 py-3 font-medium">Búsquedas activas</th>
                <th className="px-4 py-3 font-medium">Solicitudes abiertas</th>
                <th className="px-4 py-3 font-medium">Cliente desde</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {lista.map((empresa) => (
                <tr key={empresa.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/staff/empresas/${empresa.id}`}
                      className="font-medium text-slate-900 hover:text-marca-700"
                    >
                      {empresa.razonSocial}
                    </Link>
                    <p className="text-xs text-slate-500">{empresa.sector}</p>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-600">{empresa.rut}</td>
                  <td className="px-4 py-3 text-slate-600">{busquedasPorEmpresa.get(empresa.id) ?? 0}</td>
                  <td className="px-4 py-3 text-slate-600">{solicitudesPorEmpresa.get(empresa.id) ?? 0}</td>
                  <td className="px-4 py-3 text-slate-500">{formatFecha(empresa.creadoEn)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
