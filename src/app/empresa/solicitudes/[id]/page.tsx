import { and, asc, eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ListaCitas } from "@/components/citas";
import { EtiquetaSolicitud } from "@/components/etiquetas";
import { HiloMensajes } from "@/components/mensajes";
import { Aviso, EncabezadoPagina, Tarjeta } from "@/components/ui";
import { db } from "@/db";
import { citas, solicitudes, usuarios } from "@/db/schema";
import { requireEmpresa } from "@/lib/auth";
import { ESPECIALIDAD_LABEL, TIPO_SOLICITUD_LABEL } from "@/lib/dominio";
import { formatFecha } from "@/lib/utils";

export const metadata = { title: "Solicitud" };

export default async function SolicitudEmpresaPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ nueva?: string }>;
}) {
  const usuario = await requireEmpresa();
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  const { nueva } = await searchParams;

  const [solicitud] = await db
    .select({
      id: solicitudes.id,
      asunto: solicitudes.asunto,
      descripcion: solicitudes.descripcion,
      tipo: solicitudes.tipo,
      estado: solicitudes.estado,
      procesoId: solicitudes.procesoId,
      creadoEn: solicitudes.creadoEn,
      responsable: usuarios.nombre,
      especialidad: usuarios.especialidad,
    })
    .from(solicitudes)
    .leftJoin(usuarios, eq(solicitudes.responsableId, usuarios.id))
    .where(and(eq(solicitudes.id, id), eq(solicitudes.empresaId, usuario.empresaId)));
  if (!solicitud) notFound();

  const citasVinculadas = await db
    .select({
      id: citas.id,
      titulo: citas.titulo,
      tipo: citas.tipo,
      inicio: citas.inicio,
      duracionMin: citas.duracionMin,
      lugar: citas.lugar,
    })
    .from(citas)
    .where(eq(citas.solicitudId, id))
    .orderBy(asc(citas.inicio));

  return (
    <>
      <EncabezadoPagina
        titulo={solicitud.asunto}
        descripcion={`${TIPO_SOLICITUD_LABEL[solicitud.tipo]} · creada el ${formatFecha(solicitud.creadoEn)}`}
        volver={{ href: "/empresa/solicitudes", texto: "Solicitudes" }}
      />
      {nueva && (
        <div className="mb-6">
          <Aviso tono="verde">
            Recibimos tu solicitud. En breve te asignamos un profesional y te respondemos por acá.
          </Aviso>
        </div>
      )}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Tarjeta titulo="Detalle">
            <p className="text-sm whitespace-pre-line text-slate-700">{solicitud.descripcion}</p>
          </Tarjeta>
          <Tarjeta titulo="Mensajes">
            <HiloMensajes
              solicitudId={solicitud.id}
              usuarioId={usuario.id}
              cerrada={solicitud.estado === "resuelta" || solicitud.estado === "cancelada"}
            />
          </Tarjeta>
        </div>
        <div className="space-y-6">
          <Tarjeta titulo="Estado">
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">Estado</dt>
                <dd>
                  <EtiquetaSolicitud estado={solicitud.estado} />
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">Responsable</dt>
                <dd className="text-right text-slate-800">
                  {solicitud.responsable ?? "Sin asignar todavía"}
                  {solicitud.especialidad && (
                    <span className="block text-xs text-slate-500">
                      {ESPECIALIDAD_LABEL[solicitud.especialidad]}
                    </span>
                  )}
                </dd>
              </div>
            </dl>
            {solicitud.procesoId && (
              <Link
                href={`/empresa/busquedas/${solicitud.procesoId}`}
                className="mt-4 inline-block text-sm font-medium text-marca-600 hover:underline"
              >
                Ver la búsqueda de personal →
              </Link>
            )}
          </Tarjeta>
          <Tarjeta titulo="Citas">
            <ListaCitas citas={citasVinculadas} vacio="Sin citas agendadas." />
          </Tarjeta>
        </div>
      </div>
    </>
  );
}
