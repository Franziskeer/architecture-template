import pino from "pino";
import { config } from "./config";

/**
 * Logger estructurado (JSON).
 * Usar en adaptadores (API, CLI, infra). No en domain entities.
 */
export const logger = pino({
  level: config.logLevel,
  base: {
    service: "clean-architecture-example",
    env: config.nodeEnv,
  },
  ...(config.nodeEnv === "development"
    ? {
        transport: {
          target: "pino-pretty",
          options: { colorize: true, translateTime: "SYS:standard" },
        },
      }
    : {}),
});

export type AppLogger = typeof logger;

export function childLogger(bindings: pino.Bindings): AppLogger {
  return logger.child(bindings);
}
