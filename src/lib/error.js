class AppError extends Error { }

module.exports.AppError = AppError;

module.exports.handleError = (error) =>
  error instanceof AppError
    ? [400, error.message, 'warn', undefined]
    : [500, 'Internal server error', 'error', error?.stack];
