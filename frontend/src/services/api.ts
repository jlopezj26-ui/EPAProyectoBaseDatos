import {
  categorias,
  clientes,
  empleados,
  inventario,
  movimientos,
  productos,
  sucursales,
  ventas
} from "../data/mockData";

const wait = async <T,>(value: T): Promise<T> => {
  await new Promise((resolve) => setTimeout(resolve, 350));
  return structuredClone(value);
};

/**
 * Capa de servicios.
 * Sustituir estas funciones por fetch/axios hacia el backend REST
 * que se conectará con Oracle 21c.
 */
export const api = {
  getSucursales: () => wait(sucursales),
  getCategorias: () => wait(categorias),
  getProductos: () => wait(productos),
  getClientes: () => wait(clientes),
  getEmpleados: () => wait(empleados),
  getInventario: () => wait(inventario),
  getVentas: () => wait(ventas),
  getMovimientos: () => wait(movimientos)
};
