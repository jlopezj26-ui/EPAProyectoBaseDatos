/**
 * Tipos 1:1 con el esquema relacional entregado para el proyecto.
 * Los campos NUMBER/DATE de Oracle se representan como number/string
 * en el DTO del frontend. El backend puede transformarlos a JSON.
 */

export interface TbSucursal {
  id_sucursal: number;
  nombre: string;
  direccion: string;
  telefono: string;
}

export interface TbCategoriaProducto {
  id_categoria: number;
  nombre_categoria: string;
  descripcion: string;
}

export interface TbProducto {
  id_producto: number;
  id_categoria: number;
  nombre: string;
  descripcion: string;
  precio_unitario: number;
  estado: string;
}

export interface TbCliente {
  id_cliente: number;
  id_sucursal: number;
  dpi: string;
  nit: string;
  nombre: string;
  direccion: string;
  telefono: string;
  correo: string;
}

export interface TbEmpleado {
  id_empleado: number;
  id_sucursal: number;
  nombre: string;
  pusto: string;
  fecha_ingreso: string;
}

export interface TbInventario {
  id_inventario: number;
  id_sucursal: number;
  id_producto: number;
  stock: number;
  stock_minimo: number;
  fecha_actualizacion: string;
}

export interface TbEncabezadoVenta {
  id_venta: number;
  id_cliente: number;
  id_sucursal: number;
  id_empleado: number;
  fecha_venta: string;
  total_venta: number;
  estado: string;
}

export interface TbDetalleVenta {
  id_detalle: number;
  id_venta: number;
  id_inventario: number;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

export interface MovimientoInventario {
  id_movimiento: number;
  id_sucursal: number;
  id_producto: number;
  tipo_movimiento: string;
  cantidad: number;
  fecha_movimiento: string;
  observacion: string;
}

export interface CartItem {
  producto: TbProducto;
  inventario: TbInventario;
  cantidad: number;
}

export interface DashboardMetrics {
  ventas_hoy: number;
  facturas_hoy: number;
  stock_total: number;
  alertas_stock: number;
}

export type ModuleKey = "home" | "pos" | "inventario" | "catalogos" | "reportes";
