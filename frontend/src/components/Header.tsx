import type { TbEmpleado, TbSucursal } from "../types/database";

interface HeaderProps {
  sucursal: TbSucursal;
  empleado: TbEmpleado;
  onMenu: () => void;
}

export function Header({ sucursal, empleado, onMenu }: HeaderProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="flex min-h-20 items-center justify-between gap-4 px-4 md:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button
            onClick={onMenu}
            className="rounded-xl border border-slate-200 p-2 text-slate-700 lg:hidden"
            aria-label="Abrir menú"
          >
            ☰
          </button>

          <div className="min-w-0">
            <p className="truncate text-xs font-bold uppercase tracking-wider text-slate-400">
              Sucursal activa
            </p>
            <p className="truncate text-sm font-black text-slate-900">
              {sucursal.nombre}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-xs text-slate-400">Empleado / Cajero</p>
            <p className="text-sm font-bold text-slate-800">{empleado.nombre}</p>
          </div>

          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-sm font-black text-amber-400">
            {empleado.nombre
              .split(" ")
              .map((name) => name[0])
              .slice(0, 2)
              .join("")}
          </div>
        </div>
      </div>
    </header>
  );
}
