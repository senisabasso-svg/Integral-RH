"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { perfilesCandidato, postulaciones, procesos, usuarios } from "@/db/schema";
import { requireRol } from "@/lib/auth";
import { DISPONIBILIDADES } from "@/lib/dominio";
import { fallo, idDe, valoresDe, type EstadoFormulario } from "@/lib/formularios";
import { textoOpcional, textoRequerido, z } from "@/lib/validacion";

export async function postularme(formData: FormData) {
  const usuario = await requireRol("candidato");
  const procesoId = idDe(formData, "procesoId");
  const [proceso] = await db
    .select({ id: procesos.id })
    .from(procesos)
    .where(and(eq(procesos.id, procesoId), eq(procesos.estado, "publicado")));
  if (!proceso) redirect("/empleos");

  await db
    .insert(postulaciones)
    .values({ procesoId, candidatoId: usuario.id })
    .onConflictDoNothing();
  revalidatePath("/candidato", "layout");
  redirect("/candidato/postulaciones?nueva=1");
}

const perfilSchema = z.object({
  nombre: textoRequerido("Ingresá tu nombre completo."),
  documento: textoOpcional,
  telefono: textoOpcional,
  ciudad: textoOpcional,
  fechaNacimiento: textoOpcional.refine(
    (valor) => valor === null || /^\d{4}-\d{2}-\d{2}$/.test(valor),
    "Fecha inválida.",
  ),
  profesion: textoOpcional,
  resumen: textoOpcional.refine(
    (valor) => valor === null || valor.length <= 2000,
    "Máximo 2000 caracteres.",
  ),
  linkedin: textoOpcional.refine(
    (valor) => valor === null || /^https?:\/\/\S+$/.test(valor),
    "Ingresá la dirección completa, empezando por https://",
  ),
  disponibilidad: z.enum(DISPONIBILIDADES),
});

export async function actualizarPerfil(
  _previo: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  const usuario = await requireRol("candidato");
  const datos = perfilSchema.safeParse(Object.fromEntries(formData));
  if (!datos.success) return fallo(formData, datos.error);

  const { nombre, ...perfil } = datos.data;
  const cambios = { ...perfil, actualizadoEn: new Date() };
  await db.update(usuarios).set({ nombre }).where(eq(usuarios.id, usuario.id));
  await db
    .insert(perfilesCandidato)
    .values({ usuarioId: usuario.id, ...cambios })
    .onConflictDoUpdate({ target: perfilesCandidato.usuarioId, set: cambios });

  revalidatePath("/candidato", "layout");
  return { ok: true, mensaje: "Perfil actualizado.", valores: valoresDe(formData) };
}
