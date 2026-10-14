import { eq } from "drizzle-orm";
import { Aviso, Boton, EncabezadoPagina, Tarjeta } from "@/components/ui";
import { db } from "@/db";
import { perfilesCandidato } from "@/db/schema";
import { requireRol } from "@/lib/auth";
import { formatFecha } from "@/lib/utils";
import { FormPerfil } from "./form-perfil";

export const metadata = { title: "Mi perfil" };

const MENSAJES_CV: Record<string, { tono: "verde" | "rojo"; texto: string }> = {
  ok: { tono: "verde", texto: "CV actualizado." },
  vacio: { tono: "rojo", texto: "Elegí un archivo PDF." },
  grande: { tono: "rojo", texto: "El archivo supera los 5 MB." },
  formato: { tono: "rojo", texto: "El archivo tiene que ser un PDF." },
};

export default async function PerfilPage({
  searchParams,
}: {
  searchParams: Promise<{ cv?: string }>;
}) {
  const usuario = await requireRol("candidato");
  const [perfil] = await db
    .select()
    .from(perfilesCandidato)
    .where(eq(perfilesCandidato.usuarioId, usuario.id));
  const { cv } = await searchParams;
  const mensajeCv = cv ? MENSAJES_CV[cv] : undefined;

  return (
    <>
      <EncabezadoPagina
        titulo="Mi perfil"
        descripcion="Estos datos los ve el equipo de selección y, si avanzás en un proceso, la empresa."
      />
      <div className="grid gap-6 lg:grid-cols-3">
        <Tarjeta titulo="Datos personales y profesionales" className="lg:col-span-2">
          <FormPerfil nombre={usuario.nombre} perfil={perfil ?? null} />
        </Tarjeta>
        <Tarjeta titulo="Currículum (CV)">
          <div className="space-y-4">
            {mensajeCv && <Aviso tono={mensajeCv.tono}>{mensajeCv.texto}</Aviso>}
            {perfil?.cvArchivo ? (
              <p className="text-sm text-slate-600">
                Archivo actual:{" "}
                <a
                  href={`/api/cv/${usuario.id}`}
                  target="_blank"
                  className="font-medium text-marca-600 hover:underline"
                >
                  {perfil.cvNombre ?? "cv.pdf"}
                </a>
                <span className="block text-xs text-slate-400">
                  Actualizado el {formatFecha(perfil.actualizadoEn)}
                </span>
              </p>
            ) : (
              <p className="text-sm text-slate-500">Todavía no subiste tu CV.</p>
            )}
            <form action="/api/cv" method="post" encType="multipart/form-data" className="space-y-3">
              <input
                type="file"
                name="cv"
                accept="application/pdf"
                required
                className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-marca-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-marca-700 hover:file:bg-marca-100"
              />
              <Boton type="submit" variante="secundario">
                {perfil?.cvArchivo ? "Reemplazar CV" : "Subir CV"}
              </Boton>
            </form>
            <p className="text-xs text-slate-500">Formato PDF, hasta 5 MB.</p>
          </div>
        </Tarjeta>
      </div>
    </>
  );
}
