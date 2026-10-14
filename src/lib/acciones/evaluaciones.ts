"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { evaluaciones } from "@/db/schema";
import { requireRol } from "@/lib/auth";
import { TIPOS_EVALUACION } from "@/lib/dominio";
import { puntuarDisc, validarRespuestasDisc } from "@/lib/evaluaciones/disc";
import {
  MINUTOS_RAZONAMIENTO,
  puntuarRazonamiento,
  validarRespuestasRazonamiento,
} from "@/lib/evaluaciones/razonamiento";
import type { ResultadoEvaluacion } from "@/lib/evaluaciones/tipos";
import { idDe, type EstadoFormulario } from "@/lib/formularios";
import { z } from "@/lib/validacion";

const MARGEN_ENTREGA_MS = 60_000;

export async function asignarEvaluacion(formData: FormData) {
  const usuario = await requireRol("staff");
  const candidatoId = idDe(formData, "candidatoId");
  const tipo = z.enum(TIPOS_EVALUACION).parse(formData.get("tipo"));

  const [pendiente] = await db
    .select({ id: evaluaciones.id })
    .from(evaluaciones)
    .where(
      and(
        eq(evaluaciones.candidatoId, candidatoId),
        eq(evaluaciones.tipo, tipo),
        eq(evaluaciones.estado, "pendiente"),
      ),
    );
  if (!pendiente) {
    await db.insert(evaluaciones).values({ candidatoId, tipo, asignadaPorId: usuario.id });
  }
  revalidatePath("/staff", "layout");
}

async function evaluacionPendienteDe(candidatoId: number, id: number) {
  const [evaluacion] = await db
    .select()
    .from(evaluaciones)
    .where(and(eq(evaluaciones.id, id), eq(evaluaciones.candidatoId, candidatoId)));
  return evaluacion?.estado === "pendiente" ? evaluacion : null;
}

export async function iniciarEvaluacion(formData: FormData) {
  const usuario = await requireRol("candidato");
  const id = idDe(formData);
  const evaluacion = await evaluacionPendienteDe(usuario.id, id);
  if (evaluacion && !evaluacion.iniciadaEn) {
    await db.update(evaluaciones).set({ iniciadaEn: new Date() }).where(eq(evaluaciones.id, id));
  }
  redirect(`/candidato/evaluaciones/${id}`);
}

export async function enviarEvaluacion(
  _previo: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  const usuario = await requireRol("candidato");
  const id = idDe(formData);
  const evaluacion = await evaluacionPendienteDe(usuario.id, id);
  if (!evaluacion?.iniciadaEn) return { error: "Esta evaluación ya no está disponible." };

  let respuestas: unknown;
  try {
    respuestas = JSON.parse(String(formData.get("respuestas") ?? ""));
  } catch {
    return { error: "No pudimos leer tus respuestas. Intentá de nuevo." };
  }

  let resultado: ResultadoEvaluacion;
  if (evaluacion.tipo === "disc") {
    const validas = validarRespuestasDisc(respuestas);
    if (!validas) {
      return {
        error: "En cada grupo elegí una palabra para «más me representa» y otra distinta para «menos».",
      };
    }
    respuestas = validas;
    resultado = puntuarDisc(validas);
  } else {
    const validas = validarRespuestasRazonamiento(respuestas);
    if (!validas) return { error: "Hay respuestas inválidas. Recargá la página e intentá de nuevo." };
    const limite = MINUTOS_RAZONAMIENTO * 60_000 + MARGEN_ENTREGA_MS;
    const fueraDeTiempo = Date.now() - evaluacion.iniciadaEn.getTime() > limite;
    respuestas = validas;
    resultado = puntuarRazonamiento(validas, fueraDeTiempo);
  }

  await db
    .update(evaluaciones)
    .set({ estado: "completada", respuestas, resultado, completadaEn: new Date() })
    .where(eq(evaluaciones.id, id));
  revalidatePath("/candidato", "layout");
  revalidatePath("/staff", "layout");
  redirect(`/candidato/evaluaciones/${id}`);
}
