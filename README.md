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
      order.dto.ts
      order.mapper.ts
    infrastructure/
      in-memory-order.repository.ts
    interface/
      order.controller.ts
      order.routes.ts             # router Express del feature
  payments/                       # feature simple → sin capas
    payments.module.ts            # cableado del feature
    payments.routes.ts            # router Express del feature
    record-payment.ts
  shared/                         # solo lo realmente compartido
    money.vo.ts
  bootstrap.ts                    # junta módulos de feature
  main.ts                         # arranca la API
public/
  index.html                      # frontend que consume la API
```

Al abrir `src/` lees el producto (pedidos, pagos) y sus puntos de entrada. Eso es **screaming architecture** + **package by feature**.

## Cómo encajan las interfaces

```text
Navegador → frontend → HTTP API ┐
                               ├→ use case → dominio → repository
Terminal ───────────────→ CLI ─┘
```

- El frontend no invoca controllers directamente: hace `fetch` a la API.
- `apps/api/server.ts` monta routers; las rutas viven en cada feature.
- Cambiar Express por Fastify/Nest afecta a `apps/api/` y a los `*.routes.ts`.
- La CLI traduce argumentos y reutiliza la misma aplicación.
- Cada feature tiene su `*.module.ts`; `bootstrap.ts` solo los ensambla.
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

### API + frontend

```bash
npm start
```

Abre `http://localhost:3000`. Endpoints:

```text
GET  /api/health
POST /api/orders
POST /api/payments
```

### CLI

```bash
npm run cli -- create-order --customer cust-1 --product sku-42 --quantity 2 --price 10
npm run cli -- record-payment --order order-1 --amount 20
```

Cada proceso usa almacenamiento en memoria. Por eso los datos no se comparten
entre ejecuciones de CLI ni sobreviven al reinicio de la API. Una BD real
resolvería esa limitación implementando el mismo puerto `OrderRepository`.
