import type { ModuleKey } from "../types/database";

interface SidebarProps {
  active: ModuleKey;
  onNavigate: (module: ModuleKey) => void;
  mobileOpen: boolean;
  onClose: () => void;
}

const items: Array<{ key: ModuleKey; label: string; short: string }> = [
  { key: "home", label: "Dashboard Central", short: "⌂" },
  { key: "pos", label: "Facturación / POS", short: "$" },
  { key: "inventario", label: "Inventario", short: "▣" },
  { key: "catalogos", label: "Catálogos", short: "▤" },
  { key: "reportes", label: "Reportes", short: "▥" }
];

export function Sidebar({ active, onNavigate, mobileOpen, onClose }: SidebarProps) {
  return (
    <>
      {mobileOpen && (
        <button
          aria-label="Cerrar menú"
          onClick={onClose}
          className="fixed inset-0 z-30 bg-slate-950/60 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col bg-slate-950 text-white transition-transform lg:static lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-20 items-center gap-3 border-b border-slate-800 px-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500 font-black text-slate-950">
            E
          </div>
          <div>
            <p className="font-black tracking-tight">EPA ERP</p>
            <p className="text-xs text-slate-400">Gestión empresarial</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          <p className="px-3 pb-3 pt-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
            Módulos
          </p>

          {items.map((item) => {
            const selected = active === item.key;

            return (
              <button
                key={item.key}
                onClick={() => {
                  onNavigate(item.key);
                  onClose();
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold transition ${
                  selected
                    ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/10"
                    : "text-slate-300 hover:bg-slate-900 hover:text-white"
                }`}
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-xs font-black">
                  {item.short}
                </span>
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-slate-800 p-4">
          <div className="rounded-xl bg-slate-900 p-4">
            <p className="text-xs font-semibold text-slate-400">Sistema</p>
            <p className="mt-1 text-sm font-bold text-white">Oracle 21c</p>
            <p className="mt-1 text-xs text-emerald-400">● Prototipo conectado</p>
          </div>
        </div>
      </aside>
    </>
  );
}
