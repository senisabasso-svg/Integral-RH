import Link from "next/link";
import { redirect } from "next/navigation";
import { obtenerUsuario, RUTA_INICIO } from "@/lib/auth";
import { FormRegistroCandidato } from "./form-registro-candidato";

export const metadata = { title: "Crear perfil de candidato" };

export default async function RegistroCandidatoPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const usuario = await obtenerUsuario();
  if (usuario) redirect(RUTA_INICIO[usuario.rol]);
  const { next } = await searchParams;
  const destino = typeof next === "string" ? next : undefined;

  return (
    <>
      <h1 className="text-xl font-semibold text-slate-900">Creá tu perfil</h1>
      <p className="mt-1 text-sm text-slate-500">
        Postulate a búsquedas y seguí tu proceso de selección.
      </p>
      <FormRegistroCandidato next={destino} />
      <p className="mt-6 text-center text-sm text-slate-500">
        ¿Ya tenés cuenta?{" "}
        <Link
          href={destino ? `/login?next=${encodeURIComponent(destino)}` : "/login"}
          className="font-medium text-marca-600 hover:underline"
        >
          Ingresá
        </Link>
      </p>
    </>
  );
}
