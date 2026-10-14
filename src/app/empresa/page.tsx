import { and, count, desc, eq, gte, inArray, isNotNull, isNull } from "drizzle-orm";
import Link from "next/link";
import { ListaCitas } from "@/components/citas";
import { EtiquetaSolicitud } from "@/components/etiquetas";
import { BotonLink, EncabezadoPagina, Indicador, Tarjeta } from "@/components/ui";
import { db } from "@/db";
import { citas, postulaciones, procesos, solicitudes, usuarios } from "@/db/schema";
import { requireEmpresa } from "@/lib/auth";
import { TIPO_SOLICITUD_LABEL } from "@/lib/dominio";
import { formatFecha } from "@/lib/utils";

export const metadata = { title: "Inicio" };

export default async function EmpresaInicioPage() {
  const usuario = await requireEmpresa();
  const { empresaId } = usuario;

  const [{ activas }] = await db
    .select({ activas: count() })
    .from(procesos)
    .where(and(eq(procesos.empresaId, empresaId), eq(procesos.estado, "publicado")));

  const esperandoFeedback = await db
    .select({
      id: postulaciones.id,
      procesoId: procesos.id,
      titulo: procesos.titulo,
      candidato: usuarios.nombre,
      presentadoEn: postulaciones.presentadoEn,
    })
    .from(postulaciones)
    .innerJoin(procesos, eq(postulaciones.procesoId, procesos.id))
    .innerJoin(usuarios, eq(postulaciones.candidatoId, usuarios.id))
    .where(
      and(
        eq(procesos.empresaId, empresaId),
        isNotNull(postulaciones.presentadoEn),
        isNull(postulaciones.feedbackEmpresa),
      ),
    )
    .orderBy(desc(postulaciones.presentadoEn));

  const [{ abiertas }] = await db
    .select({ abiertas: count() })
    .from(solicitudes)
    .where(
      and(eq(solicitudes.empresaId, empresaId), inArray(solicitudes.estado, ["nueva", "en_curso"])),
    );

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
    .where(and(eq(citas.empresaId, empresaId), gte(citas.inicio, new Date())))
    .orderBy(citas.inicio)
    .limit(5);

  const recientes = await db
    .select({
      id: solicitudes.id,
      asunto: solicitudes.asunto,
      tipo: solicitudes.tipo,
      estado: solicitudes.estado,
      actualizadoEn: solicitudes.actualizadoEn,
    })
    .from(solicitudes)
    .where(eq(solicitudes.empresaId, empresaId))
    .orderBy(desc(solicitudes.actualizadoEn))
    .limit(5);

  return (
    <>
      <EncabezadoPagina
        titulo={`Hola, ${usuario.nombre.split(" ")[0]}`}
        descripcion="Resumen de tus búsquedas, solicitudes y agenda."
        acciones={<BotonLink href="/empresa/solicitudes/nueva">Solicitar un servicio</BotonLink>}
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Indicador etiqueta="Búsquedas activas" valor={activas} href="/empresa/busquedas" />
        <Indicador
          etiqueta="Candidatos para revisar"
          valor={esperandoFeedback.length}
          href="/empresa/busquedas"
        />
        <Indicador etiqueta="Solicitudes abiertas" valor={abiertas} href="/empresa/solicitudes" />
        <Indicador etiqueta="Próximas citas" valor={proximas.length} href="/empresa/agenda" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Tarjeta titulo="Candidatos esperando tu respuesta">
          {esperandoFeedback.length === 0 ? (
            <p className="text-sm text-slate-500">No tenés candidatos pendientes de revisar.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {esperandoFeedback.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{p.candidato}</p>
                    <p className="text-xs text-slate-500">
                      {p.titulo} · presentado el {formatFecha(p.presentadoEn!)}
                    </p>
                  </div>
                  <BotonLink href={`/empresa/busquedas/${p.procesoId}`} variante="secundario" tamano="sm">
                    Revisar
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
          titulo="Solicitudes recientes"
          className="lg:col-span-2"
          acciones={
            <Link href="/empresa/solicitudes" className="text-sm text-marca-600 hover:underline">
              Ver todas
            </Link>
          }
        >
          {recientes.length === 0 ? (
            <p className="text-sm text-slate-500">Todavía no hiciste solicitudes.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {recientes.map((s) => (
                <li key={s.id} className="py-3 first:pt-0 last:pb-0">
                  <Link
                    href={`/empresa/solicitudes/${s.id}`}
                    className="flex items-center justify-between gap-3 hover:text-marca-700"
                  >
                    <div>
                      <p className="text-sm font-medium">{s.asunto}</p>
                      <p className="text-xs text-slate-500">
                        {TIPO_SOLICITUD_LABEL[s.tipo]} · actualizada el {formatFecha(s.actualizadoEn)}
                      </p>
                    </div>
                    <EtiquetaSolicitud estado={s.estado} />
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
