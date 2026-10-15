import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import {
  DISPONIBILIDADES,
  ESPECIALIDADES,
  ESTADOS_EVALUACION,
  ESTADOS_PROCESO,
  ESTADOS_SOLICITUD,
  ETAPAS,
  FEEDBACKS_EMPRESA,
  MODALIDADES,
  ROLES,
  TIPOS_CITA,
  TIPOS_EVALUACION,
  TIPOS_SOLICITUD,
} from "../lib/dominio";
import type { ResultadoEvaluacion } from "../lib/evaluaciones/tipos";

const fecha = (nombre: string) => timestamp(nombre, { withTimezone: true, mode: "date" });
const creadoEn = () =>
  fecha("creado_en")
    .notNull()
    .$defaultFn(() => new Date());
const actualizadoEn = () =>
  fecha("actualizado_en")
    .notNull()
    .$defaultFn(() => new Date());

export const empresas = pgTable("empresas", {
  id: serial("id").primaryKey(),
  razonSocial: text("razon_social").notNull(),
  rut: text("rut").notNull(),
  sector: text("sector").notNull(),
  telefono: text("telefono"),
  direccion: text("direccion"),
  creadoEn: creadoEn(),
});

export const usuarios = pgTable("usuarios", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  nombre: text("nombre").notNull(),
  rol: text("rol", { enum: ROLES }).notNull(),
  especialidad: text("especialidad", { enum: ESPECIALIDADES }),
  esAdmin: boolean("es_admin").notNull().default(false),
  activo: boolean("activo").notNull().default(true),
  empresaId: integer("empresa_id").references(() => empresas.id, { onDelete: "cascade" }),
  creadoEn: creadoEn(),
});

export const sesiones = pgTable("sesiones", {
  id: text("id").primaryKey(),
  usuarioId: integer("usuario_id")
    .notNull()
    .references(() => usuarios.id, { onDelete: "cascade" }),
  expiraEn: fecha("expira_en").notNull(),
});

export const perfilesCandidato = pgTable("perfiles_candidato", {
  usuarioId: integer("usuario_id")
    .primaryKey()
    .references(() => usuarios.id, { onDelete: "cascade" }),
  documento: text("documento"),
  telefono: text("telefono"),
  ciudad: text("ciudad"),
  fechaNacimiento: text("fecha_nacimiento"),
  profesion: text("profesion"),
  resumen: text("resumen"),
  linkedin: text("linkedin"),
  disponibilidad: text("disponibilidad", { enum: DISPONIBILIDADES }).notNull().default("inmediata"),
  cvArchivo: text("cv_archivo"),
  cvNombre: text("cv_nombre"),
  actualizadoEn: actualizadoEn(),
});

export const procesos = pgTable(
  "procesos",
  {
    id: serial("id").primaryKey(),
    empresaId: integer("empresa_id")
      .notNull()
      .references(() => empresas.id, { onDelete: "cascade" }),
    responsableId: integer("responsable_id").references(() => usuarios.id, {
      onDelete: "set null",
    }),
    titulo: text("titulo").notNull(),
    descripcion: text("descripcion").notNull(),
    requisitos: text("requisitos").notNull().default(""),
    modalidad: text("modalidad", { enum: MODALIDADES }).notNull(),
    ubicacion: text("ubicacion").notNull(),
    vacantes: integer("vacantes").notNull().default(1),
    estado: text("estado", { enum: ESTADOS_PROCESO }).notNull().default("borrador"),
    mostrarEmpresa: boolean("mostrar_empresa").notNull().default(false),
    creadoEn: creadoEn(),
  },
  (t) => [index("procesos_empresa_idx").on(t.empresaId)],
);

export const postulaciones = pgTable(
  "postulaciones",
  {
    id: serial("id").primaryKey(),
    procesoId: integer("proceso_id")
      .notNull()
      .references(() => procesos.id, { onDelete: "cascade" }),
    candidatoId: integer("candidato_id")
      .notNull()
      .references(() => usuarios.id, { onDelete: "cascade" }),
    etapa: text("etapa", { enum: ETAPAS }).notNull().default("postulado"),
    notaInterna: text("nota_interna"),
    informeEmpresa: text("informe_empresa"),
    presentadoEn: fecha("presentado_en"),
    feedbackEmpresa: text("feedback_empresa", { enum: FEEDBACKS_EMPRESA }),
    comentarioEmpresa: text("comentario_empresa"),
    creadoEn: creadoEn(),
    actualizadoEn: actualizadoEn(),
  },
  (t) => [
    uniqueIndex("postulaciones_proceso_candidato_idx").on(t.procesoId, t.candidatoId),
    index("postulaciones_candidato_idx").on(t.candidatoId),
  ],
);

export const evaluaciones = pgTable(
  "evaluaciones",
  {
    id: serial("id").primaryKey(),
    candidatoId: integer("candidato_id")
      .notNull()
      .references(() => usuarios.id, { onDelete: "cascade" }),
    tipo: text("tipo", { enum: TIPOS_EVALUACION }).notNull(),
    estado: text("estado", { enum: ESTADOS_EVALUACION }).notNull().default("pendiente"),
    asignadaPorId: integer("asignada_por_id").references(() => usuarios.id, {
      onDelete: "set null",
    }),
    respuestas: jsonb("respuestas").$type<unknown>(),
    resultado: jsonb("resultado").$type<ResultadoEvaluacion>(),
    iniciadaEn: fecha("iniciada_en"),
    completadaEn: fecha("completada_en"),
    creadoEn: creadoEn(),
  },
  (t) => [index("evaluaciones_candidato_idx").on(t.candidatoId)],
);

export const solicitudes = pgTable(
  "solicitudes",
  {
    id: serial("id").primaryKey(),
    empresaId: integer("empresa_id")
      .notNull()
      .references(() => empresas.id, { onDelete: "cascade" }),
    tipo: text("tipo", { enum: TIPOS_SOLICITUD }).notNull(),
    asunto: text("asunto").notNull(),
    descripcion: text("descripcion").notNull(),
    estado: text("estado", { enum: ESTADOS_SOLICITUD }).notNull().default("nueva"),
    responsableId: integer("responsable_id").references(() => usuarios.id, {
      onDelete: "set null",
    }),
    procesoId: integer("proceso_id").references(() => procesos.id, { onDelete: "set null" }),
    creadoEn: creadoEn(),
    actualizadoEn: actualizadoEn(),
  },
  (t) => [index("solicitudes_empresa_idx").on(t.empresaId)],
);

export const mensajes = pgTable(
  "mensajes",
  {
    id: serial("id").primaryKey(),
    solicitudId: integer("solicitud_id")
      .notNull()
      .references(() => solicitudes.id, { onDelete: "cascade" }),
    autorId: integer("autor_id")
      .notNull()
      .references(() => usuarios.id, { onDelete: "cascade" }),
    texto: text("texto").notNull(),
    creadoEn: creadoEn(),
  },
  (t) => [index("mensajes_solicitud_idx").on(t.solicitudId)],
);

export const citas = pgTable(
  "citas",
  {
    id: serial("id").primaryKey(),
    tipo: text("tipo", { enum: TIPOS_CITA }).notNull(),
    titulo: text("titulo").notNull(),
    inicio: fecha("inicio").notNull(),
    duracionMin: integer("duracion_min").notNull().default(60),
    lugar: text("lugar"),
    notas: text("notas"),
    staffId: integer("staff_id")
      .notNull()
      .references(() => usuarios.id, { onDelete: "cascade" }),
    empresaId: integer("empresa_id").references(() => empresas.id, { onDelete: "cascade" }),
    candidatoId: integer("candidato_id").references(() => usuarios.id, { onDelete: "cascade" }),
    procesoId: integer("proceso_id").references(() => procesos.id, { onDelete: "set null" }),
    solicitudId: integer("solicitud_id").references(() => solicitudes.id, {
      onDelete: "set null",
    }),
    creadoEn: creadoEn(),
  },
  (t) => [index("citas_inicio_idx").on(t.inicio)],
);
