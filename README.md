# EPAProyectoBaseDatos

API REST de ejemplo con Node.js, NestJS y TypeScript, organizada en módulos y capas.

## Requisitos

- Node.js 20 o superior
- npm

## Instalación y ejecución

```bash
npm install
npm run start:dev
```

La API queda disponible en `http://localhost:3001/api` y la documentación Swagger interactiva en `http://localhost:3001/api/docs`.

## Frontend de prueba

En otra terminal, instala las dependencias y levanta la interfaz React:

```bash
cd frontend
npm install
npm run dev
```

Abre `http://localhost:5173`. Vite redirige las llamadas `/api` al backend en `http://localhost:3001`; inicia primero la API para consultar y gestionar productos.

## Despliegue en Vercel

El archivo [`vercel.json`](./vercel.json) configura dos servicios dentro del mismo proyecto:

- `frontend`: servicio Vite público para la interfaz en `/`.
- `app`: servicio NestJS público para la API en `/api/*`.

El frontend consume la API mediante rutas relativas `/api/gestion`, por lo que no necesita una URL de backend ni un binding de servicio. En Vercel, el backend debe recibir las variables Oracle definidas en `.env` como variables de entorno del proyecto; no se debe subir `.env` al repositorio.

## Registro de ventas

El módulo POS registra ventas reales mediante `POST /api/ventas`. Cada operación crea un encabezado en `TB_ENCABEZADO_VENTA`, crea sus detalles en `TB_DETALLE_VENTA`, descuenta el inventario dentro de una transacción Oracle y deja que el trigger de movimientos registre las salidas. Si falla cualquier línea, la operación hace `ROLLBACK`.

Ejemplo de solicitud:

```json
{
  "id_cliente": 1,
  "id_sucursal": 1,
  "id_empleado": 1,
  "detalles": [
    { "id_producto": 1, "cantidad": 2 },
    { "id_producto": 3, "cantidad": 1 }
  ]
}
```

Para probar todos los servicios localmente con la CLI de Vercel:

```bash
vercel dev
```

## Estructura

```text
src/
	main.ts
	app.module.ts
	productos/
		controllers/
			productos.controller.ts
		dtos/
			create-producto.dto.ts
			update-producto.dto.ts
		entities/
			producto.entity.ts
		interfaces/
			producto.interface.ts
			productos-service.interface.ts
		modules/
			productos.module.ts
		services/
			productos.service.ts
```

- **Controller:** recibe las peticiones, delega en el servicio y define el contrato HTTP.
- **DTOs:** validan y documentan los datos de entrada con `class-validator` y `@nestjs/swagger`.
- **Interfaces:** definen el modelo `IProducto` y el contrato `IProductosService`, que el controller inyecta mediante un token de Nest.
- **Service:** implementa el contrato y contiene las operaciones del módulo. En esta plantilla usa almacenamiento en memoria, que se reinicia al detener el proceso.

## Rutas de productos

| Método | Ruta | Descripción |
| --- | --- | --- |
| `POST` | `/api/productos` | Crear producto |
| `GET` | `/api/productos` | Listar productos |
| `GET` | `/api/productos/:id` | Obtener producto |
| `PATCH` | `/api/productos/:id` | Actualizar parcialmente |
| `DELETE` | `/api/productos/:id` | Eliminar producto |

Ejemplo de creación:

```json
{
	"nombre": "Teclado",
	"descripcion": "Teclado mecánico",
	"precio": 79.99,
	"stock": 10
}
```

El `ValidationPipe` global transforma los parámetros, elimina los campos no declarados y devuelve errores `400` cuando el DTO no es válido. Los errores de producto inexistente devuelven `404`.
