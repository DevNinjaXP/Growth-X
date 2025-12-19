export class EngineError extends Error {
  /** @param {string} message */
  constructor(message, { cause, code } = {}) {
    super(message);
    this.name = this.constructor.name;
    this.cause = cause;
    this.code = code;
  }
}

export class ValidationError extends EngineError {}
export class ProviderError extends EngineError {}
export class QualityError extends EngineError {}
