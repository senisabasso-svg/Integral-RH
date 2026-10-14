import { count, desc, eq, isNotNull, sql, and } from "drizzle-orm";
import Link from "next/link";
import { BotonLink, EncabezadoPagina, Etiqueta, Vacio, type Tono } from "@/components/ui";
import { db } from "@/db";
import { postulaciones, procesos } from "@/db/schema";
import { requireEmpresa } from "@/lib/auth";
import { MODALIDAD_LABEL, type EstadoProceso } from "@/lib/dominio";
import { formatFecha } from "@/lib/utils";

export const metadata = { title: "Búsquedas" };

const ESTADO_PARA_EMPRESA: Record<EstadoProceso, { texto: string; tono: Tono }> = {
  borrador: { texto: "En preparación", tono: "amarillo" },
  publicado: { texto: "En curso", tono: "verde" },
  cerrado: { texto: "Finalizada", tono: "gris" },
};

export default async function BusquedasEmpresaPage() {
  const usuario = await requireEmpresa();

  const lista = await db
    .select({
      id: procesos.id,
      titulo: procesos.titulo,
      estado: procesos.estado,
      modalidad: procesos.modalidad,
      ubicacion: procesos.ubicacion,
      vacantes: procesos.vacantes,
      creadoEn: procesos.creadoEn,
    })
    .from(procesos)
    .where(eq(procesos.empresaId, usuario.empresaId))
    .orderBy(desc(procesos.creadoEn));

  const conteos = await db
    .select({
      procesoId: postulaciones.procesoId,
      presentados: count(),
      sinRespuesta: sql<number>`sum(case when ${postulaciones.feedbackEmpresa} is null then 1 else 0 end)`,
    })
    .from(postulaciones)
    .innerJoin(procesos, eq(postulaciones.procesoId, procesos.id))
    .where(and(eq(procesos.empresaId, usuario.empresaId), isNotNull(postulaciones.presentadoEn)))
    .groupBy(postulaciones.procesoId);
  const conteoPorProceso = new Map(conteos.map((c) => [c.procesoId, c]));

  return (
    <>
      <EncabezadoPagina
        titulo="Búsquedas de personal"
        descripcion="Seguí cada búsqueda y revisá a los candidatos que te presentamos."
        acciones={
          <BotonLink href="/empresa/solicitudes/nueva?tipo=seleccion">Pedir una nueva búsqueda</BotonLink>
        }
      />
      {lista.length === 0 ? (
        <Vacio titulo="Todavía no tenés búsquedas.">
          Pedí una búsqueda y nuestro equipo arma el proceso de selección.
        </Vacio>
      ) : (
        <ul className="space-y-3">
          {lista.map((b) => {
            const conteo = conteoPorProceso.get(b.id);
            const estado = ESTADO_PARA_EMPRESA[b.estado];
            return (
              <li key={b.id}>
                <Link
                  href={`/empresa/busquedas/${b.id}`}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-marca-300"
                >
                  <div>
                    <p className="font-medium text-slate-900">{b.titulo}</p>
                    <p className="mt-0.5 text-sm text-slate-500">
                      {MODALIDAD_LABEL[b.modalidad]} · {b.ubicacion} · desde el {formatFecha(b.creadoEn)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {conteo && (
                      <span className="text-sm text-slate-600">
                        {conteo.presentados} {conteo.presentados === 1 ? "presentado" : "presentados"}
                        {Number(conteo.sinRespuesta) > 0 && (
                          <span className="ml-1 font-medium text-amber-700">
                            · {conteo.sinRespuesta} para revisar
                          </span>
                        )}
                      </span>
                    )}
                    <Etiqueta tono={estado.tono}>{estado.texto}</Etiqueta>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
