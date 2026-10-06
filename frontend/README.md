# EPA ERP / POS — Frontend

Prototipo de arquitectura frontend para el proyecto de reingeniería de Ferreterías EPA.

## Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Hooks: useState / useEffect
- Sin librería pesada de UI

## Módulos

1. Dashboard Central
2. Facturación / POS
3. Control de Inventario y Movimientos
4. Catálogos y Mantenimiento
5. Reportes y Analítica

El Dashboard Central funciona como entrada y navegación; los cuatro módulos funcionales están disponibles desde el Sidebar.

## Estructura

```text
src/
├── components/
│   ├── Header.tsx
│   ├── MetricCard.tsx
│   ├── Sidebar.tsx
│   └── StatusBadge.tsx
├── data/
│   └── mockData.ts
├── modules/
│   ├── Catalogs/
│   ├── Home/
│   ├── Inventory/
│   ├── POS/
│   └── Reports/
├── services/
│   └── api.ts
├── types/
│   └── database.ts
├── App.tsx
├── index.css
└── main.tsx
```

## Ejecutar

```bash
npm install
npm run dev
```

## Producción

```bash
npm run build
npm run preview
```

## Conexión con Oracle 21c

El navegador NO debe conectarse directamente a Oracle. La arquitectura prevista es:

React/TypeScript → API REST → Backend → Oracle 21c

La carpeta `src/services/api.ts` es el punto de sustitución del mock por llamadas HTTP.

Ejemplo:

```ts
const response = await fetch("/api/productos");
const productos = await response.json();
```

El backend deberá encargarse de autenticación, validación, transacciones, restricciones de negocio y acceso a Oracle.
