"use client";

import { useActionState } from "react";
import { AvisoFormulario, BotonEnviar } from "@/components/formulario";
import { Campo, Input } from "@/components/ui";
import { registrarCandidato } from "@/lib/acciones/auth";

export function FormRegistroCandidato({ next }: { next?: string }) {
  const [estado, accion] = useActionState(registrarCandidato, undefined);
  const v = estado?.valores;
  const e = estado?.errores;
  return (
    <form action={accion} className="mt-6 space-y-4">
      {next && <input type="hidden" name="next" value={next} />}
      <Campo etiqueta="Nombre completo" error={e?.nombre}>
        <Input name="nombre" autoComplete="name" required defaultValue={v?.nombre} />
      </Campo>
      <Campo etiqueta="Email" error={e?.email}>
        <Input name="email" type="email" autoComplete="email" required defaultValue={v?.email} />
      </Campo>
      <div className="grid gap-4 sm:grid-cols-2">
        <Campo etiqueta="Teléfono" error={e?.telefono}>
          <Input name="telefono" type="tel" autoComplete="tel" defaultValue={v?.telefono} />
        </Campo>
        <Campo etiqueta="Ciudad" error={e?.ciudad}>
          <Input name="ciudad" defaultValue={v?.ciudad} />
        </Campo>
      </div>
      <Campo etiqueta="Contraseña" error={e?.password} ayuda="Mínimo 8 caracteres.">
        <Input name="password" type="password" autoComplete="new-password" required />
      </Campo>
      <AvisoFormulario estado={estado} />
      <BotonEnviar className="w-full" textoPendiente="Creando cuenta…">
        Crear mi perfil
      </BotonEnviar>
    </form>
  );
}
