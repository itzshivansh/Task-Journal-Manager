import { HttpError } from "../utils/httpError.js";

export function validate(schema, where = "body") {
  return (req, _res, next) => {
    const result = schema.safeParse(req[where]);
    if (!result.success) {
      return next(
        new HttpError(400, "Validation error", {
          issues: result.error.issues
        })
      );
    }
    // Express 5 may expose req.query as getter-only; avoid overwriting it.
    if (where === "query") {
      req.validatedQuery = result.data;
      return next();
    }
    if (where === "params") {
      req.validatedParams = result.data;
      return next();
    }
    req.body = result.data;
    return next();
  };
}

