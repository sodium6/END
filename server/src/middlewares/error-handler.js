const { makeError } = require('../utils/error.js');

/**
 * Global error handling middleware for Express.js applications.
 * This middleware catches errors thrown in routes or other middlewares,
 * processes them using the `makeError` utility, and sends a standardized
 * JSON response to the client.
 *
 * It should be placed as the last middleware in your Express application
 * after all other routes and middleware have been defined.
 *
 * @param {Error} err - The error object caught by Express.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @param {import('express').NextFunction} next - The Express next middleware function.
 */

const errorHandler = (err, req, res, next) => {
  const { error, statusCode } = makeError(err);
  console.error(err.message, err);

  res.status(statusCode).json({
    success: false,
    error: error,
  });
};

module.exports = errorHandler;
