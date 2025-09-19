/**
 * Middleware to validate request data (body, params, query) against a Zod schema.
 *
 * @param {object} schema - The Zod schema object to validate against.
 * @param {'body' | 'params' | 'query'} [property='body'] - The request property to validate.
 * @returns {function} An Express middleware function.
 */

const validateSchema =
  (schema, property = 'body') =>
    (req, res, next) => {
      req[property] = schema.parse(req[property]);
      next();
    };

module.exports = validateSchema;
