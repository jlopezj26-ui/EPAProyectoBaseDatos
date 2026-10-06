import type { TbEncabezadoVenta, TbInventario, TbProducto, TbSucursal } from "../../types/database";

interface ReportsProps {
  ventas: TbEncabezadoVenta[];
  productos: TbProducto[];
  inventario: TbInventario[];
  sucursales: TbSucursal[];
}

export function Reports({ ventas, productos, inventario, sucursales }: ReportsProps) {
  const currency = new Intl.NumberFormat("es-GT", { style: "currency", currency: "GTQ" });

  const byBranch = sucursales.map((sucursal) => {
    const branchSales = ventas.filter((v) => v.id_sucursal === sucursal.id_sucursal && v.estado === "COMPLETADA");
    return {
      ...sucursal,
      count: branchSales.length,
      total: branchSales.reduce((sum, v) => sum + v.total_venta, 0)
    };
  });

  const maxBranch = Math.max(...byBranch.map((b) => b.total), 1);

  const soldProductIds = new Set<number>(
    inventario
      .filter((item) => item.stock < item.stock_minimo)
      .map((item) => item.id_producto)
  );

  const noMovement = productos.filter((product) => !soldProductIds.has(product.id_producto));

  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm font-bold uppercase tracking-wider text-amber-600">Módulo 4</p>
        <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-900">Reportes y Analítica</h1>
        <p className="mt-2 text-sm text-slate-500">Indicadores para ventas, sucursales y comportamiento del catálogo.</p>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-panel">
          <h2 className="font-black text-slate-900">Ventas por sucursal</h2>
          <p className="mt-1 text-xs text-slate-500">Comparación de ingresos registrados.</p>

          <div className="mt-6 space-y-5">
            {byBranch.map((branch) => (
              <div key={branch.id_sucursal}>
                <div className="mb-2 flex justify-between gap-3 text-sm">
                  <span className="truncate font-semibold text-slate-700">{branch.nombre}</span>
                  <span className="font-black">{currency.format(branch.total)}</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-amber-500 transition-all"
                    style={{ width: `${(branch.total / maxBranch) * 100}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-slate-400">{branch.count} factura(s)</p>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-panel">
          <h2 className="font-black text-slate-900">Resumen de ventas</h2>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[500px] text-left">
              <thead className="border-b border-slate-100 text-xs uppercase text-slate-400">
                <tr><th className="pb-3">Factura</th><th className="pb-3">Sucursal</th><th className="pb-3">Fecha</th><th className="pb-3 text-right">Total</th></tr>
              </thead>
              <tbody>
                {ventas.map((sale) => (
                  <tr key={sale.id_venta} className="border-b border-slate-50">
                    <td className="py-4 font-bold">#{sale.id_venta}</td>
                    <td className="py-4 text-sm text-slate-500">{sucursales.find((s) => s.id_sucursal === sale.id_sucursal)?.nombre}</td>
                    <td className="py-4 text-xs text-slate-500">{sale.fecha_venta}</td>
                    <td className="py-4 text-right font-bold">{currency.format(sale.total_venta)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-panel">
        <h2 className="font-black text-slate-900">Artículos para revisar</h2>
        <p className="mt-1 text-xs text-slate-500">
          La lógica de demostración identifica productos cuyo inventario está en nivel mínimo. En producción, este reporte debe calcularse con los movimientos de inventario y el detalle de ventas.
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {noMovement.map((product) => (
            <div key={product.id_producto} className="rounded-xl border border-slate-200 p-4">
              <p className="text-xs font-bold text-slate-400">ID {product.id_producto}</p>
              <p className="mt-1 font-bold text-slate-800">{product.nombre}</p>
              <p className="mt-2 text-xs text-slate-500">Q {product.precio_unitario.toFixed(2)}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
