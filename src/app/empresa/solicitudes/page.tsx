import { desc, eq } from "drizzle-orm";
import Link from "next/link";
import { EtiquetaSolicitud } from "@/components/etiquetas";
import { BotonLink, EncabezadoPagina, Vacio } from "@/components/ui";
import { db } from "@/db";
import { solicitudes, usuarios } from "@/db/schema";
import { requireEmpresa } from "@/lib/auth";
import { TIPO_SOLICITUD_LABEL } from "@/lib/dominio";
import { formatFecha } from "@/lib/utils";

export const metadata = { title: "Solicitudes" };

export default async function SolicitudesEmpresaPage() {
  const usuario = await requireEmpresa();
  const lista = await db
    .select({
      id: solicitudes.id,
      asunto: solicitudes.asunto,
      tipo: solicitudes.tipo,
      estado: solicitudes.estado,
      creadoEn: solicitudes.creadoEn,
      actualizadoEn: solicitudes.actualizadoEn,
      responsable: usuarios.nombre,
    })
    .from(solicitudes)
    .leftJoin(usuarios, eq(solicitudes.responsableId, usuarios.id))
    .where(eq(solicitudes.empresaId, usuario.empresaId))
    .orderBy(desc(solicitudes.actualizadoEn));

  return (
    <>
      <EncabezadoPagina
        titulo="Solicitudes de servicio"
        descripcion="Pedí asesoramiento a cualquiera de nuestras áreas y seguí la respuesta acá."
        acciones={<BotonLink href="/empresa/solicitudes/nueva">Nueva solicitud</BotonLink>}
      />
      {lista.length === 0 ? (
        <Vacio titulo="Todavía no hiciste solicitudes.">
          Selección, legal, contabilidad, coaching, psicología o medicina laboral: contanos qué
          necesitás.
        </Vacio>
      ) : (
        <ul className="space-y-3">
          {lista.map((s) => (
            <li key={s.id}>
              <Link
                href={`/empresa/solicitudes/${s.id}`}
                className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-marca-300"
              >
                <div>
                  <p className="font-medium text-slate-900">{s.asunto}</p>
                  <p className="mt-0.5 text-sm text-slate-500">
                    {TIPO_SOLICITUD_LABEL[s.tipo]} · {s.responsable ?? "Sin asignar todavía"}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Creada el {formatFecha(s.creadoEn)} · última novedad el {formatFecha(s.actualizadoEn)}
                  </p>
                </div>
                <EtiquetaSolicitud estado={s.estado} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
