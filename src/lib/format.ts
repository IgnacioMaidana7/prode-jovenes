import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

export function formatMatchDate(iso: string): string {
  try {
    return format(parseISO(iso), "d MMM", { locale: es }).toUpperCase();
  } catch {
    return iso;
  }
}

export function formatMatchTime(iso: string): string {
  try {
    return format(parseISO(iso), "HH:mm 'HS'", { locale: es });
  } catch {
    return iso;
  }
}

export function formatPoints(n: number): string {
  return new Intl.NumberFormat("es-AR").format(n);
}

export function formatOrdinal(n: number): string {
  return `${n}º`;
}
