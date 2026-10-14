"use client";

import { useActionState } from "react";
import { AvisoFormulario, BotonEnviar } from "@/components/formulario";
import { Campo, Textarea } from "@/components/ui";
import { guardarNotas } from "@/lib/acciones/postulaciones";

export function FormNotas({
  id,
  notaInterna,
  informeEmpresa,
}: {
  id: number;
  notaInterna: string;
  informeEmpresa: string;
}) {
  const [estado, accion] = useActionState(guardarNotas, undefined);
  return (
    <form action={accion} className="space-y-4">
      <input type="hidden" name="id" value={id} />
      <Campo etiqueta="Nota interna" ayuda="Solo la ve el equipo de Impulso Humano.">
        <Textarea name="notaInterna" rows={3} defaultValue={estado?.valores?.notaInterna ?? notaInterna} />
      </Campo>
      <Campo
        etiqueta="Informe para la empresa"
        ayuda="Se muestra a la empresa cuando presentás al candidato."
      >
        <Textarea
          name="informeEmpresa"
          rows={5}
          defaultValue={estado?.valores?.informeEmpresa ?? informeEmpresa}
        />
      </Campo>
      <AvisoFormulario estado={estado} />
      <BotonEnviar>Guardar notas</BotonEnviar>
    </form>
  );
}
