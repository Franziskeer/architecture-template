# Package by feature con API, frontend y CLI

Ejemplo en TypeScript: el repo **grita el negocio** (`orders`, `payments`), no el framework.

## Enfoque

| Feature | Complejidad | Estructura |
|---------|-------------|------------|
| **orders** | Reglas de negocio | Capas dentro del feature (`domain`, `application`, …) |
| **payments** | CRUD simple | Un vertical slice en un solo archivo |
| **shared** | Código transversal | Poco y justificado (`Money`) |
| **apps** | Adaptadores de entrada | API HTTP y CLI |

Así evitas Clean Architecture global el día 1 y la introduces **por feature** cuando duele.

---

## Estructura actual

```text
src/
  apps/                           # formas de entrar en la aplicación
    api/
      server.ts                   # Express: middleware + montar routers
    cli/
      cli.ts                      # comandos de terminal
  orders/                         # feature con reglas → capas locales
    orders.module.ts              # cableado del feature
    domain/
      order.entity.ts
      order.repository.ts         # puerto
    application/
      create-order.use-case.ts
      get-order.use-case.ts
      list-orders-by-status.use-case.ts
      order.dto.ts
      order.mapper.ts
    infrastructure/
      in-memory-order.repository.ts
      sqlite-order.repository.ts  # segundo adaptador del mismo puerto
    interface/
      order.controller.ts
      order.routes.ts             # router Express del feature
  payments/                       # feature simple → sin capas
    payments.module.ts            # cableado del feature
    payments.routes.ts            # router Express del feature
    record-payment.ts
  shared/                         # solo lo realmente compartido
    config.ts                     # variables de entorno tipadas
    logger.ts                     # logging estructurado (pino)
    money.vo.ts
  bootstrap.ts                    # junta módulos de feature
  main.ts                         # arranca la API
public/
  index.html                      # frontend que consume la API
.env.example                      # plantilla de variables
```

Al abrir `src/` lees el producto (pedidos, pagos) y sus puntos de entrada. Eso es **screaming architecture** + **package by feature**.

## Cómo encajan las interfaces

```text
Navegador → frontend → HTTP API ┐
                               ├→ use case → dominio → repository
Terminal ───────────────→ CLI ─┘
                                    ↑
                         memory o sqlite (mismo puerto)
```

- El frontend no invoca controllers directamente: hace `fetch` a la API.
- `apps/api/server.ts` monta routers; las rutas viven en cada feature.
- Cambiar Express por Fastify/Nest afecta a `apps/api/` y a los `*.routes.ts`.
- La CLI traduce argumentos y reutiliza la misma aplicación.
- Cada feature tiene su `*.module.ts`; `bootstrap.ts` solo los ensambla.
- `shared/config.ts` carga `.env` y tipa la config; el dominio no lee `process.env`.
- `shared/logger.ts` (pino) se usa en adaptadores; el dominio no registra logs.
- `ORDER_REPOSITORY=memory|sqlite` elige el adaptador sin tocar use cases.
- El dominio no importa nada de HTTP, HTML ni `process.argv`.

### Dependencias (dentro de un feature rico)

```text
interface → application → domain ← infrastructure
```

El dominio del feature no conoce HTTP ni BD.

---

## Tipos de fichero

| Tipo | Dónde | Rol |
|------|-------|-----|
| **Entity** | `orders/domain` | Identidad + reglas (`Order.confirm()`) |
| **Value Object** | `shared` o `domain` | Sin id; por valor (`Money`) |
| **Repository (puerto)** | `orders/domain` | Contrato de persistencia |
| **Use case** | `orders/application` | Orquesta un flujo |
| **DTO / Mapper** | `orders/application` | Frontera API ↔ dominio |
| **Repo (impl)** | `orders/infrastructure` | Memoria, SQL, etc. |
| **Controller** | `orders/interface` | HTTP → use case |
| **Slice simple** | `payments/record-payment.ts` | Todo el feature en un archivo |

---

## Cómo no sobreingenierizar

1. Carpeta por feature desde el día 1.
2. Capas solo dentro del feature que las necesita.
3. `shared/` mínimo; preferir duplicar poco a acoplar features.
4. Si `payments` crece: partirlo como `orders/` (domain/application/…).

### Camino evolutivo

```text
1) feature/un-archivo.ts
2) sacar entity si hay reglas
3) puerto de repo si cambias BD o tests lo piden
4) DTOs/mappers si API ≠ dominio
5) más adaptadores reutilizando el use case
```

---

## Cómo ejecutar

Copia variables locales:

```bash
cp .env.example .env
```

`LOG_LEVEL` controla el logger (`info`, `debug`, …). En `development` usa formato legible (`pino-pretty`); en otros entornos sale JSON puro.

### API + frontend

```bash
npm start
```

Abre `http://localhost:3000` (o el `PORT` de tu `.env`). Endpoints:

```text
GET  /api/health
POST /api/orders
GET  /api/orders?status=confirmed
GET  /api/orders/:id
POST /api/payments
```

### Persistencia (memory vs sqlite)

Por defecto usa memoria. Para SQLite (Node >= 22, módulo `node:sqlite`):

```bash
# en .env
ORDER_REPOSITORY=sqlite
SQLITE_PATH=./data/orders.sqlite
```

El use case no cambia: solo se sustituye la implementación de `OrderRepository`.

### CLI

```bash
npm run cli -- create-order --customer cust-1 --product sku-42 --quantity 2 --price 10
npm run cli -- get-order --id <order-id>
npm run cli -- list-orders --status confirmed
npm run cli -- record-payment --order order-1 --amount 20
```

Con `ORDER_REPOSITORY=sqlite`, create/get de CLI y API comparten el mismo fichero si apuntan al mismo `SQLITE_PATH`.
Con `memory`, cada proceso tiene su propio almacén.
