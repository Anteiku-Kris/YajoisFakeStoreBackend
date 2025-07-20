import { Request, Response, NextFunction } from "express";
import { supabase } from "../services/supabaseClient";
import { errorHandler } from "./errorHandler";

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Token no proprcionado" });
  }
  const token = authHeader.split(" ")[1];

  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    return res.status(401).json({ message: "Token inválido" });
  }

  //Inyectar user al objeto request
  (req as any).user = data.user;
  next();
};
