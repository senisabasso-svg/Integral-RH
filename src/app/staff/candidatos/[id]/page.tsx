import { and, asc, desc, eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ListaCitas } from "@/components/citas";
import { EtiquetaEtapa } from "@/components/etiquetas";
import { BotonEnviar } from "@/components/formulario";
import { BloqueEvaluaciones } from "@/components/resultados";
import { BotonLink, EncabezadoPagina, Tarjeta } from "@/components/ui";
import { db } from "@/db";
import { citas, empresas, perfilesCandidato, postulaciones, procesos, usuarios } from "@/db/schema";
import { asignarEvaluacion } from "@/lib/acciones/evaluaciones";
import { requireRol } from "@/lib/auth";
import { evaluacionesPorCandidato } from "@/lib/consultas";
import { DISPONIBILIDAD_LABEL, TIPO_EVALUACION_LABEL, TIPOS_EVALUACION } from "@/lib/dominio";
import { formatFecha } from "@/lib/utils";

export const metadata = { title: "Candidato" };

export default async function CandidatoStaffPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRol("staff");
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();

  const [candidato] = await db
    .select({ id: usuarios.id, nombre: usuarios.nombre, email: usuarios.email, creadoEn: usuarios.creadoEn })
    .from(usuarios)
    .where(and(eq(usuarios.id, id), eq(usuarios.rol, "candidato")));
  if (!candidato) notFound();

  const [perfil] = await db.select().from(perfilesCandidato).where(eq(perfilesCandidato.usuarioId, id));
  const evaluaciones = (await evaluacionesPorCandidato([id])).get(id);
  const suyas = await db
    .select({
      id: postulaciones.id,
      etapa: postulaciones.etapa,
      creadoEn: postulaciones.creadoEn,
      proceso: procesos.titulo,
      empresa: empresas.razonSocial,
    })
    .from(postulaciones)
    .innerJoin(procesos, eq(postulaciones.procesoId, procesos.id))
    .innerJoin(empresas, eq(procesos.empresaId, empresas.id))
    .where(eq(postulaciones.candidatoId, id))
    .orderBy(desc(postulaciones.creadoEn));
  const susCitas = await db
    .select({
      id: citas.id,
      titulo: citas.titulo,
      tipo: citas.tipo,
      inicio: citas.inicio,
      duracionMin: citas.duracionMin,
      lugar: citas.lugar,
    })
    .from(citas)
    .where(eq(citas.candidatoId, id))
    .orderBy(asc(citas.inicio));

  return (
    <>
      <EncabezadoPagina
        titulo={candidato.nombre}
        descripcion={`${perfil?.profesion ?? "Sin profesión"} · en la base desde el ${formatFecha(candidato.creadoEn)}`}
        volver={{ href: "/staff/candidatos", texto: "Candidatos" }}
        acciones={
          <BotonLink href={`/staff/agenda/nueva?candidato=${id}`} variante="secundario">
            Agendar cita
          </BotonLink>
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
                    <input type="hidden" name="candidatoId" value={id} />
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

          <Tarjeta titulo="Resumen profesional">
            <p className="text-sm whitespace-pre-line text-slate-700">
              {perfil?.resumen || "El candidato todavía no completó su resumen."}
            </p>
          </Tarjeta>

          <Tarjeta titulo="Postulaciones">
            {suyas.length === 0 ? (
              <p className="text-sm text-slate-500">No tiene postulaciones.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {suyas.map((p) => (
                  <li key={p.id} className="py-3 first:pt-0 last:pb-0">
                    <Link
                      href={`/staff/postulaciones/${p.id}`}
                      className="flex items-center justify-between gap-3 hover:text-marca-700"
                    >
                      <div>
                        <p className="text-sm font-medium">{p.proceso}</p>
                        <p className="text-xs text-slate-500">
                          {p.empresa} · {formatFecha(p.creadoEn)}
                        </p>
                      </div>
                      <EtiquetaEtapa etapa={p.etapa} />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Tarjeta>
        </div>

        <div className="space-y-6">
          <Tarjeta titulo="Datos de contacto">
            <dl className="space-y-2 text-sm">
              {[
                ["Email", candidato.email],
                ["Teléfono", perfil?.telefono],
                ["Cédula", perfil?.documento],
                ["Ciudad", perfil?.ciudad],
                ["Nacimiento", perfil?.fechaNacimiento],
                ["Disponibilidad", perfil ? DISPONIBILIDAD_LABEL[perfil.disponibilidad] : null],
              ].map(([etiqueta, valor]) => (
                <div key={etiqueta} className="flex justify-between gap-3">
                  <dt className="text-slate-500">{etiqueta}</dt>
                  <dd className="text-right text-slate-800">{valor || "—"}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-4 flex flex-wrap gap-2">
              {perfil?.cvArchivo ? (
                <BotonLink href={`/api/cv/${id}`} target="_blank" variante="secundario" tamano="sm">
                  Ver CV
                </BotonLink>
              ) : (
                <p className="text-xs text-slate-500">Sin CV cargado.</p>
              )}
              {perfil?.linkedin && (
                <BotonLink href={perfil.linkedin} target="_blank" variante="fantasma" tamano="sm">
                  LinkedIn
                </BotonLink>
              )}
            </div>
          </Tarjeta>
          <Tarjeta titulo="Citas">
            <ListaCitas citas={susCitas} vacio="Sin citas." />
          </Tarjeta>
        </div>
      </div>
    </>
  );
}
