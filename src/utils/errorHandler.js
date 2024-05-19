import { ApiError } from "./ApiError.js";
import { logger } from "./logger.js";

class errorHandler {
  static logError(err, method, url) {
    logger.error({
      method,
      url,
      statusCode: err.statusCode,
      message: err.message,
      errors: err.errors,
    });
  }

  static isApiError(err) {
    return err instanceof ApiError;
  }
}

export { errorHandler };
