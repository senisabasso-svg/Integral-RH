"use client";

import { useActionState } from "react";
import { AvisoFormulario, BotonEnviar } from "@/components/formulario";
import { Campo, Input } from "@/components/ui";
import { iniciarSesion } from "@/lib/acciones/auth";

export function FormLogin({ next }: { next?: string }) {
  const [estado, accion] = useActionState(iniciarSesion, undefined);
  return (
    <form action={accion} className="mt-6 space-y-4">
      {next && <input type="hidden" name="next" value={next} />}
      <Campo etiqueta="Email" error={estado?.errores?.email}>
        <Input
          name="email"
          type="email"
          autoComplete="email"
          required
          defaultValue={estado?.valores?.email}
        />
      </Campo>
      <Campo etiqueta="Contraseña" error={estado?.errores?.password}>
        <Input name="password" type="password" autoComplete="current-password" required />
      </Campo>
      <AvisoFormulario estado={estado} />
      <BotonEnviar className="w-full" textoPendiente="Ingresando…">
        Ingresar
      </BotonEnviar>
    </form>
  );
}
