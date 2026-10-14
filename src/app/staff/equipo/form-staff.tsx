"use client";

import { useActionState } from "react";
import { AvisoFormulario, BotonEnviar } from "@/components/formulario";
import { Campo, Input, Select } from "@/components/ui";
import { crearStaff } from "@/lib/acciones/equipo";
import { ESPECIALIDAD_LABEL, ESPECIALIDADES } from "@/lib/dominio";

export function FormStaff() {
  const [estado, accion] = useActionState(crearStaff, undefined);
  const e = estado?.errores;
  const v = estado?.ok ? undefined : estado?.valores;
  return (
    <form action={accion} className="space-y-3">
      <Campo etiqueta="Nombre" error={e?.nombre}>
        <Input name="nombre" required defaultValue={v?.nombre} />
      </Campo>
      <Campo etiqueta="Email" error={e?.email}>
        <Input name="email" type="email" required defaultValue={v?.email} />
      </Campo>
      <Campo etiqueta="Especialidad" error={e?.especialidad}>
        <Select name="especialidad" required defaultValue={v?.especialidad ?? ""}>
          <option value="" disabled>
            Elegí una especialidad
          </option>
          {ESPECIALIDADES.map((especialidad) => (
            <option key={especialidad} value={especialidad}>
              {ESPECIALIDAD_LABEL[especialidad]}
            </option>
          ))}
        </Select>
      </Campo>
      <Campo etiqueta="Contraseña inicial" error={e?.password} ayuda="Mínimo 8 caracteres.">
        <Input name="password" type="text" required autoComplete="off" />
      </Campo>
      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input type="checkbox" name="esAdmin" className="h-4 w-4 rounded border-slate-300" />
        Puede administrar el equipo
      </label>
      <AvisoFormulario estado={estado} />
      <BotonEnviar textoPendiente="Creando…">Crear acceso</BotonEnviar>
    </form>
  );
}
