const ZONA_HORARIA = "America/Montevideo";

export function cn(...clases: (string | false | null | undefined)[]) {
  return clases.filter(Boolean).join(" ");
}

export function formatFecha(fecha: Date | number) {
  return new Intl.DateTimeFormat("es-UY", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: ZONA_HORARIA,
  }).format(fecha);
}

export function formatFechaHora(fecha: Date | number) {
  return new Intl.DateTimeFormat("es-UY", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: ZONA_HORARIA,
  }).format(fecha);
}

export function formatHora(fecha: Date | number) {
  return new Intl.DateTimeFormat("es-UY", {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: ZONA_HORARIA,
  }).format(fecha);
}

export function formatDiaLargo(fecha: Date | number) {
  return new Intl.DateTimeFormat("es-UY", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: ZONA_HORARIA,
  }).format(fecha);
}

export function claveDia(fecha: Date | number) {
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: ZONA_HORARIA,
  }).format(fecha);
}

export function claveDiaDesdeHoy(dias: number) {
  return claveDia(Date.now() + dias * 24 * 60 * 60 * 1000);
}

// Uruguay usa UTC-3 todo el año (sin horario de verano desde 2015).
export function parseFechaHoraLocal(valor: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(valor)) return null;
  const fecha = new Date(`${valor}:00-03:00`);
  return Number.isNaN(fecha.getTime()) ? null : fecha;
}

export function iniciales(nombre: string) {
  return nombre
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0]!.toUpperCase())
    .join("");
}
