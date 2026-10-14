import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
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

const fecha = (nombre: string) => integer(nombre, { mode: "timestamp_ms" });
const creadoEn = () =>
  fecha("creado_en")
    .notNull()
    .$defaultFn(() => new Date());
const actualizadoEn = () =>
  fecha("actualizado_en")
    .notNull()
    .$defaultFn(() => new Date());

export const empresas = sqliteTable("empresas", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  razonSocial: text("razon_social").notNull(),
  rut: text("rut").notNull(),
  sector: text("sector").notNull(),
  telefono: text("telefono"),
  direccion: text("direccion"),
  creadoEn: creadoEn(),
});

export const usuarios = sqliteTable("usuarios", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  nombre: text("nombre").notNull(),
  rol: text("rol", { enum: ROLES }).notNull(),
  especialidad: text("especialidad", { enum: ESPECIALIDADES }),
  esAdmin: integer("es_admin", { mode: "boolean" }).notNull().default(false),
  activo: integer("activo", { mode: "boolean" }).notNull().default(true),
  empresaId: integer("empresa_id").references(() => empresas.id, { onDelete: "cascade" }),
  creadoEn: creadoEn(),
});

export const sesiones = sqliteTable("sesiones", {
  id: text("id").primaryKey(),
  usuarioId: integer("usuario_id")
    .notNull()
    .references(() => usuarios.id, { onDelete: "cascade" }),
  expiraEn: fecha("expira_en").notNull(),
});

export const perfilesCandidato = sqliteTable("perfiles_candidato", {
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

export const procesos = sqliteTable(
  "procesos",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
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
    mostrarEmpresa: integer("mostrar_empresa", { mode: "boolean" }).notNull().default(false),
    creadoEn: creadoEn(),
  },
  (t) => [index("procesos_empresa_idx").on(t.empresaId)],
);

export const postulaciones = sqliteTable(
  "postulaciones",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
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

export const evaluaciones = sqliteTable(
  "evaluaciones",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    candidatoId: integer("candidato_id")
      .notNull()
      .references(() => usuarios.id, { onDelete: "cascade" }),
    tipo: text("tipo", { enum: TIPOS_EVALUACION }).notNull(),
    estado: text("estado", { enum: ESTADOS_EVALUACION }).notNull().default("pendiente"),
    asignadaPorId: integer("asignada_por_id").references(() => usuarios.id, {
      onDelete: "set null",
    }),
    respuestas: text("respuestas", { mode: "json" }).$type<unknown>(),
    resultado: text("resultado", { mode: "json" }).$type<ResultadoEvaluacion>(),
    iniciadaEn: fecha("iniciada_en"),
    completadaEn: fecha("completada_en"),
    creadoEn: creadoEn(),
  },
  (t) => [index("evaluaciones_candidato_idx").on(t.candidatoId)],
);

export const solicitudes = sqliteTable(
  "solicitudes",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
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

export const mensajes = sqliteTable(
  "mensajes",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
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

export const citas = sqliteTable(
  "citas",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
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
