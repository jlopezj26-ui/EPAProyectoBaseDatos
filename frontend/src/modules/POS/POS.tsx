import { useMemo, useState } from "react";
import type { CartItem, TbCliente, TbInventario, TbProducto } from "../../types/database";
import { StatusBadge } from "../../components/StatusBadge";

interface POSProps {
  productos: TbProducto[];
  clientes: TbCliente[];
  inventario: TbInventario[];
  sucursalId: number;
  empleadoId: number;
}

export function POS({ productos, clientes, inventario, sucursalId, empleadoId }: POSProps) {
  const [query, setQuery] = useState("");
  const [clienteQuery, setClienteQuery] = useState("");
  const [selectedClient, setSelectedClient] = useState<TbCliente | null>(clientes[0] ?? null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const availableProducts = useMemo(
    () =>
      productos.filter((p) => {
        const stock = inventario.find((i) => i.id_producto === p.id_producto && i.id_sucursal === sucursalId);
        return p.estado === "ACTIVO" && (stock?.stock ?? 0) > 0 &&
          `${p.nombre} ${p.descripcion}`.toLowerCase().includes(query.toLowerCase());
      }),
    [productos, inventario, sucursalId, query]
  );

  const clients = clientes.filter((c) =>
    `${c.nit} ${c.dpi} ${c.nombre}`.toLowerCase().includes(clienteQuery.toLowerCase())
  );

  const total = cart.reduce((sum, item) => sum + item.producto.precio_unitario * item.cantidad, 0);

  const addProduct = (product: TbProducto) => {
    const stock = inventario.find((i) => i.id_producto === product.id_producto && i.id_sucursal === sucursalId);
    if (!stock) return;

    setCart((current) => {
      const existing = current.find((item) => item.producto.id_producto === product.id_producto);
      if (existing) {
        if (existing.cantidad >= stock.stock) return current;
        return current.map((item) =>
          item.producto.id_producto === product.id_producto
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      }
      return [...current, { producto: product, inventario: stock, cantidad: 1 }];
    });
  };

  const removeProduct = (id: number) => {
    setCart((current) => current.filter((item) => item.producto.id_producto !== id));
  };

  const changeQuantity = (id: number, amount: number) => {
    setCart((current) =>
      current
        .map((item) =>
          item.producto.id_producto === id
            ? { ...item, cantidad: Math.max(1, item.cantidad + amount) }
            : item
        )
        .filter(Boolean)
    );
  };

  const simulateSale = async () => {
    if (cart.length === 0 || !selectedClient) return;
    setSaving(true);
    setMessage("");
    await new Promise((resolve) => setTimeout(resolve, 800));
    setSaving(false);
    setMessage(`Venta simulada correctamente. Empleado ${empleadoId} · Cliente ${selectedClient.nombre}`);
    setCart([]);
  };

  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm font-bold uppercase tracking-wider text-amber-600">Módulo 1</p>
        <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-900">Facturación / Punto de Venta</h1>
        <p className="mt-2 text-sm text-slate-500">Carrito, cliente y simulación de emisión de venta.</p>
      </section>

      {message && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.5fr_1fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-panel">
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar producto..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
            />
            <span className="rounded-xl bg-slate-100 px-4 py-3 text-center text-xs font-bold text-slate-500">
              {availableProducts.length} resultados
            </span>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {availableProducts.map((product) => {
              const stock = inventario.find((i) => i.id_producto === product.id_producto && i.id_sucursal === sucursalId);
              return (
                <button
                  key={product.id_producto}
                  onClick={() => addProduct(product)}
                  className="rounded-xl border border-slate-200 p-4 text-left transition hover:border-amber-400 hover:shadow-md"
                >
                  <p className="text-xs font-bold text-slate-400">SKU {product.id_producto}</p>
                  <h3 className="mt-1 font-bold text-slate-800">{product.nombre}</h3>
                  <p className="mt-3 text-lg font-black text-amber-600">Q {product.precio_unitario.toFixed(2)}</p>
                  <p className="mt-1 text-xs text-slate-500">Stock: {stock?.stock ?? 0}</p>
                </button>
              );
            })}
          </div>
        </section>

        <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-panel">
          <h2 className="font-black text-slate-900">Cliente</h2>
          <p className="mt-1 text-xs text-slate-500">Buscar por NIT, DPI o nombre.</p>

          <input
            value={clienteQuery}
            onChange={(e) => setClienteQuery(e.target.value)}
            placeholder="NIT / DPI / nombre"
            className="mt-4 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-amber-500"
          />

          <div className="mt-2 max-h-32 space-y-1 overflow-auto">
            {clients.slice(0, 5).map((client) => (
              <button
                key={client.id_cliente}
                onClick={() => setSelectedClient(client)}
                className={`w-full rounded-lg p-2 text-left text-xs ${
                    selectedClient?.id_cliente === client.id_cliente ? "bg-amber-50 text-amber-800" : "hover:bg-slate-50"
                }`}
              >
                <span className="font-bold">{client.nombre}</span> · {client.nit}
              </button>
            ))}
          </div>

          <div className="mt-4 rounded-xl bg-slate-50 p-3 text-sm">
            <p className="font-bold text-slate-800">{selectedClient?.nombre ?? "Sin clientes registrados"}</p>
            {selectedClient && <p className="mt-1 text-xs text-slate-500">NIT: {selectedClient.nit} · DPI: {selectedClient.dpi}</p>}
          </div>
        </aside>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-panel">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-black text-slate-900">Carrito de compra</h2>
            <p className="text-xs text-slate-500">{cart.length} producto(s)</p>
          </div>
          <StatusBadge value={cart.length ? "PENDIENTE" : "SIN ITEMS"} />
        </div>

        <div className="mt-4 divide-y divide-slate-100">
          {cart.length === 0 ? (
            <div className="py-10 text-center text-sm text-slate-400">Agrega productos para iniciar la venta.</div>
          ) : (
            cart.map((item) => (
              <div key={item.producto.id_producto} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-bold text-slate-800">{item.producto.nombre}</p>
                  <p className="text-xs text-slate-500">Q {item.producto.precio_unitario.toFixed(2)} c/u</p>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => changeQuantity(item.producto.id_producto, -1)} className="h-8 w-8 rounded-lg bg-slate-100 font-bold">−</button>
                  <span className="w-6 text-center text-sm font-bold">{item.cantidad}</span>
                  <button onClick={() => changeQuantity(item.producto.id_producto, 1)} className="h-8 w-8 rounded-lg bg-slate-100 font-bold">+</button>
                  <span className="w-24 text-right font-black">Q {(item.producto.precio_unitario * item.cantidad).toFixed(2)}</span>
                  <button onClick={() => removeProduct(item.producto.id_producto)} className="text-xs font-bold text-red-500">Eliminar</button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-5 flex flex-col items-end gap-3 border-t border-slate-100 pt-5">
          <div className="text-right">
            <p className="text-xs text-slate-500">Total de venta</p>
            <p className="text-3xl font-black text-slate-900">Q {total.toFixed(2)}</p>
          </div>
          <button
            disabled={saving || cart.length === 0 || !selectedClient}
            onClick={simulateSale}
            className="rounded-xl bg-amber-500 px-6 py-3 text-sm font-black text-slate-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {saving ? "Procesando..." : "Simular venta"}
          </button>
        </div>
      </section>
    </div>
  );
}
