import { Request, Response } from "express";
import { supabase } from "../services/supabaseClient";

export const getAllCategories = async (_req: Request, res: Response) => {
  const { data, error } = await supabase.from("categories").select("*");

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
};
