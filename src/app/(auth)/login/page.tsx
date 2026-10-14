import Link from "next/link";
import { redirect } from "next/navigation";
import { obtenerUsuario, RUTA_INICIO } from "@/lib/auth";
import { FormLogin } from "./form-login";

export const metadata = { title: "Ingresar" };

const CUENTAS_DEMO = [
  { rol: "Staff (administración)", email: "staff@integralrh.test" },
  { rol: "Empresa", email: "empresa@integralrh.test" },
  { rol: "Candidato", email: "candidato@integralrh.test" },
];

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const usuario = await obtenerUsuario();
  if (usuario) redirect(RUTA_INICIO[usuario.rol]);

  const { next } = await searchParams;
  const destino = typeof next === "string" ? next : undefined;
  const sufijo = destino ? `?next=${encodeURIComponent(destino)}` : "";
  const mostrarDemo = process.env.NODE_ENV !== "production" || process.env.MOSTRAR_DEMO === "1";

  return (
    <>
      <h1 className="text-xl font-semibold text-slate-900">Ingresá a tu cuenta</h1>
      <p className="mt-1 text-sm text-slate-500">Para empresas, candidatos y equipo interno.</p>
      <FormLogin next={destino} />
      <p className="mt-6 text-center text-sm text-slate-500">
        ¿No tenés cuenta?{" "}
        <Link href={`/registro/candidato${sufijo}`} className="font-medium text-marca-600 hover:underline">
          Soy candidato
        </Link>{" "}
        ·{" "}
        <Link href="/registro/empresa" className="font-medium text-marca-600 hover:underline">
          Soy empresa
        </Link>
      </p>
      {mostrarDemo && (
        <div className="mt-6 border-t border-slate-100 pt-5">
          <p className="text-xs font-medium text-slate-500">
            Cuentas de demostración (contraseña: demo1234)
          </p>
          <ul className="mt-2 space-y-1.5 text-xs text-slate-600">
            {CUENTAS_DEMO.map((cuenta) => (
              <li
                key={cuenta.email}
                className="flex justify-between gap-3 rounded bg-slate-50 px-3 py-1.5"
              >
                <span>{cuenta.rol}</span>
                <span className="font-mono">{cuenta.email}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
