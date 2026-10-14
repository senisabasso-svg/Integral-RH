import { and, desc, eq, gte } from "drizzle-orm";
import Link from "next/link";
import { ListaCitas } from "@/components/citas";
import { EtiquetaEtapa } from "@/components/etiquetas";
import { Aviso, BotonLink, EncabezadoPagina, Tarjeta } from "@/components/ui";
import { db } from "@/db";
import { citas, evaluaciones, perfilesCandidato, postulaciones, procesos } from "@/db/schema";
import { requireRol } from "@/lib/auth";
import { TIPO_EVALUACION_LABEL } from "@/lib/dominio";
import { cn, formatFecha } from "@/lib/utils";

export const metadata = { title: "Inicio" };

export default async function CandidatoInicioPage() {
  const usuario = await requireRol("candidato");

  const [perfil] = await db
    .select()
    .from(perfilesCandidato)
    .where(eq(perfilesCandidato.usuarioId, usuario.id));

  const pendientes = await db
    .select({ id: evaluaciones.id, tipo: evaluaciones.tipo, iniciadaEn: evaluaciones.iniciadaEn })
    .from(evaluaciones)
    .where(and(eq(evaluaciones.candidatoId, usuario.id), eq(evaluaciones.estado, "pendiente")));

  const misPostulaciones = await db
    .select({
      id: postulaciones.id,
      etapa: postulaciones.etapa,
      creadoEn: postulaciones.creadoEn,
      titulo: procesos.titulo,
    })
    .from(postulaciones)
    .innerJoin(procesos, eq(postulaciones.procesoId, procesos.id))
    .where(eq(postulaciones.candidatoId, usuario.id))
    .orderBy(desc(postulaciones.creadoEn))
    .limit(5);

  const proximas = await db
    .select({
      id: citas.id,
      titulo: citas.titulo,
      tipo: citas.tipo,
      inicio: citas.inicio,
      duracionMin: citas.duracionMin,
      lugar: citas.lugar,
    })
    .from(citas)
    .where(and(eq(citas.candidatoId, usuario.id), gte(citas.inicio, new Date())))
    .orderBy(citas.inicio)
    .limit(5);

  const checklist = [
    {
      texto: "Datos personales",
      ok: Boolean(perfil?.documento && perfil.telefono && perfil.ciudad && perfil.profesion),
    },
    { texto: "Resumen profesional", ok: Boolean(perfil?.resumen) },
    { texto: "CV en PDF", ok: Boolean(perfil?.cvArchivo) },
  ];
  const perfilCompleto = checklist.every((item) => item.ok);

  return (
    <>
      <EncabezadoPagina
        titulo={`Hola, ${usuario.nombre.split(" ")[0]}`}
        descripcion="Seguí tus postulaciones y completá tus evaluaciones."
        acciones={<BotonLink href="/empleos">Buscar empleos</BotonLink>}
      />

      {pendientes.length > 0 && (
        <div className="mb-6">
          <Aviso tono="amarillo">
            Tenés {pendientes.length === 1 ? "una evaluación pendiente" : `${pendientes.length} evaluaciones pendientes`}.
            Completarlas es necesario para avanzar en tus procesos.
          </Aviso>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <Tarjeta titulo="Tu perfil">
          <ul className="space-y-2">
            {checklist.map((item) => (
              <li key={item.texto} className="flex items-center gap-2 text-sm">
                <span
                  className={cn(
                    "flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold",
                    item.ok ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400",
                  )}
                >
                  {item.ok ? "✓" : "·"}
                </span>
                <span className={item.ok ? "text-slate-700" : "text-slate-500"}>{item.texto}</span>
              </li>
            ))}
          </ul>
          {!perfilCompleto && (
            <BotonLink href="/candidato/perfil" variante="secundario" tamano="sm" className="mt-4">
              Completar perfil
            </BotonLink>
          )}
        </Tarjeta>

        <Tarjeta titulo="Evaluaciones pendientes">
          {pendientes.length === 0 ? (
            <p className="text-sm text-slate-500">No tenés evaluaciones pendientes.</p>
          ) : (
            <ul className="space-y-3">
              {pendientes.map((evaluacion) => (
                <li key={evaluacion.id} className="flex items-center justify-between gap-3">
                  <span className="text-sm text-slate-700">{TIPO_EVALUACION_LABEL[evaluacion.tipo]}</span>
                  <BotonLink href={`/candidato/evaluaciones/${evaluacion.id}`} tamano="sm">
                    {evaluacion.iniciadaEn ? "Continuar" : "Comenzar"}
                  </BotonLink>
                </li>
              ))}
            </ul>
          )}
        </Tarjeta>

        <Tarjeta titulo="Próximas citas">
          <ListaCitas citas={proximas} />
        </Tarjeta>

        <Tarjeta
          titulo="Tus postulaciones"
          className="lg:col-span-3"
          acciones={
            <Link href="/candidato/postulaciones" className="text-sm text-marca-600 hover:underline">
              Ver todas
            </Link>
          }
        >
          {misPostulaciones.length === 0 ? (
            <p className="text-sm text-slate-500">
              Todavía no te postulaste a ninguna búsqueda.{" "}
              <Link href="/empleos" className="text-marca-600 hover:underline">
                Ver empleos disponibles
              </Link>
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {misPostulaciones.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{p.titulo}</p>
                    <p className="text-xs text-slate-500">Te postulaste el {formatFecha(p.creadoEn)}</p>
                  </div>
                  <EtiquetaEtapa etapa={p.etapa} vista="candidato" />
                </li>
              ))}
            </ul>
          )}
        </Tarjeta>
      </div>
    </>
  );
}
