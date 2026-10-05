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

La API queda disponible en `http://localhost:3000/api` y la documentación Swagger interactiva en `http://localhost:3000/api/docs`.

## Frontend de prueba

En otra terminal, instala las dependencias y levanta la interfaz React:

```bash
cd frontend
npm install
npm run dev
```

Abre `http://localhost:5173`. Vite redirige las llamadas `/api` al backend en `http://localhost:3000`; inicia primero la API para consultar y gestionar productos. Para apuntar a otra URL, define `VITE_API_URL` al iniciar el frontend.

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
