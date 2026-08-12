import { DomainError, NotFoundError, ValidationError } from "./errors";

export interface HttpErrorBody {
  error: string;
  code: string;
}

/**
 * Traduce errores de dominio a respuesta HTTP.
 * Solo para adaptadores (routes, middleware), no para el dominio.
 */
export function mapDomainError(error: unknown): { status: number; body: HttpErrorBody } {
  if (error instanceof NotFoundError) {
    return { status: 404, body: { error: error.message, code: error.code } };
  }

  if (error instanceof ValidationError) {
    return { status: 422, body: { error: error.message, code: error.code } };
  }

  if (error instanceof DomainError) {
    return { status: 400, body: { error: error.message, code: error.code } };
  }

  const message = error instanceof Error ? error.message : "Error interno";
  return { status: 500, body: { error: message, code: "INTERNAL_ERROR" } };
}
