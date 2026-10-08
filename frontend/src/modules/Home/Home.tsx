import { MetricCard } from "../../components/MetricCard";
import type { TbInventario, TbProducto, TbSucursal, TbEncabezadoVenta, ModuleKey } from "../../types/database";

interface HomeProps {
  ventas: TbEncabezadoVenta[];
  inventario: TbInventario[];
  productos: TbProducto[];
  sucursal: TbSucursal;
  onNavigate: (module: ModuleKey) => void;
}

export function Home({ ventas, inventario, productos, sucursal, onNavigate }: HomeProps) {
  const ventasSucursal = ventas.filter((v) => v.id_sucursal === sucursal.id_sucursal && v.estado === "COMPLETADA");
  const totalVentas = ventasSucursal.reduce((sum, venta) => sum + venta.total_venta, 0);
  const inventarioSucursal = inventario.filter((i) => i.id_sucursal === sucursal.id_sucursal);
  const stockTotal = inventarioSucursal.reduce((sum, item) => sum + item.stock, 0);
  const alertas = inventarioSucursal.filter((i) => i.stock <= i.stock_minimo).length;
  const currency = new Intl.NumberFormat("es-GT", { style: "currency", currency: "GTQ" });

  const shortcuts: Array<{ key: ModuleKey; title: string; description: string }> = [
    { key: "pos", title: "Nueva venta", description: "Registrar una factura y cobrar al cliente." },
    { key: "inventario", title: "Revisar inventario", description: "Consultar existencias y movimientos." },
    { key: "catalogos", title: "Mantenimiento", description: "Gestionar productos, clientes y empleados." },
    { key: "reportes", title: "Ver reportes", description: "Analizar ventas y comportamiento de productos." }
  ];

  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm font-bold uppercase tracking-wider text-amber-600">Centro de operaciones</p>
        <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-900">Dashboard Central</h1>
        <p className="mt-2 text-sm text-slate-500">
          Resumen operativo de {sucursal.nombre}.
        </p>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Ventas del día" value={currency.format(totalVentas)} detail={`${ventasSucursal.length} facturas completadas`} accent="amber" />
        <MetricCard label="Facturas" value={String(ventasSucursal.length)} detail="Ventas completadas en sucursal" accent="blue" />
        <MetricCard label="Stock disponible" value={String(stockTotal)} detail={`${inventarioSucursal.length} registros de inventario`} accent="emerald" />
        <MetricCard label="Alertas de stock" value={String(alertas)} detail="Productos en nivel mínimo o inferior" accent="red" />
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.4fr_1fr]">
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-panel">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-black text-slate-900">Accesos rápidos</h2>
              <p className="mt-1 text-sm text-slate-500">Operaciones principales del sistema.</p>
            </div>
            <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">ERP / POS</span>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {shortcuts.map((shortcut) => (
              <button
                key={shortcut.key}
                onClick={() => onNavigate(shortcut.key)}
                className="group rounded-xl border border-slate-200 p-4 text-left transition hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-800 group-hover:text-amber-700">{shortcut.title}</h3>
                  <span className="text-amber-500">→</span>
                </div>
                <p className="mt-1 text-xs leading-5 text-slate-500">{shortcut.description}</p>
              </button>
            ))}
          </div>
        </article>

        <article className="rounded-2xl bg-slate-950 p-6 text-white shadow-panel">
          <p className="text-xs font-bold uppercase tracking-widest text-amber-400">Resumen</p>
          <h2 className="mt-2 text-xl font-black">Operación de sucursal</h2>
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-sm text-slate-400">Productos catalogados</span>
              <span className="font-black">{productos.length}</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-sm text-slate-400">Registros de inventario</span>
              <span className="font-black">{inventarioSucursal.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Estado</span>
              <span className="text-sm font-bold text-emerald-400">● Operativo</span>
            </div>
          </div>
        </article>
      </section>
    </div>
  );
}
