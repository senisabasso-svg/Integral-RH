"use server";

import { and, eq, isNotNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { evaluaciones, postulaciones, procesos } from "@/db/schema";
import { requireEmpresa, requireRol } from "@/lib/auth";
import { ETAPAS, FEEDBACKS_EMPRESA, TIPOS_EVALUACION } from "@/lib/dominio";
import { fallo, idDe, valoresDe, type EstadoFormulario } from "@/lib/formularios";
import { textoOpcional, z } from "@/lib/validacion";

async function buscarPostulacion(id: number) {
  const [postulacion] = await db
    .select({
      id: postulaciones.id,
      procesoId: postulaciones.procesoId,
      candidatoId: postulaciones.candidatoId,
      presentadoEn: postulaciones.presentadoEn,
      informeEmpresa: postulaciones.informeEmpresa,
    })
    .from(postulaciones)
    .where(eq(postulaciones.id, id));
  if (!postulacion) throw new Error("La postulación no existe.");
  return postulacion;
}

async function asignarEvaluacionesFaltantes(candidatoId: number, staffId: number) {
  const existentes = await db
    .select({ tipo: evaluaciones.tipo })
    .from(evaluaciones)
    .where(eq(evaluaciones.candidatoId, candidatoId));
  const faltantes = TIPOS_EVALUACION.filter((tipo) => !existentes.some((e) => e.tipo === tipo));
  if (faltantes.length > 0) {
    await db
      .insert(evaluaciones)
      .values(faltantes.map((tipo) => ({ candidatoId, tipo, asignadaPorId: staffId })));
  }
}

export async function moverEtapa(formData: FormData) {
  const usuario = await requireRol("staff");
  const postulacion = await buscarPostulacion(idDe(formData));
  const etapa = z.enum(ETAPAS).parse(formData.get("etapa"));

  await db
    .update(postulaciones)
    .set({
      etapa,
      actualizadoEn: new Date(),
      ...(etapa === "presentado" && !postulacion.presentadoEn ? { presentadoEn: new Date() } : {}),
    })
    .where(eq(postulaciones.id, postulacion.id));
  if (etapa === "evaluacion") await asignarEvaluacionesFaltantes(postulacion.candidatoId, usuario.id);
  revalidatePath("/staff", "layout");
}

const notasSchema = z.object({ notaInterna: textoOpcional, informeEmpresa: textoOpcional });

export async function guardarNotas(
  _previo: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  await requireRol("staff");
  const postulacion = await buscarPostulacion(idDe(formData));
  const datos = notasSchema.safeParse(Object.fromEntries(formData));
  if (!datos.success) return fallo(formData, datos.error);

  await db
    .update(postulaciones)
    .set({ ...datos.data, actualizadoEn: new Date() })
    .where(eq(postulaciones.id, postulacion.id));
  revalidatePath("/staff", "layout");
  return { ok: true, mensaje: "Notas guardadas.", valores: valoresDe(formData) };
}

export async function presentarAEmpresa(formData: FormData) {
  await requireRol("staff");
  const postulacion = await buscarPostulacion(idDe(formData));
  if (!postulacion.informeEmpresa?.trim()) return;

  await db
    .update(postulaciones)
    .set({
      etapa: "presentado",
      presentadoEn: postulacion.presentadoEn ?? new Date(),
      actualizadoEn: new Date(),
    })
    .where(eq(postulaciones.id, postulacion.id));
  revalidatePath("/staff", "layout");
}

const feedbackSchema = z.object({
  feedback: z.enum(FEEDBACKS_EMPRESA, "Elegí una opción."),
  comentario: textoOpcional,
});

export async function darFeedback(
  _previo: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  const usuario = await requireEmpresa();
  const id = idDe(formData);
  const datos = feedbackSchema.safeParse(Object.fromEntries(formData));
  if (!datos.success) return fallo(formData, datos.error);

  const [postulacion] = await db
    .select({ id: postulaciones.id, procesoId: postulaciones.procesoId })
    .from(postulaciones)
    .innerJoin(procesos, eq(postulaciones.procesoId, procesos.id))
    .where(
      and(
        eq(postulaciones.id, id),
        eq(procesos.empresaId, usuario.empresaId),
        isNotNull(postulaciones.presentadoEn),
      ),
    );
  if (!postulacion) return { error: "No encontramos ese candidato en tus búsquedas." };

  await db
    .update(postulaciones)
    .set({
      feedbackEmpresa: datos.data.feedback,
      comentarioEmpresa: datos.data.comentario,
      actualizadoEn: new Date(),
    })
    .where(eq(postulaciones.id, id));
  revalidatePath("/empresa", "layout");
  revalidatePath("/staff", "layout");
  return {
    ok: true,
    mensaje: "Gracias, le avisamos al equipo de selección.",
    valores: valoresDe(formData),
  };
}
