"use client";

import { useActionState } from "react";
import { AvisoFormulario, BotonEnviar } from "@/components/formulario";
import { Campo, Input } from "@/components/ui";
import { registrarEmpresa } from "@/lib/acciones/auth";

export function FormRegistroEmpresa() {
  const [estado, accion] = useActionState(registrarEmpresa, undefined);
  const v = estado?.valores;
  const e = estado?.errores;
  return (
    <form action={accion} className="mt-6 space-y-4">
      <Campo etiqueta="Razón social" error={e?.razonSocial}>
        <Input name="razonSocial" autoComplete="organization" required defaultValue={v?.razonSocial} />
      </Campo>
      <div className="grid gap-4 sm:grid-cols-2">
        <Campo etiqueta="RUT" error={e?.rut}>
          <Input name="rut" inputMode="numeric" required defaultValue={v?.rut} />
        </Campo>
        <Campo etiqueta="Sector" error={e?.sector}>
          <Input name="sector" placeholder="Ej.: logística" required defaultValue={v?.sector} />
        </Campo>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Campo etiqueta="Nombre del contacto" error={e?.nombre}>
          <Input name="nombre" autoComplete="name" required defaultValue={v?.nombre} />
        </Campo>
        <Campo etiqueta="Teléfono" error={e?.telefono}>
          <Input name="telefono" type="tel" autoComplete="tel" defaultValue={v?.telefono} />
        </Campo>
      </div>
      <Campo etiqueta="Email" error={e?.email}>
        <Input name="email" type="email" autoComplete="email" required defaultValue={v?.email} />
      </Campo>
      <Campo etiqueta="Contraseña" error={e?.password} ayuda="Mínimo 8 caracteres.">
        <Input name="password" type="password" autoComplete="new-password" required />
      </Campo>
      <AvisoFormulario estado={estado} />
      <BotonEnviar className="w-full" textoPendiente="Creando cuenta…">
        Crear cuenta
      </BotonEnviar>
    </form>
  );
}
