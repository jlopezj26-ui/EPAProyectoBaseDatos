export type CampoTipo = 'texto' | 'entero' | 'decimal' | 'fecha';

export interface CampoTabla {
  nombre: string;
  columnaOracle?: string;
  etiqueta: string;
  tipo: CampoTipo;
  longitud?: number;
  clavePrimaria?: boolean;
  referencia?: { tabla: string; campo: string };
}

export interface DefinicionTabla {
  nombre: string;
  tablaOracle: string;
  etiqueta: string;
  clavePrimaria: string;
  campos: CampoTabla[];
}

const texto = (nombre: string, etiqueta: string, longitud: number, extra = {}) => ({
  nombre,
  etiqueta,
  tipo: 'texto' as const,
  longitud,
  ...extra,
});
const entero = (nombre: string, etiqueta: string, extra = {}) => ({
  nombre,
  etiqueta,
  tipo: 'entero' as const,
  ...extra,
});
const decimal = (nombre: string, etiqueta: string) => ({ nombre, etiqueta, tipo: 'decimal' as const });
const fecha = (nombre: string, etiqueta: string) => ({ nombre, etiqueta, tipo: 'fecha' as const });
const referencia = (tabla: string, campo: string) => ({ referencia: { tabla, campo } });

export const TABLAS: Record<string, DefinicionTabla> = {
  sucursales: {
    nombre: 'sucursales', tablaOracle: 'TB_SUCURSAL', etiqueta: 'Sucursales', clavePrimaria: 'id_sucursal',
    campos: [entero('id_sucursal', 'ID sucursal', { clavePrimaria: true }), texto('nombre', 'Nombre', 60), texto('direccion', 'Dirección', 100), texto('telefono', 'Teléfono', 15)],
  },
  empleados: {
    nombre: 'empleados', tablaOracle: 'TB_EMPLEADO', etiqueta: 'Empleados', clavePrimaria: 'id_empleado',
    campos: [entero('id_empleado', 'ID empleado', { clavePrimaria: true }), entero('id_sucursal', 'Sucursal', referencia('sucursales', 'nombre')), texto('nombre', 'Nombre', 100), texto('puesto', 'Puesto', 60, { columnaOracle: 'PUSTO' }), fecha('fecha_ingreso', 'Fecha de ingreso')],
  },
  clientes: {
    nombre: 'clientes', tablaOracle: 'TB_CLIENTE', etiqueta: 'Clientes', clavePrimaria: 'id_cliente',
    campos: [entero('id_cliente', 'ID cliente', { clavePrimaria: true }), entero('id_sucursal', 'Sucursal', referencia('sucursales', 'nombre')), texto('dpi', 'DPI', 13), texto('nit', 'NIT', 15), texto('nombre', 'Nombre', 30), texto('direccion', 'Dirección', 60), texto('telefono', 'Teléfono', 10), texto('correo', 'Correo', 60)],
  },
  categorias_producto: {
    nombre: 'categorias_producto', tablaOracle: 'TB_CATEGORIA_PRODUCTO', etiqueta: 'Categorías', clavePrimaria: 'id_categoria',
    campos: [entero('id_categoria', 'ID categoría', { clavePrimaria: true }), texto('nombre_categoria', 'Nombre de categoría', 70), texto('descripcion', 'Descripción', 100)],
  },
  productos: {
    nombre: 'productos', tablaOracle: 'TB_PRODUCTO', etiqueta: 'Productos', clavePrimaria: 'id_producto',
    campos: [entero('id_producto', 'ID producto', { clavePrimaria: true }), entero('id_categoria', 'Categoría', referencia('categorias_producto', 'nombre_categoria')), texto('nombre', 'Nombre', 70), texto('descripcion', 'Descripción', 100), decimal('precio_unitario', 'Precio unitario'), texto('estado', 'Estado', 70)],
  },
  inventario: {
    nombre: 'inventario', tablaOracle: 'TB_INVENTARIO', etiqueta: 'Inventario', clavePrimaria: 'id_inventario',
    campos: [entero('id_inventario', 'ID inventario', { clavePrimaria: true }), entero('id_sucursal', 'Sucursal', referencia('sucursales', 'nombre')), entero('id_producto', 'Producto', referencia('productos', 'nombre')), entero('stock', 'Stock'), entero('stock_minimo', 'Stock mínimo'), fecha('fecha_actualizacion', 'Última actualización')],
  },
  encabezado_venta: {
    nombre: 'encabezado_venta', tablaOracle: 'TB_ENCABEZADO_VENTA', etiqueta: 'Ventas', clavePrimaria: 'id_venta',
    campos: [entero('id_venta', 'ID venta', { clavePrimaria: true }), entero('id_cliente', 'Cliente', referencia('clientes', 'nombre')), entero('id_sucursal', 'Sucursal', referencia('sucursales', 'nombre')), entero('id_empleado', 'Empleado', referencia('empleados', 'nombre')), fecha('fecha_venta', 'Fecha de venta'), decimal('total_venta', 'Total'), texto('estado', 'Estado', 20)],
  },
  detalle_venta: {
    nombre: 'detalle_venta', tablaOracle: 'TB_DETALLE_VENTA', etiqueta: 'Detalles de venta', clavePrimaria: 'id_detalle',
    campos: [entero('id_detalle', 'ID detalle', { clavePrimaria: true }), entero('id_venta', 'Venta', referencia('encabezado_venta', 'id_venta')), entero('id_inventario', 'Inventario', referencia('inventario', 'id_inventario')), entero('cantidad', 'Cantidad'), decimal('precio_unitario', 'Precio unitario'), decimal('subtotal', 'Subtotal')],
  },
  movimiento_inventario: {
    nombre: 'movimiento_inventario', tablaOracle: 'MOVIMIENTO_INVENTARIO', etiqueta: 'Movimientos de inventario', clavePrimaria: 'id_movimiento',
    campos: [entero('id_movimiento', 'ID movimiento', { clavePrimaria: true }), entero('id_sucursal', 'Sucursal', referencia('sucursales', 'nombre')), entero('id_producto', 'Producto', referencia('productos', 'nombre')), texto('tipo_movimiento', 'Tipo de movimiento', 20), decimal('cantidad', 'Cantidad'), fecha('fecha_movimiento', 'Fecha del movimiento'), texto('observacion', 'Observación', 200)],
  },
};

export function obtenerTabla(nombre: string): DefinicionTabla {
  const tabla = TABLAS[nombre.toLowerCase()];
  if (!tabla) {
    throw new Error(`La tabla "${nombre}" no está disponible en el módulo de gestión.`);
  }
  return tabla;
}