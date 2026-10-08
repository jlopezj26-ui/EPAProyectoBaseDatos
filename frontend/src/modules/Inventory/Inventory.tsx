import { useMemo, useState } from "react";
import type { MovimientoInventario, TbInventario, TbProducto, TbSucursal } from "../../types/database";
import { StatusBadge } from "../../components/StatusBadge";

interface InventoryProps {
  inventario: TbInventario[];
  movimientos: MovimientoInventario[];
  productos: TbProducto[];
  sucursales: TbSucursal[];
  sucursalId: number;
}

export function Inventory({ inventario, movimientos, productos, sucursales, sucursalId }: InventoryProps) {
  const [selectedSucursal, setSelectedSucursal] = useState(sucursalId);
  const [filter, setFilter] = useState("");

  const rows = useMemo(
    () =>
      inventario.filter((item) => {
        const product = productos.find((p) => p.id_producto === item.id_producto);
        return item.id_sucursal === selectedSucursal &&
          `${product?.nombre ?? ""}`.toLowerCase().includes(filter.toLowerCase());
      }),
    [inventario, productos, selectedSucursal, filter]
  );

  const getProduct = (id: number) => productos.find((p) => p.id_producto === id)?.nombre ?? "Producto";
  const getBranch = (id: number) => sucursales.find((s) => s.id_sucursal === id)?.nombre ?? "Sucursal";

  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm font-bold uppercase tracking-wider text-amber-600">Módulo 2</p>
        <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-900">Control de Inventario</h1>
        <p className="mt-2 text-sm text-slate-500">Existencias por sucursal, mínimos y movimientos.</p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-panel">
        <div className="grid gap-3 md:grid-cols-[1fr_1fr]">
          <select
            value={selectedSucursal}
            onChange={(e) => setSelectedSucursal(Number(e.target.value))}
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none focus:border-amber-500"
          >
            {sucursales.map((sucursal) => (
              <option key={sucursal.id_sucursal} value={sucursal.id_sucursal}>{sucursal.nombre}</option>
            ))}
          </select>

          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filtrar producto..."
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-amber-500"
          />
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-panel">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left">
            <thead className="bg-slate-950 text-xs uppercase tracking-wider text-slate-300">
              <tr>
                <th className="px-5 py-4">Producto</th>
                <th className="px-5 py-4">Sucursal</th>
                <th className="px-5 py-4 text-center">Stock</th>
                <th className="px-5 py-4 text-center">Mínimo</th>
                <th className="px-5 py-4">Actualización</th>
                <th className="px-5 py-4 text-right">Estado</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((item) => {
                const low = item.stock <= item.stock_minimo;
                return (
                  <tr key={item.id_inventario} className="border-b border-slate-100 last:border-0">
                    <td className="px-5 py-4 font-bold text-slate-800">{getProduct(item.id_producto)}</td>
                    <td className="px-5 py-4 text-sm text-slate-500">{getBranch(item.id_sucursal)}</td>
                    <td className={`px-5 py-4 text-center text-lg font-black ${low ? "text-red-600" : "text-slate-800"}`}>{item.stock}</td>
                    <td className="px-5 py-4 text-center text-sm text-slate-500">{item.stock_minimo}</td>
                    <td className="px-5 py-4 text-xs text-slate-500">{item.fecha_actualizacion}</td>
                    <td className="px-5 py-4 text-right">
                      <StatusBadge value={low ? "STOCK BAJO" : "NORMAL"} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-panel">
        <h2 className="font-black text-slate-900">Movimientos recientes</h2>
        <div className="mt-4 space-y-3">
          {movimientos.filter((m) => m.id_sucursal === selectedSucursal).map((movement) => (
            <div key={movement.id_movimiento} className="flex flex-col gap-2 rounded-xl bg-slate-50 p-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-bold text-slate-800">{getProduct(movement.id_producto)}</p>
                <p className="text-xs text-slate-500">{movement.fecha_movimiento} · {movement.observacion}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-black">{movement.cantidad}</span>
                <StatusBadge value={movement.tipo_movimiento} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
