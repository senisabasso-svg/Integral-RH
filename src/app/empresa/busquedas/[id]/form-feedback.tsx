"use client";

import { useActionState } from "react";
import { AvisoFormulario, BotonEnviar } from "@/components/formulario";
import { Textarea } from "@/components/ui";
import { darFeedback } from "@/lib/acciones/postulaciones";
import { FEEDBACK_EMPRESA_LABEL, FEEDBACKS_EMPRESA, type FeedbackEmpresa } from "@/lib/dominio";

export function FormFeedback({
  id,
  feedback,
  comentario,
}: {
  id: number;
  feedback: FeedbackEmpresa | null;
  comentario: string;
}) {
  const [estado, accion] = useActionState(darFeedback, undefined);
  const elegido = estado?.valores?.feedback ?? feedback ?? "";

  return (
    <form action={accion} className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
      <input type="hidden" name="id" value={id} />
      <p className="text-sm font-medium text-slate-800">Tu opinión</p>
      <div className="flex flex-wrap gap-4">
        {FEEDBACKS_EMPRESA.map((opcion) => (
          <label key={opcion} className="flex items-center gap-2 text-sm text-slate-700">
            <input type="radio" name="feedback" value={opcion} defaultChecked={elegido === opcion} required />
            {FEEDBACK_EMPRESA_LABEL[opcion]}
          </label>
        ))}
      </div>
      <Textarea
        name="comentario"
        rows={2}
        placeholder="Comentario para el equipo (opcional)"
        defaultValue={estado?.valores?.comentario ?? comentario}
      />
      {estado?.errores?.feedback && <p className="text-xs text-red-600">{estado.errores.feedback}</p>}
      <AvisoFormulario estado={estado?.errores ? { ...estado, error: undefined } : estado} />
      <BotonEnviar tamano="sm" textoPendiente="Enviando…">
        {feedback ? "Actualizar respuesta" : "Enviar respuesta"}
      </BotonEnviar>
    </form>
  );
}
