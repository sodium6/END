const { StatusCodes } = require('http-status-codes');

// Custom Error Classes
class BadRequestError extends Error {
  constructor(message) {
    super(message);
    this.name = 'BadRequestError';
    this.message = message;
  }
}

class UnauthorizedError extends Error {
  constructor(message) {
    super(message);
    this.name = 'UnauthorizedError';
    this.message = message;
  }
}

class ForbiddenError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ForbiddenError';
    this.message = message;
  }
}

class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NotFoundError';
    this.message = message;
  }
}

/**
 * Transforms an error object into a standardized response format with a status code.
 * @param {Error} error - The error object to transform.
 * @returns {{statusCode: number, error: {name: string, message: string, issues?: any, meta?: any}}} - The standardized error response.
 */

function makeError(error) {
  const defaultError = {
    name: error.name || 'InternalServerError',
    message: error.message || 'An unexpected error occurred.',
  };

  /* Custom Errors (based on message content) */
  if (error.message && error.message.includes('Malformed JSON')) {
    return {
      statusCode: StatusCodes.BAD_REQUEST,
      error: { name: 'BadRequestError', message: error.message },
    };
  }

  if (error.message && error.message.includes('jwt malformed')) {
    return {
      statusCode: StatusCodes.BAD_REQUEST,
      error: { name: 'BadRequestError', message: 'Invalid token format.' },
    };
  }

  if (error.message && error.message.includes('invalid signature')) {
    return {
      statusCode: StatusCodes.BAD_REQUEST,
      error: { name: 'BadRequestError', message: 'Invalid token signature.' },
    };
  }

  if (error.message && error.message.includes('jwt expired')) {
    return {
      statusCode: StatusCodes.UNAUTHORIZED,
      error: { name: 'UnauthorizedError', message: 'Token expired.' },
    };
  }

  /* Custom Error Class Instances */
  if (error instanceof BadRequestError) {
    return {
      statusCode: StatusCodes.BAD_REQUEST,
      error: defaultError,
    };
  }

  if (error instanceof UnauthorizedError) {
    return {
      statusCode: StatusCodes.UNAUTHORIZED,
      error: defaultError,
    };
  }

  if (error instanceof ForbiddenError) {
    return {
      statusCode: StatusCodes.FORBIDDEN,
      error: defaultError,
    };
  }

  if (error instanceof NotFoundError) {
    return {
      statusCode: StatusCodes.NOT_FOUND,
      error: defaultError,
    };
  }

  /* Zod Errors (assuming ZodError can be identified, e.g., by name or a specific property) */
  // You'll need to import ZodError if you're using Zod for validation.
  // For demonstration, let's assume it has a 'issues' property.
  if (error.name === 'ZodError' && error.issues) {
    const validationDetails = error.issues.map((issue) => ({
      field: issue.path.join('.') || 'general',
      message: issue.message,
      code: issue.code,
    }));

    return {
      statusCode: StatusCodes.BAD_REQUEST,
      error: {
        name: 'ValidationError',
        details: validationDetails,
      },
    };
  }

  /* Multer Errors (for file uploads) */
  // Multer errors typically have a 'code' property
  if (error.name === 'MulterError') {
    let message = 'File upload failed.';
    let statusCode = StatusCodes.BAD_REQUEST;

    switch (error.code) {
    case 'LIMIT_FILE_SIZE':
      message = 'File too large. Maximum file size exceeded.';
      break;
    case 'LIMIT_FILE_COUNT':
      message = 'Too many files uploaded. Maximum file count exceeded.';
      break;
    case 'LIMIT_FIELD_KEY':
      message = 'Field name too long.';
      break;
    case 'LIMIT_FIELD_VALUE':
      message = 'Field value too long.';
      break;
    case 'LIMIT_FIELD_COUNT':
      message = 'Too many fields.';
      break;
    case 'LIMIT_UNEXPECTED_FILE':
      message = `Unexpected file field: ${error.field || 'unknown'}.`;
      break;
    default:
      message = `File upload error: ${error.message || 'An unknown Multer error occurred.'}`;
      break;
    }

    return {
      statusCode: statusCode,
      error: {
        name: 'FileUploadError',
        message: message,
        code: error.code,
        field: error.field,
      },
    };
  }

  return {
    error: defaultError,
    statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
  };
}

module.exports = {
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  makeError,
};
