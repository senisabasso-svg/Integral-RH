import { desc, inArray } from "drizzle-orm";
import { db } from "@/db";
import { evaluaciones } from "@/db/schema";
import type { EstadoEvaluacion, TipoEvaluacion } from "@/lib/dominio";
import type { ResultadoEvaluacion } from "@/lib/evaluaciones/tipos";

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
