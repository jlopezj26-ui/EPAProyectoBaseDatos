import { useState } from "react";
import type { TbCategoriaProducto, TbCliente, TbEmpleado, TbProducto } from "../../types/database";
import { StatusBadge } from "../../components/StatusBadge";

interface CatalogsProps {
  productos: TbProducto[];
  categorias: TbCategoriaProducto[];
  clientes: TbCliente[];
  empleados: TbEmpleado[];
}

type CatalogTab = "productos" | "clientes" | "empleados";

export function Catalogs({ productos, categorias, clientes, empleados }: CatalogsProps) {
  const [tab, setTab] = useState<CatalogTab>("productos");
  const [query, setQuery] = useState("");

  const categoryName = (id: number) => categorias.find((c) => c.id_categoria === id)?.nombre_categoria ?? "Sin categoría";

  const filteredProducts = productos.filter((p) => p.nombre.toLowerCase().includes(query.toLowerCase()));
  const filteredClients = clientes.filter((c) => `${c.nombre} ${c.nit} ${c.dpi}`.toLowerCase().includes(query.toLowerCase()));
  const filteredEmployees = empleados.filter((e) => `${e.nombre} ${e.puesto}`.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm font-bold uppercase tracking-wider text-amber-600">Módulo 3</p>
        <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-900">Catálogos y Mantenimiento</h1>
        <p className="mt-2 text-sm text-slate-500">Administración de productos, clientes y empleados.</p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-panel">
        <div className="flex flex-wrap gap-2">
          {[
            ["productos", "Productos"],
            ["clientes", "Clientes"],
            ["empleados", "Empleados"]
          ].map(([value, label]) => (
            <button
              key={value}
              onClick={() => setTab(value as CatalogTab)}
              className={`rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                tab === value ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {label}
            </button>
          ))}
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar..."
            className="ml-auto min-w-52 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-amber-500 sm:max-w-xs"
          />
        </div>

        <div className="mt-5 overflow-x-auto">
          {tab === "productos" && (
            <table className="w-full min-w-[700px] text-left">
              <thead className="border-b border-slate-100 text-xs uppercase text-slate-400">
                <tr><th className="pb-3">Producto</th><th className="pb-3">Categoría</th><th className="pb-3">Precio</th><th className="pb-3 text-right">Estado</th></tr>
              </thead>
              <tbody>
                {filteredProducts.map((p) => (
                  <tr key={p.id_producto} className="border-b border-slate-50">
                    <td className="py-4"><p className="font-bold text-slate-800">{p.nombre}</p><p className="text-xs text-slate-400">{p.descripcion}</p></td>
                    <td className="py-4 text-sm text-slate-600">{categoryName(p.id_categoria)}</td>
                    <td className="py-4 font-bold">Q {p.precio_unitario.toFixed(2)}</td>
                    <td className="py-4 text-right"><StatusBadge value={p.estado} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {tab === "clientes" && (
            <table className="w-full min-w-[700px] text-left">
              <thead className="border-b border-slate-100 text-xs uppercase text-slate-400">
                <tr><th className="pb-3">Cliente</th><th className="pb-3">NIT</th><th className="pb-3">DPI</th><th className="pb-3">Contacto</th></tr>
              </thead>
              <tbody>
                {filteredClients.map((c) => (
                  <tr key={c.id_cliente} className="border-b border-slate-50">
                    <td className="py-4 font-bold text-slate-800">{c.nombre}</td>
                    <td className="py-4 text-sm">{c.nit}</td>
                    <td className="py-4 text-sm">{c.dpi}</td>
                    <td className="py-4 text-sm text-slate-500">{c.telefono || c.correo || "Sin contacto"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {tab === "empleados" && (
            <table className="w-full min-w-[600px] text-left">
              <thead className="border-b border-slate-100 text-xs uppercase text-slate-400">
                <tr><th className="pb-3">Empleado</th><th className="pb-3">Puesto</th><th className="pb-3">Sucursal</th><th className="pb-3">Ingreso</th></tr>
              </thead>
              <tbody>
                {filteredEmployees.map((e) => (
                  <tr key={e.id_empleado} className="border-b border-slate-50">
                    <td className="py-4 font-bold text-slate-800">{e.nombre}</td>
                    <td className="py-4 text-sm"><StatusBadge value={e.puesto} /></td>
                    <td className="py-4 text-sm text-slate-500">{e.id_sucursal}</td>
                    <td className="py-4 text-sm text-slate-500">{e.fecha_ingreso}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}
