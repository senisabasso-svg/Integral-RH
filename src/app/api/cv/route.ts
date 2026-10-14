import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { eq } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/db";
import { perfilesCandidato } from "@/db/schema";
import { CARPETA_CV, MAXIMO_CV_BYTES } from "@/lib/archivos";
import { obtenerUsuario } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const usuario = await obtenerUsuario();
  if (usuario?.rol !== "candidato") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const volver = (estado: string) =>
    NextResponse.redirect(new URL(`/candidato/perfil?cv=${estado}`, request.url), 303);

  const archivo = (await request.formData()).get("cv");
  if (!(archivo instanceof File) || archivo.size === 0) return volver("vacio");
  if (archivo.size > MAXIMO_CV_BYTES) return volver("grande");
  const contenido = Buffer.from(await archivo.arrayBuffer());
  if (contenido.subarray(0, 5).toString("latin1") !== "%PDF-") return volver("formato");

  const nombreArchivo = `${usuario.id}-${Date.now()}.pdf`;
  await mkdir(CARPETA_CV, { recursive: true });
  await writeFile(path.join(CARPETA_CV, nombreArchivo), contenido);

  const [anterior] = await db
    .select({ cvArchivo: perfilesCandidato.cvArchivo })
    .from(perfilesCandidato)
    .where(eq(perfilesCandidato.usuarioId, usuario.id));
  const cambios = {
    cvArchivo: nombreArchivo,
    cvNombre: archivo.name.slice(0, 200),
    actualizadoEn: new Date(),
  };
  await db
    .insert(perfilesCandidato)
    .values({ usuarioId: usuario.id, ...cambios })
    .onConflictDoUpdate({ target: perfilesCandidato.usuarioId, set: cambios });
  if (anterior?.cvArchivo) {
    await unlink(path.join(CARPETA_CV, path.basename(anterior.cvArchivo))).catch(() => {});
  }
  return volver("ok");
}
