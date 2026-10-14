import { createHash, randomBytes } from "node:crypto";
import { and, eq, gt, lt } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { db } from "@/db";
import { sesiones, usuarios } from "@/db/schema";
import type { Especialidad, Rol } from "@/lib/dominio";

export const COOKIE_SESION = "irh_sesion";
const DURACION_SESION_MS = 30 * 24 * 60 * 60 * 1000;

export const RUTA_INICIO: Record<Rol, string> = {
  empresa: "/empresa",
  candidato: "/candidato",
  staff: "/staff",
};

export type UsuarioSesion = {
  id: number;
  email: string;
  nombre: string;
  rol: Rol;
  especialidad: Especialidad | null;
  esAdmin: boolean;
  empresaId: number | null;
};

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function crearSesion(usuarioId: number) {
  const token = randomBytes(32).toString("base64url");
  const expiraEn = new Date(Date.now() + DURACION_SESION_MS);
  await db.delete(sesiones).where(lt(sesiones.expiraEn, new Date()));
  await db.insert(sesiones).values({ id: hashToken(token), usuarioId, expiraEn });
  (await cookies()).set(COOKIE_SESION, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiraEn,
  });
}

export async function cerrarSesion() {
  const almacen = await cookies();
  const token = almacen.get(COOKIE_SESION)?.value;
  if (token) await db.delete(sesiones).where(eq(sesiones.id, hashToken(token)));
  almacen.delete(COOKIE_SESION);
}

export const obtenerUsuario = cache(async (): Promise<UsuarioSesion | null> => {
  const token = (await cookies()).get(COOKIE_SESION)?.value;
  if (!token) return null;
  const [fila] = await db
    .select({
      id: usuarios.id,
      email: usuarios.email,
      nombre: usuarios.nombre,
      rol: usuarios.rol,
      especialidad: usuarios.especialidad,
      esAdmin: usuarios.esAdmin,
      empresaId: usuarios.empresaId,
      activo: usuarios.activo,
    })
    .from(sesiones)
    .innerJoin(usuarios, eq(sesiones.usuarioId, usuarios.id))
    .where(and(eq(sesiones.id, hashToken(token)), gt(sesiones.expiraEn, new Date())))
    .limit(1);
  if (!fila || !fila.activo) return null;
  return {
    id: fila.id,
    email: fila.email,
    nombre: fila.nombre,
    rol: fila.rol,
    especialidad: fila.especialidad,
    esAdmin: fila.esAdmin,
    empresaId: fila.empresaId,
  };
});

export async function requireRol<R extends Rol>(rol: R) {
  const usuario = await obtenerUsuario();
  if (!usuario) redirect("/login");
  if (usuario.rol !== rol) redirect(RUTA_INICIO[usuario.rol]);
  return usuario as UsuarioSesion & { rol: R };
}

export async function requireEmpresa() {
  const usuario = await requireRol("empresa");
  if (usuario.empresaId === null) redirect("/login");
  return { ...usuario, empresaId: usuario.empresaId };
}

export async function requireAdmin() {
  const usuario = await requireRol("staff");
  if (!usuario.esAdmin) redirect("/staff");
  return usuario;
}
