# AGENTS.md

Guía para agentes (y humanos que toquen el código con el mismo criterio).  
El **README.md** es para personas que quieren entender y ejecutar el proyecto.  
Este archivo es para **cómo cambiar el código sin romper el modelo**.

## Separación README vs AGENTS

| Va en **README.md** | Va en **AGENTS.md** |
| ------------------- | ------------------- |
| Qué es el proyecto | Decisiones de arquitectura y por qué |
| Cómo instalar / ejecutar | Convenciones al añadir features, slices, repos |
| Endpoints y variables de entorno | Qué no hacer (sobreingeniería, capas globales) |
| Estructura a alto nivel | Detalles de naming, errores, composition |
| Ejemplos de CLI para humanos | Pitfalls técnicos (build, sqlite, etc.) |

No dupliques tutoriales largos en ambos. README = uso; AGENTS = mantenimiento.

---

## Modelo mental del repo

Plantilla educativa de **package by feature** + **screaming architecture**:

- **`orders/`**: feature **compleja** (vertical slices + domain/infra compartidos).
- **`payments/`**: feature **simple** (pocos archivos, sin capas).
- **`apps/`**: solo adaptadores de entrada (Express API, CLI).
- **`shared/`**: mínimo y justificado (`config`, `logger`, `errors`, `Money`).
- **`bootstrap.ts`**: composition root fino; junta `*.module.ts` de cada feature.

Dependencias (hacia dentro):

```text
*.route.ts → caso de uso (slice) → domain ← infrastructure
```

El dominio **no** importa Express, `process.env`, ni status HTTP.

---

## Convenciones al cambiar código

### Features nuevas

1. Empieza como `payments` (1-3 archivos) si el flujo es simple.
2. Si aparecen reglas + varios flujos, pasa a slices como `orders`.
3. Nunca crees `controllers/`, `services/`, `repositories/` globales en `src/`.

### Vertical slices (`orders`)

- Un slice ≈ una intención de negocio (`create-order`, `get-order`, `list-by-status`).
- Separar get vs list cuando cambian contrato (1 vs N), 404 vs lista vacía, permisos o evolución de filtros.
- Naming limpio: clases `CreateOrder`, `GetOrder`, `ListByStatus` (no `*UseCase` / controllers gordos).
- HTTP en `*.route.ts` del slice; `orders.routes.ts` solo compone.
- Mapper/`OrderOutput` compartidos del feature viven en la raíz de `orders/` si los reutilizan varios slices.

### Repositories

- Puerto por agregado/feature (`OrderRepository`), no un `Repository<T>` genérico global.
- Método nuevo en el puerto ⇒ implementar en **todas** las impls de ese puerto (`memory` + `sqlite`), no en otros features.
- Elección de adaptador por config: `ORDER_REPOSITORY=memory|sqlite`.

### Errores

- Dominio lanza `ValidationError` / `NotFoundError` (`shared/errors.ts`) con `code`.
- Adaptadores traducen con `mapDomainError` (`shared/map-domain-error.ts`).
- Payload HTTP inválido (antes del use case) ⇒ 400 en la route.
- El dominio **no** conoce HTTP status codes.

### Config y logging

- Leer env solo en `shared/config.ts`.
- Logger (`pino`) solo en adaptadores (API, CLI, routes), no en entities.
- `LOG_LEVEL`, `PORT`, `NODE_ENV`, `ORDER_REPOSITORY`, `SQLITE_PATH`.

### Composition

- Cableado por feature en `orders.module.ts` / `payments.module.ts`.
- `bootstrap.ts` solo hace spread de módulos; no listar 50 clases a mano.

---

## Stack y comandos (para agentes)

- Node `>=22`, TypeScript ESM, Express 5, dotenv, pino, Prettier (`printWidth: 150`).
- Persistencia demo: in-memory o `node:sqlite` (experimental).
- Build: **tsup** (esbuild) → `dist/main.js` + `dist/cli.js`. No sustituir por Vite para el backend (Vite es para frontend).

```bash
npm run dev        # API con reload (tsx watch)
npm run build      # tsup → dist/
npm start          # node dist/main.js (tras build)
npm run cli -- …   # CLI con tsx
npm run typecheck
npm run format
```

### Pitfall: `node:sqlite` + bundler

esbuild/tsup puede reescribir `import … from "node:sqlite"` a `"sqlite"`.  
En este repo el adaptador SQLite usa `createRequire(import.meta.url)("node:sqlite")` a propósito. No “arreglarlo” volviendo al import ESM directo sin verificar el build.

### Estáticos

`public/` se resuelve con `process.cwd()` para que funcione igual con tsx y con `dist/`.

---

## Commits

- Conventional Commits en inglés, **sin scope** entre paréntesis salvo que el usuario lo pida.
- Ejemplos: `feat: …`, `fix: …`, `refactor: …`, `chore: …`.
- No commits ni push si el usuario no lo pide.
- No em dash / en dash; usar `-` ASCII.

---

## Idioma

- Respuestas al usuario de este repo: **español** (salvo que pida otra cosa).
- Código, nombres de símbolos y mensajes de commit: inglés (commits); mensajes de error de dominio actuales están en español (coherente con la plantilla didáctica). Mantén el idioma ya usado en ese archivo/capa.

---

## Qué no añadir “por plantilla”

- DI frameworks (Inversify, etc.)
- CQRS / event bus / microservicios
- Capas Clean Architecture globales el día 1
- Auth completa, OpenAPI obligatorio, Docker… salvo petición explícita
- Inflar `shared/` con utilidades “por si acaso”

---

## Checklist rápido al tocar el código

1. ¿El cambio pertenece a un feature concreto (`orders` / `payments`)?
2. ¿El dominio sigue libre de HTTP/env/logger?
3. ¿Un puerto nuevo/ampliado tiene impls actualizadas?
4. ¿Los errores tipados se mapean en el adaptador?
5. ¿`npm run typecheck` (y `build` si tocas imports/sqlite) sigue verde?
