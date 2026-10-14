import { desc, eq } from "drizzle-orm";
import Link from "next/link";
import { Etiqueta, Vacio } from "@/components/ui";
import { db } from "@/db";
import { empresas, procesos } from "@/db/schema";
import { empresaVisible, MODALIDAD_LABEL } from "@/lib/dominio";
import { formatFecha } from "@/lib/utils";

export const metadata = { title: "Empleos" };

export default async function EmpleosPage() {
  const busquedas = await db
    .select({
      id: procesos.id,
      titulo: procesos.titulo,
      descripcion: procesos.descripcion,
      modalidad: procesos.modalidad,
      ubicacion: procesos.ubicacion,
      vacantes: procesos.vacantes,
      creadoEn: procesos.creadoEn,
      mostrarEmpresa: procesos.mostrarEmpresa,
      razonSocial: empresas.razonSocial,
      sector: empresas.sector,
    })
    .from(procesos)
    .innerJoin(empresas, eq(procesos.empresaId, empresas.id))
    .where(eq(procesos.estado, "publicado"))
    .orderBy(desc(procesos.creadoEn));

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">Empleos disponibles</h1>
      <p className="mt-2 text-slate-600">
        Búsquedas abiertas gestionadas por nuestro equipo. Postulate con tu perfil y seguí el
        avance desde tu portal.
      </p>
      <div className="mt-8 space-y-4">
        {busquedas.length === 0 ? (
          <Vacio titulo="No hay búsquedas abiertas en este momento.">Volvé a mirar en unos días.</Vacio>
        ) : (
          busquedas.map((busqueda) => (
            <Link
              key={busqueda.id}
              href={`/empleos/${busqueda.id}`}
              className="block rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-colors hover:border-marca-300"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">{busqueda.titulo}</h2>
                  <p className="mt-0.5 text-sm text-slate-500">{empresaVisible(busqueda)}</p>
                </div>
                <div className="flex gap-2">
                  <Etiqueta tono="azul">{MODALIDAD_LABEL[busqueda.modalidad]}</Etiqueta>
                  <Etiqueta>{busqueda.ubicacion}</Etiqueta>
                </div>
              </div>
              <p className="mt-3 line-clamp-2 text-sm text-slate-600">{busqueda.descripcion}</p>
              <p className="mt-3 text-xs text-slate-400">
                Publicada el {formatFecha(busqueda.creadoEn)} · {busqueda.vacantes}{" "}
                {busqueda.vacantes === 1 ? "vacante" : "vacantes"}
              </p>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
