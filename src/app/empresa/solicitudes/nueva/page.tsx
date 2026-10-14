import { EncabezadoPagina, Tarjeta } from "@/components/ui";
import { requireEmpresa } from "@/lib/auth";
import { TIPOS_SOLICITUD, type TipoSolicitud } from "@/lib/dominio";
import { FormSolicitud } from "./form-solicitud";

export const metadata = { title: "Nueva solicitud" };

export default async function NuevaSolicitudPage({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string }>;
}) {
  await requireEmpresa();
  const { tipo } = await searchParams;
  const tipoInicial = TIPOS_SOLICITUD.find((t) => t === tipo) as TipoSolicitud | undefined;

  return (
    <>
      <EncabezadoPagina
        titulo="Nueva solicitud"
        descripcion="Contanos qué necesitás y asignamos al profesional indicado."
        volver={{ href: "/empresa/solicitudes", texto: "Solicitudes" }}
      />
      <Tarjeta className="max-w-3xl">
        <FormSolicitud tipoInicial={tipoInicial} />
      </Tarjeta>
    </>
  );
}
