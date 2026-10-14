import { and, count, desc, eq, gte, inArray } from "drizzle-orm";
import Link from "next/link";
import { ListaCitas } from "@/components/citas";
import { EtiquetaEtapa, EtiquetaSolicitud } from "@/components/etiquetas";
import { EncabezadoPagina, Indicador, Tarjeta } from "@/components/ui";
import { db } from "@/db";
import { citas, empresas, evaluaciones, postulaciones, procesos, solicitudes, usuarios } from "@/db/schema";
import { requireRol } from "@/lib/auth";
import { TIPO_SOLICITUD_LABEL } from "@/lib/dominio";
import { formatFecha } from "@/lib/utils";

export const metadata = { title: "Inicio" };

export default async function StaffInicioPage() {
  const usuario = await requireRol("staff");

  const [{ nuevas }] = await db
    .select({ nuevas: count() })
    .from(solicitudes)
    .where(eq(solicitudes.estado, "nueva"));
  const [{ publicados }] = await db
    .select({ publicados: count() })
    .from(procesos)
    .where(eq(procesos.estado, "publicado"));
  const [{ sinRevisar }] = await db
    .select({ sinRevisar: count() })
    .from(postulaciones)
    .where(eq(postulaciones.etapa, "postulado"));
  const [{ evaluacionesPendientes }] = await db
    .select({ evaluacionesPendientes: count() })
    .from(evaluaciones)
    .where(eq(evaluaciones.estado, "pendiente"));

  const misSolicitudes = await db
    .select({
      id: solicitudes.id,
      asunto: solicitudes.asunto,
      tipo: solicitudes.tipo,
      estado: solicitudes.estado,
      empresa: empresas.razonSocial,
    })
    .from(solicitudes)
    .innerJoin(empresas, eq(solicitudes.empresaId, empresas.id))
    .where(
      and(eq(solicitudes.responsableId, usuario.id), inArray(solicitudes.estado, ["nueva", "en_curso"])),
    )
    .orderBy(desc(solicitudes.actualizadoEn));

  const misCitas = await db
    .select({
      id: citas.id,
      titulo: citas.titulo,
      tipo: citas.tipo,
      inicio: citas.inicio,
      duracionMin: citas.duracionMin,
      lugar: citas.lugar,
    })
    .from(citas)
    .where(and(eq(citas.staffId, usuario.id), gte(citas.inicio, new Date())))
    .orderBy(citas.inicio)
    .limit(5);

  const recientes = await db
    .select({
      id: postulaciones.id,
      etapa: postulaciones.etapa,
      creadoEn: postulaciones.creadoEn,
      candidato: usuarios.nombre,
      proceso: procesos.titulo,
    })
    .from(postulaciones)
    .innerJoin(usuarios, eq(postulaciones.candidatoId, usuarios.id))
    .innerJoin(procesos, eq(postulaciones.procesoId, procesos.id))
    .orderBy(desc(postulaciones.creadoEn))
    .limit(6);

  return (
    <>
      <EncabezadoPagina
        titulo={`Hola, ${usuario.nombre.split(" ")[0]}`}
        descripcion="Lo que necesita atención hoy."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Indicador etiqueta="Solicitudes nuevas" valor={nuevas} href="/staff/solicitudes?estado=nueva" />
        <Indicador etiqueta="Procesos publicados" valor={publicados} href="/staff/procesos?estado=publicado" />
        <Indicador etiqueta="Postulaciones sin revisar" valor={sinRevisar} href="/staff/procesos" />
        <Indicador etiqueta="Evaluaciones pendientes" valor={evaluacionesPendientes} href="/staff/candidatos" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Tarjeta titulo="Mis solicitudes abiertas">
          {misSolicitudes.length === 0 ? (
            <p className="text-sm text-slate-500">No tenés solicitudes asignadas.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {misSolicitudes.map((s) => (
                <li key={s.id} className="py-3 first:pt-0 last:pb-0">
                  <Link
                    href={`/staff/solicitudes/${s.id}`}
                    className="flex items-center justify-between gap-3 hover:text-marca-700"
                  >
                    <div>
                      <p className="text-sm font-medium">{s.asunto}</p>
                      <p className="text-xs text-slate-500">
                        {s.empresa} · {TIPO_SOLICITUD_LABEL[s.tipo]}
                      </p>
                    </div>
                    <EtiquetaSolicitud estado={s.estado} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Tarjeta>

        <Tarjeta titulo="Mis próximas citas">
          <ListaCitas citas={misCitas} />
        </Tarjeta>

        <Tarjeta titulo="Postulaciones recientes" className="lg:col-span-2">
          {recientes.length === 0 ? (
            <p className="text-sm text-slate-500">Todavía no hay postulaciones.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {recientes.map((p) => (
                <li key={p.id} className="py-3 first:pt-0 last:pb-0">
                  <Link
                    href={`/staff/postulaciones/${p.id}`}
                    className="flex items-center justify-between gap-3 hover:text-marca-700"
                  >
                    <div>
                      <p className="text-sm font-medium">{p.candidato}</p>
                      <p className="text-xs text-slate-500">
                        {p.proceso} · {formatFecha(p.creadoEn)}
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
    </>
  );
}
