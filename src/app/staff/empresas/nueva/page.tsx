import { EncabezadoPagina, Tarjeta } from "@/components/ui";
import { requireRol } from "@/lib/auth";
import { FormEmpresa } from "./form-empresa";

export const metadata = { title: "Nueva empresa" };

export default async function NuevaEmpresaPage() {
  await requireRol("staff");
  return (
    <>
      <EncabezadoPagina
        titulo="Nueva empresa"
        descripcion="Se crea la empresa y un usuario para su contacto principal."
        volver={{ href: "/staff/empresas", texto: "Empresas" }}
      />
      <Tarjeta className="max-w-3xl">
        <FormEmpresa />
      </Tarjeta>
    </>
  );
}
