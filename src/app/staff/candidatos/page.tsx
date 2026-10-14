import { and, asc, count, eq, like, or } from "drizzle-orm";
import Link from "next/link";
import { ResumenEvaluaciones } from "@/components/resultados";
import { Boton, EncabezadoPagina, Input, Select, Vacio } from "@/components/ui";
import { db } from "@/db";
import { perfilesCandidato, postulaciones, usuarios } from "@/db/schema";
import { requireRol } from "@/lib/auth";
import { evaluacionesPorCandidato } from "@/lib/consultas";
import { DISPONIBILIDAD_LABEL, DISPONIBILIDADES, type Disponibilidad } from "@/lib/dominio";

export const metadata = { title: "Candidatos" };

export default async function CandidatosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; disponibilidad?: string }>;
}) {
  await requireRol("staff");
  const { q = "", disponibilidad } = await searchParams;
  const busqueda = q.trim();
  const filtroDisponibilidad = DISPONIBILIDADES.find((d) => d === disponibilidad) as
    | Disponibilidad
    | undefined;

  const lista = await db
    .select({
      id: usuarios.id,
      nombre: usuarios.nombre,
      email: usuarios.email,
      profesion: perfilesCandidato.profesion,
      ciudad: perfilesCandidato.ciudad,
      disponibilidad: perfilesCandidato.disponibilidad,
      cvArchivo: perfilesCandidato.cvArchivo,
    })
    .from(usuarios)
    .leftJoin(perfilesCandidato, eq(perfilesCandidato.usuarioId, usuarios.id))
    .where(
      and(
        eq(usuarios.rol, "candidato"),
        busqueda
          ? or(
              like(usuarios.nombre, `%${busqueda}%`),
              like(usuarios.email, `%${busqueda}%`),
              like(perfilesCandidato.profesion, `%${busqueda}%`),
              like(perfilesCandidato.ciudad, `%${busqueda}%`),
            )
          : undefined,
        filtroDisponibilidad ? eq(perfilesCandidato.disponibilidad, filtroDisponibilidad) : undefined,
      ),
    )
    .orderBy(asc(usuarios.nombre));

  const evaluaciones = await evaluacionesPorCandidato(lista.map((c) => c.id));
  const conteos = await db
    .select({ candidatoId: postulaciones.candidatoId, total: count() })
    .from(postulaciones)
    .groupBy(postulaciones.candidatoId);
  const postulacionesPorCandidato = new Map(conteos.map((c) => [c.candidatoId, c.total]));

  return (
    <>
      <EncabezadoPagina titulo="Candidatos" descripcion={`${lista.length} perfiles en la base.`} />
      <form className="mb-4 flex flex-wrap gap-2">
        <Input
          name="q"
          defaultValue={busqueda}
          placeholder="Buscar por nombre, email, profesión o ciudad"
          className="max-w-sm"
        />
        <Select name="disponibilidad" defaultValue={filtroDisponibilidad ?? ""} className="max-w-48">
          <option value="">Cualquier disponibilidad</option>
          {DISPONIBILIDADES.map((d) => (
            <option key={d} value={d}>
              {DISPONIBILIDAD_LABEL[d]}
            </option>
          ))}
        </Select>
        <Boton type="submit" variante="secundario">
          Filtrar
        </Boton>
      </form>

      {lista.length === 0 ? (
        <Vacio titulo="No encontramos candidatos con esos filtros." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500 uppercase">
              <tr>
                <th className="px-4 py-3 font-medium">Candidato</th>
                <th className="px-4 py-3 font-medium">Ciudad</th>
                <th className="px-4 py-3 font-medium">Disponibilidad</th>
                <th className="px-4 py-3 font-medium">Evaluaciones</th>
                <th className="px-4 py-3 font-medium">Postulaciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {lista.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link href={`/staff/candidatos/${c.id}`} className="font-medium text-slate-900 hover:text-marca-700">
                      {c.nombre}
                    </Link>
                    <p className="text-xs text-slate-500">
                      {c.profesion ?? "Sin profesión"}
                      {!c.cvArchivo && " · sin CV"}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{c.ciudad ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {c.disponibilidad ? DISPONIBILIDAD_LABEL[c.disponibilidad] : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <ResumenEvaluaciones evaluaciones={evaluaciones.get(c.id)} />
                  </td>
                  <td className="px-4 py-3 text-slate-600">{postulacionesPorCandidato.get(c.id) ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
