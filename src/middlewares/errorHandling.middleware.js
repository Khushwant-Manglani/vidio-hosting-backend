import { errorHandler } from "../utils/errorHandler.js";

const errorHandling = (err, req, res, next) => {
  errorHandler.logError(err, req.method, req.url);

  const isApiError = errorHandler.isApiError(err);

  const statusCode = isApiError ? err.statusCode : 500;
  const message = isApiError ? err.message : "Internal Server Error";

  res.status(err.statusCode).json({
    status: "error",
    statusCode: statusCode,
    message: message,
  });
};

export { errorHandling };
