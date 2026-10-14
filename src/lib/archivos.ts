import path from "node:path";
import { and, eq, isNotNull } from "drizzle-orm";
import { db } from "@/db";
import { postulaciones, procesos } from "@/db/schema";
import type { UsuarioSesion } from "@/lib/auth";

export const CARPETA_CV = path.join(process.cwd(), "storage", "cv");
export const MAXIMO_CV_BYTES = 5 * 1024 * 1024;

export async function puedeVerCv(usuario: UsuarioSesion, candidatoId: number) {
  if (usuario.rol === "staff") return true;
  if (usuario.rol === "candidato") return usuario.id === candidatoId;
  if (usuario.empresaId === null) return false;
  const [presentado] = await db
    .select({ id: postulaciones.id })
    .from(postulaciones)
    .innerJoin(procesos, eq(postulaciones.procesoId, procesos.id))
    .where(
      and(
        eq(postulaciones.candidatoId, candidatoId),
        eq(procesos.empresaId, usuario.empresaId),
        isNotNull(postulaciones.presentadoEn),
      ),
    )
    .limit(1);
  return Boolean(presentado);
}
