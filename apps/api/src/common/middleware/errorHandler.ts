import { Request, Response, NextFunction } from "express";
import { ApiError } from "../errors/apiError";

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error(err);

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ message: err.message });
  }

  const status = err.status || 500;
  const message = err.message || "Internal Server Error";

  res.status(status).json({ message });
};
