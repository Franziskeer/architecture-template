import { config as loadDotenv } from "dotenv";

/**
 * Carga .env una vez y expone config tipada.
 * Dominio y use cases no leen process.env; reciben valores por inyección.
 */
loadDotenv();

function numberEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  if (raw === undefined || raw === "") return fallback;
  const value = Number(raw);
  if (Number.isNaN(value)) {
    throw new Error(`${name} debe ser un número`);
  }
  return value;
}

export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Falta la variable de entorno ${name}`);
  }
  return value;
}

export const config = {
  port: numberEnv("PORT", 3000),
  nodeEnv: process.env.NODE_ENV ?? "development",
} as const;
