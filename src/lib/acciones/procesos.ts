"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { postulaciones, procesos, solicitudes } from "@/db/schema";
import { requireRol } from "@/lib/auth";
import { ESTADOS_PROCESO, MODALIDADES } from "@/lib/dominio";
import { fallo, idDe, type EstadoFormulario } from "@/lib/formularios";
import { textoRequerido, z } from "@/lib/validacion";

const procesoSchema = z.object({
  empresaId: z.coerce.number().int().positive("Elegí una empresa."),
  responsableId: z.coerce
    .number()
    .int()
    .nonnegative()
    .transform((valor) => valor || null),
  titulo: textoRequerido("Ingresá el puesto."),
  descripcion: textoRequerido("Describí el puesto."),
  requisitos: z.string().trim().default(""),
  modalidad: z.enum(MODALIDADES),
  ubicacion: textoRequerido("Indicá la ubicación."),
  vacantes: z.coerce.number().int().min(1, "Tiene que haber al menos una vacante.").max(500),
  estado: z.enum(ESTADOS_PROCESO),
  mostrarEmpresa: z
    .string()
    .optional()
    .transform((valor) => valor === "on"),
});

export async function guardarProceso(
  _previo: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  const usuario = await requireRol("staff");
  const datos = procesoSchema.safeParse(Object.fromEntries(formData));
  if (!datos.success) return fallo(formData, datos.error);

  let procesoId = Number(formData.get("id")) || 0;
  if (procesoId) {
    await db.update(procesos).set(datos.data).where(eq(procesos.id, procesoId));
  } else {
    const [nuevo] = await db
      .insert(procesos)
      .values({ ...datos.data, responsableId: datos.data.responsableId ?? usuario.id })
      .returning({ id: procesos.id });
    procesoId = nuevo!.id;

    const solicitudId = Number(formData.get("solicitudId")) || 0;
    if (solicitudId) {
      await db
        .update(solicitudes)
        .set({ procesoId, estado: "en_curso", actualizadoEn: new Date() })
        .where(and(eq(solicitudes.id, solicitudId), eq(solicitudes.empresaId, datos.data.empresaId)));
    }
  }

  revalidatePath("/staff", "layout");
  redirect(`/staff/procesos/${procesoId}`);
}

export async function cambiarEstadoProceso(formData: FormData) {
  await requireRol("staff");
  const id = idDe(formData);
  const estado = z.enum(ESTADOS_PROCESO).parse(formData.get("estado"));
  await db.update(procesos).set({ estado }).where(eq(procesos.id, id));
  revalidatePath("/staff", "layout");
}

export async function agregarCandidato(formData: FormData) {
  await requireRol("staff");
  const procesoId = idDe(formData, "procesoId");
  const candidatoId = idDe(formData, "candidatoId");
  await db
    .insert(postulaciones)
    .values({ procesoId, candidatoId, etapa: "preseleccionado" })
    .onConflictDoNothing();
  revalidatePath("/staff", "layout");
}
