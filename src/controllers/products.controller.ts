import { Request, Response } from "express";
import { supabase } from "../services/supabaseClient";

export const getAllProducts = async (_req: Request, res: Response) => {
  const { data, error } = await supabase.from("products").select("*");

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
};
