/**
 * Middleware factory for validating request body against a Zod schema.
 * @param {import('zod').ZodTypeAny} schema
 */
export function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.length > 0 ? issue.path.join('.') : 'body',
        message: issue.message
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    req.body = result.data;
    next();
  };
}

/**
 * Middleware factory for validating URL parameters against a Zod schema.
 * @param {import('zod').ZodTypeAny} schema
 */
export function validateParams(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.params);
    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.length > 0 ? issue.path.join('.') : 'params',
        message: issue.message
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    next();
  };
}
