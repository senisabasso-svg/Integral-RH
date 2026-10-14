"use client";

import { useActionState, useState } from "react";
import { AvisoFormulario, BotonEnviar } from "@/components/formulario";
import { Campo, Input, Select, Textarea } from "@/components/ui";
import { crearSolicitud } from "@/lib/acciones/solicitudes";
import { SERVICIOS, TIPO_SOLICITUD_LABEL, TIPOS_SOLICITUD, type TipoSolicitud } from "@/lib/dominio";

const AYUDA: Partial<Record<TipoSolicitud, string[]>> = {
  ...Object.fromEntries(SERVICIOS.map((s) => [s.tipo, s.items])),
  seleccion: ["Búsqueda y selección de personal", "Evaluaciones psicotécnicas, test de inteligencia y DISC", "Informe de cada candidato presentado"],
  administracion_personal: ["Administración de nóminas", "Contratos de trabajo", "Altas, bajas y documentación laboral"],
};

export function FormSolicitud({ tipoInicial }: { tipoInicial?: TipoSolicitud }) {
  const [estado, accion] = useActionState(crearSolicitud, undefined);
  const [tipo, setTipo] = useState<string>(estado?.valores?.tipo ?? tipoInicial ?? "");
  const e = estado?.errores;
  const ayuda = AYUDA[tipo as TipoSolicitud];

  return (
    <form action={accion} className="space-y-4">
      <Campo etiqueta="Servicio" error={e?.tipo}>
        <Select name="tipo" required value={tipo} onChange={(evento) => setTipo(evento.target.value)}>
          <option value="" disabled>
            Elegí un servicio
          </option>
          {TIPOS_SOLICITUD.map((t) => (
            <option key={t} value={t}>
              {TIPO_SOLICITUD_LABEL[t]}
            </option>
          ))}
        </Select>
      </Campo>
      {ayuda && (
        <ul className="rounded-lg bg-marca-50 px-4 py-3 text-sm text-marca-800">
          {ayuda.map((item) => (
            <li key={item}>· {item}</li>
          ))}
        </ul>
      )}
      <Campo etiqueta="Asunto" error={e?.asunto}>
        <Input
          name="asunto"
          required
          maxLength={150}
          placeholder={tipo === "seleccion" ? "Ej.: búsqueda de un analista contable" : "Resumí tu consulta en una línea"}
          defaultValue={estado?.valores?.asunto}
        />
      </Campo>
      <Campo
        etiqueta="Detalle"
        error={e?.descripcion}
        ayuda={tipo === "seleccion" ? "Contanos el puesto, las tareas, los requisitos y la zona de trabajo." : undefined}
      >
        <Textarea name="descripcion" rows={6} required defaultValue={estado?.valores?.descripcion} />
      </Campo>
      <AvisoFormulario estado={estado} />
      <BotonEnviar textoPendiente="Enviando…">Enviar solicitud</BotonEnviar>
    </form>
  );
}
