import { asc, eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ListaCitas } from "@/components/citas";
import { EtiquetaSolicitud } from "@/components/etiquetas";
import { BotonEnviar } from "@/components/formulario";
import { HiloMensajes } from "@/components/mensajes";
import { BotonLink, EncabezadoPagina, Select, Tarjeta } from "@/components/ui";
import { db } from "@/db";
import { citas, empresas, procesos, solicitudes } from "@/db/schema";
import { asignarSolicitud, cambiarEstadoSolicitud } from "@/lib/acciones/solicitudes";
import { requireRol } from "@/lib/auth";
import { opcionesStaff } from "@/lib/consultas";
import {
  ESPECIALIDAD_LABEL,
  ESPECIALIDAD_POR_TIPO,
  ESTADO_SOLICITUD_LABEL,
  ESTADOS_SOLICITUD,
  TIPO_SOLICITUD_LABEL,
} from "@/lib/dominio";
import { formatFecha } from "@/lib/utils";

export const metadata = { title: "Solicitud" };

export default async function SolicitudStaffPage({ params }: { params: Promise<{ id: string }> }) {
  const usuario = await requireRol("staff");
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();

  const [solicitud] = await db
    .select({
      id: solicitudes.id,
      asunto: solicitudes.asunto,
      descripcion: solicitudes.descripcion,
      tipo: solicitudes.tipo,
      estado: solicitudes.estado,
      responsableId: solicitudes.responsableId,
      procesoId: solicitudes.procesoId,
      creadoEn: solicitudes.creadoEn,
      empresaId: empresas.id,
      empresa: empresas.razonSocial,
      sector: empresas.sector,
      procesoTitulo: procesos.titulo,
    })
    .from(solicitudes)
    .innerJoin(empresas, eq(solicitudes.empresaId, empresas.id))
    .leftJoin(procesos, eq(solicitudes.procesoId, procesos.id))
    .where(eq(solicitudes.id, id));
  if (!solicitud) notFound();

  const especialidadSugerida = ESPECIALIDAD_POR_TIPO[solicitud.tipo];
  const staff = (await opcionesStaff()).sort(
    (a, b) => Number(b.especialidad === especialidadSugerida) - Number(a.especialidad === especialidadSugerida),
  );
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
        descripcion={`${TIPO_SOLICITUD_LABEL[solicitud.tipo]} · ${solicitud.empresa} · creada el ${formatFecha(solicitud.creadoEn)}`}
        volver={{ href: "/staff/solicitudes", texto: "Solicitudes" }}
        acciones={
          <>
            <BotonLink
              href={`/staff/agenda/nueva?solicitud=${solicitud.id}&empresa=${solicitud.empresaId}`}
              variante="secundario"
            >
              Agendar cita
            </BotonLink>
            {solicitud.tipo === "seleccion" && !solicitud.procesoId && (
              <BotonLink href={`/staff/procesos/nuevo?solicitud=${solicitud.id}`}>
                Crear proceso de selección
              </BotonLink>
            )}
          </>
        }
      />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Tarjeta titulo="Pedido de la empresa">
            <p className="text-sm whitespace-pre-line text-slate-700">{solicitud.descripcion}</p>
          </Tarjeta>
          <Tarjeta titulo="Conversación con la empresa">
            <HiloMensajes
              solicitudId={solicitud.id}
              usuarioId={usuario.id}
              cerrada={solicitud.estado === "resuelta" || solicitud.estado === "cancelada"}
            />
          </Tarjeta>
        </div>
        <div className="space-y-6">
          <Tarjeta titulo="Gestión">
            <div className="mb-4">
              <EtiquetaSolicitud estado={solicitud.estado} />
            </div>
            <form action={asignarSolicitud} className="space-y-2">
              <input type="hidden" name="id" value={solicitud.id} />
              <p className="text-xs font-medium text-slate-500">
                Responsable (sugerido: {ESPECIALIDAD_LABEL[especialidadSugerida].toLowerCase()})
              </p>
              <Select name="responsableId" defaultValue={solicitud.responsableId ?? ""}>
                <option value="">Sin asignar</option>
                {staff.map((persona) => (
                  <option key={persona.id} value={persona.id}>
                    {persona.nombre}
                    {persona.especialidad && ` · ${ESPECIALIDAD_LABEL[persona.especialidad]}`}
                  </option>
                ))}
              </Select>
              <BotonEnviar variante="secundario" tamano="sm" textoPendiente="Guardando…">
                Asignar
              </BotonEnviar>
            </form>
            <form action={cambiarEstadoSolicitud} className="mt-4 space-y-2 border-t border-slate-100 pt-4">
              <input type="hidden" name="id" value={solicitud.id} />
              <p className="text-xs font-medium text-slate-500">Estado</p>
              <Select name="estado" defaultValue={solicitud.estado}>
                {ESTADOS_SOLICITUD.map((e) => (
                  <option key={e} value={e}>
                    {ESTADO_SOLICITUD_LABEL[e]}
                  </option>
                ))}
              </Select>
              <BotonEnviar variante="secundario" tamano="sm" textoPendiente="Guardando…">
                Cambiar estado
              </BotonEnviar>
            </form>
          </Tarjeta>
          <Tarjeta titulo="Empresa">
            <p className="text-sm font-medium text-slate-900">{solicitud.empresa}</p>
            <p className="text-xs text-slate-500">{solicitud.sector}</p>
            <Link
              href={`/staff/empresas/${solicitud.empresaId}`}
              className="mt-3 inline-block text-sm text-marca-600 hover:underline"
            >
              Ver ficha de la empresa
            </Link>
            {solicitud.procesoId && (
              <Link
                href={`/staff/procesos/${solicitud.procesoId}`}
                className="mt-2 block text-sm text-marca-600 hover:underline"
              >
                Proceso: {solicitud.procesoTitulo}
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
