"use client";

import { useActionState } from "react";
import { AvisoFormulario, BotonEnviar } from "@/components/formulario";
import { Textarea } from "@/components/ui";
import { enviarMensaje } from "@/lib/acciones/solicitudes";

export function FormMensaje({ solicitudId }: { solicitudId: number }) {
  const [estado, accion] = useActionState(enviarMensaje, undefined);
  return (
    <form action={accion} className="space-y-2 border-t border-slate-100 pt-4">
      <input type="hidden" name="solicitudId" value={solicitudId} />
      <Textarea
        name="texto"
        rows={3}
        required
        placeholder="Escribí tu mensaje…"
        defaultValue={estado?.ok ? "" : estado?.valores?.texto}
      />
      {estado?.errores?.texto && <p className="text-xs text-red-600">{estado.errores.texto}</p>}
      {!estado?.errores && <AvisoFormulario estado={estado} />}
      <BotonEnviar tamano="sm" textoPendiente="Enviando…">
        Enviar mensaje
      </BotonEnviar>
    </form>
  );
}
