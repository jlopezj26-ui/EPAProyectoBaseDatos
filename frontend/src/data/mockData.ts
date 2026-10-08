import type {
  MovimientoInventario,
  TbCategoriaProducto,
  TbCliente,
  TbEmpleado,
  TbEncabezadoVenta,
  TbInventario,
  TbProducto,
  TbSucursal
} from "../types/database";

export const sucursales: TbSucursal[] = [
  { id_sucursal: 1, nombre: "EPA Plaza Maderas", direccion: "Ciudad de Guatemala", telefono: "2200-0001" },
  { id_sucursal: 2, nombre: "EPA Roosevelt", direccion: "Calzada Roosevelt", telefono: "2200-0002" },
  { id_sucursal: 3, nombre: "EPA Carretera a El Salvador", direccion: "Carretera a El Salvador", telefono: "2200-0003" },
  { id_sucursal: 4, nombre: "EPA Zona 18", direccion: "Zona 18, Guatemala", telefono: "2200-0004" }
];

export const categorias: TbCategoriaProducto[] = [
  { id_categoria: 1, nombre_categoria: "Herramientas", descripcion: "Herramientas manuales y eléctricas" },
  { id_categoria: 2, nombre_categoria: "Pintura", descripcion: "Pinturas, brochas y accesorios" },
  { id_categoria: 3, nombre_categoria: "Electricidad", descripcion: "Material eléctrico" },
  { id_categoria: 4, nombre_categoria: "Construcción", descripcion: "Materiales de construcción" }
];

export const productos: TbProducto[] = [
  { id_producto: 1, id_categoria: 1, nombre: "Taladro eléctrico 1/2", descripcion: "Taladro profesional", precio_unitario: 549.99, estado: "ACTIVO" },
  { id_producto: 2, id_categoria: 2, nombre: "Pintura látex blanca 1 galón", descripcion: "Pintura para interiores", precio_unitario: 189.99, estado: "ACTIVO" },
  { id_producto: 3, id_categoria: 3, nombre: "Tomacorriente doble", descripcion: "Tomacorriente residencial", precio_unitario: 39.99, estado: "ACTIVO" },
  { id_producto: 4, id_categoria: 4, nombre: "Cemento gris 42.5 kg", descripcion: "Cemento para construcción", precio_unitario: 79.99, estado: "ACTIVO" },
  { id_producto: 5, id_categoria: 1, nombre: "Martillo profesional", descripcion: "Martillo de acero", precio_unitario: 119.99, estado: "ACTIVO" },
  { id_producto: 6, id_categoria: 2, nombre: "Brocha 3 pulgadas", descripcion: "Brocha profesional", precio_unitario: 34.99, estado: "ACTIVO" },
  { id_producto: 7, id_categoria: 3, nombre: "Cable eléctrico 100 m", descripcion: "Cable para instalaciones", precio_unitario: 699.99, estado: "ACTIVO" }
];

export const clientes: TbCliente[] = [
  { id_cliente: 1, id_sucursal: 1, dpi: "1234567890101", nit: "1234567-8", nombre: "Constructora El Roble", direccion: "Zona 10", telefono: "5555-1000", correo: "compras@elroble.gt" },
  { id_cliente: 2, id_sucursal: 2, dpi: "2234567890102", nit: "2234567-9", nombre: "Carlos Méndez", direccion: "Zona 7", telefono: "5555-2000", correo: "carlos@email.com" },
  { id_cliente: 3, id_sucursal: 1, dpi: "3234567890103", nit: "CF", nombre: "Consumidor Final", direccion: "Guatemala", telefono: "", correo: "" }
];

export const empleados: TbEmpleado[] = [
  { id_empleado: 1, id_sucursal: 1, nombre: "Andrea López", puesto: "CAJERO", fecha_ingreso: "2025-01-15" },
  { id_empleado: 2, id_sucursal: 2, nombre: "Luis García", puesto: "CAJERO", fecha_ingreso: "2025-03-10" }
];

export const inventario: TbInventario[] = [
  { id_inventario: 1, id_sucursal: 1, id_producto: 1, stock: 3, stock_minimo: 5, fecha_actualizacion: "2026-10-06 08:00" },
  { id_inventario: 2, id_sucursal: 1, id_producto: 2, stock: 32, stock_minimo: 10, fecha_actualizacion: "2026-10-06 08:02" },
  { id_inventario: 3, id_sucursal: 1, id_producto: 3, stock: 15, stock_minimo: 8, fecha_actualizacion: "2026-10-06 08:04" },
  { id_inventario: 4, id_sucursal: 1, id_producto: 4, stock: 45, stock_minimo: 15, fecha_actualizacion: "2026-10-06 08:05" },
  { id_inventario: 5, id_sucursal: 1, id_producto: 5, stock: 2, stock_minimo: 8, fecha_actualizacion: "2026-10-06 08:06" },
  { id_inventario: 6, id_sucursal: 2, id_producto: 1, stock: 18, stock_minimo: 5, fecha_actualizacion: "2026-10-06 08:10" },
  { id_inventario: 7, id_sucursal: 2, id_producto: 4, stock: 50, stock_minimo: 15, fecha_actualizacion: "2026-10-06 08:12" }
];

export const ventas: TbEncabezadoVenta[] = [
  { id_venta: 1001, id_cliente: 1, id_sucursal: 1, id_empleado: 1, fecha_venta: "2026-10-06 09:05", total_venta: 1250.50, estado: "COMPLETADA" },
  { id_venta: 1002, id_cliente: 2, id_sucursal: 1, id_empleado: 1, fecha_venta: "2026-10-06 10:15", total_venta: 890.00, estado: "COMPLETADA" },
  { id_venta: 1003, id_cliente: 3, id_sucursal: 2, id_empleado: 2, fecha_venta: "2026-10-06 11:20", total_venta: 2450.75, estado: "COMPLETADA" }
];

export const movimientos: MovimientoInventario[] = [
  { id_movimiento: 1, id_sucursal: 1, id_producto: 1, tipo_movimiento: "SALIDA", cantidad: 2, fecha_movimiento: "2026-10-06 09:05", observacion: "Venta FAC-1001" },
  { id_movimiento: 2, id_sucursal: 1, id_producto: 4, tipo_movimiento: "ENTRADA", cantidad: 50, fecha_movimiento: "2026-10-06 07:30", observacion: "Recepción proveedor" },
  { id_movimiento: 3, id_sucursal: 1, id_producto: 5, tipo_movimiento: "SALIDA", cantidad: 4, fecha_movimiento: "2026-10-06 10:10", observacion: "Venta FAC-1002" }
];
