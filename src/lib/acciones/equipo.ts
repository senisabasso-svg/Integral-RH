"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { sesiones, usuarios } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { ESPECIALIDADES } from "@/lib/dominio";
import { fallo, idDe, valoresDe, type EstadoFormulario } from "@/lib/formularios";
import { hashPassword } from "@/lib/password";
import { emailSchema, passwordNueva, textoRequerido, z } from "@/lib/validacion";

const staffSchema = z.object({
  nombre: textoRequerido("Ingresá el nombre."),
  email: emailSchema,
  especialidad: z.enum(ESPECIALIDADES, "Elegí una especialidad."),
  password: passwordNueva,
  esAdmin: z
    .string()
    .optional()
    .transform((valor) => valor === "on"),
});

export async function crearStaff(
  _previo: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  await requireAdmin();
  const datos = staffSchema.safeParse(Object.fromEntries(formData));
  if (!datos.success) return fallo(formData, datos.error);

  const [existente] = await db
    .select({ id: usuarios.id })
    .from(usuarios)
    .where(eq(usuarios.email, datos.data.email));
  if (existente) {
    return { errores: { email: "Ya existe un usuario con ese email." }, valores: valoresDe(formData) };
  }

  const { password, ...resto } = datos.data;
  await db.insert(usuarios).values({ ...resto, rol: "staff", passwordHash: await hashPassword(password) });
  revalidatePath("/staff", "layout");
  return { ok: true, mensaje: `Listo: ${datos.data.nombre} ya puede ingresar con ${datos.data.email}.` };
}

export async function cambiarActivo(formData: FormData) {
  const admin = await requireAdmin();
  const id = idDe(formData);
  if (id === admin.id) return;

  const [usuario] = await db
    .select({ activo: usuarios.activo })
    .from(usuarios)
    .where(eq(usuarios.id, id));
  if (!usuario) return;

  await db.update(usuarios).set({ activo: !usuario.activo }).where(eq(usuarios.id, id));
  if (usuario.activo) await db.delete(sesiones).where(eq(sesiones.usuarioId, id));
  revalidatePath("/staff", "layout");
}
