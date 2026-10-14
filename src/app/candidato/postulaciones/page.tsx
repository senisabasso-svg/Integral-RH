import { desc, eq } from "drizzle-orm";
import Link from "next/link";
import { EtiquetaEtapa } from "@/components/etiquetas";
import { Aviso, BotonLink, EncabezadoPagina, Vacio } from "@/components/ui";
import { db } from "@/db";
import { empresas, postulaciones, procesos } from "@/db/schema";
import { requireRol } from "@/lib/auth";
import { empresaVisible, MODALIDAD_LABEL } from "@/lib/dominio";
import { formatFecha } from "@/lib/utils";

export const metadata = { title: "Postulaciones" };

export default async function PostulacionesCandidatoPage({
  searchParams,
}: {
  searchParams: Promise<{ nueva?: string }>;
}) {
  const usuario = await requireRol("candidato");
  const { nueva } = await searchParams;

  const lista = await db
    .select({
      id: postulaciones.id,
      etapa: postulaciones.etapa,
      creadoEn: postulaciones.creadoEn,
      procesoId: procesos.id,
      titulo: procesos.titulo,
      modalidad: procesos.modalidad,
      ubicacion: procesos.ubicacion,
      estadoProceso: procesos.estado,
      mostrarEmpresa: procesos.mostrarEmpresa,
      razonSocial: empresas.razonSocial,
      sector: empresas.sector,
    })
    .from(postulaciones)
    .innerJoin(procesos, eq(postulaciones.procesoId, procesos.id))
    .innerJoin(empresas, eq(procesos.empresaId, empresas.id))
    .where(eq(postulaciones.candidatoId, usuario.id))
    .orderBy(desc(postulaciones.creadoEn));

  return (
    <>
      <EncabezadoPagina
        titulo="Mis postulaciones"
        descripcion="El estado se actualiza a medida que el equipo avanza con cada proceso."
        acciones={<BotonLink href="/empleos">Buscar empleos</BotonLink>}
      />
      {nueva && (
        <div className="mb-6">
          <Aviso tono="verde">
            ¡Listo! Recibimos tu postulación. Si todavía no lo hiciste, completá tu perfil y subí tu CV.
          </Aviso>
        </div>
      )}
      {lista.length === 0 ? (
        <Vacio titulo="Todavía no te postulaste a ninguna búsqueda.">
          <Link href="/empleos" className="text-marca-600 hover:underline">
            Ver empleos disponibles
          </Link>
        </Vacio>
      ) : (
        <ul className="space-y-3">
          {lista.map((p) => (
            <li
              key={p.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div>
                <p className="font-medium text-slate-900">{p.titulo}</p>
                <p className="mt-0.5 text-sm text-slate-500">
                  {empresaVisible(p)} · {MODALIDAD_LABEL[p.modalidad]} · {p.ubicacion}
                </p>
                <p className="mt-1 text-xs text-slate-400">Te postulaste el {formatFecha(p.creadoEn)}</p>
              </div>
              <EtiquetaEtapa
                etapa={p.estadoProceso === "cerrado" && p.etapa !== "contratado" ? "descartado" : p.etapa}
                vista="candidato"
              />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
