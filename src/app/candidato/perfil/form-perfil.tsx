"use client";

import { useActionState } from "react";
import { AvisoFormulario, BotonEnviar } from "@/components/formulario";
import { Campo, Input, Select, Textarea } from "@/components/ui";
import type { perfilesCandidato } from "@/db/schema";
import { actualizarPerfil } from "@/lib/acciones/candidato";
import { DISPONIBILIDAD_LABEL, DISPONIBILIDADES } from "@/lib/dominio";

type Perfil = typeof perfilesCandidato.$inferSelect;

export function FormPerfil({ nombre, perfil }: { nombre: string; perfil: Perfil | null }) {
  const [estado, accion] = useActionState(actualizarPerfil, undefined);
  const e = estado?.errores;
  const valor = (campo: keyof Perfil | "nombre") => {
    if (estado?.valores && campo in estado.valores) return estado.valores[campo];
    if (campo === "nombre") return nombre;
    const actual = perfil?.[campo];
    return typeof actual === "string" ? actual : "";
  };

  return (
    <form action={accion} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Campo etiqueta="Nombre completo" error={e?.nombre}>
          <Input name="nombre" required defaultValue={valor("nombre")} />
        </Campo>
        <Campo etiqueta="Profesión u oficio" error={e?.profesion}>
          <Input name="profesion" defaultValue={valor("profesion")} />
        </Campo>
        <Campo etiqueta="Cédula de identidad" error={e?.documento}>
          <Input name="documento" defaultValue={valor("documento")} />
        </Campo>
        <Campo etiqueta="Fecha de nacimiento" error={e?.fechaNacimiento}>
          <Input name="fechaNacimiento" type="date" defaultValue={valor("fechaNacimiento")} />
        </Campo>
        <Campo etiqueta="Teléfono" error={e?.telefono}>
          <Input name="telefono" type="tel" defaultValue={valor("telefono")} />
        </Campo>
        <Campo etiqueta="Ciudad" error={e?.ciudad}>
          <Input name="ciudad" defaultValue={valor("ciudad")} />
        </Campo>
        <Campo etiqueta="Perfil de LinkedIn" error={e?.linkedin}>
          <Input name="linkedin" type="url" placeholder="https://" defaultValue={valor("linkedin")} />
        </Campo>
        <Campo etiqueta="Disponibilidad" error={e?.disponibilidad}>
          <Select name="disponibilidad" defaultValue={valor("disponibilidad") || "inmediata"}>
            {DISPONIBILIDADES.map((d) => (
              <option key={d} value={d}>
                {DISPONIBILIDAD_LABEL[d]}
              </option>
            ))}
          </Select>
        </Campo>
      </div>
      <Campo
        etiqueta="Resumen profesional"
        error={e?.resumen}
        ayuda="Contá brevemente tu experiencia y lo que buscás."
      >
        <Textarea name="resumen" rows={5} defaultValue={valor("resumen")} />
      </Campo>
      <AvisoFormulario estado={estado} />
      <BotonEnviar>Guardar cambios</BotonEnviar>
    </form>
  );
}
