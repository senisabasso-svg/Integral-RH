import { and, asc, desc, eq, gte } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ListaCitas } from "@/components/citas";
import { EtiquetaProceso, EtiquetaSolicitud } from "@/components/etiquetas";
import { BotonLink, EncabezadoPagina, Tarjeta } from "@/components/ui";
import { db } from "@/db";
import { citas, empresas, procesos, solicitudes, usuarios } from "@/db/schema";
import { requireRol } from "@/lib/auth";
import { TIPO_SOLICITUD_LABEL } from "@/lib/dominio";
import { formatFecha } from "@/lib/utils";
import { FormContacto } from "./form-contacto";

export const metadata = { title: "Empresa" };

export default async function EmpresaStaffPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRol("staff");
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();

  const [empresa] = await db.select().from(empresas).where(eq(empresas.id, id));
  if (!empresa) notFound();

  const contactos = await db
    .select({ id: usuarios.id, nombre: usuarios.nombre, email: usuarios.email, activo: usuarios.activo })
    .from(usuarios)
    .where(eq(usuarios.empresaId, id))
    .orderBy(asc(usuarios.nombre));
  const susProcesos = await db
    .select({ id: procesos.id, titulo: procesos.titulo, estado: procesos.estado, creadoEn: procesos.creadoEn })
    .from(procesos)
    .where(eq(procesos.empresaId, id))
    .orderBy(desc(procesos.creadoEn));
  const susSolicitudes = await db
    .select({
      id: solicitudes.id,
      asunto: solicitudes.asunto,
      tipo: solicitudes.tipo,
      estado: solicitudes.estado,
      actualizadoEn: solicitudes.actualizadoEn,
    })
    .from(solicitudes)
    .where(eq(solicitudes.empresaId, id))
    .orderBy(desc(solicitudes.actualizadoEn));
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
    .where(and(eq(citas.empresaId, id), gte(citas.inicio, new Date())))
    .orderBy(asc(citas.inicio));

  return (
    <>
      <EncabezadoPagina
        titulo={empresa.razonSocial}
        descripcion={`${empresa.sector} · RUT ${empresa.rut} · cliente desde el ${formatFecha(empresa.creadoEn)}`}
        volver={{ href: "/staff/empresas", texto: "Empresas" }}
        acciones={
          <>
            <BotonLink href={`/staff/agenda/nueva?empresa=${id}`} variante="secundario">
              Agendar cita
            </BotonLink>
            <BotonLink href={`/staff/procesos/nuevo?empresa=${id}`}>Nuevo proceso</BotonLink>
          </>
        }
      />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Tarjeta titulo="Procesos de selección">
            {susProcesos.length === 0 ? (
              <p className="text-sm text-slate-500">Sin procesos.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {susProcesos.map((p) => (
                  <li key={p.id} className="py-3 first:pt-0 last:pb-0">
                    <Link
                      href={`/staff/procesos/${p.id}`}
                      className="flex items-center justify-between gap-3 hover:text-marca-700"
                    >
                      <div>
                        <p className="text-sm font-medium">{p.titulo}</p>
                        <p className="text-xs text-slate-500">Desde el {formatFecha(p.creadoEn)}</p>
                      </div>
                      <EtiquetaProceso estado={p.estado} />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Tarjeta>
          <Tarjeta titulo="Solicitudes de servicio">
            {susSolicitudes.length === 0 ? (
              <p className="text-sm text-slate-500">Sin solicitudes.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {susSolicitudes.map((s) => (
                  <li key={s.id} className="py-3 first:pt-0 last:pb-0">
                    <Link
                      href={`/staff/solicitudes/${s.id}`}
                      className="flex items-center justify-between gap-3 hover:text-marca-700"
                    >
                      <div>
                        <p className="text-sm font-medium">{s.asunto}</p>
                        <p className="text-xs text-slate-500">
                          {TIPO_SOLICITUD_LABEL[s.tipo]} · {formatFecha(s.actualizadoEn)}
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
        <div className="space-y-6">
          <Tarjeta titulo="Datos">
            <dl className="space-y-2 text-sm">
              {[
                ["Teléfono", empresa.telefono],
                ["Dirección", empresa.direccion],
              ].map(([etiqueta, valor]) => (
                <div key={etiqueta} className="flex justify-between gap-3">
                  <dt className="text-slate-500">{etiqueta}</dt>
                  <dd className="text-right text-slate-800">{valor || "—"}</dd>
                </div>
              ))}
            </dl>
          </Tarjeta>
          <Tarjeta titulo="Contactos con acceso al portal">
            <ul className="mb-4 space-y-2 text-sm">
              {contactos.map((c) => (
                <li key={c.id}>
                  <p className="font-medium text-slate-800">{c.nombre}</p>
                  <p className="text-xs text-slate-500">{c.email}</p>
                </li>
              ))}
            </ul>
            <FormContacto empresaId={id} />
          </Tarjeta>
          <Tarjeta titulo="Próximas citas">
            <ListaCitas citas={proximas} />
          </Tarjeta>
        </div>
      </div>
    </>
  );
}
