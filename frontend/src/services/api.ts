import type {
  MovimientoInventario,
  TbCategoriaProducto,
  TbCliente,
  TbEmpleado,
  TbEncabezadoVenta,
  TbInventario,
  TbProducto,
  TbSucursal,
} from '../types/database';

const API_BASE = '/api/gestion';
type JsonRecord = Record<string, unknown>;
export type ApiField = {
  nombre: string;
  etiqueta: string;
  tipo: 'texto' | 'entero' | 'decimal' | 'fecha';
  longitud?: number;
  clavePrimaria?: boolean;
  referencia?: { tabla: string; campo: string };
};
export type ApiTable = {
  nombre: string;
  tablaOracle: string;
  etiqueta: string;
  clavePrimaria: string;
  campos: ApiField[];
};

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(path, {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null) as { message?: string | string[] } | null;
    const message = Array.isArray(body?.message) ? body.message.join('. ') : body?.message;
    throw new Error(message || `Error ${response.status}: no se pudo conectar con Oracle.`);
  }

  if (response.status === 204) return null as T;
  return response.json() as Promise<T>;
}

function tablePath(table: string) {
  return `${API_BASE}/${encodeURIComponent(table)}`;
}

export const api = {
  getTables: () => request<ApiTable[]>(`${API_BASE}/tablas`),
  getTable: (table: string) => request<JsonRecord[]>(tablePath(table)),
  getSucursales: () => request<TbSucursal[]>(tablePath('sucursales')),
  getCategorias: () => request<TbCategoriaProducto[]>(tablePath('categorias_producto')),
  getProductos: () => request<TbProducto[]>(tablePath('productos')),
  getClientes: () => request<TbCliente[]>(tablePath('clientes')),
  getEmpleados: () => request<TbEmpleado[]>(tablePath('empleados')),
  getInventario: () => request<TbInventario[]>(tablePath('inventario')),
  getVentas: () => request<TbEncabezadoVenta[]>(tablePath('encabezado_venta')),
  getMovimientos: () => request<MovimientoInventario[]>(tablePath('movimiento_inventario')),
  getDetallesVenta: () => request<JsonRecord[]>(tablePath('detalle_venta')),
  createRecord: (table: string, data: JsonRecord) => request<JsonRecord>(tablePath(table), {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateRecord: (table: string, id: number, data: JsonRecord) => request<JsonRecord>(`${tablePath(table)}/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  deleteRecord: (table: string, id: number) => request<void>(`${tablePath(table)}/${id}`, { method: 'DELETE' }),
  create: <T>(table: string, data: JsonRecord) => request<T>(tablePath(table), {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: <T>(table: string, id: number, data: JsonRecord) => request<T>(`${tablePath(table)}/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  remove: (table: string, id: number) => request<void>(`${tablePath(table)}/${id}`, { method: 'DELETE' }),
};