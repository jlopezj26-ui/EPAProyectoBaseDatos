import { useEffect, useMemo, useState } from "react";
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import { Home } from "./modules/Home/Home";
import { POS } from "./modules/POS/POS";
import { Inventory } from "./modules/Inventory/Inventory";
import { Catalogs } from "./modules/Catalogs/Catalogs";
import { Reports } from "./modules/Reports/Reports";
import { api } from "./services/api";
import type {
  ModuleKey,
  TbCategoriaProducto,
  TbCliente,
  TbEmpleado,
  TbEncabezadoVenta,
  TbInventario,
  TbProducto,
  TbSucursal,
  MovimientoInventario
} from "./types/database";

interface AppData {
  sucursales: TbSucursal[];
  categorias: TbCategoriaProducto[];
  productos: TbProducto[];
  clientes: TbCliente[];
  empleados: TbEmpleado[];
  inventario: TbInventario[];
  ventas: TbEncabezadoVenta[];
  movimientos: MovimientoInventario[];
}

function App() {
  const [activeModule, setActiveModule] = useState<ModuleKey>("home");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AppData | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      const [
        sucursales,
        categorias,
        productos,
        clientes,
        empleados,
        inventario,
        ventas,
        movimientos
      ] = await Promise.all([
        api.getSucursales(),
        api.getCategorias(),
        api.getProductos(),
        api.getClientes(),
        api.getEmpleados(),
        api.getInventario(),
        api.getVentas(),
        api.getMovimientos()
      ]);

      setData({
        sucursales,
        categorias,
        productos,
        clientes,
        empleados,
        inventario,
        ventas,
        movimientos
      });

      setLoading(false);
    };

    void load();
  }, []);

  const activeEmployee = data?.empleados[0];

  const activeBranch = useMemo(
    () => data?.sucursales.find((branch) => branch.id_sucursal === activeEmployee?.id_sucursal),
    [data, activeEmployee]
  );

  if (loading || !data || !activeEmployee || !activeBranch) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 animate-pulse items-center justify-center rounded-2xl bg-amber-500 text-2xl font-black text-slate-950">
            E
          </div>
          <p className="mt-4 text-sm font-bold text-white">Cargando EPA ERP...</p>
          <p className="mt-1 text-xs text-slate-400">Inicializando módulos</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="flex min-h-screen">
        <Sidebar
          active={activeModule}
          onNavigate={setActiveModule}
          mobileOpen={mobileOpen}
          onClose={() => setMobileOpen(false)}
        />

        <div className="min-w-0 flex-1">
          <Header
            sucursal={activeBranch}
            empleado={activeEmployee}
            onMenu={() => setMobileOpen(true)}
          />

          <main className="p-4 md:p-6 lg:p-8">
            <div className="mx-auto max-w-[1500px]">
              {activeModule === "home" && (
                <Home
                  ventas={data.ventas}
                  inventario={data.inventario}
                  productos={data.productos}
                  sucursal={activeBranch}
                  onNavigate={setActiveModule}
                />
              )}

              {activeModule === "pos" && (
                <POS
                  productos={data.productos}
                  clientes={data.clientes}
                  inventario={data.inventario}
                  sucursalId={activeBranch.id_sucursal}
                  empleadoId={activeEmployee.id_empleado}
                />
              )}

              {activeModule === "inventario" && (
                <Inventory
                  inventario={data.inventario}
                  movimientos={data.movimientos}
                  productos={data.productos}
                  sucursales={data.sucursales}
                  sucursalId={activeBranch.id_sucursal}
                />
              )}

              {activeModule === "catalogos" && (
                <Catalogs
                  productos={data.productos}
                  categorias={data.categorias}
                  clientes={data.clientes}
                  empleados={data.empleados}
                />
              )}

              {activeModule === "reportes" && (
                <Reports
                  ventas={data.ventas}
                  productos={data.productos}
                  inventario={data.inventario}
                  sucursales={data.sucursales}
                />
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default App;
