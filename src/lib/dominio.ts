export const APP_NAME = "Integral RH";

export const ROLES = ["empresa", "candidato", "staff"] as const;
export type Rol = (typeof ROLES)[number];

export const ESPECIALIDADES = [
  "rrhh",
  "legal",
  "contabilidad",
  "coaching",
  "psicologia",
  "medicina",
] as const;
export type Especialidad = (typeof ESPECIALIDADES)[number];
export const ESPECIALIDAD_LABEL: Record<Especialidad, string> = {
  rrhh: "Recursos humanos",
  legal: "Legal y escribanía",
  contabilidad: "Contabilidad",
  coaching: "Coaching",
  psicologia: "Psicología",
  medicina: "Medicina laboral",
};

export const TIPOS_SOLICITUD = [
  "seleccion",
  "administracion_personal",
  "legal",
  "contabilidad",
  "coaching",
  "psicologia",
  "medicina",
] as const;
export type TipoSolicitud = (typeof TIPOS_SOLICITUD)[number];
export const TIPO_SOLICITUD_LABEL: Record<TipoSolicitud, string> = {
  seleccion: "Selección de personal",
  administracion_personal: "Administración de personal",
  legal: "Consultoría legal",
  contabilidad: "Contabilidad y finanzas",
  coaching: "Coaching empresarial",
  psicologia: "Psicología organizacional",
  medicina: "Medicina laboral",
};
export const ESPECIALIDAD_POR_TIPO: Record<TipoSolicitud, Especialidad> = {
  seleccion: "rrhh",
  administracion_personal: "rrhh",
  legal: "legal",
  contabilidad: "contabilidad",
  coaching: "coaching",
  psicologia: "psicologia",
  medicina: "medicina",
};

export const ESTADOS_SOLICITUD = ["nueva", "en_curso", "resuelta", "cancelada"] as const;
export type EstadoSolicitud = (typeof ESTADOS_SOLICITUD)[number];
export const ESTADO_SOLICITUD_LABEL: Record<EstadoSolicitud, string> = {
  nueva: "Nueva",
  en_curso: "En curso",
  resuelta: "Resuelta",
  cancelada: "Cancelada",
};

export const ESTADOS_PROCESO = ["borrador", "publicado", "cerrado"] as const;
export type EstadoProceso = (typeof ESTADOS_PROCESO)[number];
export const ESTADO_PROCESO_LABEL: Record<EstadoProceso, string> = {
  borrador: "Borrador",
  publicado: "Publicado",
  cerrado: "Cerrado",
};

export const MODALIDADES = ["presencial", "remoto", "hibrido"] as const;
export type Modalidad = (typeof MODALIDADES)[number];
export const MODALIDAD_LABEL: Record<Modalidad, string> = {
  presencial: "Presencial",
  remoto: "Remoto",
  hibrido: "Híbrido",
};

export const ETAPAS = [
  "postulado",
  "preseleccionado",
  "evaluacion",
  "entrevista",
  "presentado",
  "contratado",
  "descartado",
] as const;
export type Etapa = (typeof ETAPAS)[number];
export const ETAPA_LABEL: Record<Etapa, string> = {
  postulado: "Postulado",
  preseleccionado: "Preseleccionado",
  evaluacion: "Evaluación",
  entrevista: "Entrevista RH",
  presentado: "Presentado a la empresa",
  contratado: "Contratado",
  descartado: "Descartado",
};
export const ETAPA_CANDIDATO_LABEL: Record<Etapa, string> = {
  postulado: "Postulación recibida",
  preseleccionado: "En revisión",
  evaluacion: "En evaluación",
  entrevista: "Entrevista",
  presentado: "Etapa final",
  contratado: "Seleccionado/a",
  descartado: "Proceso finalizado",
};

export const FEEDBACKS_EMPRESA = ["interesa", "no_interesa"] as const;
export type FeedbackEmpresa = (typeof FEEDBACKS_EMPRESA)[number];
export const FEEDBACK_EMPRESA_LABEL: Record<FeedbackEmpresa, string> = {
  interesa: "Le interesa",
  no_interesa: "No avanzar",
};

export const TIPOS_EVALUACION = ["disc", "inteligencia"] as const;
export type TipoEvaluacion = (typeof TIPOS_EVALUACION)[number];
export const TIPO_EVALUACION_LABEL: Record<TipoEvaluacion, string> = {
  disc: "Test DISC",
  inteligencia: "Test de razonamiento",
};

export const ESTADOS_EVALUACION = ["pendiente", "completada"] as const;
export type EstadoEvaluacion = (typeof ESTADOS_EVALUACION)[number];

export const DISPONIBILIDADES = ["inmediata", "30_dias", "60_dias", "no_disponible"] as const;
export type Disponibilidad = (typeof DISPONIBILIDADES)[number];
export const DISPONIBILIDAD_LABEL: Record<Disponibilidad, string> = {
  inmediata: "Inmediata",
  "30_dias": "En 30 días",
  "60_dias": "En 60 días",
  no_disponible: "No disponible",
};

export const TIPOS_CITA = ["entrevista", "examen_medico", "sesion", "reunion"] as const;
export type TipoCita = (typeof TIPOS_CITA)[number];
export const TIPO_CITA_LABEL: Record<TipoCita, string> = {
  entrevista: "Entrevista",
  examen_medico: "Examen médico",
  sesion: "Sesión",
  reunion: "Reunión",
};

export const SERVICIOS: {
  tipo: TipoSolicitud;
  sigla: string;
  titulo: string;
  items: string[];
}[] = [
  {
    tipo: "seleccion",
    sigla: "SP",
    titulo: "Selección y administración de personal",
    items: [
      "Procesos de selección personalizados",
      "Administración de nóminas y contratos",
      "Evaluaciones psicotécnicas, test de inteligencia y DISC",
    ],
  },
  {
    tipo: "legal",
    sigla: "CL",
    titulo: "Consultoría legal",
    items: [
      "Asesoría legal laboral para empresas",
      "Servicios de escribanía",
      "Cumplimiento regulatorio y gestión de conflictos laborales",
    ],
  },
  {
    tipo: "contabilidad",
    sigla: "CF",
    titulo: "Contabilidad y finanzas",
    items: [
      "Servicios de contaduría pública",
      "Gestión de impuestos y auditoría financiera",
      "Consultoría financiera para decisiones estratégicas",
    ],
  },
  {
    tipo: "coaching",
    sigla: "CE",
    titulo: "Coaching empresarial",
    items: [
      "Programas de coaching para líderes y equipos",
      "Talleres de habilidades blandas y liderazgo",
      "Mentoría para el crecimiento personal y profesional",
    ],
  },
  {
    tipo: "psicologia",
    sigla: "PO",
    titulo: "Psicología organizacional",
    items: [
      "Evaluación del clima laboral",
      "Programas de bienestar emocional y manejo del estrés",
      "Mejora de la comunicación interna",
    ],
  },
  {
    tipo: "medicina",
    sigla: "ML",
    titulo: "Medicina laboral",
    items: [
      "Exámenes médicos ocupacionales",
      "Prevención de riesgos laborales",
      "Consultas de salud mental y bienestar",
    ],
  },
];
