import { z } from "zod";

z.config(z.locales.es());

export { z };

export const textoRequerido = (mensaje = "Este campo es obligatorio.") =>
  z.string().trim().min(1, mensaje);

export const textoOpcional = z
  .string()
  .trim()
  .optional()
  .transform((valor) => (valor ? valor : null));

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email("Ingresá un email válido."));

export const passwordNueva = z
  .string()
  .min(8, "La contraseña debe tener al menos 8 caracteres.");

export const rutSchema = z
  .string()
  .transform((valor) => valor.replace(/\D/g, ""))
  .pipe(z.string().length(12, "El RUT debe tener 12 dígitos."));
