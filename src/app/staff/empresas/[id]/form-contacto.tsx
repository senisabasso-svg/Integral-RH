"use client";

import { useActionState } from "react";
import { AvisoFormulario, BotonEnviar } from "@/components/formulario";
import { Input } from "@/components/ui";
import { agregarContacto } from "@/lib/acciones/empresas";

export function FormContacto({ empresaId }: { empresaId: number }) {
  const [estado, accion] = useActionState(agregarContacto, undefined);
  const e = estado?.errores;
  return (
    <details className="border-t border-slate-100 pt-4">
      <summary className="cursor-pointer text-sm font-medium text-marca-600">Agregar contacto</summary>
      <form action={accion} className="mt-3 space-y-2">
        <input type="hidden" name="empresaId" value={empresaId} />
        <Input name="nombre" placeholder="Nombre" required defaultValue={estado?.valores?.nombre} />
        {e?.nombre && <p className="text-xs text-red-600">{e.nombre}</p>}
        <Input name="email" type="email" placeholder="Email" required defaultValue={estado?.valores?.email} />
        {e?.email && <p className="text-xs text-red-600">{e.email}</p>}
        <Input name="password" type="text" placeholder="Contraseña inicial" required autoComplete="off" />
        {e?.password && <p className="text-xs text-red-600">{e.password}</p>}
        <AvisoFormulario estado={estado?.errores ? undefined : estado} />
        <BotonEnviar variante="secundario" tamano="sm" textoPendiente="Creando…">
          Crear acceso
        </BotonEnviar>
      </form>
    </details>
  );
}
