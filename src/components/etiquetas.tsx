import { Etiqueta, type Tono } from "@/components/ui";
import {
  ESTADO_PROCESO_LABEL,
  ESTADO_SOLICITUD_LABEL,
  ETAPA_CANDIDATO_LABEL,
  ETAPA_LABEL,
  FEEDBACK_EMPRESA_LABEL,
  type EstadoProceso,
  type EstadoSolicitud,
  type Etapa,
  type FeedbackEmpresa,
} from "@/lib/dominio";

const TONO_ETAPA: Record<Etapa, Tono> = {
  postulado: "gris",
  preseleccionado: "azul",
  evaluacion: "violeta",
  entrevista: "amarillo",
  presentado: "azul",
  contratado: "verde",
  descartado: "rojo",
};

export function EtiquetaEtapa({
  etapa,
  vista = "staff",
}: {
  etapa: Etapa;
  vista?: "staff" | "candidato";
}) {
  if (vista === "candidato") {
    return (
      <Etiqueta tono={etapa === "descartado" ? "gris" : TONO_ETAPA[etapa]}>
        {ETAPA_CANDIDATO_LABEL[etapa]}
      </Etiqueta>
    );
  }
  return <Etiqueta tono={TONO_ETAPA[etapa]}>{ETAPA_LABEL[etapa]}</Etiqueta>;
}

const TONO_PROCESO: Record<EstadoProceso, Tono> = {
  borrador: "amarillo",
  publicado: "verde",
  cerrado: "gris",
};

export function EtiquetaProceso({ estado }: { estado: EstadoProceso }) {
  return <Etiqueta tono={TONO_PROCESO[estado]}>{ESTADO_PROCESO_LABEL[estado]}</Etiqueta>;
}

const TONO_SOLICITUD: Record<EstadoSolicitud, Tono> = {
  nueva: "azul",
  en_curso: "amarillo",
  resuelta: "verde",
  cancelada: "gris",
};

export function EtiquetaSolicitud({ estado }: { estado: EstadoSolicitud }) {
  return <Etiqueta tono={TONO_SOLICITUD[estado]}>{ESTADO_SOLICITUD_LABEL[estado]}</Etiqueta>;
}

export function EtiquetaFeedback({ feedback }: { feedback: FeedbackEmpresa | null }) {
  if (!feedback) return <Etiqueta tono="amarillo">Esperando respuesta</Etiqueta>;
  return (
    <Etiqueta tono={feedback === "interesa" ? "verde" : "rojo"}>
      {FEEDBACK_EMPRESA_LABEL[feedback]}
    </Etiqueta>
  );
}
