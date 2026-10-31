import { useMemo, useState } from "react";
import type { CartItem, TbCliente, TbInventario, TbProducto } from "../../types/database";
import { StatusBadge } from "../../components/StatusBadge";
import { api } from "../../services/api";

interface POSProps {
  productos: TbProducto[];
  clientes: TbCliente[];
  inventario: TbInventario[];
  sucursalId: number;
  empleadoId: number;
  onSaleCreated: () => void;
}

export function POS({ productos, clientes, inventario, sucursalId, empleadoId, onSaleCreated }: POSProps) {
  const [query, setQuery] = useState("");
  const [clienteQuery, setClienteQuery] = useState("");
  const [selectedClient, setSelectedClient] = useState<TbCliente | null>(clientes[0] ?? null);
  const [createdClients, setCreatedClients] = useState<TbCliente[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [clientSaving, setClientSaving] = useState(false);
  const [clientError, setClientError] = useState("");
  const [clientForm, setClientForm] = useState({
    nombre: "",
    dpi: "",
    nit: "",
    direccion: "",
    telefono: "",
    correo: "",
  });

  const availableProducts = useMemo(
    () =>
      productos.filter((p) => {
        const stock = inventario.find((i) => i.id_producto === p.id_producto && i.id_sucursal === sucursalId);
        return p.estado === "ACTIVO" && (stock?.stock ?? 0) > 0 &&
          `${p.nombre} ${p.descripcion}`.toLowerCase().includes(query.toLowerCase());
      }),
    [productos, inventario, sucursalId, query]
  );

  const allClients = [...clientes, ...createdClients];
  const clients = allClients.filter((c) =>
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

  const createSale = async () => {
    if (cart.length === 0 || !selectedClient) return;
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const result = await api.createSale({
        id_cliente: selectedClient.id_cliente,
        id_sucursal: sucursalId,
        id_empleado: empleadoId,
        detalles: cart.map((item) => ({
          id_producto: item.producto.id_producto,
          cantidad: item.cantidad,
        })),
      });
      setMessage(`Venta #${result.id_venta} registrada correctamente. Total: Q ${result.total_venta.toFixed(2)}`);
      setCart([]);
      onSaleCreated();
    } catch (saleError) {
      setError(saleError instanceof Error ? saleError.message : "No se pudo registrar la venta.");
    } finally {
      setSaving(false);
    }
  };

  const createClient = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setClientSaving(true);
    setClientError("");
    try {
      const client = await api.create<TbCliente>("clientes", {
        ...clientForm,
        id_sucursal: sucursalId,
      });
      setCreatedClients((current) => [...current, client]);
      setSelectedClient(client);
      setClientModalOpen(false);
      setClientForm({ nombre: "", dpi: "", nit: "", direccion: "", telefono: "", correo: "" });
    } catch (clientCreateError) {
      setClientError(clientCreateError instanceof Error ? clientCreateError.message : "No se pudo crear el cliente.");
    } finally {
      setClientSaving(false);
    }
  };

  const clientFields: Array<[keyof typeof clientForm, string, boolean]> = [
    ["nombre", "Nombre completo", true],
    ["dpi", "DPI", true],
    ["nit", "NIT", true],
    ["direccion", "Dirección", false],
    ["telefono", "Teléfono", false],
    ["correo", "Correo electrónico", false],
  ];

  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm font-bold uppercase tracking-wider text-emerald-600">Módulo 1</p>
        <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-900">Facturación / Punto de Venta</h1>
        <p className="mt-2 text-sm text-slate-500">Carrito, cliente y simulación de emisión de venta.</p>
      </section>

      {message && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">
          {message}
        </div>
      )}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.5fr_1fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-panel">
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar producto..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
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
                  className="rounded-xl border border-slate-200 p-4 text-left transition hover:border-emerald-400 hover:shadow-md"
                >
                  <p className="text-xs font-bold text-slate-400">SKU {product.id_producto}</p>
                  <h3 className="mt-1 font-bold text-slate-800">{product.nombre}</h3>
                  <p className="mt-3 text-lg font-black text-emerald-600">Q {product.precio_unitario.toFixed(2)}</p>
                  <p className="mt-1 text-xs text-slate-500">Stock: {stock?.stock ?? 0}</p>
                </button>
              );
            })}
          </div>
        </section>

        <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-panel">
          <h2 className="font-black text-slate-900">Cliente</h2>
          <p className="mt-1 text-xs text-slate-500">Buscar por NIT, DPI o nombre.</p>

          <div className="mt-4 flex gap-2">
            <input
              value={clienteQuery}
              onChange={(e) => setClienteQuery(e.target.value)}
              placeholder="NIT / DPI / nombre"
              className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-emerald-500"
            />
            <button
              type="button"
              onClick={() => { setClientError(""); setClientModalOpen(true); }}
              className="rounded-xl bg-emerald-500 px-4 py-3 text-xs font-black text-slate-950 hover:bg-emerald-400"
            >
              Nuevo cliente
            </button>
          </div>

          <div className="mt-2 max-h-48 space-y-1 overflow-auto">
            {clients.map((client) => (
              <button
                key={client.id_cliente}
                onClick={() => setSelectedClient(client)}
                className={`w-full rounded-lg p-2 text-left text-xs ${
                    selectedClient?.id_cliente === client.id_cliente ? "bg-emerald-50 text-emerald-800" : "hover:bg-slate-50"
                }`}
              >
                <span className="font-bold">{client.nombre}</span> · {client.nit}
              </button>
            ))}
            {!clients.length && <p className="p-3 text-xs text-slate-400">No hay clientes que coincidan con la búsqueda.</p>}
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
          <div className="flex flex-wrap justify-end gap-3">
            <button
              disabled={saving || cart.length === 0 || !selectedClient}
              onClick={() => setPreviewOpen(true)}
              className="rounded-xl border border-emerald-200 bg-emerald-50 px-6 py-3 text-sm font-black text-emerald-800 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Vista previa
            </button>
            <button
              disabled={saving || cart.length === 0 || !selectedClient}
              onClick={createSale}
              className="rounded-xl bg-emerald-500 px-6 py-3 text-sm font-black text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {saving ? "Registrando..." : "Registrar venta"}
            </button>
          </div>
        </div>
      </section>

      {previewOpen && selectedClient && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4"
          onMouseDown={(event) => event.target === event.currentTarget && setPreviewOpen(false)}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="sale-preview-title"
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
          >
            <header className="border-b border-slate-100 px-6 py-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600">Vista previa</p>
                  <h2 id="sale-preview-title" className="mt-1 text-2xl font-black text-slate-900">Venta por registrar</h2>
                  <p className="mt-1 text-sm text-slate-500">Verifica los datos antes de guardar en Oracle.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewOpen(false)}
                  aria-label="Cerrar vista previa"
                  className="rounded-lg px-3 py-2 text-xl font-bold text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                >
                  ×
                </button>
              </div>
            </header>

            <div className="space-y-5 px-6 py-5">
              <div className="grid gap-3 rounded-xl bg-slate-50 p-4 text-sm sm:grid-cols-2">
                <div>
                  <p className="text-xs font-bold uppercase text-slate-400">Cliente</p>
                  <p className="mt-1 font-bold text-slate-800">{selectedClient.nombre}</p>
                  <p className="text-xs text-slate-500">NIT: {selectedClient.nit} · DPI: {selectedClient.dpi}</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase text-slate-400">Operación</p>
                  <p className="mt-1 font-bold text-slate-800">Sucursal {sucursalId}</p>
                  <p className="text-xs text-slate-500">Empleado / cajero: {empleadoId}</p>
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full min-w-[500px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Producto</th>
                      <th className="px-4 py-3 text-center">Cantidad</th>
                      <th className="px-4 py-3 text-right">Precio</th>
                      <th className="px-4 py-3 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cart.map((item) => (
                      <tr key={item.producto.id_producto} className="border-t border-slate-100">
                        <td className="px-4 py-3 font-semibold text-slate-800">{item.producto.nombre}</td>
                        <td className="px-4 py-3 text-center text-slate-600">{item.cantidad}</td>
                        <td className="px-4 py-3 text-right text-slate-600">Q {item.producto.precio_unitario.toFixed(2)}</td>
                        <td className="px-4 py-3 text-right font-bold text-slate-800">
                          Q {(item.producto.precio_unitario * item.cantidad).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between border-t border-slate-200 pt-4">
                <div>
                  <p className="text-xs text-slate-500">Estado previo</p>
                  <p className="font-bold text-emerald-700">Lista para registrar</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">Total de venta</p>
                  <p className="text-3xl font-black text-slate-900">Q {total.toFixed(2)}</p>
                </div>
              </div>
            </div>

            <footer className="flex flex-wrap justify-end gap-3 border-t border-slate-100 px-6 py-4">
              <button
                type="button"
                onClick={() => setPreviewOpen(false)}
                className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50"
              >
                Volver al carrito
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => {
                  setPreviewOpen(false);
                  void createSale();
                }}
                className="rounded-xl bg-emerald-500 px-5 py-3 text-sm font-black text-slate-950 hover:bg-emerald-400 disabled:opacity-40"
              >
                {saving ? "Registrando..." : "Confirmar y registrar"}
              </button>
            </footer>
          </section>
        </div>
      )}

      {clientModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4"
          onMouseDown={(event) => event.target === event.currentTarget && setClientModalOpen(false)}
        >
          <section className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <header className="border-b border-slate-100 px-6 py-5">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600">Clientes</p>
              <h2 className="mt-1 text-2xl font-black text-slate-900">Agregar cliente</h2>
              <p className="mt-1 text-sm text-slate-500">El cliente quedará disponible para esta venta.</p>
            </header>
            <form onSubmit={createClient} className="space-y-4 p-6">
              {clientError && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">{clientError}</div>}
              <div className="grid gap-4 sm:grid-cols-2">
                {clientFields.map(([key, label, required]) => (
                  <label key={key} className="grid gap-1.5 text-xs font-bold text-slate-600">
                    {label}{required ? " *" : ""}
                    <input
                      required={Boolean(required)}
                      value={clientForm[key]}
                      onChange={(event) => setClientForm((current) => ({ ...current, [key]: event.target.value }))}
                      className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-normal text-slate-800 outline-none focus:border-emerald-500"
                    />
                  </label>
                ))}
              </div>
              <footer className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                <button type="button" onClick={() => setClientModalOpen(false)} className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50">
                  Cancelar
                </button>
                <button type="submit" disabled={clientSaving} className="rounded-xl bg-emerald-500 px-5 py-3 text-sm font-black text-slate-950 hover:bg-emerald-400 disabled:opacity-40">
                  {clientSaving ? "Guardando..." : "Guardar cliente"}
                </button>
              </footer>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
