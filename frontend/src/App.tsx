import { useEffect, useMemo, useState } from "react";
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import { Home } from "./modules/Home/Home";
import { POS } from "./modules/POS/POS";
import { Inventory } from "./modules/Inventory/Inventory";
import { Catalogs } from "./modules/Catalogs/Catalogs";
import { Reports } from "./modules/Reports/Reports";
import { DatabaseAdmin } from "./modules/Database/DatabaseAdmin";
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
  const [loadError, setLoadError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [data, setData] = useState<AppData | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setLoadError('');
      try {
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

        setData({ sucursales, categorias, productos, clientes, empleados, inventario, ventas, movimientos });
      } catch (error) {
        setLoadError(error instanceof Error ? error.message : 'No fue posible cargar los datos de Oracle.');
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [refreshKey]);

  const activeEmployee = data?.empleados[0];

  const activeBranch = useMemo(
    () => data?.sucursales.find((branch) => branch.id_sucursal === activeEmployee?.id_sucursal) ?? data?.sucursales[0],
    [data, activeEmployee]
  );

  if (loading) {
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

  if (loadError || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-center">
        <div className="max-w-lg">
          <p className="text-sm font-bold uppercase tracking-wider text-amber-500">Conexión a Oracle</p>
          <h1 className="mt-3 text-2xl font-black text-white">No se pudieron cargar los datos</h1>
          <p className="mt-3 text-sm text-slate-300">{loadError || 'El API no devolvió información.'}</p>
          <button onClick={() => window.location.reload()} className="mt-6 rounded-xl bg-amber-500 px-5 py-3 text-sm font-black text-slate-950">Reintentar</button>
        </div>
      </div>
    );
  }

  if (activeModule === "basedatos") {
    return (
      <div className="flex min-h-screen bg-slate-100">
        <Sidebar active={activeModule} onNavigate={setActiveModule} mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
        <main className="min-w-0 flex-1 p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-[1500px]">
            <DatabaseAdmin onDataChanged={() => setRefreshKey((current) => current + 1)} />
          </div>
        </main>
      </div>
    );
  }

  if (!activeEmployee || !activeBranch) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-center">
        <div className="max-w-lg">
          <p className="text-sm font-bold uppercase tracking-wider text-amber-500">Configuración inicial</p>
          <h1 className="mt-3 text-2xl font-black text-white">Falta una sucursal o un empleado</h1>
          <p className="mt-3 text-sm text-slate-300">Oracle respondió correctamente, pero el inicio requiere al menos una sucursal y un empleado asociado.</p>
          <button onClick={() => setActiveModule("basedatos")} className="mt-6 rounded-xl bg-amber-500 px-5 py-3 text-sm font-black text-slate-950">Abrir mantenimiento de tablas</button>
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
