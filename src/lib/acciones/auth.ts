"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { empresas, perfilesCandidato, usuarios } from "@/db/schema";
import { cerrarSesion, crearSesion, RUTA_INICIO } from "@/lib/auth";
import { fallo, valoresDe, type EstadoFormulario } from "@/lib/formularios";
import { hashPassword, verificarPassword } from "@/lib/password";
import { emailSchema, passwordNueva, rutSchema, textoOpcional, textoRequerido, z } from "@/lib/validacion";

function destinoSeguro(next: FormDataEntryValue | null, porDefecto: string) {
  return typeof next === "string" && next.startsWith("/") && !next.startsWith("//")
    ? next
    : porDefecto;
}

async function emailEnUso(email: string) {
  const [existente] = await db
    .select({ id: usuarios.id })
    .from(usuarios)
    .where(eq(usuarios.email, email))
    .limit(1);
  return Boolean(existente);
}

const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Ingresá tu contraseña."),
});

export async function iniciarSesion(
  _previo: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  const datos = loginSchema.safeParse(Object.fromEntries(formData));
  if (!datos.success) return fallo(formData, datos.error);

  const [usuario] = await db
    .select()
    .from(usuarios)
    .where(eq(usuarios.email, datos.data.email))
    .limit(1);
  const valido =
    usuario?.activo && (await verificarPassword(datos.data.password, usuario.passwordHash));
  if (!usuario || !valido) {
    return { error: "Email o contraseña incorrectos.", valores: valoresDe(formData) };
  }

  await crearSesion(usuario.id);
  redirect(destinoSeguro(formData.get("next"), RUTA_INICIO[usuario.rol]));
}

const registroCandidatoSchema = z.object({
  nombre: textoRequerido("Ingresá tu nombre completo."),
  email: emailSchema,
  password: passwordNueva,
  telefono: textoOpcional,
  ciudad: textoOpcional,
});

export async function registrarCandidato(
  _previo: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  const datos = registroCandidatoSchema.safeParse(Object.fromEntries(formData));
  if (!datos.success) return fallo(formData, datos.error);
  if (await emailEnUso(datos.data.email)) {
    return {
      errores: { email: "Ya existe una cuenta con ese email." },
      valores: valoresDe(formData),
    };
  }

  const [usuario] = await db
    .insert(usuarios)
    .values({
      nombre: datos.data.nombre,
      email: datos.data.email,
      passwordHash: await hashPassword(datos.data.password),
      rol: "candidato",
    })
    .returning({ id: usuarios.id });
  await db.insert(perfilesCandidato).values({
    usuarioId: usuario!.id,
    telefono: datos.data.telefono,
    ciudad: datos.data.ciudad,
  });

  await crearSesion(usuario!.id);
  redirect(destinoSeguro(formData.get("next"), "/candidato/perfil"));
}

const registroEmpresaSchema = z.object({
  razonSocial: textoRequerido("Ingresá la razón social."),
  rut: rutSchema,
  sector: textoRequerido("Indicá el sector de actividad."),
  telefono: textoOpcional,
  nombre: textoRequerido("Ingresá el nombre del contacto."),
  email: emailSchema,
  password: passwordNueva,
});

export async function registrarEmpresa(
  _previo: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  const datos = registroEmpresaSchema.safeParse(Object.fromEntries(formData));
  if (!datos.success) return fallo(formData, datos.error);
  if (await emailEnUso(datos.data.email)) {
    return {
      errores: { email: "Ya existe una cuenta con ese email." },
      valores: valoresDe(formData),
    };
  }

  const [empresa] = await db
    .insert(empresas)
    .values({
      razonSocial: datos.data.razonSocial,
      rut: datos.data.rut,
      sector: datos.data.sector,
      telefono: datos.data.telefono,
    })
    .returning({ id: empresas.id });
  const [usuario] = await db
    .insert(usuarios)
    .values({
      nombre: datos.data.nombre,
      email: datos.data.email,
      passwordHash: await hashPassword(datos.data.password),
      rol: "empresa",
      empresaId: empresa!.id,
    })
    .returning({ id: usuarios.id });

  await crearSesion(usuario!.id);
  redirect("/empresa");
}

export async function salir() {
  await cerrarSesion();
  redirect("/login");
}
