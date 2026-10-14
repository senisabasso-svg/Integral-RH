import { asc, eq } from "drizzle-orm";
import { BotonEnviar } from "@/components/formulario";
import { EncabezadoPagina, Etiqueta, Tarjeta } from "@/components/ui";
import { db } from "@/db";
import { usuarios } from "@/db/schema";
import { cambiarActivo } from "@/lib/acciones/equipo";
import { requireAdmin } from "@/lib/auth";
import { ESPECIALIDAD_LABEL } from "@/lib/dominio";
import { FormStaff } from "./form-staff";

export const metadata = { title: "Equipo" };

export default async function EquipoPage() {
  const admin = await requireAdmin();
  const equipo = await db
    .select({
      id: usuarios.id,
      nombre: usuarios.nombre,
      email: usuarios.email,
      especialidad: usuarios.especialidad,
      esAdmin: usuarios.esAdmin,
      activo: usuarios.activo,
    })
    .from(usuarios)
    .where(eq(usuarios.rol, "staff"))
    .orderBy(asc(usuarios.nombre));

  return (
    <>
      <EncabezadoPagina
        titulo="Equipo"
        descripcion="Profesionales de Integral RH con acceso al sistema."
      />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm lg:col-span-2">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500 uppercase">
              <tr>
                <th className="px-4 py-3 font-medium">Profesional</th>
                <th className="px-4 py-3 font-medium">Especialidad</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {equipo.map((persona) => (
                <tr key={persona.id}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900">
                      {persona.nombre}
                      {persona.esAdmin && (
                        <span className="ml-2">
                          <Etiqueta tono="violeta">Admin</Etiqueta>
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-slate-500">{persona.email}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {persona.especialidad ? ESPECIALIDAD_LABEL[persona.especialidad] : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <Etiqueta tono={persona.activo ? "verde" : "gris"}>
                      {persona.activo ? "Activo" : "Inactivo"}
                    </Etiqueta>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {persona.id !== admin.id && (
                      <form action={cambiarActivo}>
                        <input type="hidden" name="id" value={persona.id} />
                        <BotonEnviar variante="fantasma" tamano="sm" textoPendiente="…">
                          {persona.activo ? "Desactivar" : "Activar"}
                        </BotonEnviar>
                      </form>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Tarjeta titulo="Agregar profesional">
          <FormStaff />
        </Tarjeta>
      </div>
    </>
  );
}
