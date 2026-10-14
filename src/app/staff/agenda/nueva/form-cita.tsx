"use client";

import { useActionState } from "react";
import { AvisoFormulario, BotonEnviar } from "@/components/formulario";
import { Campo, Input, Select, Textarea } from "@/components/ui";
import { crearCita } from "@/lib/acciones/citas";
import { TIPO_CITA_LABEL, TIPOS_CITA } from "@/lib/dominio";

type Opcion = { id: number; nombre: string };

export function FormCita({
  staff,
  empresas,
  candidatos,
  procesos,
  solicitudes,
  inicial,
}: {
  staff: Opcion[];
  empresas: Opcion[];
  candidatos: Opcion[];
  procesos: Opcion[];
  solicitudes: Opcion[];
  inicial: Record<string, string>;
}) {
  const [estado, accion] = useActionState(crearCita, undefined);
  const e = estado?.errores;
  const v = (campo: string) => estado?.valores?.[campo] ?? inicial[campo] ?? "";

  const selector = (nombre: string, etiqueta: string, opciones: Opcion[], vacio: string) => (
    <Campo etiqueta={etiqueta} error={e?.[nombre]}>
      <Select name={nombre} defaultValue={v(nombre)}>
        <option value="">{vacio}</option>
        {opciones.map((opcion) => (
          <option key={opcion.id} value={opcion.id}>
            {opcion.nombre}
          </option>
        ))}
      </Select>
    </Campo>
  );

  return (
    <form action={accion} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Campo etiqueta="Tipo" error={e?.tipo}>
          <Select name="tipo" defaultValue={v("tipo") || "entrevista"}>
            {TIPOS_CITA.map((tipo) => (
              <option key={tipo} value={tipo}>
                {TIPO_CITA_LABEL[tipo]}
              </option>
            ))}
          </Select>
        </Campo>
        <Campo etiqueta="Título" error={e?.titulo}>
          <Input name="titulo" required placeholder="Ej.: Entrevista RH con…" defaultValue={v("titulo")} />
        </Campo>
        <Campo etiqueta="Fecha y hora" error={e?.inicio}>
          <Input name="inicio" type="datetime-local" required defaultValue={v("inicio")} />
        </Campo>
        <Campo etiqueta="Duración (minutos)" error={e?.duracionMin}>
          <Input name="duracionMin" type="number" min={5} max={600} step={5} defaultValue={v("duracionMin") || "60"} />
        </Campo>
        <Campo etiqueta="Lugar o enlace" error={e?.lugar} className="sm:col-span-2">
          <Input name="lugar" placeholder="Oficina, dirección o enlace de videollamada" defaultValue={v("lugar")} />
        </Campo>
      </div>

      <fieldset className="grid gap-4 rounded-lg border border-slate-200 p-4 sm:grid-cols-2">
        <legend className="px-1 text-xs font-medium text-slate-500">Participantes y vínculos</legend>
        {selector("staffId", "Responsable", staff, "Elegí un responsable")}
        {selector("empresaId", "Empresa", empresas, "Ninguna")}
        {selector("candidatoId", "Candidato", candidatos, "Ninguno")}
        {selector("procesoId", "Proceso de selección", procesos, "Ninguno")}
        {selector("solicitudId", "Solicitud de servicio", solicitudes, "Ninguna")}
      </fieldset>

      <Campo etiqueta="Notas" error={e?.notas} ayuda="Visibles solo para el equipo.">
        <Textarea name="notas" rows={3} defaultValue={v("notas")} />
      </Campo>
      <AvisoFormulario estado={estado} />
      <BotonEnviar textoPendiente="Agendando…">Agendar</BotonEnviar>
    </form>
  );
}
