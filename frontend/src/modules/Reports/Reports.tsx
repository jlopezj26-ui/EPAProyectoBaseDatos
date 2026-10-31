import { useMemo, useState } from "react";
import type { TbEncabezadoVenta, TbInventario, TbProducto, TbSucursal } from "../../types/database";
import { isCompletedSale } from "../../utils/sales";
import { compareValues, toggleSort, type SortState } from "../../utils/sorting";

interface ReportsProps {
  ventas: TbEncabezadoVenta[];
  productos: TbProducto[];
  inventario: TbInventario[];
  sucursales: TbSucursal[];
}

export function Reports({ ventas, productos, inventario, sucursales }: ReportsProps) {
  const currency = new Intl.NumberFormat("es-GT", { style: "currency", currency: "GTQ" });
  const [sort, setSort] = useState<SortState>({ key: "id_venta", direction: "desc" });

  const byBranch = sucursales.map((sucursal) => {
    const branchSales = ventas.filter((v) => v.id_sucursal === sucursal.id_sucursal && isCompletedSale(v));
    return {
      ...sucursal,
      count: branchSales.length,
      total: branchSales.reduce((sum, v) => sum + v.total_venta, 0)
    };
  });

  const maxBranch = Math.max(...byBranch.map((b) => b.total), 1);
  const totalSales = byBranch.reduce((sum, branch) => sum + branch.total, 0);
  const pieColors = ["#10b981", "#0ea5e9", "#8b5cf6", "#f97316", "#ef4444", "#14b8a6", "#eab308", "#ec4899"];
  let pieStart = 0;
  const pieSegments = byBranch.map((branch, index) => {
    const percentage = totalSales ? (branch.total / totalSales) * 100 : 0;
    const segment = `${pieColors[index % pieColors.length]} ${pieStart}% ${pieStart + percentage}%`;
    pieStart += percentage;
    return { ...branch, percentage, segment };
  });
  const stockByBranch = sucursales.map((sucursal) => ({
    ...sucursal,
    stock: inventario
      .filter((item) => item.id_sucursal === sucursal.id_sucursal)
      .reduce((sum, item) => sum + item.stock, 0),
  }));
  const maxStock = Math.max(...stockByBranch.map((branch) => branch.stock), 1);

  const soldProductIds = new Set<number>(
    inventario
      .filter((item) => item.stock < item.stock_minimo)
      .map((item) => item.id_producto)
  );

  const noMovement = productos.filter((product) => !soldProductIds.has(product.id_producto));
  const sortedSales = useMemo(() => [...ventas].sort((a, b) => {
    const result = compareValues(a[sort.key as keyof TbEncabezadoVenta], b[sort.key as keyof TbEncabezadoVenta]);
    return sort.direction === "asc" ? result : -result;
  }), [sort, ventas]);
  const sortButton = (key: string, label: string) => (
    <button type="button" onClick={() => setSort((current) => toggleSort(current, key))} className="font-inherit">
      {label} {sort.key === key ? (sort.direction === "asc" ? "↑" : "↓") : "↕"}
    </button>
  );

  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm font-bold uppercase tracking-wider text-emerald-600">Módulo 4</p>
        <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-900">Reportes y Analítica</h1>
        <p className="mt-2 text-sm text-slate-500">Indicadores para ventas, sucursales y comportamiento del catálogo.</p>
      </section>

      <section className="grid items-start grid-cols-1 gap-4 xl:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-panel">
          <h2 className="font-black text-slate-900">Ventas por sucursal</h2>
          <p className="mt-1 text-xs text-slate-500">Comparación de ingresos registrados.</p>

          <div className="mt-4 max-h-64 space-y-3 overflow-y-auto pr-1">
            {byBranch.map((branch) => (
              <div key={branch.id_sucursal}>
                <div className="mb-1 flex justify-between gap-3 text-sm">
                  <span className="truncate font-semibold text-slate-700">{branch.nombre}</span>
                  <span className="font-black">{currency.format(branch.total)}</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all"
                    style={{ width: `${(branch.total / maxBranch) * 100}%` }}
                  />
                </div>
                <p className="mt-0.5 text-[11px] text-slate-400">{branch.count} venta(s)</p>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-panel">
          <h2 className="font-black text-slate-900">Resumen de ventas</h2>
          <p className="mt-1 text-xs text-slate-500">Últimas ventas registradas.</p>
          <div className="mt-3 max-h-64 overflow-auto">
            <table className="w-full min-w-[500px] text-left">
              <thead className="sticky top-0 border-b border-slate-100 bg-white text-xs uppercase text-slate-400">
                <tr><th className="pb-2">{sortButton("id_venta", "Venta")}</th><th className="pb-2">{sortButton("id_sucursal", "Sucursal")}</th><th className="pb-2">{sortButton("fecha_venta", "Fecha")}</th><th className="pb-2 text-right">{sortButton("total_venta", "Total")}</th></tr>
              </thead>
              <tbody>
                {sortedSales.map((sale) => (
                  <tr key={sale.id_venta} className="border-b border-slate-50">
                    <td className="py-2.5 font-bold">#{sale.id_venta}</td>
                    <td className="max-w-40 truncate py-2.5 text-sm text-slate-500">{sucursales.find((s) => s.id_sucursal === sale.id_sucursal)?.nombre}</td>
                    <td className="py-2.5 text-xs text-slate-500">{sale.fecha_venta}</td>
                    <td className="py-2.5 text-right font-bold">{currency.format(sale.total_venta)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </section>

      <section className="grid items-start grid-cols-1 gap-4 xl:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-panel">
          <h2 className="font-black text-slate-900">Distribución de ventas</h2>
          <p className="mt-1 text-xs text-slate-500">Participación de cada sucursal en los ingresos registrados.</p>
          <div className="mt-4 flex flex-col items-center gap-4 sm:flex-row sm:items-center">
            <div
              className="h-40 w-40 shrink-0 rounded-full"
              style={{
                background: totalSales
                  ? `conic-gradient(${pieSegments.map((segment) => segment.segment).join(", ")})`
                  : "#e2e8f0",
              }}
              aria-label="Gráfica circular de ventas por sucursal"
              role="img"
            >
              <div className="m-6 flex h-28 w-28 items-center justify-center rounded-full bg-white text-center shadow-inner">
                <div>
                  <p className="text-xs text-slate-400">Total</p>
                  <p className="font-black text-slate-900">{currency.format(totalSales)}</p>
                </div>
              </div>
            </div>
            <div className="max-h-40 w-full space-y-2 overflow-y-auto pr-1">
              {pieSegments.map((branch, index) => (
                <div key={branch.id_sucursal} className="flex items-center justify-between gap-3 text-sm">
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: pieColors[index % pieColors.length] }} />
                    <span className="truncate text-slate-600">{branch.nombre}</span>
                  </span>
                  <span className="font-bold text-slate-800">{branch.percentage.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-panel">
          <h2 className="font-black text-slate-900">Stock por sucursal</h2>
          <p className="mt-1 text-xs text-slate-500">Comparación de unidades disponibles en inventario.</p>
          <div className="mt-4 max-h-64 space-y-3 overflow-y-auto pr-1">
            {stockByBranch.map((branch) => (
              <div key={branch.id_sucursal}>
                <div className="mb-1 flex justify-between gap-3 text-sm">
                  <span className="truncate font-semibold text-slate-700">{branch.nombre}</span>
                  <span className="font-black text-slate-900">{branch.stock.toLocaleString("es-GT")}</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all"
                    style={{ width: `${(branch.stock / maxStock) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-panel">
        <h2 className="font-black text-slate-900">Artículos para revisar</h2>
        <p className="mt-1 text-xs text-slate-500">
          La lógica de demostración identifica productos cuyo inventario está en nivel mínimo. En producción, este reporte debe calcularse con los movimientos de inventario y el detalle de ventas.
        </p>

        <div className="mt-4 max-h-48 overflow-y-auto pr-1">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {noMovement.map((product) => (
            <div key={product.id_producto} className="rounded-xl border border-slate-200 p-4">
              <p className="text-xs font-bold text-slate-400">ID {product.id_producto}</p>
              <p className="mt-1 font-bold text-slate-800">{product.nombre}</p>
              <p className="mt-2 text-xs text-slate-500">Q {product.precio_unitario.toFixed(2)}</p>
            </div>
          ))}
          </div>
        </div>
      </section>
    </div>
  );
}
