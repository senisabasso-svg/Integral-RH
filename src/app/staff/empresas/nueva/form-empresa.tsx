"use client";

import { useActionState } from "react";
import { AvisoFormulario, BotonEnviar } from "@/components/formulario";
import { Campo, Input } from "@/components/ui";
import { crearEmpresa } from "@/lib/acciones/empresas";

export function FormEmpresa() {
  const [estado, accion] = useActionState(crearEmpresa, undefined);
  const v = estado?.valores;
  const e = estado?.errores;
  return (
    <form action={accion} className="space-y-6">
      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold text-slate-900">Datos de la empresa</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo etiqueta="Razón social" error={e?.razonSocial}>
            <Input name="razonSocial" required defaultValue={v?.razonSocial} />
          </Campo>
          <Campo etiqueta="RUT" error={e?.rut}>
            <Input name="rut" inputMode="numeric" required defaultValue={v?.rut} />
          </Campo>
          <Campo etiqueta="Sector" error={e?.sector}>
            <Input name="sector" required defaultValue={v?.sector} />
          </Campo>
          <Campo etiqueta="Teléfono" error={e?.telefono}>
            <Input name="telefono" type="tel" defaultValue={v?.telefono} />
          </Campo>
          <Campo etiqueta="Dirección" error={e?.direccion} className="sm:col-span-2">
            <Input name="direccion" defaultValue={v?.direccion} />
          </Campo>
        </div>
      </fieldset>
      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold text-slate-900">Contacto principal</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo etiqueta="Nombre" error={e?.nombre}>
            <Input name="nombre" required defaultValue={v?.nombre} />
          </Campo>
          <Campo etiqueta="Email" error={e?.email}>
            <Input name="email" type="email" required defaultValue={v?.email} />
          </Campo>
          <Campo
            etiqueta="Contraseña inicial"
            error={e?.password}
            ayuda="Compartila con el contacto para su primer ingreso."
          >
            <Input name="password" type="text" required autoComplete="off" />
          </Campo>
        </div>
      </fieldset>
      <AvisoFormulario estado={estado} />
      <BotonEnviar textoPendiente="Creando…">Crear empresa</BotonEnviar>
    </form>
  );
}
