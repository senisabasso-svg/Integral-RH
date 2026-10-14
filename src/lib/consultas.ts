import { and, asc, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { empresas, evaluaciones, usuarios } from "@/db/schema";
import type { EstadoEvaluacion, TipoEvaluacion } from "@/lib/dominio";
import type { ResultadoEvaluacion } from "@/lib/evaluaciones/tipos";

export function opcionesEmpresas() {
  return db
    .select({ id: empresas.id, nombre: empresas.razonSocial })
    .from(empresas)
    .orderBy(asc(empresas.razonSocial));
}

export function opcionesStaff() {
  return db
    .select({ id: usuarios.id, nombre: usuarios.nombre, especialidad: usuarios.especialidad })
    .from(usuarios)
    .where(and(eq(usuarios.rol, "staff"), eq(usuarios.activo, true)))
    .orderBy(asc(usuarios.nombre));
}

export function opcionesCandidatos() {
  return db
    .select({ id: usuarios.id, nombre: usuarios.nombre })
    .from(usuarios)
    .where(and(eq(usuarios.rol, "candidato"), eq(usuarios.activo, true)))
    .orderBy(asc(usuarios.nombre));
}

export type EvaluacionResumen = {
  id: number;
  estado: EstadoEvaluacion;
  resultado: ResultadoEvaluacion | null;
  completadaEn: Date | null;
};

export type EvaluacionesCandidato = Partial<Record<TipoEvaluacion, EvaluacionResumen>>;

export async function evaluacionesPorCandidato(candidatoIds: number[]) {
  const mapa = new Map<number, EvaluacionesCandidato>();
  if (candidatoIds.length === 0) return mapa;
  const filas = await db
    .select({
      id: evaluaciones.id,
      candidatoId: evaluaciones.candidatoId,
      tipo: evaluaciones.tipo,
      estado: evaluaciones.estado,
      resultado: evaluaciones.resultado,
      completadaEn: evaluaciones.completadaEn,
    })
    .from(evaluaciones)
    .where(inArray(evaluaciones.candidatoId, candidatoIds))
    .orderBy(desc(evaluaciones.creadoEn));

  for (const { candidatoId, tipo, ...evaluacion } of filas) {
    const actual = mapa.get(candidatoId) ?? {};
    const previa = actual[tipo];
    if (!previa || (previa.estado === "pendiente" && evaluacion.estado === "completada")) {
      actual[tipo] = { ...evaluacion, resultado: evaluacion.resultado ?? null };
    }
    mapa.set(candidatoId, actual);
  }
  return mapa;
}
