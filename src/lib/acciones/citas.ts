"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { citas } from "@/db/schema";
import { requireRol } from "@/lib/auth";
import { TIPOS_CITA } from "@/lib/dominio";
import { fallo, idDe, type EstadoFormulario } from "@/lib/formularios";
import { parseFechaHoraLocal } from "@/lib/utils";
import { textoOpcional, textoRequerido, z } from "@/lib/validacion";

const idOpcional = z.coerce
  .number()
  .int()
  .nonnegative()
  .transform((valor) => valor || null);

const citaSchema = z.object({
  tipo: z.enum(TIPOS_CITA),
  titulo: textoRequerido("Poné un título.").max(150),
  inicio: z.string().transform((valor, ctx) => {
    const fecha = parseFechaHoraLocal(valor);
    if (!fecha) {
      ctx.addIssue({ code: "custom", message: "Elegí fecha y hora." });
      return z.NEVER;
    }
    return fecha;
  }),
  duracionMin: z.coerce.number().int().min(5, "Mínimo 5 minutos.").max(600, "Máximo 10 horas."),
  lugar: textoOpcional,
  notas: textoOpcional,
  staffId: z.coerce.number().int().positive("Elegí un responsable."),
  empresaId: idOpcional,
  candidatoId: idOpcional,
  procesoId: idOpcional,
  solicitudId: idOpcional,
});

function revalidarAgendas() {
  revalidatePath("/staff", "layout");
  revalidatePath("/empresa", "layout");
  revalidatePath("/candidato", "layout");
}

export async function crearCita(
  _previo: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  await requireRol("staff");
  const datos = citaSchema.safeParse(Object.fromEntries(formData));
  if (!datos.success) return fallo(formData, datos.error);

  await db.insert(citas).values(datos.data);
  revalidarAgendas();
  redirect("/staff/agenda");
}

export async function eliminarCita(formData: FormData) {
  await requireRol("staff");
  await db.delete(citas).where(eq(citas.id, idDe(formData)));
  revalidarAgendas();
}
