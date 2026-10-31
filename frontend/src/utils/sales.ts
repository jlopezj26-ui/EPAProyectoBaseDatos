import type { TbEncabezadoVenta } from "../types/database";

export function isCompletedSale(sale: TbEncabezadoVenta): boolean {
  const status = sale.estado.trim().toUpperCase();
  return status === "COMPLETADA" || status === "PAGADA";
}

export function isTodaySale(sale: TbEncabezadoVenta): boolean {
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Guatemala",
  }).format(new Date());
  return sale.fecha_venta.slice(0, 10) === today;
}
