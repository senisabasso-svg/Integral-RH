import Link from "next/link";
import { redirect } from "next/navigation";
import { obtenerUsuario, RUTA_INICIO } from "@/lib/auth";
import { FormRegistroEmpresa } from "./form-registro-empresa";

export const metadata = { title: "Crear cuenta de empresa" };

export default async function RegistroEmpresaPage() {
  const usuario = await obtenerUsuario();
  if (usuario) redirect(RUTA_INICIO[usuario.rol]);

  return (
    <>
      <h1 className="text-xl font-semibold text-slate-900">Cuenta de empresa</h1>
      <p className="mt-1 text-sm text-slate-500">
        Solicitá servicios y seguí tus búsquedas desde un solo lugar.
      </p>
      <FormRegistroEmpresa />
      <p className="mt-6 text-center text-sm text-slate-500">
        ¿Ya tenés cuenta?{" "}
        <Link href="/login" className="font-medium text-marca-600 hover:underline">
          Ingresá
        </Link>
      </p>
    </>
  );
}
