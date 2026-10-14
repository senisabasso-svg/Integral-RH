"use client";

import type { ComponentProps } from "react";
import { useFormStatus } from "react-dom";
import { Aviso, Boton } from "@/components/ui";
import type { EstadoFormulario } from "@/lib/formularios";

export function BotonEnviar({
  children,
  textoPendiente = "Guardando…",
  disabled,
  ...props
}: ComponentProps<typeof Boton> & { textoPendiente?: string }) {
  const { pending } = useFormStatus();
  return (
    <Boton type="submit" disabled={pending || disabled} {...props}>
      {pending ? textoPendiente : children}
    </Boton>
  );
}

export function AvisoFormulario({ estado }: { estado: EstadoFormulario }) {
  if (estado?.error) return <Aviso tono="rojo">{estado.error}</Aviso>;
  if (estado?.mensaje) return <Aviso tono="verde">{estado.mensaje}</Aviso>;
  return null;
}
