import { Request, Response, NextFunction } from "express";

/**
 * Middleware global de manejo de errores.
 * Debe colocarse al final de todas las rutas.
 */

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error(`Error: ${err.message}`);

  res.status(500).json({
    success: false,
    message: "Internal Server Error",
    error: err.message,
  });
};
