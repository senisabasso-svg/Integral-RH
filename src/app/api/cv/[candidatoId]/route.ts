import { readFile } from "node:fs/promises";
import path from "node:path";
import { eq } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/db";
import { perfilesCandidato } from "@/db/schema";
import { CARPETA_CV, puedeVerCv } from "@/lib/archivos";
import { obtenerUsuario } from "@/lib/auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ candidatoId: string }> },
) {
  const usuario = await obtenerUsuario();
  if (!usuario) return new NextResponse("No autorizado", { status: 401 });

  const candidatoId = Number((await params).candidatoId);
  if (!Number.isInteger(candidatoId)) return new NextResponse("No encontrado", { status: 404 });
  if (!(await puedeVerCv(usuario, candidatoId))) {
    return new NextResponse("No autorizado", { status: 403 });
  }

  const [perfil] = await db
    .select({ cvArchivo: perfilesCandidato.cvArchivo, cvNombre: perfilesCandidato.cvNombre })
    .from(perfilesCandidato)
    .where(eq(perfilesCandidato.usuarioId, candidatoId));
  if (!perfil?.cvArchivo) return new NextResponse("No encontrado", { status: 404 });

  const contenido = await readFile(path.join(CARPETA_CV, path.basename(perfil.cvArchivo))).catch(
    () => null,
  );
  if (!contenido) return new NextResponse("No encontrado", { status: 404 });

  const nombre = encodeURIComponent(perfil.cvNombre ?? "cv.pdf");
  return new NextResponse(new Uint8Array(contenido), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename*=UTF-8''${nombre}`,
      "Cache-Control": "private, no-store",
    },
  });
}
