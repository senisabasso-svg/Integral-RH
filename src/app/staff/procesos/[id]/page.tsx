import { and, asc, eq, getTableColumns, notInArray } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EtiquetaFeedback, EtiquetaProceso } from "@/components/etiquetas";
import { BotonEnviar } from "@/components/formulario";
import { ResumenEvaluaciones } from "@/components/resultados";
import { BotonLink, EncabezadoPagina, Select, Tarjeta } from "@/components/ui";
import { db } from "@/db";
import { empresas, perfilesCandidato, postulaciones, procesos, usuarios } from "@/db/schema";
import { agregarCandidato, cambiarEstadoProceso } from "@/lib/acciones/procesos";
import { moverEtapa } from "@/lib/acciones/postulaciones";
import { requireRol } from "@/lib/auth";
import { evaluacionesPorCandidato } from "@/lib/consultas";
import { ETAPA_LABEL, ETAPAS, MODALIDAD_LABEL, type EstadoProceso } from "@/lib/dominio";
import { formatFecha } from "@/lib/utils";

const TRANSICIONES: Record<EstadoProceso, { estado: EstadoProceso; texto: string }> = {
  borrador: { estado: "publicado", texto: "Publicar" },
  publicado: { estado: "cerrado", texto: "Cerrar búsqueda" },
  cerrado: { estado: "publicado", texto: "Reabrir" },
};

export default async function ProcesoPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRol("staff");
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();

  const [proceso] = await db
    .select({
      ...getTableColumns(procesos),
      empresa: empresas.razonSocial,
      responsable: usuarios.nombre,
    })
    .from(procesos)
    .innerJoin(empresas, eq(procesos.empresaId, empresas.id))
    .leftJoin(usuarios, eq(procesos.responsableId, usuarios.id))
    .where(eq(procesos.id, id));
  if (!proceso) notFound();

  const lista = await db
    .select({
      id: postulaciones.id,
      etapa: postulaciones.etapa,
      candidatoId: postulaciones.candidatoId,
      presentadoEn: postulaciones.presentadoEn,
      feedbackEmpresa: postulaciones.feedbackEmpresa,
      nombre: usuarios.nombre,
      profesion: perfilesCandidato.profesion,
      ciudad: perfilesCandidato.ciudad,
    })
    .from(postulaciones)
    .innerJoin(usuarios, eq(postulaciones.candidatoId, usuarios.id))
    .leftJoin(perfilesCandidato, eq(perfilesCandidato.usuarioId, usuarios.id))
    .where(eq(postulaciones.procesoId, id))
    .orderBy(asc(postulaciones.creadoEn));
  const evaluaciones = await evaluacionesPorCandidato(lista.map((p) => p.candidatoId));

  const disponibles = await db
    .select({ id: usuarios.id, nombre: usuarios.nombre })
    .from(usuarios)
    .where(
      and(
        eq(usuarios.rol, "candidato"),
        eq(usuarios.activo, true),
        lista.length > 0 ? notInArray(usuarios.id, lista.map((p) => p.candidatoId)) : undefined,
      ),
    )
    .orderBy(asc(usuarios.nombre));

  const transicion = TRANSICIONES[proceso.estado];
  const columnas = ETAPAS.filter((etapa) => etapa !== "descartado");
  const descartados = lista.filter((p) => p.etapa === "descartado");
  const requisitos = proceso.requisitos.split("\n").map((r) => r.trim()).filter(Boolean);

  return (
    <>
      <EncabezadoPagina
        titulo={proceso.titulo}
        descripcion={`${proceso.empresa} · ${MODALIDAD_LABEL[proceso.modalidad]} · ${proceso.ubicacion} · ${proceso.vacantes} ${proceso.vacantes === 1 ? "vacante" : "vacantes"}`}
        volver={{ href: "/staff/procesos", texto: "Procesos" }}
        acciones={
          <>
            {proceso.estado === "publicado" && (
              <BotonLink href={`/empleos/${proceso.id}`} variante="fantasma" target="_blank">
                Ver aviso
              </BotonLink>
            )}
            <BotonLink
              href={`/staff/agenda/nueva?proceso=${proceso.id}&empresa=${proceso.empresaId}`}
              variante="secundario"
            >
              Agendar cita
            </BotonLink>
            <BotonLink href={`/staff/procesos/${proceso.id}/editar`} variante="secundario">
              Editar
            </BotonLink>
            <form action={cambiarEstadoProceso}>
              <input type="hidden" name="id" value={proceso.id} />
              <input type="hidden" name="estado" value={transicion.estado} />
              <BotonEnviar variante={proceso.estado === "publicado" ? "secundario" : "primario"} textoPendiente="Actualizando…">
                {transicion.texto}
              </BotonEnviar>
            </form>
          </>
        }
      />

      <div className="mb-6 grid gap-6 lg:grid-cols-3">
        <Tarjeta titulo="Detalle de la búsqueda" className="lg:col-span-2">
          <p className="text-sm whitespace-pre-line text-slate-700">{proceso.descripcion}</p>
          {requisitos.length > 0 && (
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-600">
              {requisitos.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          )}
        </Tarjeta>
        <Tarjeta titulo="Resumen">
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-slate-500">Estado</dt>
              <dd>
                <EtiquetaProceso estado={proceso.estado} />
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-slate-500">Responsable</dt>
              <dd className="text-slate-800">{proceso.responsable ?? "Sin asignar"}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-slate-500">Creado</dt>
              <dd className="text-slate-800">{formatFecha(proceso.creadoEn)}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-slate-500">Postulaciones</dt>
              <dd className="text-slate-800">{lista.length}</dd>
            </div>
          </dl>
          {disponibles.length > 0 && (
            <form action={agregarCandidato} className="mt-4 space-y-2 border-t border-slate-100 pt-4">
              <input type="hidden" name="procesoId" value={proceso.id} />
              <p className="text-xs font-medium text-slate-500">Agregar candidato de la base</p>
              <Select name="candidatoId" required defaultValue="">
                <option value="" disabled>
                  Elegí un candidato
                </option>
                {disponibles.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </Select>
              <BotonEnviar variante="secundario" tamano="sm" textoPendiente="Agregando…">
                Agregar al proceso
              </BotonEnviar>
            </form>
          )}
        </Tarjeta>
      </div>

      <h2 className="mb-3 text-sm font-semibold text-slate-700">Pipeline</h2>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columnas.map((etapa) => {
          const enEtapa = lista.filter((p) => p.etapa === etapa);
          return (
            <div key={etapa} className="w-64 shrink-0 rounded-xl bg-slate-100 p-3">
              <p className="mb-3 flex items-center justify-between text-xs font-semibold text-slate-600 uppercase">
                {ETAPA_LABEL[etapa]}
                <span className="rounded-full bg-white px-2 py-0.5 text-slate-500">{enEtapa.length}</span>
              </p>
              <div className="space-y-3">
                {enEtapa.map((p) => (
                  <div key={p.id} className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
                    <Link
                      href={`/staff/postulaciones/${p.id}`}
                      className="text-sm font-medium text-slate-900 hover:text-marca-700"
                    >
                      {p.nombre}
                    </Link>
                    <p className="text-xs text-slate-500">
                      {p.profesion ?? "Sin profesión"}
                      {p.ciudad && ` · ${p.ciudad}`}
                    </p>
                    <div className="mt-2">
                      <ResumenEvaluaciones evaluaciones={evaluaciones.get(p.candidatoId)} />
                    </div>
                    {p.presentadoEn && (
                      <div className="mt-2">
                        <EtiquetaFeedback feedback={p.feedbackEmpresa} />
                      </div>
                    )}
                    <form action={moverEtapa} className="mt-3 flex gap-1">
                      <input type="hidden" name="id" value={p.id} />
                      <Select name="etapa" defaultValue={p.etapa} tamano="sm">
                        {ETAPAS.map((e) => (
                          <option key={e} value={e}>
                            {ETAPA_LABEL[e]}
                          </option>
                        ))}
                      </Select>
                      <BotonEnviar variante="secundario" tamano="sm" textoPendiente="…">
                        Mover
                      </BotonEnviar>
                    </form>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {descartados.length > 0 && (
        <details className="mt-2 rounded-xl border border-slate-200 bg-white p-4">
          <summary className="cursor-pointer text-sm font-medium text-slate-700">
            Descartados ({descartados.length})
          </summary>
          <ul className="mt-3 divide-y divide-slate-100">
            {descartados.map((p) => (
              <li key={p.id} className="flex items-center justify-between py-2 text-sm">
                <Link href={`/staff/postulaciones/${p.id}`} className="hover:text-marca-700">
                  {p.nombre}
                </Link>
                <span className="text-xs text-slate-500">{p.profesion}</span>
              </li>
            ))}
          </ul>
        </details>
      )}
    </>
  );
}
