import { and, asc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { ListaCitas } from "@/components/citas";
import { EtiquetaEtapa, EtiquetaFeedback } from "@/components/etiquetas";
import { BotonEnviar } from "@/components/formulario";
import { BloqueEvaluaciones } from "@/components/resultados";
import { BotonLink, EncabezadoPagina, Select, Tarjeta } from "@/components/ui";
import { db } from "@/db";
import { citas, empresas, perfilesCandidato, postulaciones, procesos, usuarios } from "@/db/schema";
import { asignarEvaluacion } from "@/lib/acciones/evaluaciones";
import { moverEtapa, presentarAEmpresa } from "@/lib/acciones/postulaciones";
import { requireRol } from "@/lib/auth";
import { evaluacionesPorCandidato } from "@/lib/consultas";
import { DISPONIBILIDAD_LABEL, ETAPA_LABEL, ETAPAS, TIPO_EVALUACION_LABEL, TIPOS_EVALUACION } from "@/lib/dominio";
import { formatFecha } from "@/lib/utils";
import { FormNotas } from "./form-notas";

export const metadata = { title: "Postulación" };

export default async function PostulacionPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRol("staff");
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();

  const [p] = await db
    .select({
      id: postulaciones.id,
      etapa: postulaciones.etapa,
      notaInterna: postulaciones.notaInterna,
      informeEmpresa: postulaciones.informeEmpresa,
      presentadoEn: postulaciones.presentadoEn,
      feedbackEmpresa: postulaciones.feedbackEmpresa,
      comentarioEmpresa: postulaciones.comentarioEmpresa,
      creadoEn: postulaciones.creadoEn,
      candidatoId: postulaciones.candidatoId,
      procesoId: procesos.id,
      procesoTitulo: procesos.titulo,
      empresaId: empresas.id,
      empresa: empresas.razonSocial,
      nombre: usuarios.nombre,
      email: usuarios.email,
    })
    .from(postulaciones)
    .innerJoin(procesos, eq(postulaciones.procesoId, procesos.id))
    .innerJoin(empresas, eq(procesos.empresaId, empresas.id))
    .innerJoin(usuarios, eq(postulaciones.candidatoId, usuarios.id))
    .where(eq(postulaciones.id, id));
  if (!p) notFound();

  const [perfil] = await db
    .select()
    .from(perfilesCandidato)
    .where(eq(perfilesCandidato.usuarioId, p.candidatoId));
  const evaluaciones = (await evaluacionesPorCandidato([p.candidatoId])).get(p.candidatoId);
  const citasDelProceso = await db
    .select({
      id: citas.id,
      titulo: citas.titulo,
      tipo: citas.tipo,
      inicio: citas.inicio,
      duracionMin: citas.duracionMin,
      lugar: citas.lugar,
    })
    .from(citas)
    .where(and(eq(citas.candidatoId, p.candidatoId), eq(citas.procesoId, p.procesoId)))
    .orderBy(asc(citas.inicio));

  return (
    <>
      <EncabezadoPagina
        titulo={p.nombre}
        descripcion={`${p.procesoTitulo} · ${p.empresa} · postulado el ${formatFecha(p.creadoEn)}`}
        volver={{ href: `/staff/procesos/${p.procesoId}`, texto: p.procesoTitulo }}
        acciones={
          <>
            <BotonLink href={`/staff/candidatos/${p.candidatoId}`} variante="secundario">
              Perfil completo
            </BotonLink>
            <BotonLink
              href={`/staff/agenda/nueva?proceso=${p.procesoId}&candidato=${p.candidatoId}&empresa=${p.empresaId}`}
              variante="secundario"
            >
              Agendar entrevista
            </BotonLink>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Tarjeta
            titulo="Evaluaciones"
            acciones={
              <div className="flex gap-2">
                {TIPOS_EVALUACION.filter((tipo) => evaluaciones?.[tipo]?.estado !== "pendiente").map((tipo) => (
                  <form key={tipo} action={asignarEvaluacion}>
                    <input type="hidden" name="candidatoId" value={p.candidatoId} />
                    <input type="hidden" name="tipo" value={tipo} />
                    <BotonEnviar variante="secundario" tamano="sm" textoPendiente="Asignando…">
                      {evaluaciones?.[tipo] ? "Repetir" : "Asignar"} {TIPO_EVALUACION_LABEL[tipo]}
                    </BotonEnviar>
                  </form>
                ))}
              </div>
            }
          >
            <BloqueEvaluaciones evaluaciones={evaluaciones} />
          </Tarjeta>

          <Tarjeta titulo="Notas e informe">
            <FormNotas id={p.id} notaInterna={p.notaInterna ?? ""} informeEmpresa={p.informeEmpresa ?? ""} />
          </Tarjeta>
        </div>

        <div className="space-y-6">
          <Tarjeta titulo="Etapa">
            <div className="mb-3">
              <EtiquetaEtapa etapa={p.etapa} />
            </div>
            <form action={moverEtapa} className="flex gap-2">
              <input type="hidden" name="id" value={p.id} />
              <Select name="etapa" defaultValue={p.etapa}>
                {ETAPAS.map((e) => (
                  <option key={e} value={e}>
                    {ETAPA_LABEL[e]}
                  </option>
                ))}
              </Select>
              <BotonEnviar variante="secundario" textoPendiente="…">
                Mover
              </BotonEnviar>
            </form>
          </Tarjeta>

          <Tarjeta titulo="Presentación a la empresa">
            {p.presentadoEn ? (
              <div className="space-y-2 text-sm">
                <p className="text-slate-600">Presentado el {formatFecha(p.presentadoEn)}.</p>
                <EtiquetaFeedback feedback={p.feedbackEmpresa} />
                {p.comentarioEmpresa && (
                  <p className="rounded-lg bg-slate-50 p-3 text-slate-700">«{p.comentarioEmpresa}»</p>
                )}
              </div>
            ) : (
              <form action={presentarAEmpresa} className="space-y-2">
                <input type="hidden" name="id" value={p.id} />
                <p className="text-sm text-slate-600">
                  La empresa verá el perfil, el CV, los resultados de las evaluaciones y el informe.
                </p>
                <BotonEnviar disabled={!p.informeEmpresa?.trim()} textoPendiente="Presentando…">
                  Presentar a {p.empresa}
                </BotonEnviar>
                {!p.informeEmpresa?.trim() && (
                  <p className="text-xs text-amber-700">Primero escribí el informe para la empresa.</p>
                )}
              </form>
            )}
          </Tarjeta>

          <Tarjeta titulo="Datos del candidato">
            <dl className="space-y-2 text-sm">
              <Dato etiqueta="Email" valor={p.email} />
              <Dato etiqueta="Teléfono" valor={perfil?.telefono} />
              <Dato etiqueta="Ciudad" valor={perfil?.ciudad} />
              <Dato etiqueta="Profesión" valor={perfil?.profesion} />
              <Dato
                etiqueta="Disponibilidad"
                valor={perfil ? DISPONIBILIDAD_LABEL[perfil.disponibilidad] : null}
              />
            </dl>
            {perfil?.cvArchivo ? (
              <BotonLink href={`/api/cv/${p.candidatoId}`} target="_blank" variante="secundario" tamano="sm" className="mt-4">
                Ver CV
              </BotonLink>
            ) : (
              <p className="mt-4 text-xs text-slate-500">Sin CV cargado.</p>
            )}
          </Tarjeta>

          <Tarjeta titulo="Citas de este proceso">
            <ListaCitas citas={citasDelProceso} vacio="Sin citas agendadas." />
          </Tarjeta>
        </div>
      </div>
    </>
  );
}

function Dato({ etiqueta, valor }: { etiqueta: string; valor: string | null | undefined }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-slate-500">{etiqueta}</dt>
      <dd className="text-right text-slate-800">{valor || "—"}</dd>
    </div>
  );
}
