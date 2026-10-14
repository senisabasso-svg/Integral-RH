"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { empresas, usuarios } from "@/db/schema";
import { requireRol } from "@/lib/auth";
import { fallo, idDe, valoresDe, type EstadoFormulario } from "@/lib/formularios";
import { hashPassword } from "@/lib/password";
import { emailSchema, passwordNueva, rutSchema, textoOpcional, textoRequerido, z } from "@/lib/validacion";

async function emailEnUso(email: string) {
  const [existente] = await db
    .select({ id: usuarios.id })
    .from(usuarios)
    .where(eq(usuarios.email, email))
    .limit(1);
  return Boolean(existente);
}

const contactoSchema = z.object({
  nombre: textoRequerido("Ingresá el nombre del contacto."),
  email: emailSchema,
  password: passwordNueva,
});

const empresaSchema = contactoSchema.extend({
  razonSocial: textoRequerido("Ingresá la razón social."),
  rut: rutSchema,
  sector: textoRequerido("Indicá el sector."),
  telefono: textoOpcional,
  direccion: textoOpcional,
});

export async function crearEmpresa(
  _previo: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  await requireRol("staff");
  const datos = empresaSchema.safeParse(Object.fromEntries(formData));
  if (!datos.success) return fallo(formData, datos.error);
  if (await emailEnUso(datos.data.email)) {
    return { errores: { email: "Ya existe un usuario con ese email." }, valores: valoresDe(formData) };
  }

  const { nombre, email, password, ...empresa } = datos.data;
  const [nueva] = await db.insert(empresas).values(empresa).returning({ id: empresas.id });
  await db.insert(usuarios).values({
    nombre,
    email,
    passwordHash: await hashPassword(password),
    rol: "empresa",
    empresaId: nueva!.id,
  });
  revalidatePath("/staff", "layout");
  redirect(`/staff/empresas/${nueva!.id}`);
}

export async function agregarContacto(
  _previo: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  await requireRol("staff");
  const empresaId = idDe(formData, "empresaId");
  const datos = contactoSchema.safeParse(Object.fromEntries(formData));
  if (!datos.success) return fallo(formData, datos.error);
  if (await emailEnUso(datos.data.email)) {
    return { errores: { email: "Ya existe un usuario con ese email." }, valores: valoresDe(formData) };
  }

  await db.insert(usuarios).values({
    nombre: datos.data.nombre,
    email: datos.data.email,
    passwordHash: await hashPassword(datos.data.password),
    rol: "empresa",
    empresaId,
  });
  revalidatePath("/staff", "layout");
  return { ok: true, mensaje: `Contacto creado. Ya puede ingresar con ${datos.data.email}.` };
}
