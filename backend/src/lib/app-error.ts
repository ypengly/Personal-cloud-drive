/**
 * Thrown deliberately anywhere in the app for expected failure cases
 * (bad input, not found, unauthorized, etc). The error handler middleware
 * knows these are "safe" to show to the client. Anything else (unexpected
 * exceptions) is logged server-side and reported as a generic 500 —
 * we never leak stack traces, file paths, or internal details to clients.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;

  constructor(message: string, statusCode = 400, code = "BAD_REQUEST") {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    Object.setPrototypeOf(this, AppError.prototype);
  }

  static badRequest(message: string, code = "BAD_REQUEST") {
    return new AppError(message, 400, code);
  }
  static unauthorized(message = "Unauthorized", code = "UNAUTHORIZED") {
    return new AppError(message, 401, code);
  }
  static forbidden(message = "Forbidden", code = "FORBIDDEN") {
    return new AppError(message, 403, code);
  }
  static notFound(message = "Not found", code = "NOT_FOUND") {
    return new AppError(message, 404, code);
  }
  static conflict(message: string, code = "CONFLICT") {
    return new AppError(message, 409, code);
  }
  static tooLarge(message = "Payload too large", code = "PAYLOAD_TOO_LARGE") {
    return new AppError(message, 413, code);
  }
  static internal(message = "Internal server error", code = "INTERNAL_ERROR") {
    return new AppError(message, 500, code);
  }
}
