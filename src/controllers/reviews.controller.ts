import { Request, Response } from "express";
import { supabase } from "../services/supabaseClient";

export const getAllReviews = async (_req: Request, res: Response) => {
  const { data, error } = await supabase.from("reviews").select("*");

  if (error) {
    throw new Error(error.message);
  }

  res.json(data);
};
