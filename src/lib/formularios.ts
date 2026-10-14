import type { z } from "zod";

export type EstadoFormulario =
  | {
      ok?: boolean;
      mensaje?: string;
      error?: string;
      errores?: Record<string, string>;
      valores?: Record<string, string>;
    }
  | undefined;

export function valoresDe(formData: FormData) {
  const valores: Record<string, string> = {};
  for (const [clave, valor] of formData.entries()) {
    if (typeof valor === "string" && !clave.toLowerCase().includes("password")) {
      valores[clave] = valor;
    }
  }
  return valores;
}

export function erroresDe(error: z.ZodError) {
  const errores: Record<string, string> = {};
  for (const issue of error.issues) {
    const campo = String(issue.path[0] ?? "");
    if (campo && !errores[campo]) errores[campo] = issue.message;
  }
  return errores;
}

export function fallo(formData: FormData, error: z.ZodError): EstadoFormulario {
  return {
    error: "Revisá los campos marcados.",
    errores: erroresDe(error),
    valores: valoresDe(formData),
  };
}

export function idDe(formData: FormData, campo = "id") {
  const id = Number(formData.get(campo));
  if (!Number.isInteger(id) || id <= 0) throw new Error(`Identificador inválido: ${campo}`);
  return id;
}
