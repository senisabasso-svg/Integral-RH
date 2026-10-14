import { and, eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BotonEnviar } from "@/components/formulario";
import { Aviso, BotonLink, Etiqueta } from "@/components/ui";
import { db } from "@/db";
import { empresas, postulaciones, procesos } from "@/db/schema";
import { postularme } from "@/lib/acciones/candidato";
import { obtenerUsuario } from "@/lib/auth";
import { empresaVisible, MODALIDAD_LABEL } from "@/lib/dominio";
import { formatFecha } from "@/lib/utils";

export default async function EmpleoPage({ params }: { params: Promise<{ id: string }> }) {
  const procesoId = Number((await params).id);
  if (!Number.isInteger(procesoId)) notFound();

  const [busqueda] = await db
    .select({
      id: procesos.id,
      titulo: procesos.titulo,
      descripcion: procesos.descripcion,
      requisitos: procesos.requisitos,
      modalidad: procesos.modalidad,
      ubicacion: procesos.ubicacion,
      vacantes: procesos.vacantes,
      creadoEn: procesos.creadoEn,
      mostrarEmpresa: procesos.mostrarEmpresa,
      razonSocial: empresas.razonSocial,
      sector: empresas.sector,
    })
    .from(procesos)
    .innerJoin(empresas, eq(procesos.empresaId, empresas.id))
    .where(and(eq(procesos.id, procesoId), eq(procesos.estado, "publicado")));
  if (!busqueda) notFound();

  const usuario = await obtenerUsuario();
  let yaPostulado = false;
  if (usuario?.rol === "candidato") {
    const [existente] = await db
      .select({ id: postulaciones.id })
      .from(postulaciones)
      .where(and(eq(postulaciones.procesoId, procesoId), eq(postulaciones.candidatoId, usuario.id)));
    yaPostulado = Boolean(existente);
  }
  const requisitos = busqueda.requisitos.split("\n").map((r) => r.trim()).filter(Boolean);
  const destino = encodeURIComponent(`/empleos/${procesoId}`);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <Link href="/empleos" className="text-sm text-marca-600 hover:underline">
        ← Todos los empleos
      </Link>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight">{busqueda.titulo}</h1>
      <p className="mt-1 text-slate-500">{empresaVisible(busqueda)}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Etiqueta tono="azul">{MODALIDAD_LABEL[busqueda.modalidad]}</Etiqueta>
        <Etiqueta>{busqueda.ubicacion}</Etiqueta>
        <Etiqueta>
          {busqueda.vacantes} {busqueda.vacantes === 1 ? "vacante" : "vacantes"}
        </Etiqueta>
      </div>

      <section className="mt-8">
        <h2 className="font-semibold">Descripción del puesto</h2>
        <p className="mt-2 whitespace-pre-line text-slate-700">{busqueda.descripcion}</p>
      </section>
      {requisitos.length > 0 && (
        <section className="mt-6">
          <h2 className="font-semibold">Requisitos</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-slate-700">
            {requisitos.map((requisito) => (
              <li key={requisito}>{requisito}</li>
            ))}
          </ul>
        </section>
      )}
      <p className="mt-6 text-sm text-slate-400">Publicada el {formatFecha(busqueda.creadoEn)}</p>

      <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-6">
        {!usuario && (
          <div className="flex flex-wrap items-center gap-3">
            <BotonLink href={`/registro/candidato?next=${destino}`}>Postularme</BotonLink>
            <BotonLink href={`/login?next=${destino}`} variante="secundario">
              Ya tengo cuenta
            </BotonLink>
          </div>
        )}
        {usuario?.rol === "candidato" &&
          (yaPostulado ? (
            <Aviso tono="verde">
              Ya te postulaste a esta búsqueda.{" "}
              <Link href="/candidato/postulaciones" className="font-medium underline">
                Ver mis postulaciones
              </Link>
            </Aviso>
          ) : (
            <form action={postularme}>
              <input type="hidden" name="procesoId" value={busqueda.id} />
              <BotonEnviar textoPendiente="Enviando…">Postularme</BotonEnviar>
            </form>
          ))}
        {usuario && usuario.rol !== "candidato" && (
          <p className="text-sm text-slate-600">
            Ingresaste con una cuenta de {usuario.rol}. Para postularte necesitás una cuenta de
            candidato.
          </p>
        )}
      </div>
    </div>
  );
}
