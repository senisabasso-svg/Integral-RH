"use client";

import { useActionState } from "react";
import { AvisoFormulario, BotonEnviar } from "@/components/formulario";
import { Campo, Input, Select, Textarea } from "@/components/ui";
import { guardarProceso } from "@/lib/acciones/procesos";
import { ESTADO_PROCESO_LABEL, ESTADOS_PROCESO, MODALIDAD_LABEL, MODALIDADES } from "@/lib/dominio";

type Opcion = { id: number; nombre: string };

export type ValoresProceso = {
  id?: number;
  empresaId?: number;
  responsableId?: number | null;
  titulo?: string;
  descripcion?: string;
  requisitos?: string;
  modalidad?: string;
  ubicacion?: string;
  vacantes?: number;
  estado?: string;
  mostrarEmpresa?: boolean;
};

export function FormProceso({
  empresas,
  staff,
  inicial = {},
  solicitudId,
}: {
  empresas: Opcion[];
  staff: Opcion[];
  inicial?: ValoresProceso;
  solicitudId?: number;
}) {
  const [estado, accion] = useActionState(guardarProceso, undefined);
  const e = estado?.errores;
  const v = (campo: keyof ValoresProceso) =>
    estado?.valores?.[campo] ?? (inicial[campo] === undefined || inicial[campo] === null ? "" : String(inicial[campo]));

  return (
    <form action={accion} className="space-y-4">
      {inicial.id && <input type="hidden" name="id" value={inicial.id} />}
      {solicitudId && <input type="hidden" name="solicitudId" value={solicitudId} />}
      <div className="grid gap-4 sm:grid-cols-2">
        <Campo etiqueta="Empresa cliente" error={e?.empresaId}>
          <Select name="empresaId" defaultValue={v("empresaId")} required>
            <option value="">Elegí una empresa</option>
            {empresas.map((empresa) => (
              <option key={empresa.id} value={empresa.id}>
                {empresa.nombre}
              </option>
            ))}
          </Select>
        </Campo>
        <Campo etiqueta="Responsable" error={e?.responsableId}>
          <Select name="responsableId" defaultValue={v("responsableId")}>
            <option value="">Yo</option>
            {staff.map((persona) => (
              <option key={persona.id} value={persona.id}>
                {persona.nombre}
              </option>
            ))}
          </Select>
        </Campo>
        <Campo etiqueta="Puesto" error={e?.titulo} className="sm:col-span-2">
          <Input name="titulo" required defaultValue={v("titulo")} />
        </Campo>
      </div>
      <Campo etiqueta="Descripción del puesto" error={e?.descripcion}>
        <Textarea name="descripcion" rows={4} required defaultValue={v("descripcion")} />
      </Campo>
      <Campo etiqueta="Requisitos" error={e?.requisitos} ayuda="Uno por línea.">
        <Textarea name="requisitos" rows={4} defaultValue={v("requisitos")} />
      </Campo>
      <div className="grid gap-4 sm:grid-cols-4">
        <Campo etiqueta="Modalidad" error={e?.modalidad}>
          <Select name="modalidad" defaultValue={v("modalidad") || "presencial"}>
            {MODALIDADES.map((m) => (
              <option key={m} value={m}>
                {MODALIDAD_LABEL[m]}
              </option>
            ))}
          </Select>
        </Campo>
        <Campo etiqueta="Ubicación" error={e?.ubicacion}>
          <Input name="ubicacion" required defaultValue={v("ubicacion")} />
        </Campo>
        <Campo etiqueta="Vacantes" error={e?.vacantes}>
          <Input name="vacantes" type="number" min={1} defaultValue={v("vacantes") || "1"} />
        </Campo>
        <Campo etiqueta="Estado" error={e?.estado}>
          <Select name="estado" defaultValue={v("estado") || "borrador"}>
            {ESTADOS_PROCESO.map((est) => (
              <option key={est} value={est}>
                {ESTADO_PROCESO_LABEL[est]}
              </option>
            ))}
          </Select>
        </Campo>
      </div>
      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          name="mostrarEmpresa"
          defaultChecked={estado?.valores ? estado.valores.mostrarEmpresa === "on" : Boolean(inicial.mostrarEmpresa)}
          className="h-4 w-4 rounded border-slate-300"
        />
        Mostrar el nombre de la empresa en el aviso público
      </label>
      <AvisoFormulario estado={estado} />
      <BotonEnviar>{inicial.id ? "Guardar cambios" : "Crear proceso"}</BotonEnviar>
    </form>
  );
}
