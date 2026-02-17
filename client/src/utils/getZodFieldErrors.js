import { ZodError } from 'zod';

export const getZodFieldErrors = (error) => {
  if (error instanceof ZodError) {
    const fieldErrors = error.issues.reduce((acc, issue) => {
      if (issue.path && issue.path.length > 0) {
        acc[issue.path[0]] = issue.message;
      }
      return acc;
    }, {});

    return fieldErrors;
  }
  return {};
};
