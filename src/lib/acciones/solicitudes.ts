"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { mensajes, solicitudes } from "@/db/schema";
import { obtenerUsuario, requireEmpresa, requireRol } from "@/lib/auth";
import { ESTADOS_SOLICITUD, TIPOS_SOLICITUD } from "@/lib/dominio";
import { fallo, idDe, valoresDe, type EstadoFormulario } from "@/lib/formularios";
import { textoRequerido, z } from "@/lib/validacion";

function revalidarPortales() {
  revalidatePath("/empresa", "layout");
  revalidatePath("/staff", "layout");
}

const solicitudSchema = z.object({
  tipo: z.enum(TIPOS_SOLICITUD, "Elegí el tipo de servicio."),
  asunto: textoRequerido("Escribí un asunto.").max(150),
  descripcion: textoRequerido("Contanos qué necesitás.").max(5000),
});

export async function crearSolicitud(
  _previo: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  const usuario = await requireEmpresa();
  const datos = solicitudSchema.safeParse(Object.fromEntries(formData));
  if (!datos.success) return fallo(formData, datos.error);

  const [nueva] = await db
    .insert(solicitudes)
    .values({ ...datos.data, empresaId: usuario.empresaId })
    .returning({ id: solicitudes.id });
  revalidarPortales();
  redirect(`/empresa/solicitudes/${nueva!.id}?nueva=1`);
}

const mensajeSchema = z.object({
  texto: textoRequerido("Escribí un mensaje.").max(5000),
});

export async function enviarMensaje(
  _previo: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  const usuario = await obtenerUsuario();
  if (!usuario || usuario.rol === "candidato") redirect("/login");
  const solicitudId = idDe(formData, "solicitudId");
  const datos = mensajeSchema.safeParse(Object.fromEntries(formData));
  if (!datos.success) return fallo(formData, datos.error);

  const [solicitud] = await db
    .select({ id: solicitudes.id, empresaId: solicitudes.empresaId, estado: solicitudes.estado })
    .from(solicitudes)
    .where(eq(solicitudes.id, solicitudId));
  if (!solicitud || (usuario.rol === "empresa" && solicitud.empresaId !== usuario.empresaId)) {
    return { error: "No encontramos esa solicitud.", valores: valoresDe(formData) };
  }

  await db.insert(mensajes).values({ solicitudId, autorId: usuario.id, texto: datos.data.texto });
  await db
    .update(solicitudes)
    .set({
      actualizadoEn: new Date(),
      ...(usuario.rol === "staff" && solicitud.estado === "nueva" ? { estado: "en_curso" as const } : {}),
    })
    .where(eq(solicitudes.id, solicitudId));
  revalidarPortales();
  return { ok: true };
}

export async function asignarSolicitud(formData: FormData) {
  await requireRol("staff");
  const id = idDe(formData);
  const responsableId = Number(formData.get("responsableId")) || null;
  const [solicitud] = await db
    .select({ estado: solicitudes.estado })
    .from(solicitudes)
    .where(eq(solicitudes.id, id));
  if (!solicitud) return;

  await db
    .update(solicitudes)
    .set({
      responsableId,
      actualizadoEn: new Date(),
      ...(responsableId && solicitud.estado === "nueva" ? { estado: "en_curso" as const } : {}),
    })
    .where(eq(solicitudes.id, id));
  revalidarPortales();
}

export async function cambiarEstadoSolicitud(formData: FormData) {
  await requireRol("staff");
  const id = idDe(formData);
  const estado = z.enum(ESTADOS_SOLICITUD).parse(formData.get("estado"));
  await db
    .update(solicitudes)
    .set({ estado, actualizadoEn: new Date() })
    .where(eq(solicitudes.id, id));
  revalidarPortales();
}
