# Package by feature: orders (complejo) vs payments (simple)

Ejemplo en TypeScript de organización por **feature** (el repo grita el negocio, no el framework).

| Feature | Idea |
| ------- | ---- |
| **orders** | Feature compleja: vertical slices + dominio/infra |
| **payments** | Feature simple: pocos archivos, sin capas |
| **apps** | Entradas: API Express y CLI |
| **shared** | Solo piezas transversales (`config`, `logger`, errores, `Money`) |

Para convenciones de código y mantenimiento asistido por agentes, ver [AGENTS.md](./AGENTS.md).

---

## Requisitos

- Node.js `>= 22`
- `cp .env.example .env` (ajusta `PORT`, `ORDER_REPOSITORY`, etc.)

## Cómo ejecutar

```bash
npm install
npm run dev      # desarrollo (reload)
npm run build    # genera dist/
npm start        # API desde dist/ (tras build)
```

`LOG_LEVEL` controla el logger (en `development`, formato legible).

### Endpoints

```text
GET  /api/health
POST /api/orders
GET  /api/orders?status=confirmed
GET  /api/orders/:id
POST /api/payments
```

Frontend de demo: `http://localhost:3000` (o el `PORT` de tu `.env`).

### Persistencia

```bash
# .env
ORDER_REPOSITORY=memory   # o sqlite
SQLITE_PATH=./data/orders.sqlite
```

### CLI

```bash
npm run cli -- create-order --customer cust-1 --product sku-42 --quantity 2 --price 10
npm run cli -- get-order --id <order-id>
npm run cli -- list-orders --status confirmed
npm run cli -- record-payment --order order-1 --amount 20
```

### Otros scripts

```bash
npm run typecheck
npm run format
```

---

## Estructura (vista rápida)

```text
src/
  apps/api|cli          # entradas
  orders/               # feature compleja (slices)
  payments/             # feature simple
  shared/               # config, logger, errors, Money
  bootstrap.ts          # junta módulos de feature
public/                 # frontend estático de demo
```

Flujo:

```text
Frontend/CLI → API o CLI → caso de uso → dominio → repository (memory|sqlite)
```

---

## Idea pedagógica

1. Empieza simple (`payments`).
2. Cuando haya reglas y varios flujos, usa slices (`orders`).
3. Cambia de persistencia implementando el mismo puerto, sin tocar el caso de uso.
