import { ApiError } from "../utils/ApiError.js";
import { logger } from "../utils/logger.js";

const errorHandling = (err, req, res, next) => {
  const isApiError = err instanceof ApiError;
  const statusCode = isApiError ? err.statusCode : 500;
  const message = isApiError ? err.message : "Internal Server Error";

  const errorDetails = {
    level: "error",
    statusCode,
    message,
    errors: err.errors ? err.errors.toString() : {},
    method: req.method,
    url: req.originalUrl,
  };

  logger.error(errorDetails);
  res.status(err.statusCode).json(errorDetails);
};

export { errorHandling };
