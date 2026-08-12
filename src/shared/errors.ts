/**
 * Errores de dominio tipados.
 * No conocen HTTP: el mapeo a status codes vive en los adaptadores.
 */
export type DomainErrorCode = "VALIDATION_ERROR" | "NOT_FOUND" | (string & {});

export class DomainError extends Error {
  readonly code: DomainErrorCode;

  constructor(message: string, code: DomainErrorCode) {
    super(message);
    this.name = new.target.name;
    this.code = code;
  }
}

export class ValidationError extends DomainError {
  constructor(message: string, code: DomainErrorCode = "VALIDATION_ERROR") {
    super(message, code);
  }
}

export class NotFoundError extends DomainError {
  constructor(message: string, code: DomainErrorCode = "NOT_FOUND") {
    super(message, code);
  }
}
