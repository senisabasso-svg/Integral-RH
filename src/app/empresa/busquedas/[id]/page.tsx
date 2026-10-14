import { and, desc, eq, isNotNull } from "drizzle-orm";
import { notFound } from "next/navigation";
import { EtiquetaFeedback } from "@/components/etiquetas";
import { BloqueEvaluaciones } from "@/components/resultados";
import { BotonLink, EncabezadoPagina, Tarjeta, Vacio } from "@/components/ui";
import { db } from "@/db";
import { perfilesCandidato, postulaciones, procesos, usuarios } from "@/db/schema";
import { requireEmpresa } from "@/lib/auth";
import { evaluacionesPorCandidato } from "@/lib/consultas";
import { DISPONIBILIDAD_LABEL, MODALIDAD_LABEL } from "@/lib/dominio";
import { formatFecha } from "@/lib/utils";
import { FormFeedback } from "./form-feedback";

export const metadata = { title: "Búsqueda" };

export default async function BusquedaEmpresaPage({ params }: { params: Promise<{ id: string }> }) {
  const usuario = await requireEmpresa();
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();

  const [proceso] = await db
    .select()
    .from(procesos)
    .where(and(eq(procesos.id, id), eq(procesos.empresaId, usuario.empresaId)));
  if (!proceso) notFound();

  const presentados = await db
    .select({
      id: postulaciones.id,
      candidatoId: postulaciones.candidatoId,
      etapa: postulaciones.etapa,
      informeEmpresa: postulaciones.informeEmpresa,
      presentadoEn: postulaciones.presentadoEn,
      feedbackEmpresa: postulaciones.feedbackEmpresa,
      comentarioEmpresa: postulaciones.comentarioEmpresa,
      nombre: usuarios.nombre,
      profesion: perfilesCandidato.profesion,
      ciudad: perfilesCandidato.ciudad,
      disponibilidad: perfilesCandidato.disponibilidad,
      resumen: perfilesCandidato.resumen,
      cvArchivo: perfilesCandidato.cvArchivo,
    })
    .from(postulaciones)
    .innerJoin(usuarios, eq(postulaciones.candidatoId, usuarios.id))
    .leftJoin(perfilesCandidato, eq(perfilesCandidato.usuarioId, usuarios.id))
    .where(and(eq(postulaciones.procesoId, id), isNotNull(postulaciones.presentadoEn)))
    .orderBy(desc(postulaciones.presentadoEn));
  const evaluaciones = await evaluacionesPorCandidato(presentados.map((p) => p.candidatoId));

  return (
    <>
      <EncabezadoPagina
        titulo={proceso.titulo}
        descripcion={`${MODALIDAD_LABEL[proceso.modalidad]} · ${proceso.ubicacion} · ${proceso.vacantes} ${proceso.vacantes === 1 ? "vacante" : "vacantes"}`}
        volver={{ href: "/empresa/busquedas", texto: "Búsquedas" }}
      />

      <h2 className="mb-3 text-sm font-semibold text-slate-700">
        Candidatos presentados ({presentados.length})
      </h2>
      {presentados.length === 0 ? (
        <Vacio titulo="Todavía no hay candidatos presentados.">
          Te avisamos acá apenas tengamos perfiles evaluados para mostrarte.
        </Vacio>
      ) : (
        <div className="space-y-6">
          {presentados.map((p) => (
            <Tarjeta
              key={p.id}
              titulo={
                <span>
                  {p.nombre}
                  <span className="ml-2 font-normal text-slate-500">
                    {p.profesion ?? ""}
                    {p.ciudad && ` · ${p.ciudad}`}
                  </span>
                </span>
              }
              acciones={<EtiquetaFeedback feedback={p.feedbackEmpresa} />}
            >
              <div className="grid gap-6 lg:grid-cols-3">
                <div className="space-y-4 lg:col-span-2">
                  <div>
                    <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">
                      Informe del consultor
                    </p>
                    <p className="mt-1 text-sm whitespace-pre-line text-slate-700">{p.informeEmpresa}</p>
                  </div>
                  {p.resumen && (
                    <div>
                      <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">
                        Resumen del candidato
                      </p>
                      <p className="mt-1 text-sm text-slate-600">{p.resumen}</p>
                    </div>
                  )}
                  <BloqueEvaluaciones evaluaciones={evaluaciones.get(p.candidatoId)} />
                </div>
                <div className="space-y-4">
                  <dl className="space-y-1 text-sm">
                    <div className="flex justify-between gap-3">
                      <dt className="text-slate-500">Presentado</dt>
                      <dd className="text-slate-800">{formatFecha(p.presentadoEn!)}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-slate-500">Disponibilidad</dt>
                      <dd className="text-slate-800">
                        {p.disponibilidad ? DISPONIBILIDAD_LABEL[p.disponibilidad] : "—"}
                      </dd>
                    </div>
                  </dl>
                  {p.cvArchivo && (
                    <BotonLink href={`/api/cv/${p.candidatoId}`} target="_blank" variante="secundario" tamano="sm">
                      Ver CV
                    </BotonLink>
                  )}
                  <FormFeedback
                    id={p.id}
                    feedback={p.feedbackEmpresa}
                    comentario={p.comentarioEmpresa ?? ""}
                  />
                </div>
              </div>
            </Tarjeta>
          ))}
        </div>
      )}
    </>
  );
}
