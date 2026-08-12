# Package by feature: orders (complejo) vs payments (simple)

El repo **grita el negocio** (`orders`, `payments`), no el framework.

## Enfoque

| Feature      | Complejidad | Estructura                                 |
| ------------ | ----------- | ------------------------------------------ |
| **orders**   | Compleja    | Vertical slices + domain/infra compartidos |
| **payments** | Simple      | Un slice en pocos archivos                 |
| **shared**   | Transversal | Mínimo (`config`, `logger`, `Money`)       |
| **apps**     | Entradas    | API Express y CLI                          |

---

## Estructura actual

```text
src/
  apps/
    api/server.ts                 # middleware + montar routers de feature
    cli/cli.ts
  orders/                         # FEATURE COMPLEJA (vertical slices)
    domain/
      order.ts                    # entity
      order-repository.ts         # puerto
    create-order/
      create-order.ts             # caso de uso (clase CreateOrder)
      create-order.dto.ts
      create-order.route.ts       # HTTP del slice
    get-order/
      get-order.ts
      get-order.route.ts
    list-by-status/
      list-by-status.ts
      list-by-status.route.ts
    infrastructure/
      in-memory-order-repository.ts
      sqlite-order-repository.ts
    order-mapper.ts               # shared entre slices del feature
    orders.routes.ts              # compone routers de slices
    orders.module.ts              # cableado del feature
  payments/                       # FEATURE SIMPLE
    record-payment.ts             # lógica en un archivo
    payments.routes.ts
    payments.module.ts
  shared/
    config.ts
    errors.ts                     # DomainError, ValidationError, NotFoundError
    map-domain-error.ts           # dominio → HTTP (solo adaptadores)
    logger.ts
    money.vo.ts
  bootstrap.ts
  main.ts
public/index.html
.env.example
```

## Cómo encajan las interfaces

```text
Navegador → frontend → HTTP API ┐
                               ├→ slice use case → domain → repository
Terminal ───────────────→ CLI ─┘
                                    ↑
                         memory o sqlite (mismo puerto)
```

- `orders`: cada acción es un slice (`create-order`, `get-order`, `list-by-status`).
- `payments`: un solo flujo, sin carpetas de capas.
- `apps/api` solo monta; no conoce endpoints internos.
- Dominio sin HTTP ni `process.env`.
- Errores tipados en dominio; `mapDomainError` los traduce a status/code en routes.

### Dependencias (feature compleja)

```text
*.route.ts → CreateOrder/GetOrder/... → domain ← infrastructure
```

### Errores

| Tipo                  | Origen                     | HTTP típico |
| --------------------- | -------------------------- | ----------- |
| `ValidationError`     | reglas de negocio / VO     | 422         |
| `NotFoundError`       | recurso inexistente        | 404         |
| payload HTTP inválido | route (antes del use case) | 400         |

El dominio **no** conoce status codes; solo lanza `DomainError` con `code`.

---

## Naming

| Antes                       | Ahora                              |
| --------------------------- | ---------------------------------- |
| `CreateOrderUseCase`        | `CreateOrder`                      |
| `ListOrdersByStatusUseCase` | `ListByStatus`                     |
| `order.entity.ts`           | `order.ts`                         |
| `application/` monolítica   | carpeta por slice                  |
| `OrderController` gordo     | HTTP en `*.route.ts` de cada slice |

---

## Cómo no sobreingenierizar

1. Empieza como `payments` (pocos archivos).
2. Cuando haya reglas + varios flujos, pasa a slices como `orders`.
3. `shared/` solo con piezas realmente transversales.
4. No vuelvas a `controllers/` / `services/` globales.

### Camino evolutivo

```text
1) feature/un-archivo.ts          ← payments
2) entity + puerto si hay reglas
3) vertical slices por acción     ← orders
4) más adaptadores del mismo puerto (sqlite, etc.)
```

---

## Cómo ejecutar

```bash
cp .env.example .env
npm start
```

`LOG_LEVEL` controla el logger. En `development`, formato legible; en otros entornos, JSON.

### Endpoints

```text
GET  /api/health
POST /api/orders
GET  /api/orders?status=confirmed
GET  /api/orders/:id
POST /api/payments
```

### Persistencia

```bash
ORDER_REPOSITORY=sqlite
SQLITE_PATH=./data/orders.sqlite
```

### CLI

```bash
npm run cli -- create-order --customer cust-1 --product sku-42 --quantity 2 --price 10
npm run cli -- get-order --id <order-id>
npm run cli -- list-orders --status confirmed
npm run cli -- record-payment --order order-1 --amount 20
```
